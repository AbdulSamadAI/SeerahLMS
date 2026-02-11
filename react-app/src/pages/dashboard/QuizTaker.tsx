import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthContext';
import {
    Brain,
    Timer,
    ArrowRight,
    ArrowLeft,
    Check,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuizTaker: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmSubmit, setConfirmSubmit] = useState(false);

    const { data: quiz, isLoading } = useQuery({
        queryKey: ['quiz-taking', id],
        queryFn: async () => {
            const { data: header, error: hError } = await supabase
                .from('quiz_headers')
                .select('*')
                .eq('id', id)
                .single();
            if (hError) throw hError;

            const { data: questions, error: qError } = await supabase
                .from('quiz_questions')
                .select('*')
                .eq('quiz_id', id)
                .order('order_index', { ascending: true });
            if (qError) throw qError;

            return { ...header, questions };
        }
    });

    useEffect(() => {
        if (quiz && timeLeft === null) {
            setTimeLeft(quiz.duration_minutes * 60);
        }
    }, [quiz]);

    useEffect(() => {
        if (timeLeft === 0) handleSubmit();
        if (!timeLeft || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers({ ...answers, [questionId]: answer });
    };

    const submitQuiz = useMutation({
        mutationFn: async () => {
            if (!quiz || !user) return;
            setIsSubmitting(true);

            // 1. Calculate Results
            let correctCount = 0;
            const processedAnswers = quiz.questions.map((q: any) => {
                const selected = answers[q.id];
                const isCorrect = selected === q.correct_answer;
                if (isCorrect) correctCount++;
                return {
                    question_id: q.id,
                    selected_answer: selected,
                    is_correct: isCorrect
                };
            });

            const score = Math.round((correctCount / quiz.questions.length) * 100);
            const isPassed = score >= quiz.passing_score;

            // 2. Create Attempt
            const { data: attempt, error: aError } = await supabase
                .from('quiz_attempts')
                .insert({
                    quiz_id: quiz.id,
                    student_id: user.id,
                    score,
                    total_questions: quiz.questions.length,
                    correct_answers: correctCount,
                    time_taken_seconds: quiz.duration_minutes * 60 - (timeLeft || 0),
                    is_passed: isPassed,
                    completed_at: new Date()
                })
                .select()
                .single();

            if (aError) throw aError;

            // 3. Save Answers
            const { error: ansError } = await supabase
                .from('quiz_answers')
                .insert(processedAnswers.map((ans: any) => ({ ...ans, attempt_id: attempt.id })));

            if (ansError) throw ansError;

            // 4. Award Points (Handled by DB Trigger on quiz_attempts insert)
            // if (isPassed) { await supabase.rpc('award_lms_points', ...); }

            return { score, isPassed, correctCount, attemptId: attempt.id };
        },
        onSuccess: (data) => {
            if (data) {
                navigate(`/quiz/${id}/result`, { state: { ...data, attemptId: data.attemptId } });
            }
        }
    });

    const handleSubmit = () => {
        setConfirmSubmit(true);
    };

    const confirmQuizSubmission = () => {
        submitQuiz.mutate();
        setConfirmSubmit(false);
    };

    if (isLoading || !quiz) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-12">
            <RefreshCw className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
    );

    const currentQuestion = quiz.questions[currentQuestionIdx];
    const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header / HUD */}
            <header className="bg-white border-b border-slate-100 p-4 md:p-6 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-50 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                            <Brain className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm md:text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1 truncate">{quiz.title}</h2>
                            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Assessment</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8 shrink-0">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Left</span>
                            <div className={`flex items-center gap-2 text-xl font-black ${(timeLeft || 0) < 60 ? 'text-red-500 animate-pulse' : 'text-slate-900'}`}>
                                <Timer className="w-5 h-5" />
                                {formatTime(timeLeft || 0)}
                            </div>
                        </div>
                        <div className="sm:hidden flex items-center gap-1.5 text-xs font-black font-mono bg-slate-50 px-2 py-1 rounded-lg">
                            <Timer className={`w-3.5 h-3.5 ${(timeLeft || 0) < 60 ? 'text-red-500' : 'text-slate-400'}`} />
                            <span className={(timeLeft || 0) < 60 ? 'text-red-500' : 'text-slate-600'}>{formatTime(timeLeft || 0)}</span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-primary-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-lg shadow-primary-500/20 uppercase tracking-widest font-black text-[9px] md:text-xs hover:bg-primary-700 transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary-600"
                    />
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8 md:space-y-12"
                    >
                        <div className="space-y-4 md:space-y-6">
                            <span className="text-[11px] md:text-[12px] font-black text-primary-600 uppercase tracking-[0.3em]">Query {currentQuestionIdx + 1} of {quiz.questions.length}</span>
                            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                {currentQuestion.question_text}
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                            {['A', 'B', 'C', 'D'].map((opt) => {
                                const optKey = `option_${opt.toLowerCase()}`;
                                const text = currentQuestion[optKey];
                                if (!text) return null;

                                const isSelected = answers[currentQuestion.id] === opt;

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleAnswer(currentQuestion.id, opt)}
                                        className={`group relative p-5 md:p-8 rounded-[24px] md:rounded-[32px] border-2 text-left transition-all duration-300 ${isSelected
                                            ? 'bg-primary-50 border-primary-500 shadow-xl shadow-primary-500/10'
                                            : 'bg-white border-slate-100 hover:border-primary-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-base md:text-lg transition-all ${isSelected ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600'
                                                }`}>
                                                {opt}
                                            </div>
                                            <span className={`text-base md:text-lg font-bold flex-1 ${isSelected ? 'text-primary-900' : 'text-slate-700'}`}>
                                                {text}
                                            </span>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    className="w-6 h-6 md:w-8 md:h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shrink-0"
                                                >
                                                    <Check className="w-4 h-4 md:w-5 h-5" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmSubmit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                        onClick={() => setConfirmSubmit(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl max-w-md w-full p-6 md:p-8 text-center"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-50 text-primary-600 rounded-[24px] md:rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                <Brain className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Submit Assessment?</h3>
                            <p className="text-slate-500 mb-8 font-medium">
                                Are you ready to submit your answers?
                                <br /><span className="text-xs text-primary-600 font-bold uppercase mt-2 block">Make sure you have reviewed your work.</span>
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setConfirmSubmit(false)}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmQuizSubmission}
                                    className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-xl shadow-primary-600/20"
                                >
                                    Confirm Submission
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Controls */}
            <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 md:p-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIdx === 0}
                        className={`flex items-center gap-2 md:gap-3 font-black uppercase tracking-widest text-[9px] md:text-xs transition-all ${currentQuestionIdx === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900 hover:-translate-x-1'}`}
                    >
                        <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Previous
                    </button>

                    <div className="flex gap-1 md:gap-2 overflow-hidden">
                        {quiz.questions.map((_: any, idx: number) => (
                            <div
                                key={idx}
                                className={`h-1 md:h-1.5 rounded-full transition-all duration-500 shrink-0 ${idx === currentQuestionIdx
                                    ? 'w-4 md:w-8 bg-primary-600'
                                    : answers[quiz.questions[idx].id] ? 'w-1 md:w-1.5 bg-primary-300' : 'w-1 md:w-1.5 bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentQuestionIdx(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                        disabled={currentQuestionIdx === quiz.questions.length - 1}
                        className={`flex items-center gap-2 md:gap-3 font-black uppercase tracking-widest text-[9px] md:text-xs transition-all ${currentQuestionIdx === quiz.questions.length - 1 ? 'text-slate-200 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700 hover:translate-x-1'}`}
                    >
                        Next <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                </div>
            </footer>
        </div >
    );
};
