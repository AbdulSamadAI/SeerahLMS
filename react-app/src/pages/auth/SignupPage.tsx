import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, AlertCircle, Sparkles, Shield, Zap, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Create Supabase auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        role: 'Student'
                    }
                }
            });

            if (authError) {
                if (authError.message.includes('rate limit')) {
                    throw new Error('Email rate limit exceeded. Since this is a demo, please try again in a few minutes or use a different email.');
                }
                throw authError;
            }

            if (!authData.user) {
                throw new Error('Signup failed - no user created');
            }

            // 2. Profile creation is handled automatically by the database trigger
            // waiting for trigger to complete isn't necessary for the redirect but ensures data consistency if we checked


            // 3. Notification & Redirect
            // If session exists (email confirmation disabled), redirect to dashboard
            // If no session (email confirmation enabled), show a link to login or tell them to check email
            if (authData.session) {
                navigate('/dashboard');
            } else {
                setError('Account created! Please check your email for the confirmation link.');
                // Optional: navigate to login after a delay
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse" />
            <div className="absolute top-1/3 -right-48 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse" style={{ animationDelay: '4s' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Neon Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-[32px] blur-xl opacity-75 animate-pulse" />

                {/* Glass Card */}
                <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
                    {/* Top Gradient Bar */}
                    <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

                    <div className="p-8 sm:p-10">
                        {/* Logo/Brand Section */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 mb-4">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                Join PropheticPD
                            </h1>
                            <p className="text-slate-400 text-sm">Begin Your Mastery Journey</p>
                        </motion.div>

                        {/* Form */}
                        <form onSubmit={handleSignup} className="space-y-5">
                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <p className="text-sm text-red-200">{error}</p>
                                </motion.div>
                            )}

                            {/* Name Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-3 h-3 text-purple-400" />
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                                    <div className="relative flex items-center">
                                        <User className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:bg-slate-800/70 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                                            placeholder="Abdul Samad"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                    Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                                    <div className="relative flex items-center">
                                        <Mail className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:bg-slate-800/70 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                                            placeholder="name@domain.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-cyan-400" />
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:bg-slate-800/70 focus:border-cyan-500/50 transition-all backdrop-blur-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <Shield className="w-3 h-3 text-cyan-400" />
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none" />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:bg-slate-800/70 focus:border-cyan-500/50 transition-all backdrop-blur-sm"
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
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
                                <div className="relative px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 group-hover:from-purple-500 group-hover:to-pink-500 transition-all transform group-hover:scale-[1.02] group-active:scale-[0.98]">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Creating Account...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Create Account</span>
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
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom Accents */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                </div>

                {/* Floating Particles */}
                <div className="absolute -z-10 top-0 left-0 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute -z-10 top-10 right-10 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
                <div className="absolute -z-10 bottom-10 left-10 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
            </motion.div>
        </div>
    );
};
