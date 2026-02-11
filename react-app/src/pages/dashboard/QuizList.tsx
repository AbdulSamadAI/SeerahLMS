import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Target,
    Award
} from 'lucide-react';
import { useAuth } from '../../components/auth/AuthContext';
import { motion } from 'framer-motion';

interface ManualGrade {
    id: number;
    user_id: string;
    quiz_number: number;
    grade: number;
    feedback: string | null;
    created_at: string;
}

export const QuizList: React.FC = () => {
    const { user } = useAuth();

    const { data: manualGrades, isLoading } = useQuery({
        queryKey: ['my-manual-grades', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('manual_quiz_grades')
                .select('*')
                .eq('user_id', user?.id)
                .order('quiz_number', { ascending: true });

            if (error) {
                // Silent fail if table doesn't exist yet
                return [];
            }
            return data as ManualGrade[];
        }
    });

    if (isLoading) {
        return (
            <div className="p-12 space-y-8 animate-pulse">
                <div className="h-10 bg-slate-100 rounded-2xl w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-[40px]" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="badge bg-indigo-100 text-indigo-700">Intellectual Sanctuary</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Assessments</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-4 leading-none">
                    Knowledge <span className="text-primary-600">Verification</span>
                </h2>
                <p className="text-slate-500 font-medium max-w-2xl">
                    Validate your mastery of the Prophetic Journey through guided assessments and earn points for your sanctuary rank.
                </p>
            </header>


            {/* Manual Assessments Section */}
            {
                manualGrades && manualGrades.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Instructor Assessments
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {manualGrades.map((grade: any) => (
                                <motion.div
                                    key={grade.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="card p-8 bg-white border-slate-100 shadow-xl rounded-[32px] overflow-hidden relative group"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Target className="w-24 h-24 rotate-12" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(grade.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <h4 className="text-2xl font-black text-slate-900 mb-1">
                                            Quiz {grade.quiz_number || 1}
                                        </h4>
                                        <div className="text-4xl font-black text-primary-600 mb-3">
                                            {grade.grade} <span className="text-lg text-slate-400">Points</span>
                                        </div>

                                        <p className="text-slate-500 font-medium text-sm">
                                            {grade.feedback || 'Assessment completed by instructor.'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )
            }

        </div>
    );
};
