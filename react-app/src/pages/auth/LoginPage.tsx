import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, AlertCircle, Sparkles, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error, data } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Fetch user profile to check role
            const { data: profileData } = await supabase
                .from('users_extended')
                .select('role')
                .eq('id', data.user.id)
                .single();

            // Redirect based on role
            if (profileData?.role === 'Admin' || profileData?.role === 'Instructor') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse" />
            <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse" style={{ animationDelay: '4s' }} />

            {/* Main Card Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Neon Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-[32px] blur-xl opacity-75 animate-pulse" />

                {/* Glass Card */}
                <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
                    {/* Top Gradient Bar */}
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

                    {/* Content */}
                    <div className="p-8 sm:p-10">
                        {/* Logo/Brand Section */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="text-center mb-8"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/50 mb-4 relative group">
                                <Shield className="w-8 h-8 text-white" />
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                PropheticPD
                            </h1>
                            <p className="text-slate-400 text-sm">Access Your Mastery Dashboard</p>
                        </motion.div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 backdrop-blur-sm"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                    <p className="text-sm text-red-300">{error}</p>
                                </motion.div>
                            )}

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-indigo-400" />
                                    Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                                    <div className="relative flex items-center">
                                        <Mail className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:bg-slate-800/70 focus:border-indigo-500/50 transition-all backdrop-blur-sm"
                                            placeholder="name@domain.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-blue-400" />
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:bg-slate-800/70 focus:border-blue-500/50 transition-all backdrop-blur-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative w-full group mt-6"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                                <div className="relative px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 group-hover:from-indigo-500 group-hover:to-blue-500 transition-all transform group-hover:scale-[1.02] group-active:scale-[0.98]">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Enter Dashboard</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>


                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-slate-400 text-sm">
                                Don't have an account?{' '}
                                <Link
                                    to="/signup"
                                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom Accent */}
                    <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                </div>

                {/* Floating Particles */}
                <div className="absolute top-10 -left-4 w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                <div className="absolute bottom-20 -right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            </motion.div>
        </div>
    );
};
