import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
    videoUrl: string;
    onProgress?: (percentage: number) => void;
    onComplete?: () => void;
    title?: string;
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onProgress, onComplete }) => {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYoutubeId(videoUrl);

    useEffect(() => {
        if (!videoId) return;

        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const initPlayer = () => {
            if (window.YT && window.YT.Player && videoId) {
                playerRef.current = new window.YT.Player(`player-${videoId}`, {
                    videoId: videoId,
                    playerVars: {
                        autoplay: 0,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        controls: 1,
                    },
                    events: {
                        onReady: () => { },
                        onStateChange: (event: any) => {
                            if (event.data === window.YT.PlayerState.ENDED) {
                                handleComplete();
                            }
                        },
                    },
                });
            }
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        const interval = setInterval(() => {
            if (playerRef.current && playerRef.current.getDuration) {
                const currentTime = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();
                if (duration > 0) {
                    const percentage = (currentTime / duration) * 100;
                    setProgress(percentage);
                    onProgress?.(percentage);
                    if (percentage >= 95 && !isCompleted) {
                        handleComplete();
                    }
                }
            }
        }, 5000);

        return () => {
            clearInterval(interval);
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [videoId]);

    const handleComplete = () => {
        if (!isCompleted) {
            setIsCompleted(true);
            onComplete?.();
        }
    };

    if (!videoId && !videoUrl) return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No Video Source Available</div>;

    return (
        <div ref={containerRef} className="w-full h-full bg-black rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl relative group">
            {videoId ? (
                <div id={`player-${videoId}`} className="w-full h-full aspect-video" />
            ) : (
                <video
                    className="w-full h-full object-cover"
                    src={videoUrl}
                    controls
                    onTimeUpdate={(e) => {
                        const video = e.target as HTMLVideoElement;
                        const percentage = (video.currentTime / video.duration) * 100;
                        setProgress(percentage);
                        onProgress?.(percentage);
                        if (percentage >= 95 && !isCompleted) {
                            handleComplete();
                        }
                    }}
                    onEnded={handleComplete}
                />
            )}

            {/* Custom Progress Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                <motion.div
                    className="h-full bg-primary-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            {isCompleted && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                >
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Lesson Mastered</h3>
                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mt-2">+100 Points Awarded</p>
                </motion.div>
            )}
        </div>
    );
};
