import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Calendar, ChevronRight, Check, Loader2, Plus, Target } from 'lucide-react';

export const ClassSwitcher: React.FC = () => {
    const queryClient = useQueryClient();
    const [manualClass, setManualClass] = useState<string>('');

    // 1. Fetch classes that have content
    const { data: availableClasses, isLoading: isLoadingClasses } = useQuery({
        queryKey: ['available-content-classes'],
        queryFn: async () => {
            const { data: videoClasses } = await supabase.from('videos').select('class_number');
            const { data: challengeClasses } = await supabase.from('challenges').select('class_number');

            const allNumbers = new Set<number>();
            videoClasses?.forEach(v => allNumbers.add(v.class_number));
            challengeClasses?.forEach(c => allNumbers.add(c.class_number));

            return Array.from(allNumbers).sort((a, b) => a - b);
        }
    });

    // 2. Fetch active class from dashboard_config
    const { data: activeConfig } = useQuery({
        queryKey: ['dashboard-config'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('dashboard_config')
                .select('class_id')
                .single();
            if (error) throw error;
            return data;
        }
    });

    // 3. Mutation to update active class
    const updateActiveClass = useMutation({
        mutationFn: async (classNumber: number) => {
            const { error } = await supabase
                .from('dashboard_config')
                .update({ class_id: classNumber, updated_at: new Date().toISOString() })
                .eq('id', 1);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-config'] });
            queryClient.invalidateQueries({ queryKey: ['student-stats'] });
            setManualClass('');
        }
    });

    const activeClassId = activeConfig?.class_id || 1;

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(manualClass);
        if (!isNaN(num) && num > 0) {
            updateActiveClass.mutate(num);
        }
    };

    return (
        <div className="card p-8 bg-white border-slate-100 rounded-[40px] shadow-xl shadow-slate-200/50">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Class Control</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Synchronization</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-200">
                        Class {activeClassId} Active
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Dynamic Selection */}
                <div className="lg:col-span-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Quick Selection (Classes with content)
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {isLoadingClasses ? (
                            <div className="flex items-center gap-2 text-slate-400 py-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs font-bold uppercase tracking-widest">Scanning content...</span>
                            </div>
                        ) : (
                            <>
                                {availableClasses?.map((classNum) => (
                                    <button
                                        key={classNum}
                                        onClick={() => updateActiveClass.mutate(classNum)}
                                        disabled={updateActiveClass.isPending}
                                        className={`
                                            relative py-4 px-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-1 min-w-[100px]
                                            ${activeClassId === classNum
                                                ? 'bg-primary-50 border-primary-200 text-primary-900 shadow-lg shadow-primary-100'
                                                : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-50'}
                                        `}
                                    >
                                        {updateActiveClass.isPending && updateActiveClass.variables === classNum ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-primary-600 mb-1" />
                                        ) : activeClassId === classNum ? (
                                            <Check className="w-4 h-4 text-primary-600 mb-1" />
                                        ) : null}
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Class</span>
                                        <span className="text-xl font-black leading-none">{classNum}</span>
                                    </button>
                                ))}
                                {(!availableClasses || availableClasses.length === 0) && (
                                    <div className="text-slate-400 text-sm font-medium py-4">No classes with content found.</div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Manual Override */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary-600" />
                        Manual Deployment
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Set any class number as active</p>
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <input
                            type="number"
                            value={manualClass}
                            onChange={(e) => setManualClass(e.target.value)}
                            placeholder="e.g. 5"
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-100 font-black text-slate-900"
                        />
                        <button
                            type="submit"
                            disabled={updateActiveClass.isPending || !manualClass}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            Update
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-8 p-5 bg-primary-600/5 rounded-2xl border border-primary-100">
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-white rounded-lg border border-primary-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <ChevronRight className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                            System Synchronization Active
                        </h4>
                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                            Students will only see Lessons, Quizzes, and Challenges associated with <span className="font-bold text-primary-700 underline">Class {activeClassId}</span>. Previous classes are automatically archived for their view.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

