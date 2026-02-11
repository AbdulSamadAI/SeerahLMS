import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Trophy, Crown, Star, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Leaderboard: React.FC = () => {
    const { data: rankings, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users_extended')
                .select('id, name, points, role')
                .eq('role', 'Student')
                .order('points', { ascending: false })
                .limit(10);

            if (error) throw error;
            return data;
        },
        refetchInterval: 5000 // Faster refetch for demo feel
    });

    if (isLoading) return <div className="p-12 animate-pulse space-y-4"><div className="h-20 bg-slate-50 rounded-3xl" /></div>;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sanctuary <span className="text-primary-600">Elite</span></h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Student Rankings</p>
                </div>
                <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                    <Trophy className="w-5 h-5" />
                </div>
            </header>

            <div className="space-y-4">
                {rankings?.map((student, idx) => (
                    <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`group relative p-6 rounded-[32px] border transition-all duration-300 flex items-center gap-6 ${idx === 0
                            ? 'bg-amber-50 border-amber-100 shadow-xl shadow-amber-500/10'
                            : 'bg-white border-slate-50 hover:border-primary-100 hover:shadow-xl'
                            }`}
                    >
                        {/* Rank Badge */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-amber-500 text-white shadow-lg' :
                            idx === 1 ? 'bg-slate-300 text-white' :
                                idx === 2 ? 'bg-orange-400 text-white' : 'bg-slate-50 text-slate-400'
                            }`}>
                            {idx + 1}
                        </div>

                        {/* Student Info */}
                        <div className="flex-1 flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border-2 border-white group-hover:bg-primary-50">
                                <User className="w-5 h-5 text-slate-300 group-hover:text-primary-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                    {student.name || 'Anonymous Seeker'}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <Star className={`w-3 h-3 ${idx === 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Level {Math.floor((student.points || 0) / 500) + 1}</span>
                                </div>
                            </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                            <div className="text-lg font-black text-slate-900 leading-none mb-1 group-hover:scale-110 transition-transform">{student.points?.toLocaleString() || 0}</div>
                            <div className="text-[9px] font-black text-primary-600 uppercase tracking-[0.2em]">Sanctuary Pts</div>
                        </div>

                        {/* Top Rank Icons */}
                        {idx === 0 && <Crown className="absolute -top-3 -left-3 w-8 h-8 text-amber-500 drop-shadow-lg animate-bounce" />}
                    </motion.div>
                ))}
            </div>

            <button className="w-full py-4 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-primary-50 hover:text-primary-600 transition-all">
                View Full Sanctuary Rankings
            </button>
        </div>
    );
};
