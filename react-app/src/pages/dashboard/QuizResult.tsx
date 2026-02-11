import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Trophy,
    ArrowRight,
    Home,
    RotateCcw,
    Award,
    Target,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export const QuizResult: React.FC = () => {
    const { state } = useLocation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    if (!state) {
        navigate('/quizzes');
        return null;
    }

    const { score, isPassed, correctCount, attemptId } = state;

    // Fetch detailed answers
    const { data: reviewData } = useQuery({
        queryKey: ['quiz-review', attemptId],
        enabled: !!attemptId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('quiz_answers')
                .select(`
                    *,
                    question:quiz_questions(*)
                `)
                .eq('attempt_id', attemptId);
            if (error) throw error;
            return data;
        }
    });

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 md:p-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-2xl w-full bg-white rounded-[60px] shadow-2xl overflow-hidden relative"
            >
                {/* Score Header */}
                <div className={`p-16 text-center relative overflow-hidden ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {/* Animated Sparkles for pass */}
                    {isPassed && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
                            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
                        />
                    )}

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="relative z-10 w-32 h-32 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white/50"
                    >
                        <Trophy className="w-16 h-16 text-white" />
                    </motion.div>

                    <h1 className="text-5xl font-black text-white uppercase tracking-tight mb-2 relative z-10">
                        {isPassed ? 'Sanctuary Mastery' : 'Assessment Failure'}
                    </h1>
                    <p className="text-white/80 font-bold uppercase tracking-widest text-sm relative z-10">
                        {isPassed ? 'Knowledge Verified & Recorded' : 'Further Study Required'}
                    </p>
                </div>

                <div className="p-16 space-y-12">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-8 text-center">
                        <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100">
                            <div className="text-4xl font-black text-slate-900 mb-1">{score}%</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Score</div>
                        </div>
                        <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100">
                            <div className="text-4xl font-black text-slate-900 mb-1">{isPassed ? '+100' : '0'}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points Earned</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50">
                            <div className="flex items-center gap-4">
                                <Target className="w-6 h-6 text-primary-600" />
                                <span className="font-bold text-slate-700">Analytical Precision</span>
                            </div>
                            <span className="font-black text-slate-900">{correctCount} Correct Queries</span>
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50">
                            <div className="flex items-center gap-4">
                                <Award className={`w-6 h-6 ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`} />
                                <span className="font-bold text-slate-700">Sanctuary Status</span>
                            </div>
                            <span className={`font-black uppercase tracking-widest ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isPassed ? 'Advanced' : 'Standard'}
                            </span>
                        </div>
                    </div>

                    {/* Detailed Review */}
                    {reviewData && (
                        <div className="space-y-8">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight pb-4 border-b border-slate-100">
                                Detailed Review
                            </h3>
                            <div className="space-y-6">
                                {reviewData.map((ans: any, idx: number) => (
                                    <div key={idx} className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <h4 className="font-bold text-slate-900 leading-tight">
                                                <span className="text-primary-600 mr-2">#{idx + 1}</span>
                                                {ans.question.question_text}
                                            </h4>
                                            {ans.is_correct ? (
                                                <span className="shrink-0 bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Correct</span>
                                            ) : (
                                                <span className="shrink-0 bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Incorrect</span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Selection</p>
                                                <p className={`p-4 rounded-2xl text-sm font-bold ${ans.is_correct ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                                    Option {ans.selected_answer}: {ans.question[`option_${ans.selected_answer?.toLowerCase()}`]}
                                                </p>
                                            </div>
                                            {!ans.is_correct && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Answer</p>
                                                    <p className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-bold">
                                                        Option {ans.question.correct_answer}: {ans.question[`option_${ans.question.correct_answer?.toLowerCase()}`]}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="flex-1 btn btn-ghost py-5 border-2 border-slate-100 shadow-xl rounded-[24px] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs"
                        >
                            <Home className="w-4 h-4" /> Return to Intel
                        </button>
                        <button
                            onClick={() => navigate(`/quiz/${id}`)}
                            className={`flex-[2] btn py-5 shadow-2xl rounded-[24px] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs text-white ${isPassed ? 'bg-primary-600 shadow-primary-500/20' : 'bg-slate-900'}`}
                        >
                            {isPassed ? <Sparkles className="w-5 h-5" /> : <RotateCcw className="w-4 h-4" />}
                            {isPassed ? 'Continue Mastery' : 'Retry Verification'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
