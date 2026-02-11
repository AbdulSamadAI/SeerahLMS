import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../components/auth/NotificationContext';
import { NotificationPanel } from './NotificationPanel';

export const NotificationBell: React.FC = () => {
    const { unreadCount } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-xl transition-all relative group ${isOpen
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'text-slate-400 hover:text-slate-900 hover:bg-white/50 border border-transparent hover:border-white/40'
                    }`}
            >
                <Bell className={`w-5 h-5 transition-transform duration-300 ${isOpen ? '' : 'group-hover:rotate-12'}`} />

                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-white shadow-lg animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <NotificationPanel onClose={() => setIsOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};
