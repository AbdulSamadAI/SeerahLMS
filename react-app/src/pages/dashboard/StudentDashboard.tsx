import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthContext';
import { useActiveClass } from '../../hooks/useActiveClass';
import {
    Video,
    ClipboardList,
    Target,
    Trophy,
    BarChart3,
    Activity,
    Sun,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Leaderboard } from '../../components/dashboard/Leaderboard';
import { PointsHistoryTable } from '../../components/dashboard/PointsHistoryTable';
import { PieChart } from '../../components/ui/PieChart';

export const StudentDashboard: React.FC = () => {
    const { profile } = useAuth();
    const userId = profile?.id;

    const { activeClass } = useActiveClass();
    const currentClass = activeClass;

    // 2. Fetch student's personal statistics
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['student-stats', userId, activeClass],
        enabled: !!userId,
        refetchInterval: 10000,
        queryFn: async () => {
            if (!userId) return null;

            const [
                videosWatched,
                quizzesData,
                challengesData,
                userData,
                attendanceData,
                totalVideos,
                totalQuizzesData
            ] = await Promise.all([
                supabase.from('video_progress').select('id', { count: 'exact' }).eq('user_id', userId).eq('is_completed', true),
                supabase.from('manual_quiz_grades').select('grade').eq('user_id', userId),
                supabase.from('student_challenge_responses').select('status, challenges(points_completed, points_tried)').eq('user_id', userId),
                supabase.from('users_extended').select('points').eq('id', userId).maybeSingle(),
                supabase.from('attendance_records').select('class_number').eq('user_id', userId).eq('status', 'Present'),
                supabase.from('videos').select('video_id', { count: 'exact' }).eq('class_number', currentClass),
                supabase.rpc('get_total_quiz_count')
            ]);

            const videosCount = videosWatched.count || 0;
            const quizzesCount = quizzesData.data?.length || 0;
            const challengesCount = challengesData.data?.filter(c => c.status !== 'Not Completed').length || 0;
            const attendanceCount = new Set(attendanceData.data?.map(a => a.class_number)).size;

            // Calculate Dynamic Points
            const videoPts = videosCount * 10;
            const quizPts = quizzesData.data?.reduce((sum, q) => sum + (q.grade || 0), 0) || 0;
            const challengePts = challengesData.data?.reduce((sum, c) => {
                const ch = c.challenges as any;
                const pts = c.status === 'Completed' ? (ch?.points_completed || 10) : (ch?.points_tried || 5);
                return sum + (c.status !== 'Not Completed' ? pts : 0);
            }, 0) || 0;
            const attendancePts = attendanceCount * 10; // +10 per class

            const calculatedTotalPoints = videoPts + quizPts + challengePts + attendancePts;

            // Optional: Update database if out of sync
            if (userData?.data?.points !== calculatedTotalPoints) {
                await supabase.from('users_extended').update({ points: calculatedTotalPoints }).eq('id', userId);
            }

            // Calculate completion percentage
            const availableVideos = totalVideos.count || 0;
            const availableQuizzes = (totalQuizzesData as any).data || 0;
            const expectedTotal = availableVideos + availableQuizzes + availableVideos;

            const totalActivities = videosCount + quizzesCount + challengesCount;
            const completionPercentage = expectedTotal > 0
                ? Math.min(Math.round((totalActivities / expectedTotal) * 100), 100)
                : 0;

            return {
                videosWatched: videosCount,
                quizzesCompleted: quizzesCount,
                challengesCompleted: challengesCount,
                totalActivities,
                completionPercentage,
                points: calculatedTotalPoints,
                attendanceCount: attendanceCount,
                activeClass: currentClass
            };
        }
    });

    // Fetch student's rank
    const { data: rank } = useQuery({
        queryKey: ['student-rank', userId],
        enabled: !!userId,
        queryFn: async () => {
            if (!userId) return null;

            const { data: allStudents } = await supabase
                .from('users_extended')
                .select('id, points')
                .eq('role', 'Student')
                .order('points', { ascending: false });

            if (!allStudents) return null;

            const studentRank = allStudents.findIndex(s => s.id === userId) + 1;
            return {
                rank: studentRank,
                totalStudents: allStudents.length
            };
        }
    });


    if (isStatsLoading) {
        return <div className="p-12 animate-pulse space-y-12">
            <div className="grid grid-cols-4 gap-6"><div className="h-40 bg-slate-100 rounded-3xl col-span-1" /></div>
        </div>;
    }

    const statCards = [
        { label: 'Videos Watched', value: stats?.videosWatched || 0, icon: <Video />, color: 'bg-amber-600' },
        { label: 'Quizzes Done', value: stats?.quizzesCompleted || 0, icon: <ClipboardList />, color: 'bg-indigo-600' },
        { label: 'Challenges', value: stats?.challengesCompleted || 0, icon: <Target />, color: 'bg-rose-600' },
        { label: 'Attendance', value: stats?.attendanceCount || 0, icon: <Activity />, color: 'bg-emerald-600' },
    ];

    return (
        <div className="p-4 md:p-12 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                        Welcome, <span className="text-primary-600 underline decoration-4 decoration-primary-200">{profile?.name?.split(' ')[0] || 'Student'}</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Continue your journey to mastery.</p>
                </div>
                <div className="flex items-center self-start md:self-auto gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl border border-amber-100">
                    <Sun className="w-5 h-5 fill-current" />
                    <span className="text-xs font-black uppercase tracking-widest">Class {currentClass} Active</span>
                </div>
            </div>

            {/* 1. Detailed Analytics (Restored Activity Breakdown) */}
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 md:mb-8">Detailed Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="card p-6 md:p-8 bg-white border-slate-100 shadow-lg rounded-[32px] md:rounded-[40px]"
                >
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <h3 className="text-base md:text-lg font-black text-slate-700 uppercase tracking-tight flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-primary-600" />
                            Activity Breakdown
                        </h3>
                    </div>
                    <div className="flex justify-center">
                        <PieChart
                            data={[
                                { label: 'Videos', value: stats?.videosWatched || 0, color: '#F59E0B' },
                                { label: 'Quizzes', value: stats?.quizzesCompleted || 0, color: '#6366F1' },
                                { label: 'Challenges', value: stats?.challengesCompleted || 0, color: '#F43F5E' },
                                { label: 'Attendance', value: stats?.attendanceCount || 0, color: '#10B981' },
                            ]}
                            size={180}
                        />
                    </div>
                </motion.div>

                {/* 4. Rank Card (Moved) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-2xl text-white relative overflow-hidden group min-h-[250px] md:min-h-[300px] flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                    <div className="relative z-10 w-full">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <div className="p-2.5 md:p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Current Rank</div>
                                <div className="text-2xl md:text-3xl font-black italic">#{rank?.rank || '-'}</div>
                            </div>
                        </div>

                        <div>
                            <div className="text-4xl md:text-5xl font-black mb-2 flex items-baseline gap-2">
                                {stats?.points?.toLocaleString() || 0}
                                <span className="text-xs md:text-sm font-bold opacity-40 uppercase tracking-widest">PTS</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((stats?.points || 0) % 500) / 500 * 100}%` }}
                                    className="h-full bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                                />
                            </div>
                            <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-60">
                                <span>Level {Math.floor((stats?.points || 0) / 500) + 1}</span>
                                <span>Next Level</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-6 shadow-lg shadow-slate-100 border border-slate-50 flex flex-col items-center text-center group hover:scale-[1.03] transition-all duration-300"
                    >
                        <div className={`w-12 h-12 md:w-12 md:h-12 ${stat.color} text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 shadow-md`}>
                            {React.cloneElement(stat.icon as any, { className: 'w-6 h-6 md:w-6 md:h-6' })}
                        </div>
                        <span className="text-3xl md:text-3xl font-black text-slate-900 mb-1 md:mb-1">{stat.value}</span>
                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            <div className="mb-12">
                {/* 3. Point Breakdown */}
                <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-50">
                    <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-slate-100">
                        <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                            Point Breakdown
                        </h3>
                        <div className="badge bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                            Live
                        </div>
                    </div>
                    {userId && <PointsHistoryTable userId={userId} />}
                </div>
            </div>

            {/* 5. Leaderboard */}
            <div className="mb-20">
                <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-50">
                    <Leaderboard />
                </div>
            </div>

        </div>
    );
};
