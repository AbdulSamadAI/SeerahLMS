import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
    Home,
    PlayCircle,
    LogOut,
    Award,
    User,
    ChevronDown,
    Trophy,
    CalendarCheck,
    Brain
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NotificationBell } from '../notifications/NotificationBell';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
        { to: '/videos', icon: <PlayCircle className="w-5 h-5" />, label: 'Videos' },
        { to: '/quizzes', icon: <Brain className="w-5 h-5" />, label: 'Quizzes' },
        { to: '/challenges', icon: <Trophy className="w-5 h-5" />, label: 'Challenges' },
        { to: '/attendance', icon: <CalendarCheck className="w-5 h-5" />, label: 'Attendance' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary-100 selection:text-primary-900">
            {/* Nav Shadows/Blur container */}
            <div className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none z-[45]" />

            {/* Premium Header */}
            <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-7xl z-50">
                <nav className="glass rounded-[32px] px-6 py-3 flex items-center justify-between shadow-premium border-white/40">
                    {/* Branding */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className="bg-primary-600 p-2.5 rounded-2xl shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight uppercase">
                            Prophetic<span className="text-primary-600">PD</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2 bg-slate-900/5 p-1.5 rounded-2xl border border-white/20">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `px-5 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 ${isActive
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                                    }`
                                }
                            >
                                {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Admin Portal Link Removed - Accessed via /admin only */}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-white/50 transition-all border border-transparent hover:border-white/40 group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                                {(user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()}
                            </div>
                            <div className="hidden lg:flex flex-col items-start pr-2">
                                <span className="text-xs font-black text-slate-900 leading-none mb-1">
                                    {user?.user_metadata?.name || user?.email?.split('@')[0]}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">
                                        {profile?.role || 'Student'}
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                </div>
                            </div>
                        </button>

                        <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block" />

                        <NotificationBell />

                        <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block" />

                        <button
                            onClick={handleSignOut}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Leave Sanctuary"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 pt-32 pb-32 md:pb-12 max-w-7xl mx-auto w-full px-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>

            {/* Mobile Navigation (Glassmorphic Bottom Bar) */}
            <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50">
                <div className="glass rounded-[28px] p-2 flex items-center justify-around shadow-premium border-white/40">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-[22px] transition-all duration-300 ${isActive
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`
                            }
                        >
                            {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                            <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
                        </NavLink>
                    ))}

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-[22px] transition-all duration-300 ${isActive
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                : 'text-slate-400 hover:text-slate-600'
                            }`
                        }
                    >
                        <User className="w-5 h-5" />
                        <span className="text-[9px] font-black uppercase tracking-tight">Me</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};
