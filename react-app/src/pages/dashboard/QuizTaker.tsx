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
        onSuccess: (data, variables, context) => {
            navigate(`/quiz/${id}/result`, { state: { ...data, attemptId: data.attemptId } });
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
            <header className="bg-white border-b border-slate-100 p-6 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{quiz.title}</h2>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Assessment in Progress</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Remaining</span>
                            <div className={`flex items-center gap-2 text-xl font-black ${(timeLeft || 0) < 60 ? 'text-red-500 animate-pulse' : 'text-slate-900'}`}>
                                <Timer className="w-5 h-5" />
                                {formatTime(timeLeft || 0)}
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="btn btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-primary-500/20 uppercase tracking-widest font-black text-xs"
                        >
                            Final Submission
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

            <main className="flex-1 max-w-4xl mx-auto w-full p-8 md:p-12 pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12"
                    >
                        <div className="space-y-6">
                            <span className="text-[12px] font-black text-primary-600 uppercase tracking-[0.3em]">Query {currentQuestionIdx + 1} of {quiz.questions.length}</span>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                {currentQuestion.question_text}
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {['A', 'B', 'C', 'D'].map((opt) => {
                                const optKey = `option_${opt.toLowerCase()}`;
                                const text = currentQuestion[optKey];
                                if (!text) return null;

                                const isSelected = answers[currentQuestion.id] === opt;

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleAnswer(currentQuestion.id, opt)}
                                        className={`group relative p-8 rounded-[32px] border-2 text-left transition-all duration-300 ${isSelected
                                            ? 'bg-primary-50 border-primary-500 shadow-xl shadow-primary-500/10'
                                            : 'bg-white border-slate-100 hover:border-primary-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${isSelected ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600'
                                                }`}>
                                                {opt}
                                            </div>
                                            <span className={`text-lg font-bold ${isSelected ? 'text-primary-900' : 'text-slate-700'}`}>
                                                {text}
                                            </span>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    className="ml-auto w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white"
                                                >
                                                    <Check className="w-5 h-5" />
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
                            className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                <Brain className="w-10 h-10" />
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
            <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 p-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIdx === 0}
                        className={`flex items-center gap-3 font-black uppercase tracking-widest text-xs transition-all ${currentQuestionIdx === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:text-slate-900 hover:-translate-x-2'}`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Previous Query
                    </button>

                    <div className="flex gap-2">
                        {quiz.questions.map((_: any, idx: number) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${idx === currentQuestionIdx
                                    ? 'w-8 bg-primary-600'
                                    : answers[quiz.questions[idx].id] ? 'bg-primary-300' : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentQuestionIdx(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                        disabled={currentQuestionIdx === quiz.questions.length - 1}
                        className={`flex items-center gap-3 font-black uppercase tracking-widest text-xs transition-all ${currentQuestionIdx === quiz.questions.length - 1 ? 'text-slate-200 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700 hover:translate-x-2'}`}
                    >
                        Next Query <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </footer>
        </div >
    );
};
