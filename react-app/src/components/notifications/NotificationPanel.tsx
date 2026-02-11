import React from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    X,
    Zap,
    Video,
    Brain,
    Trophy,
    Clock
} from 'lucide-react';
import { useNotifications } from '../../components/auth/NotificationContext';

interface NotificationPanelProps {
    onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
    const { notifications, markAsRead, unreadCount } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4" />;
            case 'quiz': return <Brain className="w-4 h-4" />;
            case 'points': return <Zap className="w-4 h-4" />;
            case 'rank': return <Trophy className="w-4 h-4" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'video': return 'bg-amber-100 text-amber-600';
            case 'quiz': return 'bg-indigo-100 text-indigo-600';
            case 'points': return 'bg-primary-100 text-primary-600';
            case 'rank': return 'bg-amber-500 text-white';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-4 w-96 bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[100]"
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Sanctuary Alerts</h4>
                    {unreadCount > 0 && (
                        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">
                            {unreadCount} Unread Milestones
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100 p-2">
                {notifications.length > 0 ? (
                    notifications.map((notif, idx) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                            className={`group p-4 rounded-2xl flex gap-4 transition-all duration-300 cursor-pointer mb-1 ${notif.is_read ? 'opacity-60 bg-white' : 'bg-slate-50 hover:bg-white hover:shadow-lg active:scale-95'
                                }`}
                        >
                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${getIconColor(notif.type)}`}>
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight">
                                        {notif.title}
                                    </h5>
                                    {!notif.is_read && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1" />
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-2 line-clamp-2">
                                    {notif.message}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-white/50 rounded-full w-fit border border-slate-50">
                                    <Clock className="w-3 h-3" />
                                    {new Date(notif.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-12 text-center text-slate-300">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Silence in the Sanctuary</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-50 bg-slate-50/30 text-center">
                <button className="text-[9px] font-black text-primary-600 uppercase tracking-widest hover:underline transition-all">
                    View Complete History
                </button>
            </div>
        </motion.div>
    );
};
