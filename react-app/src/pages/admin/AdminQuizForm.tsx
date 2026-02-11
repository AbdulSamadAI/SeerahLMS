import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, X, HelpCircle, Clock, Target, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Question {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'A' | 'B' | 'C' | 'D';
    points: number;
}

interface AdminQuizFormProps {
    onClose: () => void;
    classNumber?: number;
}

export const AdminQuizForm: React.FC<AdminQuizFormProps> = ({ onClose, classNumber = 1 }) => {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(30);
    const [passingScore] = useState(70); // setPassingScore removed as it was unused
    const [questions, setQuestions] = useState<Question[]>([
        { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', points: 10 }
    ]);

    const createQuiz = useMutation({
        mutationFn: async () => {
            // 1. Create Header
            const { data: quizHeader, error: headerError } = await supabase
                .from('quiz_headers')
                .insert({
                    class_number: classNumber,
                    title,
                    description,
                    duration_minutes: duration,
                    passing_score: passingScore
                })
                .select()
                .single();

            if (headerError) throw headerError;

            // 2. Create Questions
            const questionsWithIds = questions.map((q, idx) => ({
                ...q,
                quiz_id: quizHeader.id,
                order_index: idx
            }));

            const { error: questionsError } = await supabase
                .from('quiz_questions')
                .insert(questionsWithIds);

            if (questionsError) throw questionsError;

            return quizHeader;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
            onClose();
        }
    });

    const addQuestion = () => {
        setQuestions([...questions, { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', points: 10 }]);
    };

    const removeQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const updateQuestion = (idx: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[idx] = { ...newQuestions[idx], [field]: value };
        setQuestions(newQuestions);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="bg-white rounded-[40px] w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-1 block">Quiz Forge</span>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Create New Assessment</h3>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-white hover:shadow-lg rounded-2xl transition-all group">
                        <X className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quiz Title</label>
                            <input
                                type="text" value={title} onChange={e => setTitle(e.target.value)}
                                className="input w-full" placeholder="e.g. Class 1: Seerah Fundamentals"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (Minutes)</label>
                            <input
                                type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))}
                                className="input w-full"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                            <textarea
                                value={description} onChange={e => setDescription(e.target.value)}
                                className="input w-full h-24 pt-4" placeholder="Briefly describe what this quiz covers..."
                            />
                        </div>
                    </div>

                    {/* Questions Area */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-primary-600" />
                                Assessment Questions ({questions.length})
                            </h4>
                            <button
                                onClick={addQuestion}
                                className="btn bg-primary-100 text-primary-700 hover:bg-primary-200 px-6 py-2 text-xs flex items-center gap-2 border-none"
                            >
                                <Plus className="w-4 h-4" /> Add Question
                            </button>
                        </div>

                        <div className="space-y-10">
                            {questions.map((q, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 relative group"
                                >
                                    <button
                                        onClick={() => removeQuestion(idx)}
                                        className="absolute -right-3 -top-3 w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all border border-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                Question #{idx + 1}
                                            </label>
                                            <input
                                                type="text" value={q.question_text}
                                                onChange={e => updateQuestion(idx, 'question_text', e.target.value)}
                                                className="input w-full border-white" placeholder="What is the significance of...?"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {['A', 'B', 'C', 'D'].map(opt => {
                                                const hasText = !!(q as any)[`option_${opt.toLowerCase()}`];
                                                const isCorrect = q.correct_answer === opt;
                                                return (
                                                    <div key={opt} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <label className={`text-[10px] font-black uppercase tracking-widest pl-1 ${hasText ? 'text-slate-400' : 'text-slate-300 italic'}`}>
                                                                Option {opt} {!hasText && '(Optional)'}
                                                            </label>
                                                            <button
                                                                onClick={() => updateQuestion(idx, 'correct_answer', opt)}
                                                                disabled={!hasText && opt !== 'A'} // A is always required
                                                                className={`text-[9px] font-black px-3 py-1 rounded-full uppercase transition-all ${isCorrect ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                                                            >
                                                                {isCorrect ? 'Correct Answer' : 'Set Correct'}
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text" value={(q as any)[`option_${opt.toLowerCase()}`]}
                                                            onChange={e => updateQuestion(idx, `option_${opt.toLowerCase()}` as any, e.target.value)}
                                                            className={`input w-full border-none shadow-sm transition-all ${isCorrect ? 'ring-2 ring-emerald-500 bg-emerald-50/10' : 'bg-white'}`}
                                                            placeholder={`Enter option ${opt}...`}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Target className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Pass: {passingScore}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{duration} mins</span>
                        </div>
                    </div>
                    <button
                        onClick={() => createQuiz.mutate()}
                        className="w-full btn btn-primary py-4 uppercase font-black tracking-widest shadow-xl rounded-2xl flex items-center justify-center gap-3"
                    >
                        {createQuiz.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span className="uppercase tracking-[0.2em] font-black">Forge Assessment</span>
                    </button>
                </div>
            </motion.div >
        </div >
    );
};
