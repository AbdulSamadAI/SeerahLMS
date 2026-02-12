import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthContext';
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Pause,
    Trophy,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AttendanceRecord {
    id: number;
    class_number: number;
    session_number: number;
    session_topic: string;
    status: 'Present' | 'Absent' | 'Leave';
    date_of_class: string;
    points_awarded: number;
}

export const StudentAttendanceView: React.FC = () => {
    const { user } = useAuth();

    const { data: records, isLoading } = useQuery({
        queryKey: ['student-attendance', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('attendance_records')
                .select('*')
                .eq('user_id', user?.id)
                .order('class_number', { ascending: false })
                .order('session_number', { ascending: false });

            if (error) throw error;
            return data as AttendanceRecord[];
        }
    });

    const stats = React.useMemo(() => {
        if (!records) return { present: 0, absent: 0, leave: 0, total: 0, percentage: 0 };
        const total = records.length;
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const leave = records.filter(r => r.status === 'Leave').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        return { present, absent, leave, total, percentage };
    }, [records]);

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
            <header className="mb-8 md:mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="badge bg-primary-100 text-primary-700">My Journey</span>
                    <span className="hidden sm:inline text-slate-300">/</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Attendance</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">
                    Attendance <span className="text-primary-600">Record</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 font-medium">Track your presence and commitment to the Prophetic path.</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-10">
                <div className="card bg-white border-slate-100 shadow-xl p-5 md:p-6 rounded-[28px] md:rounded-[32px]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <span className="text-[9.5px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance Rate</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{stats.percentage}%</div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                        <div
                            className="h-full bg-primary-600 rounded-full transition-all duration-1000"
                            style={{ width: `${stats.percentage}%` }}
                        />
                    </div>
                </div>

                <div className="card bg-emerald-50 border-emerald-100/50 p-5 md:p-6 rounded-[28px] md:rounded-[32px]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-[9.5px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Present</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-700">{stats.present}</div>
                </div>

                <div className="card bg-rose-50 border-rose-100/50 p-5 md:p-6 rounded-[28px] md:rounded-[32px]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-rose-600">
                            <XCircle className="w-4 h-4" />
                        </div>
                        <span className="text-[9.5px] md:text-[10px] font-black uppercase tracking-widest text-rose-600/60">Absent</span>
                    </div>
                    <div className="text-3xl font-black text-rose-700">{stats.absent}</div>
                </div>

                <div className="card bg-amber-50 border-amber-100/50 p-5 md:p-6 rounded-[28px] md:rounded-[32px]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-amber-600">
                            <Pause className="w-4 h-4" />
                        </div>
                        <span className="text-[9.5px] md:text-[10px] font-black uppercase tracking-widest text-amber-600/60">Leave</span>
                    </div>
                    <div className="text-3xl font-black text-amber-700">{stats.leave}</div>
                </div>
            </div>

            {/* History List */}
            <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
                <div className="p-5 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
                    <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-600" />
                        Session History
                    </h3>
                    <div className="badge bg-white shadow-sm text-slate-500">
                        {stats.total} Sessions Total
                    </div>
                </div>

                {records?.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-slate-900 font-bold mb-1">No Attendance Records Yet</h4>
                        <p className="text-slate-500 text-sm">Attendance will appear here once marked by your instructor.</p>
                    </div>
                ) : (
                    <div className="p-5 md:p-8 space-y-5 md:space-y-6">
                        {records?.map((record, index) => (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="card p-5 md:p-8 bg-white rounded-[28px] md:rounded-[40px] shadow-xl border border-slate-100"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-6 md:mb-8">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary-50 text-primary-600 flex flex-col items-center justify-center font-black shadow-inner flex-shrink-0">
                                            <span className="text-[10px] uppercase opacity-60">Class</span>
                                            <span className="text-xl md:text-2xl">{record.class_number}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-1 break-words">{record.session_topic || 'Regular Session'}</h3>
                                            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500">
                                                <span className="flex items-center gap-1 font-bold">
                                                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    <span className="hidden md:inline">
                                                        {new Date(record.date_of_class).toLocaleDateString(undefined, {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="md:hidden">
                                                        {new Date(record.date_of_class).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="self-start md:self-auto">
                                        <div className={`px-4 md:px-6 py-2 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 ${record.status === 'Present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                                            record.status === 'Absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' :
                                                'bg-amber-500 text-white shadow-lg shadow-amber-200'
                                            }`}>
                                            {record.status === 'Present' ? <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> :
                                                record.status === 'Absent' ? <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> :
                                                    <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            }
                                            {record.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Layout Mirroring Admin */}
                                <div className="grid grid-cols-3 gap-3 md:gap-4">
                                    <div className={`p-3 md:p-4 rounded-2xl transition-all duration-500 ${record.status === 'Present'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-[1.02]'
                                        : 'bg-slate-50 text-slate-400 opacity-40'
                                        }`}>
                                        <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 ${record.status === 'Present' ? 'text-white' : 'text-slate-400'}`}>Present</div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-xl md:text-2xl font-black">{record.status === 'Present' ? 'YES' : '-'}</div>
                                            <CheckCircle2 className={`w-5 h-5 md:w-6 md:h-6 ${record.status === 'Present' ? 'text-white' : 'text-slate-200'}`} />
                                        </div>
                                    </div>

                                    <div className={`p-3 md:p-4 rounded-2xl transition-all duration-500 ${record.status === 'Absent'
                                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-[1.02]'
                                        : 'bg-slate-50 text-slate-400 opacity-40'
                                        }`}>
                                        <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 ${record.status === 'Absent' ? 'text-white' : 'text-slate-400'}`}>Absent</div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-xl md:text-2xl font-black">{record.status === 'Absent' ? 'YES' : '-'}</div>
                                            <XCircle className={`w-5 h-5 md:w-6 md:h-6 ${record.status === 'Absent' ? 'text-white' : 'text-slate-200'}`} />
                                        </div>
                                    </div>

                                    <div className={`p-3 md:p-4 rounded-2xl transition-all duration-500 ${record.status === 'Leave'
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 scale-[1.02]'
                                        : 'bg-slate-50 text-slate-400 opacity-40'
                                        }`}>
                                        <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 ${record.status === 'Leave' ? 'text-white' : 'text-slate-400'}`}>Leave</div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-xl md:text-2xl font-black">{record.status === 'Leave' ? 'YES' : '-'}</div>
                                            <Pause className={`w-5 h-5 md:w-6 md:h-6 ${record.status === 'Leave' ? 'text-white' : 'text-slate-200'}`} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
