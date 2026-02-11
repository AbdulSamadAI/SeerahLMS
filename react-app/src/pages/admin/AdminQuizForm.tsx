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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="bg-white rounded-t-[32px] md:rounded-[40px] w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden flex flex-col h-[95vh] md:h-auto md:max-h-[90vh] mt-auto md:mt-0"
            >
                <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
                    <div>
                        <span className="text-[8px] md:text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-1 block">Quiz Forge</span>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">New Assessment</h3>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-white hover:shadow-lg rounded-xl md:rounded-2xl transition-all group shrink-0">
                        <X className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 md:space-y-12">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2 md:space-y-3">
                            <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Quiz Title</label>
                            <input
                                type="text" value={title} onChange={e => setTitle(e.target.value)}
                                className="w-full bg-slate-50 border-none px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base focus:ring-2 focus:ring-primary-500/20 transition-all outline-none" placeholder="e.g. Seerah Fundamentals"
                            />
                        </div>
                        <div className="space-y-2 md:space-y-3">
                            <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (Minutes)</label>
                            <input
                                type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))}
                                className="w-full bg-slate-50 border-none px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2 md:space-y-3">
                            <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                            <textarea
                                value={description} onChange={e => setDescription(e.target.value)}
                                className="w-full bg-slate-50 border-none px-4 py-3 rounded-xl md:rounded-2xl font-medium text-sm md:text-base focus:ring-2 focus:ring-primary-500/20 transition-all outline-none h-20 md:h-24 pt-4" placeholder="Brief description..."
                            />
                        </div>
                    </div>

                    {/* Questions Area */}
                    <div className="space-y-6 md:space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 gap-4">
                            <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-primary-600 shrink-0" />
                                Questions ({questions.length})
                            </h4>
                            <button
                                onClick={addQuestion}
                                className="bg-primary-100 text-primary-700 hover:bg-primary-200 px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Add
                            </button>
                        </div>

                        <div className="space-y-10">
                            {questions.map((q, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-slate-50 border border-slate-100 relative group"
                                >
                                    <button
                                        onClick={() => removeQuestion(idx)}
                                        className="absolute -right-2 md:-right-3 -top-2 md:-top-3 w-8 h-8 md:w-10 md:h-10 bg-white shadow-lg rounded-lg md:rounded-xl flex items-center justify-center text-red-400 hover:text-red-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all border border-red-50 z-20"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </button>

                                    <div className="space-y-6">
                                        <div className="space-y-2 md:space-y-3">
                                            <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                Question #{idx + 1}
                                            </label>
                                            <input
                                                type="text" value={q.question_text}
                                                onChange={e => updateQuestion(idx, 'question_text', e.target.value)}
                                                className="w-full bg-white border-none px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base outline-none shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all" placeholder="Enter question..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            {['A', 'B', 'C', 'D'].map(opt => {
                                                const hasText = !!(q as any)[`option_${opt.toLowerCase()}`];
                                                const isCorrect = q.correct_answer === opt;
                                                return (
                                                    <div key={opt} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <label className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest pl-1 ${hasText ? 'text-slate-400' : 'text-slate-300 italic'}`}>
                                                                Option {opt} {!hasText && '(Optional)'}
                                                            </label>
                                                            <button
                                                                onClick={() => updateQuestion(idx, 'correct_answer', opt)}
                                                                disabled={!hasText && opt !== 'A'}
                                                                className={`text-[8px] md:text-[9px] font-black px-2.5 md:px-3 py-1 rounded-full uppercase transition-all ${isCorrect ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
                                                            >
                                                                {isCorrect ? 'Correct' : 'Mark'}
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text" value={(q as any)[`option_${opt.toLowerCase()}`]}
                                                            onChange={e => updateQuestion(idx, `option_${opt.toLowerCase()}` as any, e.target.value)}
                                                            className={`w-full bg-white border-none px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-medium text-sm md:text-base outline-none shadow-sm transition-all ${isCorrect ? 'ring-2 ring-emerald-500 bg-emerald-50/10' : ''}`}
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

                <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                    <div className="flex items-center gap-6 self-start sm:self-auto">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Target className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Pass: {passingScore}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{duration} min</span>
                        </div>
                    </div>
                    <button
                        onClick={() => createQuiz.mutate()}
                        className="w-full sm:w-auto bg-primary-600 text-white px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        {createQuiz.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>Forge Assessment</span>
                    </button>
                </div>
            </motion.div >
        </div >
    );
};
