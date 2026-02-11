import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    ChevronLeft,
    Target,
    CheckCircle2,
    Award,
    RefreshCw,
    Trophy,
    Sparkles,
    Flame,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../../components/ui/Skeleton';
import { useActiveClass } from '../../hooks/useActiveClass';

interface Challenge {
    id: number;
    title: string;
    description: string;
    class_number: number;
    max_points: number;
}

export const ChallengeModule: React.FC = () => {
    const { week } = useParams<{ week: string }>();
    const { activeClass } = useActiveClass();
    const classNumber = week ? parseInt(week) : activeClass;
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: challenge, isLoading: isChallengeLoading } = useQuery({
        queryKey: ['challenge', classNumber],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('class_number', classNumber)
                .maybeSingle();
            if (error) throw error;
            return data as Challenge;
        }
    });

    const { data: previousSubmission, isLoading: isScoreCheckLoading } = useQuery({
        queryKey: ['challenge-submission', user?.id, challenge?.id],
        enabled: !!user && !!challenge,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('student_challenge_responses')
                .select('*')
                .eq('user_id', user?.id)
                .eq('challenge_id', challenge?.id)
                .maybeSingle();
            if (error) return null;
            return data;
        }
    });

    const completeChallenge = useMutation({
        mutationFn: async () => {
            if (!challenge || !user) return;

            // 1. Create Submission
            const { error } = await supabase
                .from('student_challenge_responses')
                .upsert({
                    user_id: user.id,
                    challenge_id: challenge.id,
                    status: 'Completed',
                    submitted_at: new Date().toISOString()
                }, { onConflict: 'user_id,challenge_id' });

            if (error) throw error;

            // 2. Award Points (Handled by DB Trigger on student_challenge_responses insert)
            // await supabase.rpc('award_lms_points', ...);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-submission'] });
            queryClient.invalidateQueries({ queryKey: ['student-stats'] });
            queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
        }
    });

    if (isChallengeLoading || isScoreCheckLoading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-12 pb-32 animate-pulse-slow">
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <Skeleton className="w-32 h-8 rounded-full bg-primary-50" />
                    <Skeleton className="w-3/4 h-12 rounded-xl" />
                </div>
                <div className="bg-white rounded-[48px] overflow-hidden shadow-2xl border border-slate-100 p-10 md:p-16 flex flex-col items-center">
                    <Skeleton className="w-32 h-32 rounded-[40px] mb-12" />
                    <Skeleton className="w-2/3 h-10 mb-8" />
                    <div className="w-full space-y-4 max-w-xl mx-auto mb-12">
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-3/4 h-4 mx-auto" />
                    </div>
                    <div className="flex gap-6 mb-16">
                        <Skeleton className="w-40 h-16 rounded-3xl" />
                        <Skeleton className="w-40 h-16 rounded-3xl" />
                    </div>
                    <Skeleton className="w-full h-20 rounded-[32px]" />
                </div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                <div className="card p-16 shadow-2xl bg-white border-none">
                    <div className="w-28 h-28 bg-slate-50 text-slate-300 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-inner">
                        <Target className="w-14 h-14" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-none">The Path Unfolds</h2>
                    <p className="text-slate-500 font-medium text-lg mb-12">The divine trial for Class {classNumber} is still being forged.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-ghost w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest border-2 border-slate-100"
                    >
                        Relocate to Hub
                    </button>
                </div>
            </div>
        );
    }

    const isCompleted = !!previousSubmission;

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
            <div className="flex flex-col items-center text-center mb-16 space-y-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 hover:border-primary-200 transition-all group"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-primary-600" />
                    </button>
                    <span className="badge bg-primary-100 text-primary-700">Divine Trial</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">Class {classNumber} <span className="text-primary-600 font-serif normal-case italic">Challenge</span></h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-white rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-none relative group"
            >
                {/* Immersive Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                <div className={`absolute top-0 left-0 w-full h-2 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-primary-600 shadow-[0_0_15px_rgba(124,58,237,0.5)]'}`} />

                <div className="p-10 md:p-16 flex flex-col items-center relative z-10">
                    <motion.div
                        whileHover={{ rotate: 12, scale: 1.1 }}
                        className={`w-32 h-32 ${isCompleted ? 'bg-emerald-50 text-emerald-500 shadow-emerald-100' : 'bg-primary-50 text-primary-600 shadow-primary-100'} rounded-[40px] flex items-center justify-center mb-12 shadow-2xl transition-all duration-700`}
                    >
                        {isCompleted ? <Trophy className="w-14 h-14" /> : <Target className="w-14 h-14" />}
                    </motion.div>

                    <AnimatePresence>
                        {isCompleted && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl shadow-emerald-500/30"
                            >
                                <Sparkles className="w-4 h-4" />
                                Victory Achieved
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tighter uppercase leading-none">
                        {challenge.title}
                    </h2>

                    <div className="max-w-xl mx-auto text-slate-500 text-xl font-medium leading-relaxed mb-12 text-center whitespace-pre-wrap selection:bg-primary-100 selection:text-primary-900">
                        {challenge.description}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 mb-16">
                        <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 shadow-inner group/stat">
                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover/stat:rotate-12 transition-transform">
                                <Award className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Points Value</span>
                                <span className="text-xl font-black text-slate-900">{challenge.max_points} Points</span>
                            </div>
                        </div>

                        {!isCompleted && (
                            <div className="flex items-center gap-3 bg-primary-50 px-6 py-4 rounded-3xl border border-primary-100 shadow-inner group/stat">
                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover/stat:rotate-12 transition-transform">
                                    <Flame className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Divine Aura</span>
                                    <span className="text-xl font-black text-primary-600">Active</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {isCompleted ? (
                        <div className="w-full space-y-6">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-[32px] p-8 text-emerald-800 font-black uppercase tracking-widest flex items-center justify-center gap-4 text-center"
                            >
                                <Zap className="w-6 h-6 fill-current" />
                                Your contribution has been recorded in the Divine Registry
                            </motion.div>
                            <button
                                onClick={() => navigate('/')}
                                className="text-slate-400 font-bold hover:text-slate-600 transition-all uppercase tracking-[0.2em] text-xs flex items-center gap-2 mx-auto py-4"
                            >
                                Return to Sanctum
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => completeChallenge.mutate()}
                            disabled={completeChallenge.isPending}
                            className="w-full py-7 rounded-[32px] text-xl font-black uppercase tracking-[0.2em] shadow-[0_25px_50px_-12px_rgba(124,58,237,0.3)] bg-primary-600 text-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 hover:bg-primary-700"
                        >
                            {completeChallenge.isPending ? <RefreshCw className="w-7 h-7 animate-spin" /> : <CheckCircle2 className="w-7 h-7" />}
                            I Have Forged My Path
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
