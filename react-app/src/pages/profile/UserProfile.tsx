import React, { useState } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    User,
    Mail,
    Calendar,
    Shield,
    Save,
    LogOut,
    Camera,
    RefreshCw
} from 'lucide-react';

export const UserProfile: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const queryClient = useQueryClient();
    const [name, setName] = useState(profile?.name || user?.user_metadata?.name || '');

    const updateProfile = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('users_extended')
                .update({ name })
                .eq('id', user?.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            alert('Profile updated successfully!');
        }
    });

    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/login';
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">Profile Settings</h1>
                <p className="text-slate-500 font-medium text-lg">Manage your identity and account details</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Avatar Section */}
                <div className="card p-10 text-center flex flex-col items-center bg-white border-slate-100 shadow-xl shadow-slate-100/50">
                    <div className="relative group mb-6">
                        <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center text-5xl font-black text-primary-700 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                            {(name || user?.email || 'U')[0].toUpperCase()}
                        </div>
                        <button className="absolute bottom-0 right-0 p-3 bg-slate-900 text-white rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all border-2 border-white">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">{name || 'New Student'}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">{profile?.role || 'Student'}</p>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-10 bg-white border-slate-100 shadow-xl shadow-slate-100/50">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-10 pb-4 border-b border-slate-100 flex items-center gap-3">
                            <User className="w-6 h-6 text-primary-600" />
                            Personal Information
                        </h3>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-700 font-bold"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-60">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-slate-100 rounded-2xl cursor-not-allowed text-slate-500 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 opacity-60">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="text"
                                            value={profile?.role || 'Student'}
                                            disabled
                                            className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-slate-100 rounded-2xl cursor-not-allowed text-slate-500 font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-60">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enrollment Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="text"
                                            value={profile?.enrollment_date ? new Date(profile.enrollment_date).toLocaleDateString() : 'Active'}
                                            disabled
                                            className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-slate-100 rounded-2xl cursor-not-allowed text-slate-500 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    onClick={() => updateProfile.mutate()}
                                    disabled={updateProfile.isPending || name === (profile?.name || user?.user_metadata?.name)}
                                    className="btn btn-primary w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {updateProfile.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
