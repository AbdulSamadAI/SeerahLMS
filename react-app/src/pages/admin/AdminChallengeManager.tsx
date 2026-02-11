import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Trophy, Plus, Trash2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export const AdminChallengeManager: React.FC = () => {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        class_number: 1,
        challenge_number: 1,
        topic: '',
        description: ''
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; challenge: Challenge | null }>({
        isOpen: false,
        challenge: null
    });

    // Fetch all challenges
    const { data: challenges, isLoading } = useQuery({
        queryKey: ['admin-challenges'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .order('class_number', { ascending: true })
                .order('challenge_number', { ascending: true });
            if (error) throw error;
            return data as Challenge[];
        }
    });

    // Group challenges by class
    const challengesByClass = challenges?.reduce((acc, challenge) => {
        const key = `Class ${challenge.class_number}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(challenge);
        return acc;
    }, {} as Record<string, Challenge[]>);

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { error } = await supabase.from('challenges').insert([{
                class_number: data.class_number,
                challenge_number: data.challenge_number,
                topic: data.topic,
                description: data.description || null
            }]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setIsCreating(false);
            setFormData({ class_number: 1, challenge_number: 1, topic: '', description: '' });
            alert('Challenge created successfully!');
        },
        onError: (err: any) => {
            alert(`Error creating challenge: ${err.message}`);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            console.log(`[Challenges] Attempting to delete Challenge ID ${id}`);
            const { error } = await supabase.from('challenges').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            console.log('[Challenges] Deletion successful');
            queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            alert('Challenge deleted successfully!');
            setDeleteConfirmation({ isOpen: false, challenge: null });
        },
        onError: (err: any) => {
            console.error('[Challenges] Deletion failed:', err);
            alert(`Error deleting challenge: ${err.message}`);
            setDeleteConfirmation({ isOpen: false, challenge: null });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.topic.trim()) {
            alert('Please enter a challenge topic');
            return;
        }
        createMutation.mutate(formData);
    };

    if (isLoading) {
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
                <header className="mb-6 md:mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="badge bg-purple-100 text-purple-700 text-[10px]">Digital Sanctuary</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Challenges</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight mb-1">
                                Challenge <span className="text-purple-600">Forge</span>
                            </h1>
                            <p className="text-slate-500 text-sm md:text-base font-medium">Create and manage class challenges</p>
                        </div>
                        <button
                            onClick={() => setIsCreating(!isCreating)}
                            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95 shrink-0"
                        >
                            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {isCreating ? 'Cancel' : 'New Challenge'}
                        </button>
                    </div>
                </header>

                {/* Create Form */}
                <AnimatePresence>
                    {isCreating && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white shadow-2xl rounded-[32px] md:rounded-[40px] p-6 md:p-8 mb-8 border border-purple-100"
                        >
                            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 mb-6">Create New Challenge</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
                                    <div>
                                        <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                            Class
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.class_number}
                                            onChange={(e) => setFormData({ ...formData, class_number: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border-none px-4 py-2.5 md:py-3 rounded-xl font-bold text-base md:text-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                            Number
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.challenge_number}
                                            onChange={(e) => setFormData({ ...formData, challenge_number: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border-none px-4 py-2.5 md:py-3 rounded-xl font-bold text-base md:text-lg"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                        Topic / Challenge
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full bg-slate-50 border-none px-4 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base"
                                        placeholder="e.g., Memorize first 10 Ayahs of Al-Baqarah"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-50 border-none px-4 py-2.5 md:py-3 rounded-xl font-medium min-h-[100px] text-sm md:text-base"
                                        placeholder="Additional details about the challenge..."
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                                        disabled={createMutation.isPending}
                                    >
                                        <Save className="w-4 h-4" />
                                        {createMutation.isPending ? 'Creating...' : 'Forge Challenge'}
                                    </button>
                                    <div className="text-[10px] text-slate-500 text-center sm:text-left">
                                        Points: <span className="font-bold text-emerald-600">✓ +10</span>,{' '}
                                        <span className="font-bold text-amber-600">~ +5</span>,{' '}
                                        <span className="font-bold text-slate-400">✗ 0</span>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Challenges by Class */}
                <div className="space-y-8">
                    {challengesByClass && Object.keys(challengesByClass).length > 0 ? (
                        Object.entries(challengesByClass).map(([className, classChallenges]) => (
                            <div key={className} className="bg-white shadow-xl rounded-[24px] md:rounded-[40px] overflow-hidden border border-slate-100">
                                <div className="p-5 md:p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                        <Trophy className="w-5 h-5 md:w-6 md:h-6" />
                                        {className}
                                    </h2>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {classChallenges.map((challenge) => (
                                        <motion.div
                                            key={challenge.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="p-5 md:p-6 hover:bg-slate-50/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] md:text-xs font-black rounded-lg uppercase">
                                                            #{challenge.challenge_number}
                                                        </span>
                                                        {!challenge.is_active && (
                                                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-black rounded-lg uppercase">
                                                                INACTIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-base md:text-lg font-black text-slate-900 mb-1 leading-tight">{challenge.topic}</h3>
                                                    {challenge.description && (
                                                        <p className="text-xs md:text-sm text-slate-600 line-clamp-2 md:line-clamp-none">{challenge.description}</p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-3 text-[9px] md:text-xs">
                                                        <span className="text-emerald-600 font-bold">✓ +{challenge.points_completed}</span>
                                                        <span className="text-amber-600 font-bold">~ +{challenge.points_tried}</span>
                                                        <span className="text-slate-400 font-bold">✗ {challenge.points_not_completed}</span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            console.log(`[Challenges] Delete clicked for Challenge: ${challenge.topic}`);
                                                            setDeleteConfirmation({ isOpen: true, challenge });
                                                        }}
                                                        className="p-2.5 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                                                        title="Delete challenge"
                                                    >
                                                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="card bg-white shadow-lg rounded-3xl p-12 text-center">
                            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight mb-2">No Challenges Yet</h3>
                            <p className="text-slate-500">Click "New Challenge" to create your first challenge</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmation.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
                        onClick={() => setDeleteConfirmation({ isOpen: false, challenge: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl max-w-md w-full p-6 md:p-8 text-center border border-slate-100"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 text-rose-500 rounded-2xl md:rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Delete?</h3>
                            <p className="text-slate-500 mb-8 font-medium text-xs md:text-base px-4">Delete "{deleteConfirmation.challenge?.topic}"? This cannot be undone.</p>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <button
                                    onClick={() => setDeleteConfirmation({ isOpen: false, challenge: null })}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteConfirmation.challenge && deleteMutation.mutate(deleteConfirmation.challenge.id)}
                                    disabled={deleteMutation.isPending}
                                    className="px-6 py-3 bg-rose-600 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                                >
                                    {deleteMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        'Delete'
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
