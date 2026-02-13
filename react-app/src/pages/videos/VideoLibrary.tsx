import React from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Play,
    CheckCircle2,
    Calendar,
    ChevronLeft,
    ExternalLink,
    X,
    Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../components/ui/Skeleton';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveClass } from '../../hooks/useActiveClass';

interface Video {
    video_id: number;
    title: string;
    video_link: string;
    class_number: number;
    scheduling_datetime: string;
}

export const VideoLibrary: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { activeClass } = useActiveClass();

    const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);
    const [currentProgress, setCurrentProgress] = React.useState(0);
    const lastSavedProgress = React.useRef<number>(0);

    // 1. Fetch All Videos
    const { data: videos = [], isLoading: isVideosLoading } = useQuery({
        queryKey: ['videos', activeClass],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .eq('class_number', activeClass)
                .order('video_id', { ascending: true });
            if (error) throw error;
            return data as Video[];
        }
    });

    // 2. Fetch Watched Status
    const { data: watchedVideos = [], isLoading: isWatchedLoading } = useQuery({
        queryKey: ['watched-videos-v2', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('video_progress')
                .select('video_id')
                .eq('user_id', user?.id)
                .eq('is_completed', true);
            if (error) throw error;
            return data.map(r => r.video_id);
        }
    });



    // 2c. Save Watch Progress & Award Points
    const saveProgressMutation = useMutation({
        mutationFn: async ({ videoId, percentage }: { videoId: number; percentage: number }) => {
            if (!user) return;

            // Calculate points based on percentage
            let pointsToAward = 0;
            if (percentage >= 100) {
                pointsToAward = 100;
            } else if (percentage >= 50) {
                pointsToAward = 50;
            }

            // Save progress
            const { error: progressError } = await supabase
                .from('video_watch_progress')
                .upsert({
                    user_id: user.id,
                    video_id: videoId,
                    watch_percentage: Math.min(percentage, 100),
                    points_awarded: pointsToAward,
                    last_updated: new Date().toISOString()
                }, {
                    onConflict: 'user_id,video_id'
                });

            if (progressError) throw progressError;

            // Award points to user
            if (pointsToAward > 0) {
                // Get current progress to see if we need to update points
                const { data: existing } = await supabase
                    .from('video_watch_progress')
                    .select('points_awarded')
                    .eq('user_id', user.id)
                    .eq('video_id', videoId)
                    .maybeSingle();

                // Only update points if new award is higher
                if (!existing || existing.points_awarded < pointsToAward) {
                    const pointsDifference = pointsToAward - (existing?.points_awarded || 0);

                    // Update user points
                    const { error: pointsError } = await supabase.rpc('increment_user_points', {
                        p_user_id: user.id,
                        p_points: pointsDifference
                    });

                    if (pointsError) {
                        // Fallback: direct SQL update
                        const { data: userData } = await supabase
                            .from('users_extended')
                            .select('points')
                            .eq('id', user.id)
                            .single();

                        if (userData) {
                            await supabase
                                .from('users_extended')
                                .update({ points: userData.points + pointsDifference })
                                .eq('id', user.id);
                        }
                    }
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['video-watch-progress'] });
            queryClient.invalidateQueries({ queryKey: ['user-points'] });
            queryClient.invalidateQueries({ queryKey: ['student-stats'] });
        }
    });

    // 3. Mutation to mark as watched (Attendance + Points)
    const completeVideo = useMutation({
        mutationFn: async (video: Video) => {
            if (!user) return;

            // 1. Mark as completed in progress table
            await supabase
                .from('video_progress')
                .upsert({
                    user_id: user.id,
                    video_id: video.video_id,
                    is_completed: true,
                    progress_percentage: 100,
                    completed_at: new Date()
                });

            // 2. Award Points (Handled by DB Trigger on video_progress update)
            // Note: Attendance is now marked manually by admins, not automatically here.
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watched-videos-v2'] });
            queryClient.invalidateQueries({ queryKey: ['class-progress'] });
            queryClient.invalidateQueries({ queryKey: ['student-stats'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); // Update admin dasboard if staff is watching
        }
    });

    const getYoutubeVideoId = (url: string) => {
        if (!url) return '';
        const patterns = [
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
            /^[a-zA-Z0-9_-]{11}$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return '';
    };

    const handlePlayVideo = (video: Video) => {
        setSelectedVideo(video);
    };


    if (isVideosLoading || isWatchedLoading) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-8 animate-pulse-slow">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="w-48 h-8" />
                        <Skeleton className="w-64 h-4" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card border-slate-200 overflow-hidden flex flex-col h-full">
                            <Skeleton className="aspect-video w-full" />
                            <div className="p-5 flex-1 flex flex-col space-y-3">
                                <Skeleton className="w-24 h-3" />
                                <Skeleton className="w-full h-6" />
                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                                    <Skeleton className="w-20 h-3" />
                                    <Skeleton className="w-4 h-4 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-1.5 md:p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
                >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">VIDEO LESSONS</h1>
                    <p className="text-slate-500 text-xs md:text-base font-medium">Explore the curriculum of the Prophetic Journey</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {videos.map((video) => {
                    const youtubeId = getYoutubeVideoId(video.video_link);
                    const isWatched = watchedVideos.includes(video.video_id);

                    return (
                        <div
                            key={video.video_id}
                            className="card group hover:shadow-2xl transition-all duration-500 cursor-pointer border-slate-200 overflow-hidden flex flex-col rounded-[24px] md:rounded-[32px]"
                            onClick={() => handlePlayVideo(video)}
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                {youtubeId ? (
                                    <img
                                        src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        alt={video.title}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-200">
                                        <Play className="w-12 h-12" />
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl text-primary-600">
                                        <Play className="w-6 h-6 fill-current" />
                                    </div>
                                </div>

                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-white">
                                    Class {video.class_number}
                                </div>

                                {isWatched && (
                                    <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 ring-2 ring-emerald-400/50">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Watched
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4 md:p-5 flex-1 flex flex-col">
                                <span className="text-[9px] md:text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1 md:mb-1.5">Lesson {video.video_id}</span>
                                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors uppercase tracking-tight truncate">
                                    {video.title}
                                </h3>

                                <div className="mt-auto pt-3 md:pt-4 flex items-center justify-between border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] md:text-xs font-bold uppercase">
                                        <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                        <span>{video.scheduling_datetime ? new Date(video.scheduling_datetime).toLocaleDateString() : 'Curriculum'}</span>
                                    </div>
                                    <div className="text-primary-600 group-hover:translate-x-1 transition-transform">
                                        <ExternalLink className="w-3.5 md:w-4 h-3.5 md:h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {videos.length === 0 && (
                <div className="card p-20 text-center bg-white border-dashed border-2 border-slate-200">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Play className="w-10 h-10 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">The Library is Empty</h2>
                    <p className="text-slate-500 font-medium">Sit tight! Your lessons are currently being scheduled.</p>
                </div>
            )}

            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVideo(null)}
                            className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-6xl z-10 flex flex-col gap-4"
                        >
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all group"
                                >
                                    <X className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>

                            <div className="bg-white rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[70vh] max-h-[90vh]">
                                {/* Left: Content Area */}
                                <div className="flex-[2] bg-black relative">
                                    <VideoPlayer
                                        videoUrl={selectedVideo.video_link}
                                        title={selectedVideo.title}
                                        onProgress={(percentage) => {
                                            setCurrentProgress(percentage);
                                            // Save every 10% increment
                                            if (percentage - lastSavedProgress.current >= 10 || percentage >= 100) {
                                                lastSavedProgress.current = percentage;
                                                saveProgressMutation.mutate({
                                                    videoId: selectedVideo.video_id,
                                                    percentage
                                                });
                                            }
                                        }}
                                        onComplete={() => {
                                            completeVideo.mutate(selectedVideo);
                                        }}
                                    />
                                </div>

                                {/* Right: Interaction Area */}
                                <div className="flex-1 p-6 md:p-10 bg-white overflow-y-auto">
                                    <div className="mb-6 md:mb-10">
                                        <span className="text-[9px] md:text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1 md:mb-2 block">Lesson Masterclass</span>
                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{selectedVideo.title}</h3>
                                        <div className="flex items-center gap-3 text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                                            <span>Class {selectedVideo.class_number}</span>
                                            <span>•</span>
                                            <span className="text-primary-600">Mastery Session</span>
                                        </div>
                                    </div>

                                    {currentProgress >= 100 && (
                                        <div className="space-y-8">
                                            <div className="p-8 bg-primary-50 rounded-[32px] border border-primary-100/50">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                        <Trophy className="w-5 h-5 text-primary-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Mastery Achieved</h4>
                                                    </div>
                                                </div>
                                                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                                    You have successfully completed this lesson. 100 points have been added to your profile.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
