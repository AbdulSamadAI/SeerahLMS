import React from 'react';
import { NavLink, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
    LayoutDashboard,
    LogOut,
    CheckCircle,
    FileCheck,
    Trophy,
    Video,
    Menu,
    X,
    Award,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminLayout: React.FC = () => {
    const { profile, isLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    if (isLoading) return null;

    // Guard: Only Admin/Staff
    if (profile?.role !== 'Admin' && profile?.role !== 'Staff') {
        return <Navigate to="/dashboard" replace />;
    }

    const navItems = [
        { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
        { to: '/admin/attendance', label: 'Attendance', icon: <CheckCircle className="w-4 h-4" /> },
        { to: '/admin/manual-quiz', label: 'Quiz', icon: <FileCheck className="w-4 h-4" /> },
        { to: '/admin/challenges', label: 'Challenges', icon: <Trophy className="w-4 h-4" /> },
        { to: '/admin/videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-900 text-white py-3 px-4 md:py-4 md:px-6 sticky top-0 z-50 shadow-2xl">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-8">
                        <div
                            className="flex items-center gap-2 md:gap-3 cursor-pointer group"
                            onClick={() => navigate('/admin')}
                        >
                            <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg md:text-xl font-black tracking-tight uppercase">
                                Admin<span className="text-primary-400">Portal</span>
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) => `flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] lg:text-xs transition-all ${isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {item.icon}
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <NavLink
                            to="/dashboard"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <Users className="w-4 h-4" />
                            Student View
                        </NavLink>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <button
                            onClick={handleSignOut}
                            className="p-2 md:p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[48] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-[60px] bottom-0 w-[280px] bg-slate-900 border-l border-white/10 z-[49] md:hidden p-6 flex flex-col gap-2"
                        >
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Navigation</div>
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${isActive ? 'bg-white text-slate-900 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                                    {item.label}
                                </NavLink>
                            ))}
                            <div className="mt-auto pt-6 border-t border-white/10">
                                <NavLink
                                    to="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
                                >
                                    <Users className="w-5 h-5" />
                                    Student View
                                </NavLink>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="min-h-[calc(100vh-80px)]">
                <Outlet />
            </main>
        </div>
    );
};

