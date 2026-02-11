import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Video,
    Plus,
    Search,
    Filter,
    Play,
    Edit3,
    Trash2,
    Save,
    X,
    Upload,
    Link as LinkIcon,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoRecord {
    video_id: number;
    title: string;
    video_link: string;
    class_number: number;
    description: string | null;
    created_at: string;
}

export const AdminVideoManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<VideoRecord | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        videoType: 'link' as 'link' | 'upload',
        videoUrl: '',
        classNumber: 1,
        videoFile: null as File | null
    });
    const [isUploading, setIsUploading] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; video: VideoRecord | null }>({
        isOpen: false,
        video: null
    });

    // 1. Fetch Videos
    const { data: videos = [], isLoading } = useQuery({
        queryKey: ['admin-videos'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order('class_number', { ascending: true })
                .order('video_id', { ascending: true });

            if (error) throw error;
            return data as VideoRecord[];
        }
    });

    // 2. Mutations
    const createVideoMutation = useMutation({
        mutationFn: async (data: any) => {
            const { error } = await supabase.from('videos').insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); // Update dashboard
            resetForm();
            setIsModalOpen(false);
        }
    });

    const updateVideoMutation = useMutation({
        mutationFn: async (data: any) => {
            const { error } = await supabase
                .from('videos')
                .update(data)
                .eq('video_id', editingVideo!.video_id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); // Update dashboard
            resetForm();
            setIsModalOpen(false);
        }
    });

    const deleteVideoMutation = useMutation({
        mutationFn: async (id: number) => {
            console.log(`[Videos] Attempting to delete Video ID ${id}`);
            const { error } = await supabase.from('videos').delete().eq('video_id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            console.log('[Videos] Deletion successful');
            queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); // Update dashboard
            setDeleteConfirmation({ isOpen: false, video: null });
        },
        onError: (err: any) => {
            console.error('[Videos] Deletion failed:', err);
            alert(`Error deleting video: ${err.message}`);
            setDeleteConfirmation({ isOpen: false, video: null });
        }
    });

    // Handlers
    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('lms-videos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('lms-videos')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Video upload failed. Please try again.');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalUrl = formData.videoUrl;

        if (formData.videoType === 'upload' && formData.videoFile) {
            const uploadedUrl = await handleFileUpload(formData.videoFile);
            if (!uploadedUrl) return;
            finalUrl = uploadedUrl;
        }

        const payload = {
            title: formData.title,
            video_link: finalUrl,
            class_number: formData.classNumber,
            client_id: 0 // Default for global visibility
        };

        if (editingVideo) {
            updateVideoMutation.mutate(payload);
        } else {
            createVideoMutation.mutate(payload);
        }
    };

    const handleEdit = (video: VideoRecord) => {
        setEditingVideo(video);
        setFormData({
            title: video.title,
            videoType: 'link', // Default to link for editing unless we can detect otherwise
            videoUrl: video.video_link,
            classNumber: video.class_number,
            videoFile: null
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingVideo(null);
        setFormData({
            title: '',
            videoType: 'link',
            videoUrl: '',
            classNumber: 1,
            videoFile: null
        });
    };

    // Filtered Videos
    const filteredVideos = videos.filter(video =>
        (selectedClass === 'all' || video.class_number === selectedClass) &&
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const classes = Array.from(new Set(videos.map(v => v.class_number))).sort((a, b) => a - b);

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Video className="w-8 h-8 text-primary-600" />
                        Video Forge
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage and curate the sanctuary's learning materials</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Forge Record
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search records by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 text-sm font-medium"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="bg-slate-50 border-none rounded-xl py-3 pl-4 pr-10 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                    >
                        <option value="all">All Classes</option>
                        {classes.map(c => (
                            <option key={c} value={c}>Class {c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    // Skeletons
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-[24px] border border-slate-100 p-4 h-80 animate-pulse bg-slate-50" />
                    ))
                ) : filteredVideos.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Video className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No Records Found</p>
                    </div>
                ) : (
                    filteredVideos.map((video) => (
                        <div key={video.video_id} className="group bg-white rounded-[24px] border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            {/* Thumbnail Area */}
                            <div className="aspect-video bg-slate-100 relative group-hover:opacity-90 transition-opacity">
                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                    <Play className="w-10 h-10" />
                                </div>
                                {/* If it's a YouTube link, try to show thumbnail */}
                                {video.video_link.includes('youtu') && (
                                    <img
                                        src={`https://img.youtube.com/vi/${(video.video_link.match(/v=([^&]+)/) || [])[1] || video.video_link.split('/').pop()}/hqdefault.jpg`}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                )}
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900">
                                    Class {video.class_number}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">
                                        ID: {video.video_id}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-900 leading-tight mb-4 flex-1 line-clamp-2">
                                    {video.title || 'Untitled Record'}
                                </h3>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                                    <button
                                        onClick={() => handleEdit(video)}
                                        className="flex-1 py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            console.log(`[Videos] Delete clicked for Video: ${video.title}`);
                                            setDeleteConfirmation({ isOpen: true, video });
                                        }}
                                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-8 overflow-hidden z-10"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                    {editingVideo ? 'Edit Record' : 'Forge Record'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 font-medium"
                                        placeholder="Enter lesson title..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Video Source
                                    </label>
                                    <div className="flex p-1 bg-slate-50 rounded-xl mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, videoType: 'link' })}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${formData.videoType === 'link'
                                                ? 'bg-white shadow text-primary-600'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            Link URL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, videoType: 'upload' })}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${formData.videoType === 'upload'
                                                ? 'bg-white shadow text-primary-600'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            Upload File
                                        </button>
                                    </div>

                                    {formData.videoType === 'link' ? (
                                        <div className="relative">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="url"
                                                required={formData.videoType === 'link'}
                                                value={formData.videoUrl}
                                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 font-medium"
                                                placeholder="https://youtube.com/..."
                                            />
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept="video/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setFormData({ ...formData, videoFile: file });
                                                }}
                                            />
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                {formData.videoFile ? (
                                                    <>
                                                        <Video className="w-8 h-8 text-primary-600" />
                                                        <span className="text-sm font-bold text-slate-700">{formData.videoFile.name}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8" />
                                                        <span className="text-xs font-bold uppercase tracking-wide">Click to browse or drag file</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Class Number
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.classNumber}
                                        onChange={(e) => setFormData({ ...formData, classNumber: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 font-medium"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={createVideoMutation.isPending || updateVideoMutation.isPending || isUploading}
                                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {(createVideoMutation.isPending || updateVideoMutation.isPending || isUploading) ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {isUploading ? 'Uploading...' : 'Forging...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Sanctuary Record
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmation.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
                        onClick={() => setDeleteConfirmation({ isOpen: false, video: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Delete Video?</h3>
                            <p className="text-slate-500 mb-8 font-medium">Are you sure you want to delete "{deleteConfirmation.video?.title}"? This will remove the record from the sanctuary's library.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setDeleteConfirmation({ isOpen: false, video: null })}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteConfirmation.video && deleteVideoMutation.mutate(deleteConfirmation.video.video_id)}
                                    disabled={deleteVideoMutation.isPending}
                                    className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleteVideoMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        'Delete Now'
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
