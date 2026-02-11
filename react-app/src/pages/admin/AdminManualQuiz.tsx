import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Award, Plus, Trash2, Edit2, X, Trophy, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
    id: string;
    name: string;
    email: string;
}

interface QuizGrade {
    user_id: string;
    quiz_number: number;
    grade: number;
    feedback: string | null;
}

interface StudentGrade {
    [userId: string]: number;
}

interface GroupedQuiz {
    quiz_number: number;
    grades: QuizGrade[];
}

export const AdminManualQuiz: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        quiz_number: 1,
        quiz_topic: ''
    });
    const [studentGrades, setStudentGrades] = useState<StudentGrade>({});
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; quizNumber: number | null }>({
        isOpen: false,
        quizNumber: null
    });

    // Fetch all students
    const { data: students = [] } = useQuery({
        queryKey: ['students-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users_extended')
                .select('id, name, email')
                .eq('role', 'Student')
                .order('name');
            if (error) throw error;
            return data as Student[];
        }
    });

    // Fetch all quiz grades
    const { data: quizGrades = [], isLoading } = useQuery({
        queryKey: ['all-quiz-grades'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('manual_quiz_grades')
                .select('*')
                .order('quiz_number', { ascending: false });
            if (error) {
                console.warn('Quiz grades table might not exist yet:', error);
                return [];
            }
            return data as QuizGrade[];
        }
    });

    // Group grades by quiz number
    const groupedQuizzes: GroupedQuiz[] = Object.values(
        quizGrades.reduce((acc, grade) => {
            const key = grade.quiz_number;
            if (!acc[key]) {
                acc[key] = {
                    quiz_number: grade.quiz_number,
                    grades: []
                };
            }
            acc[key].grades.push(grade);
            return acc;
        }, {} as Record<number, GroupedQuiz>)
    );

    // Initialize grades when modal opens
    React.useEffect(() => {
        if (students && isModalOpen) {
            if (editingQuiz !== null) {
                // Load existing grades for editing
                const existingGrades = quizGrades.filter(g => g.quiz_number === editingQuiz);
                const grades: StudentGrade = {};
                students.forEach(student => {
                    const grade = existingGrades.find(g => g.user_id === student.id);
                    grades[student.id] = grade?.grade || 0;
                });
                setStudentGrades(grades);
            } else {
                // Default all to 0 for new quiz
                const initialGrades: StudentGrade = {};
                students.forEach(student => {
                    initialGrades[student.id] = 0;
                });
                setStudentGrades(initialGrades);
            }
        }
    }, [students, isModalOpen, editingQuiz]);

    // Save/Update quiz grades
    const saveMutation = useMutation({
        mutationFn: async () => {
            const records = Object.entries(studentGrades).map(([userId, grade]) => ({
                user_id: userId,
                quiz_number: formData.quiz_number,
                grade: grade,
                feedback: formData.quiz_topic || 'Quiz Assessment'
            }));

            const { error } = await supabase.from('manual_quiz_grades')
                .upsert(records, {
                    onConflict: 'user_id,quiz_number'
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-quiz-grades'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setIsModalOpen(false);
            setEditingQuiz(null);
            setFormData({ quiz_number: 1, quiz_topic: '' });
            alert('Quiz grades saved successfully!');
        },
        onError: (err: any) => {
            alert(`Error saving grades: ${err.message}`);
        }
    });

    // Delete quiz grades
    const deleteMutation = useMutation({
        mutationFn: async (quizNumber: number) => {
            console.log(`[Quizzes] Attempting to delete Quiz #${quizNumber}`);
            const { error } = await supabase
                .from('manual_quiz_grades')
                .delete()
                .eq('quiz_number', quizNumber);
            if (error) throw error;
        },
        onSuccess: () => {
            console.log('[Quizzes] Deletion successful');
            queryClient.invalidateQueries({ queryKey: ['all-quiz-grades'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            alert('Quiz grades deleted successfully!');
            setDeleteConfirmation({ isOpen: false, quizNumber: null });
        },
        onError: (err: any) => {
            console.error('[Quizzes] Deletion failed:', err);
            alert(`Error deleting quiz: ${err.message}`);
            setDeleteConfirmation({ isOpen: false, quizNumber: null });
        }
    });

    const handleEdit = (group: GroupedQuiz) => {
        setEditingQuiz(group.quiz_number);
        setFormData({
            quiz_number: group.quiz_number,
            quiz_topic: group.grades[0]?.feedback || ''
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingQuiz(null);
        const nextQuizNumber = groupedQuizzes.length > 0
            ? Math.max(...groupedQuizzes.map(g => g.quiz_number)) + 1
            : 1;
        setFormData({
            quiz_number: nextQuizNumber,
            quiz_topic: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (quizNumber: number) => {
        console.log(`[Quizzes] Delete clicked for Quiz #${quizNumber}`);
        setDeleteConfirmation({ isOpen: true, quizNumber });
    };

    const confirmDelete = () => {
        if (deleteConfirmation.quizNumber) {
            deleteMutation.mutate(deleteConfirmation.quizNumber);
        }
    };

    const setGradeForAll = (grade: number) => {
        const newGrades: StudentGrade = {};
        students.forEach(student => {
            newGrades[student.id] = grade;
        });
        setStudentGrades(newGrades);
    };

    const getQuizStats = (grades: QuizGrade[]) => {
        const total = grades.reduce((sum, g) => sum + g.grade, 0);
        const avg = grades.length > 0 ? (total / grades.length).toFixed(1) : 0;
        const highest = grades.length > 0 ? Math.max(...grades.map(g => g.grade)) : 0;
        return { total, avg, highest };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading quiz records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 max-w-[1400px] mx-auto">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="badge bg-indigo-100 text-indigo-700">Admin Portal</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Assessments</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
                            Quiz <span className="text-primary-600">Grading</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Manually assess student performance (+10, +5, or 0 points).</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="btn btn-primary px-6 py-3 rounded-2xl flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Quiz
                    </button>
                </div>
            </header>

            {/* Quiz Records List */}
            <div className="space-y-6">
                {groupedQuizzes.length === 0 ? (
                    <div className="card p-12 text-center bg-white rounded-[40px] shadow-xl">
                        <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-400 mb-2">No Quiz Records</h3>
                        <p className="text-slate-500">Click "Create New Quiz" to grade your first quiz.</p>
                    </div>
                ) : (
                    groupedQuizzes.map((group) => {
                        const stats = getQuizStats(group.grades);
                        return (
                            <motion.div
                                key={group.quiz_number}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-8 bg-white rounded-[40px] shadow-xl border border-slate-100"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-black shadow-inner">
                                            <span className="text-[10px] uppercase opacity-60">Quiz</span>
                                            <span className="text-2xl">{group.quiz_number}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-1">
                                                Quiz {group.quiz_number}
                                                {group.grades[0]?.feedback && ` - ${group.grades[0].feedback}`}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {group.grades.length} Students
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Trophy className="w-4 h-4" />
                                                    {stats.total} Total Points
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleEdit(group)}
                                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-black uppercase hover:bg-blue-100 transition-colors flex items-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(group.quiz_number)}
                                            className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-sm font-black uppercase hover:bg-rose-100 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-primary-50 rounded-2xl">
                                        <div className="text-primary-600 text-sm font-black uppercase tracking-widest mb-1">Total Points</div>
                                        <div className="text-3xl font-black text-primary-700">{stats.total}</div>
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-2xl">
                                        <div className="text-indigo-600 text-sm font-black uppercase tracking-widest mb-1">Average</div>
                                        <div className="text-3xl font-black text-indigo-700">{stats.avg}</div>
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-2xl">
                                        <div className="text-amber-600 text-sm font-black uppercase tracking-widest mb-1">Highest</div>
                                        <div className="text-3xl font-black text-amber-700">{stats.highest}</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[40px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900">
                                            {editingQuiz !== null ? 'Edit' : 'Create'} Quiz Grades
                                        </h2>
                                        <p className="text-slate-500 mt-1">
                                            {editingQuiz !== null
                                                ? `Update grades for Quiz ${formData.quiz_number}`
                                                : 'Award points for a new quiz'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                                {/* Form */}
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                            Quiz Number
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.quiz_number}
                                            onChange={(e) => setFormData({ ...formData, quiz_number: Number(e.target.value) })}
                                            disabled={editingQuiz !== null}
                                            className="input w-full bg-slate-50 border-none px-4 py-3 rounded-xl font-bold text-lg disabled:opacity-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                            Quiz Topic (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.quiz_topic}
                                            onChange={(e) => setFormData({ ...formData, quiz_topic: e.target.value })}
                                            className="input w-full bg-slate-50 border-none px-4 py-3 rounded-xl font-bold"
                                            placeholder="e.g., Chapter 1 Review"
                                        />
                                    </div>
                                </div>

                                {/* Bulk Actions */}
                                <div className="mb-6 p-4 bg-slate-50 rounded-2xl">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 mr-3">Bulk Award:</span>
                                    <button
                                        onClick={() => setGradeForAll(10)}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors mr-2"
                                    >
                                        All +10
                                    </button>
                                    <button
                                        onClick={() => setGradeForAll(5)}
                                        className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-colors mr-2"
                                    >
                                        All +5
                                    </button>
                                    <button
                                        onClick={() => setGradeForAll(0)}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                    >
                                        All 0
                                    </button>
                                </div>

                                {/* Student List */}
                                <div className="space-y-3">
                                    {students.map((student) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{student.name}</div>
                                                    <div className="text-xs text-slate-500">{student.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setStudentGrades({ ...studentGrades, [student.id]: 10 })}
                                                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-colors ${studentGrades[student.id] === 10
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                        }`}
                                                >
                                                    +10
                                                </button>
                                                <button
                                                    onClick={() => setStudentGrades({ ...studentGrades, [student.id]: 5 })}
                                                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-colors ${studentGrades[student.id] === 5
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                        }`}
                                                >
                                                    +5
                                                </button>
                                                <button
                                                    onClick={() => setStudentGrades({ ...studentGrades, [student.id]: 0 })}
                                                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-colors ${studentGrades[student.id] === 0
                                                        ? 'bg-slate-500 text-white'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    0
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => saveMutation.mutate()}
                                    disabled={saveMutation.isPending}
                                    className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saveMutation.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Trophy className="w-5 h-5" />
                                            Save Grades
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmation.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
                        onClick={() => setDeleteConfirmation({ isOpen: false, quizNumber: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Delete Quiz?</h3>
                            <p className="text-slate-500 mb-8 font-medium">Are you sure you want to delete all grades for Quiz {deleteConfirmation.quizNumber}? This action cannot be undone.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setDeleteConfirmation({ isOpen: false, quizNumber: null })}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteMutation.isPending}
                                    className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleteMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        'Delete Now'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
