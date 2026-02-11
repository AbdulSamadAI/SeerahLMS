import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthContext';
import { Trophy, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveClass } from '../../hooks/useActiveClass';
import { SimpleErrorBoundary } from '../../components/ui/SimpleErrorBoundary';

interface Challenge {
    id: number;
    class_number: number;
    challenge_number: number;
    topic: string;
    description: string | null;
    points_completed: number;
    points_tried: number;
    points_not_completed: number;
    is_active: boolean;
}

interface ChallengeResponse {
    id: number;
    user_id: string;
    challenge_id: number;
    status: 'Completed' | 'Tried' | 'Not Completed';
    points_awarded: number;
    submitted_at: string;
}

const StudentChallengeViewContent: React.FC = () => {
    console.log("Rendering StudentChallengeViewContent");
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { activeClass } = useActiveClass();
    const [responseConfirmation, setResponseConfirmation] = React.useState<{
        isOpen: boolean;
        challengeId: number | null;
        status: 'Completed' | 'Tried' | 'Not Completed' | null;
        topic: string;
    }>({
        isOpen: false,
        challengeId: null,
        status: null,
        topic: ''
    });

    // Fetch active challenges for the current class
    const { data: challenges, isLoading: challengesLoading } = useQuery({
        queryKey: ['student-challenges', activeClass],
        queryFn: async () => {
            if (!activeClass) return [];
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('is_active', true)
                .eq('class_number', activeClass)
                .order('challenge_number', { ascending: true });
            if (error) throw error;
            return (data || []) as Challenge[];
        },
        enabled: !!activeClass
    });

    // Fetch user's responses
    const { data: responses, isLoading: responsesLoading } = useQuery({
        queryKey: ['student-challenge-responses', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('student_challenge_responses')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            return (data || []) as ChallengeResponse[];
        },
        enabled: !!user?.id
    });

    // Create response mutation
    const respondMutation = useMutation({
        mutationFn: async ({ challengeId, status }: { challengeId: number; status: string }) => {
            if (!user?.id) throw new Error('Not authenticated');
            console.log(`[Challenge Response] Attempting to submit "${status}" for challenge ID ${challengeId}`);

            const { error } = await supabase.from('student_challenge_responses').upsert([{
                user_id: user.id,
                challenge_id: challengeId,
                status: status,
                submitted_at: new Date().toISOString() // Ensure timestamp is updated
            }], { onConflict: 'user_id,challenge_id' });
            if (error) throw error;
        },
        onSuccess: () => {
            console.log('[Challenge Response] Submission successful');
            queryClient.invalidateQueries({ queryKey: ['student-challenge-responses'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            alert('Challenge response submitted! Points have been awarded.');
            setResponseConfirmation({ isOpen: false, challengeId: null, status: null, topic: '' });
        },
        onError: (err: any) => {
            console.error('[Challenge Response] Submission failed:', err);
            alert(`Error submitting response: ${err.message}`);
            setResponseConfirmation({ isOpen: false, challengeId: null, status: null, topic: '' });
        }
    });

    const getResponseForChallenge = (challengeId: number) => {
        return responses?.find(r => r.challenge_id === challengeId);
    };

    const handleRespond = (challengeId: number, status: 'Completed' | 'Tried' | 'Not Completed', topic: string) => {
        console.log(`[Challenge Response] handleRespond clicked: ${topic} -> ${status}`);
        setResponseConfirmation({
            isOpen: true,
            challengeId,
            status,
            topic
        });
    };

    const confirmResponse = () => {
        if (responseConfirmation.challengeId && responseConfirmation.status) {
            respondMutation.mutate({
                challengeId: responseConfirmation.challengeId,
                status: responseConfirmation.status
            });
        }
    };

    if (challengesLoading || responsesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading challenges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="badge bg-purple-100 text-purple-700">Student Portal</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Challenges</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">
                        Class <span className="text-purple-600">{activeClass}</span> <span className="text-slate-400 font-normal lowercase italic">Challenges</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Complete the divine trials for Class {activeClass} to earn spiritual points</p>
                </header>

                {/* Challenges Grid */}
                <div className="space-y-8">
                    {challenges && challenges.length > 0 ? (
                        <div className="card bg-white shadow-2xl rounded-[40px] overflow-hidden">
                            <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <Trophy className="w-5 h-5 md:w-6 md:h-6" />
                                    Active Divine Trials
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {challenges.map((challenge, idx) => {
                                    const response = getResponseForChallenge(challenge.id);
                                    const hasResponded = !!response;

                                    return (
                                        <motion.div
                                            key={challenge.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`p-4 md:p-6 ${hasResponded ? 'bg-slate-50/50' : 'hover:bg-purple-50/30'} transition-colors`}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <span className="badge bg-purple-100 text-purple-700 text-xs font-black">
                                                            Challenge #{challenge.challenge_number}
                                                        </span>
                                                        {hasResponded && (
                                                            <span className={`badge text-[10px] font-black ${response.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                response.status === 'Tried' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-slate-200 text-slate-600'
                                                                }`}>
                                                                {response.status} · +{response.points_awarded}pts
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg md:text-xl font- black text-slate-900 mb-2">{challenge.topic}</h3>
                                                    {challenge.description && (
                                                        <p className="text-sm text-slate-600 mb-3">{challenge.description}</p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs font-bold uppercase tracking-wider">
                                                        <span className="text-emerald-600">✓ Completed: +{challenge.points_completed}pts</span>
                                                        <span className="text-amber-600">~ Tried: +{challenge.points_tried}pts</span>
                                                        <span className="text-slate-400">✗ Not Completed: {challenge.points_not_completed}pts</span>
                                                    </div>
                                                </div>

                                                {/* Response Buttons */}
                                                {hasResponded ? (
                                                    <div className="flex items-center gap-2 text-sm bg-white rounded-2xl px-4 py-3 shadow-md">
                                                        {response.status === 'Completed' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                                                        {response.status === 'Tried' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                                                        {response.status === 'Not Completed' && <XCircle className="w-5 h-5 text-slate-400" />}
                                                        <span className="font-bold text-slate-700">Responded</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                        <button
                                                            onClick={() => handleRespond(challenge.id, 'Completed', challenge.topic)}
                                                            disabled={respondMutation.isPending}
                                                            className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {respondMutation.isPending ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : '✓ Completed'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRespond(challenge.id, 'Tried', challenge.topic)}
                                                            disabled={respondMutation.isPending}
                                                            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {respondMutation.isPending ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : '~ Tried'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRespond(challenge.id, 'Not Completed', challenge.topic)}
                                                            disabled={respondMutation.isPending}
                                                            className="px-4 py-3 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-slate-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {respondMutation.isPending ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : '✗ Not Completed'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="card bg-white shadow-lg rounded-[40px] p-16 text-center">
                            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight mb-2">No Challenges for Class {activeClass}</h3>
                            <p className="text-slate-500 font-medium italic">The divine trials are not yet visible for this stage of your journey.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {responseConfirmation.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
                        onClick={() => setResponseConfirmation({ ...responseConfirmation, isOpen: false })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Submit Response?</h3>
                            <p className="text-slate-500 mb-8 font-medium">
                                Are you sure you want to mark "{responseConfirmation.topic}" as <span className="text-purple-600 font-bold italic">"{responseConfirmation.status}"</span>?
                                <br /><span className="text-xs text-rose-500 font-bold uppercase mt-2 block">This action cannot be undone.</span>
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setResponseConfirmation({ ...responseConfirmation, isOpen: false })}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-colors uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmResponse}
                                    disabled={respondMutation.isPending}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-xl shadow-purple-600/20"
                                >
                                    {respondMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        'Confirm Submission'
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

export const StudentChallengeView: React.FC = () => {
    return (
        <SimpleErrorBoundary>
            <StudentChallengeViewContent />
        </SimpleErrorBoundary>
    );
};
