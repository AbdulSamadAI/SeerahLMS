import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Users, Calendar, CheckCircle2, XCircle, Pause, Trophy, Sparkles, Plus, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
    id: string;
    name: string;
    email: string;
    points: number;
}

interface AttendanceRecord {
    user_id: string;
    class_number: number;
    session_topic: string;
    status: 'Present' | 'Absent' | 'Leave';
    date_of_class: string;
}

interface AttendanceStatus {
    [userId: string]: 'Present' | 'Absent' | 'Leave';
}

interface GroupedAttendance {
    class_number: number;
    session_topic: string;
    date_of_class: string;
    records: AttendanceRecord[];
}

export const AdminAttendanceMarker: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        class_number: 1,
        class_topic: ''
    });
    const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({});
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; classNumber: number | null }>({
        isOpen: false,
        classNumber: null
    });

    // Fetch all students
    const { data: students = [] } = useQuery({
        queryKey: ['students-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users_extended')
                .select('id, name, email, points')
                .eq('role', 'Student')
                .order('name');
            if (error) throw error;
            return data as Student[];
        }
    });

    // Fetch all attendance records
    const { data: attendanceRecords = [], isLoading } = useQuery({
        queryKey: ['all-attendance-records'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('attendance_records')
                .select('*')
                .order('class_number', { ascending: false });
            if (error) throw error;
            return data as AttendanceRecord[];
        }
    });

    // Group attendance by class
    const groupedAttendance: GroupedAttendance[] = Object.values(
        attendanceRecords.reduce((acc, record) => {
            const key = record.class_number;
            if (!acc[key]) {
                acc[key] = {
                    class_number: record.class_number,
                    session_topic: record.session_topic,
                    date_of_class: record.date_of_class,
                    records: []
                };
            }
            acc[key].records.push(record);
            return acc;
        }, {} as Record<number, GroupedAttendance>)
    );

    // Initialize status when students load or modal opens
    React.useEffect(() => {
        if (students && isModalOpen) {
            if (editingClass !== null) {
                // Load existing attendance for editing
                const existingRecords = attendanceRecords.filter(r => r.class_number === editingClass);
                const status: AttendanceStatus = {};
                students.forEach(student => {
                    const record = existingRecords.find(r => r.user_id === student.id);
                    status[student.id] = record?.status || 'Present';
                });
                setAttendanceStatus(status);
            } else {
                // Default all to Present for new attendance
                const initialStatus: AttendanceStatus = {};
                students.forEach(student => {
                    initialStatus[student.id] = 'Present';
                });
                setAttendanceStatus(initialStatus);
            }
        }
    }, [students, isModalOpen, editingClass]);

    // Save/Update attendance
    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!formData.class_topic.trim()) {
                throw new Error('Please enter a class topic');
            }

            const records = Object.entries(attendanceStatus).map(([userId, status]) => ({
                user_id: userId,
                class_number: formData.class_number,
                session_topic: formData.class_topic,
                status: status,
                date_of_class: new Date().toISOString(),
                is_present: status === 'Present'
            }));

            const { error } = await supabase.from('attendance_records')
                .upsert(records, {
                    onConflict: 'user_id,class_number'
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-attendance-records'] });
            queryClient.invalidateQueries({ queryKey: ['students-list'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setIsModalOpen(false);
            setEditingClass(null);
            setFormData({ class_number: 1, class_topic: '' });
            alert('Attendance saved successfully!');
        },
        onError: (err: any) => {
            alert(`Error saving attendance: ${err.message}`);
        }
    });

    // Delete attendance
    const deleteMutation = useMutation({
        mutationFn: async (classNumber: number) => {
            console.log(`[Attendance] Attempting to delete Class ${classNumber}`);
            const { error } = await supabase
                .from('attendance_records')
                .delete()
                .eq('class_number', classNumber);
            if (error) throw error;
        },
        onSuccess: () => {
            console.log('[Attendance] Deletion successful');
            queryClient.invalidateQueries({ queryKey: ['all-attendance-records'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            alert('Attendance deleted successfully!');
            setDeleteConfirmation({ isOpen: false, classNumber: null });
        },
        onError: (err: any) => {
            console.error('[Attendance] Deletion failed:', err);
            alert(`Error deleting attendance: ${err.message}`);
            setDeleteConfirmation({ isOpen: false, classNumber: null });
        }
    });

    const handleEdit = (group: GroupedAttendance) => {
        setEditingClass(group.class_number);
        setFormData({
            class_number: group.class_number,
            class_topic: group.session_topic
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingClass(null);
        const nextClassNumber = groupedAttendance.length > 0
            ? Math.max(...groupedAttendance.map(g => g.class_number)) + 1
            : 1;
        setFormData({
            class_number: nextClassNumber,
            class_topic: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (classNumber: number) => {
        console.log(`[Attendance] Delete clicked for Class ${classNumber}`);
        setDeleteConfirmation({ isOpen: true, classNumber });
    };

    const confirmDelete = () => {
        if (deleteConfirmation.classNumber) {
            deleteMutation.mutate(deleteConfirmation.classNumber);
        }
    };

    const setStatusForAll = (status: 'Present' | 'Absent' | 'Leave') => {
        const newStatus: AttendanceStatus = {};
        students.forEach(student => {
            newStatus[student.id] = status;
        });
        setAttendanceStatus(newStatus);
    };

    const getStatusCounts = (records: AttendanceRecord[]) => {
        return {
            present: records.filter(r => r.status === 'Present').length,
            absent: records.filter(r => r.status === 'Absent').length,
            leave: records.filter(r => r.status === 'Leave').length
        };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading attendance records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-12 max-w-[1400px] mx-auto">
            {/* Header */}
            <header className="mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="badge bg-violet-100 text-violet-700 text-[10px]">Admin Portal</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
                            Attendance <span className="text-primary-600">Management</span>
                        </h1>
                        <p className="text-slate-500 text-sm md:text-base font-medium mt-1">View, track, and manage class records</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-primary-600 text-white px-6 py-3 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        New Attendance
                    </button>
                </div>
            </header>

            {/* Attendance Records List */}
            <div className="space-y-6">
                {groupedAttendance.length === 0 ? (
                    <div className="card p-12 text-center bg-white rounded-[40px] shadow-xl">
                        <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-400 mb-2">No Attendance Records</h3>
                        <p className="text-slate-500">Click "Create New Attendance" to mark your first class attendance.</p>
                    </div>
                ) : (
                    groupedAttendance.map((group) => {
                        const counts = getStatusCounts(group.records);
                        return (
                            <motion.div
                                key={group.class_number}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[24px] md:rounded-[40px] p-5 md:p-8 shadow-sm hover:shadow-xl transition-all border border-slate-100"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary-50 text-primary-600 flex flex-col items-center justify-center font-black shadow-inner shrink-0">
                                            <span className="text-[8px] uppercase opacity-60">Class</span>
                                            <span className="text-lg md:text-2xl">{group.class_number}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-1 truncate">{group.session_topic}</h3>
                                            <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(group.date_of_class).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {group.records.length} <span className="hidden xs:inline">Students</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleEdit(group)}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(group.class_number)}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-[10px] font-black uppercase hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 md:gap-4">
                                    <div className="p-3 md:p-4 bg-emerald-50 rounded-xl md:rounded-2xl text-center sm:text-left">
                                        <div className="text-emerald-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Present</div>
                                        <div className="text-xl md:text-3xl font-black text-emerald-700">{counts.present}</div>
                                    </div>
                                    <div className="p-3 md:p-4 bg-rose-50 rounded-xl md:rounded-2xl text-center sm:text-left">
                                        <div className="text-rose-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Absent</div>
                                        <div className="text-xl md:text-3xl font-black text-rose-700">{counts.absent}</div>
                                    </div>
                                    <div className="p-3 md:p-4 bg-amber-50 rounded-xl md:rounded-2xl text-center sm:text-left">
                                        <div className="text-amber-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Leave</div>
                                        <div className="text-xl md:text-3xl font-black text-amber-700">{counts.leave}</div>
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
                            <div className="p-6 md:p-8 border-b border-slate-100 shrink-0">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <h2 className="text-xl md:text-3xl font-black text-slate-900 truncate">
                                            {editingClass !== null ? 'Edit' : 'Create'} Attendance
                                        </h2>
                                        <p className="text-slate-500 text-xs md:text-sm mt-1 truncate">
                                            {editingClass !== null
                                                ? `Update Class ${formData.class_number}`
                                                : 'Mark new class attendance'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
                                    >
                                        <X className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-160px)]">
                                {/* Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                                    <div>
                                        <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                            <Calendar className="w-3 h-3 inline mr-1" />
                                            Class Number
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.class_number}
                                            onChange={(e) => setFormData({ ...formData, class_number: Number(e.target.value) })}
                                            disabled={editingClass !== null}
                                            className="w-full bg-slate-50 border-none px-4 py-2.5 md:py-3 rounded-xl font-bold text-base md:text-lg disabled:opacity-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                            <Sparkles className="w-3 h-3 inline mr-1" />
                                            Class Topic
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.class_topic}
                                            onChange={(e) => setFormData({ ...formData, class_topic: e.target.value })}
                                            className="w-full bg-slate-50 border-none px-4 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base"
                                            placeholder="e.g., Introduction to Seerah"
                                        />
                                    </div>
                                </div>

                                {/* Bulk Actions */}
                                <div className="mb-6 p-4 bg-slate-50 rounded-2xl flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-full mb-1">Bulk Actions</span>
                                    <button
                                        onClick={() => setStatusForAll('Present')}
                                        className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Present
                                    </button>
                                    <button
                                        onClick={() => setStatusForAll('Absent')}
                                        className="flex-1 px-3 py-2 bg-rose-50 text-rose-700 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <XCircle className="w-3 h-3" />
                                        Absent
                                    </button>
                                    <button
                                        onClick={() => setStatusForAll('Leave')}
                                        className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Pause className="w-3 h-3" />
                                        Leave
                                    </button>
                                </div>

                                {/* Student List */}
                                <div className="space-y-4 md:space-y-3">
                                    {students.map((student) => (
                                        <div
                                            key={student.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-[20px] md:rounded-2xl hover:bg-slate-100 transition-colors gap-4"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-black text-sm shrink-0">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-900 truncate text-sm md:text-base">{student.name}</div>
                                                    <div className="text-[10px] md:text-xs text-slate-500 truncate">{student.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setAttendanceStatus({ ...attendanceStatus, [student.id]: 'Present' })}
                                                    className={`flex-1 sm:flex-none px-4 py-2 md:py-2 rounded-xl text-[10px] font-black uppercase transition-colors flex items-center justify-center gap-1.5 ${attendanceStatus[student.id] === 'Present'
                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                        : 'bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50'
                                                        }`}
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span className="sm:hidden">Present</span>
                                                </button>
                                                <button
                                                    onClick={() => setAttendanceStatus({ ...attendanceStatus, [student.id]: 'Absent' })}
                                                    className={`flex-1 sm:flex-none px-4 py-2 md:py-2 rounded-xl text-[10px] font-black uppercase transition-colors flex items-center justify-center gap-1.5 ${attendanceStatus[student.id] === 'Absent'
                                                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                                        : 'bg-white text-rose-600 border border-rose-100 hover:bg-rose-50'
                                                        }`}
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span className="sm:hidden">Absent</span>
                                                </button>
                                                <button
                                                    onClick={() => setAttendanceStatus({ ...attendanceStatus, [student.id]: 'Leave' })}
                                                    className={`flex-1 sm:flex-none px-4 py-2 md:py-2 rounded-xl text-[10px] font-black uppercase transition-colors flex items-center justify-center gap-1.5 ${attendanceStatus[student.id] === 'Leave'
                                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                        : 'bg-white text-amber-600 border border-amber-100 hover:bg-amber-50'
                                                        }`}
                                                >
                                                    <Pause className="w-3.5 h-3.5" />
                                                    <span className="sm:hidden">Leave</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 md:p-8 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 md:px-6 py-2.5 md:py-3 bg-slate-100 text-slate-700 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => saveMutation.mutate()}
                                    disabled={saveMutation.isPending || !formData.class_topic.trim()}
                                    className="px-5 md:px-6 py-2.5 md:py-3 bg-primary-600 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary-500/20"
                                >
                                    {saveMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Trophy className="w-4 h-4" />
                                            <span>Save</span>
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                        onClick={() => setDeleteConfirmation({ isOpen: false, classNumber: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl max-w-md w-full p-6 md:p-8 text-center"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 text-rose-500 rounded-2xl md:rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Delete?</h3>
                            <p className="text-slate-500 mb-8 font-medium text-sm md:text-base">Delete attendance for Class {deleteConfirmation.classNumber}?</p>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <button
                                    onClick={() => setDeleteConfirmation({ isOpen: false, classNumber: null })}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteMutation.isPending}
                                    className="px-6 py-3 bg-rose-600 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                                >
                                    {deleteMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        'Delete'
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
