import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Play,
    Brain,
    Target,
    CheckCircle2,
    Clock,
    Award,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PointTransaction {
    id: string;
    type: 'Video' | 'Quiz' | 'Challenge' | 'Attendance';
    title: string;
    points: number;
    date: string;
    status?: string;
}

interface PointsHistoryTableProps {
    userId: string;
}

export const PointsHistoryTable: React.FC<PointsHistoryTableProps> = ({ userId }) => {
    const { data: history, isLoading } = useQuery({
        queryKey: ['points-history', userId],
        enabled: !!userId,
        queryFn: async () => {
            const [videosWatch, videosComplete, quizzes, challenges, attendance] = await Promise.all([
                // 1. Detailed Watch Progress (v1)
                supabase.from('video_watch_progress')
                    .select('video_id, points_awarded, last_updated, videos(title)')
                    .eq('user_id', userId)
                    .gt('points_awarded', 0),
                // 2. Completed Videos (v2) - Sync with dashboard counter
                supabase.from('video_progress')
                    .select('video_id, completed_at, videos(title)')
                    .eq('user_id', userId)
                    .eq('is_completed', true),
                // 3. Quizzes
                supabase.from('manual_quiz_grades')
                    .select('quiz_number, grade, feedback')
                    .eq('user_id', userId)
                    .gt('grade', 0),
                // 4. Challenges
                supabase.from('student_challenge_responses')
                    .select('status, submitted_at, challenges(topic, points_completed, points_tried)')
                    .eq('user_id', userId)
                    .neq('status', 'Not Completed'),
                // 5. Attendance
                supabase.from('attendance_records')
                    .select('class_number, session_topic, date_of_class, status')
                    .eq('user_id', userId)
                    .eq('status', 'Present')
            ]);

            // Deduplicate Videos: prioritize watch progress data (v1) but ensure all completed (v2) are shown
            const videoMap = new Map<number, PointTransaction>();

            // First add completed videos (v2) - these are the baseline for +10 pts
            (videosComplete.data || []).forEach(v => {
                videoMap.set(v.video_id, {
                    id: `video-${v.video_id}`,
                    type: 'Video',
                    title: (v.videos as any)?.title || `Video ${v.video_id}`,
                    points: 10,
                    date: v.completed_at || new Date().toISOString()
                });
            });

            // Then layer on v1 data (which might have different points or dates)
            (videosWatch.data || []).forEach(v => {
                videoMap.set(v.video_id, {
                    id: `video-${v.video_id}`,
                    type: 'Video',
                    title: (v.videos as any)?.title || `Video ${v.video_id}`,
                    points: v.points_awarded,
                    date: v.last_updated
                });
            });

            const normalized: PointTransaction[] = [
                ...Array.from(videoMap.values()),
                ...(quizzes.data || []).map(q => ({
                    id: `quiz-${q.quiz_number}`,
                    type: 'Quiz' as const,
                    title: `Quiz ${q.quiz_number}: ${q.feedback || 'Assessment'}`,
                    points: q.grade,
                    date: new Date().toISOString() // Fallback
                })),
                ...(challenges.data || []).map(c => {
                    const ch = c.challenges as any;
                    const pts = c.status === 'Completed' ? ch?.points_completed : ch?.points_tried;
                    return {
                        id: `challenge-${c.submitted_at}`,
                        type: 'Challenge' as const,
                        title: ch?.topic || 'Challenge',
                        points: pts || 0,
                        date: c.submitted_at,
                        status: c.status
                    };
                }),
                ...(attendance.data || []).map(a => ({
                    id: `attendance-${a.class_number}`,
                    type: 'Attendance' as const,
                    title: a.session_topic || `Class ${a.class_number}`,
                    points: 10, // Corrected to +10 as per user request
                    date: a.date_of_class
                }))
            ];

            return normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-3xl" />
                ))}
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100">
                <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No points earned yet</p>
                <p className="text-slate-400 text-[10px] mt-1">Activities will appear here once points are awarded.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((tx, idx) => (
                <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-[32px] p-5 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-500 border border-slate-100 flex items-center gap-6"
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner relative transition-transform group-hover:scale-110 duration-500 ${tx.type === 'Video' ? 'bg-amber-50 text-amber-600' :
                        tx.type === 'Quiz' ? 'bg-indigo-50 text-indigo-600' :
                            tx.type === 'Challenge' ? 'bg-rose-50 text-rose-600' :
                                'bg-emerald-50 text-emerald-600'
                        }`}>
                        {tx.type === 'Video' ? <Play className="w-6 h-6 fill-current" /> :
                            tx.type === 'Quiz' ? <Brain className="w-6 h-6" /> :
                                tx.type === 'Challenge' ? <Target className="w-6 h-6" /> :
                                    <CheckCircle2 className="w-6 h-6" />}

                        <div className="absolute -top-2 -right-2 bg-white shadow-md border border-slate-50 w-6 h-6 rounded-full flex items-center justify-center">
                            <Award className="w-3.5 h-3.5 text-primary-600" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${tx.type === 'Video' ? 'bg-amber-100 text-amber-700' :
                                tx.type === 'Quiz' ? 'bg-indigo-100 text-indigo-700' :
                                    tx.type === 'Challenge' ? 'bg-rose-100 text-rose-700' :
                                        'bg-emerald-100 text-emerald-700'
                                }`}>
                                {tx.type}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                            {tx.title}
                        </h4>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-black text-slate-900 flex items-center justify-end gap-1">
                            <span className="text-primary-600 text-sm font-black">+</span>
                            {tx.points}
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Points</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
