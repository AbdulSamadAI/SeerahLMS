import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
    LayoutDashboard,
    LogOut,
    ExternalLink,
    ShieldCheck,
    CheckCircle,
    FileCheck,
    Trophy,
    Video
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    // Guard: Only Admin/Instructor
    if (profile && profile.role !== 'Admin' && profile.role !== 'Instructor') {
        navigate('/');
        return null;
    }

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Admin Header */}
            <header className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary-600 p-2 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tighter">Admin Portal</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">PropheticPD Management</p>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-2">
                        <NavLink
                            to="/admin"
                            end
                            className={({ isActive }) => `flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/admin/attendance"
                            className={({ isActive }) => `flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Attendance
                        </NavLink>
                        <NavLink
                            to="/admin/manual-quiz"
                            className={({ isActive }) => `flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <FileCheck className="w-4 h-4" />
                            Quiz
                        </NavLink>
                        <NavLink
                            to="/admin/challenges"
                            className={({ isActive }) => `flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Trophy className="w-4 h-4" />
                            Challenges
                        </NavLink>
                        <NavLink
                            to="/admin/videos"
                            className={({ isActive }) => `flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Video className="w-4 h-4" />
                            Videos
                        </NavLink>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 px-4"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span className="hidden sm:inline">Student View</span>
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1600px] mx-auto">
                <Outlet />
            </main>
        </div>
    );
};
