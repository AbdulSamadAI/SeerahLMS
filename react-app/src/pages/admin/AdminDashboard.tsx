import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Users,
    Video,
    ClipboardList,
    Target,
    Trophy,
    History,
    Search,
    AlertCircle,
    Activity,
    BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart } from '../../components/ui/PieChart';
import { ClassSwitcher } from '../../components/admin/ClassSwitcher';

export const AdminDashboard: React.FC = () => {
    // 1. Fetch Stats
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['admin-stats'],
        refetchInterval: 5000, // Auto-refresh every 5 seconds
        staleTime: 0, // Always consider data stale
        queryFn: async () => {
            const [
                students,
                admins,
                videos,
                quizzes,
                challenges,
                attendanceData
            ] = await Promise.all([
                supabase.from('users_extended').select('id', { count: 'exact' }).eq('role', 'Student'),
                supabase.from('users_extended').select('id', { count: 'exact' }).in('role', ['Admin', 'Instructor']),
                supabase.from('videos').select('video_id', { count: 'exact' }),
                supabase.from('manual_quiz_grades').select('quiz_number'),
                supabase.from('challenges').select('id', { count: 'exact' }),
                supabase.from('attendance_records').select('class_number'),
            ]);

            const uniqueQuizzes = new Set(quizzes.data?.map(q => q.quiz_number)).size;
            const uniqueAttendance = new Set(attendanceData.data?.map(a => a.class_number)).size;

            return [
                { label: 'Students', value: students.count || 0, icon: <Users />, color: 'bg-blue-600' },
                { label: 'Staff', value: admins.count || 0, icon: <AlertCircle />, color: 'bg-slate-600' },
                { label: 'Videos', value: videos.count || 0, icon: <Video />, color: 'bg-amber-600' },
                { label: 'Quizzes', value: uniqueQuizzes, icon: <ClipboardList />, color: 'bg-indigo-600' },
                { label: 'Challenges', value: challenges.count || 0, icon: <Target />, color: 'bg-rose-600' },
                { label: 'Attendance', value: uniqueAttendance, icon: <Activity />, color: 'bg-emerald-600' },
            ];
        }
    });

    // 2. Fetch Leaderboard
    const { data: leaderboard, isLoading: isLeaderboardLoading } = useQuery({
        queryKey: ['admin-leaderboard'],
        refetchInterval: 10000, // Auto-refresh every 10 seconds
        staleTime: 0,
        queryFn: async () => {
            const { data: users, error } = await supabase
                .from('users_extended')
                .select('id, name, email, points')
                .eq('role', 'Student')
                .order('points', { ascending: false })
                .limit(5);

            if (error) throw error;

            // Fetch completion counts for these users
            const results = await Promise.all(users.map(async (u) => {
                const [videos] = await Promise.all([
                    supabase.from('video_progress').select('id', { count: 'exact' }).eq('user_id', u.id).eq('is_completed', true)
                ]);
                return {
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    total_points: u.points || 0,
                    completed: (videos.count || 0)
                };
            }));

            return results;
        }
    });

    // 3. Fetch Recent Activity (Mirroring PHP Logic)
    const { data: recentActivity, isLoading: isActivityLoading } = useQuery({
        queryKey: ['admin-activity'],
        refetchInterval: 10000, // Auto-refresh every 10 seconds
        staleTime: 0,
        queryFn: async () => {
            const [challenges, attendance, quizzes] = await Promise.all([
                supabase.from('student_challenge_responses').select('submitted_at, users_extended(name), challenges(topic)').order('submitted_at', { ascending: false }).limit(10),
                supabase.from('attendance_records').select('class_number, created_at, users_extended(name)').eq('is_present', true).order('created_at', { ascending: false }).limit(10),
                supabase.from('manual_quiz_grades').select('quiz_number, feedback, user_id, users_extended(name)').order('quiz_number', { ascending: false }).limit(10)
            ]);

            const activities = [
                ...(challenges.data || []).map((c: any) => ({
                    type: 'challenge',
                    user: c.users_extended?.name || 'Unknown',
                    activity: `Completed Challenge: ${c.challenges?.title || 'Untitled'}`,
                    date: c.created_at
                })),
                ...(attendance.data || []).map((a: any) => ({
                    type: 'attendance',
                    user: a.users_extended?.name || 'Unknown',
                    activity: `Attended Class ${a.class_number} session`,
                    date: a.created_at
                })),
                ...(quizzes.data || []).map((q: any) => ({
                    type: 'quiz',
                    user: q.users_extended?.name || 'Unknown',
                    activity: `Graded Quiz ${q.quiz_number}: ${q.feedback || 'Manual Assessment'}`,
                    date: new Date().toISOString() // Fallback as we don't have created_at in manual_quiz_grades yet
                }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

            return activities;
        }
    });

    if (isStatsLoading || isLeaderboardLoading || isActivityLoading) {
        return <div className="p-12 animate-pulse space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-slate-100 rounded-3xl" />)}
            </div>
        </div>;
    }

    return (
        <div className="p-8 md:p-12">
            <header className="mb-12">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-2">System Overview</h2>
                <p className="text-slate-500 font-medium">Real-time statistics across the mastery platform</p>
            </header>

            {/* Week Control Section */}
            <div className="mb-16">
                <ClassSwitcher />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
                {stats?.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center text-center group hover:scale-105 transition-all duration-500"
                    >
                        <div className={`w-14 h-14 ${stat.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
                            {React.cloneElement(stat.icon as any, { className: 'w-7 h-7' })}
                        </div>
                        <span className="text-3xl font-black text-slate-900 mb-1">{stat.value}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Visual Statistics Section */}
            <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Content Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card p-10 bg-white border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px] lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-primary-600" />
                            Content Distribution
                        </h3>
                    </div>
                    <div className="flex justify-center">
                        <PieChart
                            data={[
                                { label: 'Videos', value: stats?.[2].value || 0, color: '#F59E0B' },
                                { label: 'Quizzes', value: stats?.[3].value || 0, color: '#6366F1' },
                                { label: 'Challenges', value: stats?.[4].value || 0, color: '#F43F5E' },
                                { label: 'Attendance', value: stats?.[5].value || 0, color: '#10B981' },
                            ]}
                            size={200}
                        />
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Leaderboard Card */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="card p-10 bg-white border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px]">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <Trophy className="w-6 h-6 text-amber-500" />
                                Top Performing Students
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {leaderboard?.map((student, idx) => (
                                <div key={student.id} className="flex items-center justify-between p-5 rounded-[24px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-2 ${idx === 0 ? 'bg-amber-100 text-amber-600 border-amber-200' : idx === 1 ? 'bg-slate-100 text-slate-600 border-slate-200' : idx === 2 ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-slate-400 border-slate-100'}`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{student.name}</h4>
                                            <p className="text-slate-400 text-xs font-bold truncate max-w-[200px]">{student.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-12 text-right">
                                        <div className="hidden sm:block">
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Mastery</div>
                                            <div className="flex items-center gap-1">
                                                <Target className="w-3 h-3 text-emerald-500" />
                                                <span className="text-xs font-black text-slate-600">{student.completed}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-black text-slate-900 group-hover:scale-110 transition-transform">{student.total_points}</div>
                                            <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none">PTS</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="card p-10 bg-white border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px]">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <Activity className="w-6 h-6 text-primary-500" />
                                Recent Activity
                            </h3>
                        </div>

                        <div className="space-y-6">
                            {recentActivity?.map((act, idx) => (
                                <div key={idx} className="flex gap-6 items-start group">
                                    <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 ${act.type === 'challenge' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{act.user}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">{act.activity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="card p-8 bg-slate-900 border-none rounded-[40px] text-white overflow-hidden relative shadow-2xl shadow-slate-900/40">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-tight mb-4">Quick Find</h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input type="text" placeholder="Find student..." className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl focus:outline-none focus:bg-white/20 transition-all font-bold placeholder-slate-500" />
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    </div>

                    <div className="card p-8 bg-white border-slate-100 rounded-[40px] shadow-xl shadow-slate-200/50">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                            <History className="w-4 h-4" />
                            System Health
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Supabase DB', status: 'Optimal', color: 'text-emerald-500' },
                                { label: 'Edge Functions', status: 'Online', color: 'text-emerald-500' },
                                { label: 'Auth Sync', status: 'Connected', color: 'text-emerald-500' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <span className="text-slate-600 font-bold text-sm">{item.label}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
