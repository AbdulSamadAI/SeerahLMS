import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';

interface Notification {
    id: string;
    type: 'video' | 'quiz' | 'points' | 'rank';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (!error && data) {
            setNotifications(data);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();

            const subscription = supabase
                .channel(`notifications-${user.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                    // Show toast
                    showToast(payload.new as Notification);
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user]);

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
    };

    const [activeToast, setActiveToast] = useState<Notification | null>(null);

    const showToast = (notif: Notification) => {
        setActiveToast(notif);
        setTimeout(() => setActiveToast(null), 5000);
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
            {children}

            {/* Real-time Toast Notification */}
            <AnimatePresence>
                {activeToast && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        className="fixed bottom-8 right-8 z-[200] w-96 bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex items-center p-6 gap-6"
                    >
                        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
                            <Zap className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{activeToast.title}</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{activeToast.message}</p>
                        </div>
                        <button onClick={() => setActiveToast(null)} className="text-slate-300 hover:text-slate-500">
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};
