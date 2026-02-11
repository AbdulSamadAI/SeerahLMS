import React from 'react';
import {
    Clock,
    Brain,
    RefreshCw,
    Heart,
    MessageCircle,
    Smile,
    UserCheck,
    TrendingUp,
    Compass
} from 'lucide-react';
import { motion } from 'framer-motion';

const skills = [
    {
        number: 1,
        icon: <Clock className="w-8 h-8" />,
        title: 'Time Management',
        description: 'Learn to prioritize tasks with barakah and purpose, managing your time according to Islamic principles.',
        class_number: 1,
        color: 'bg-purple-500'
    },
    {
        number: 2,
        icon: <Brain className="w-8 h-8" />,
        title: 'Critical Thinking',
        description: 'Develop analytical thinking grounded in prophetic wisdom to solve modern challenges.',
        week: 2,
        color: 'bg-indigo-500'
    },
    {
        number: 3,
        icon: <RefreshCw className="w-8 h-8" />,
        title: 'Change Management',
        description: 'Embrace continuous improvement through small, consistent prophetic habits.',
        week: 3,
        color: 'bg-blue-500'
    },
    {
        number: 4,
        icon: <Heart className="w-8 h-8" />,
        title: 'Emotional Intelligence',
        description: 'Build self-awareness and empathy through understanding emotions in light of Islamic teachings.',
        week: 4,
        color: 'bg-rose-500'
    },
    {
        number: 5,
        icon: <MessageCircle className="w-8 h-8" />,
        title: 'Prophetic Communication',
        description: 'Master the art of prophetic communication - speaking with wisdom, kindness, and impact.',
        week: 5,
        color: 'bg-emerald-500'
    },
    {
        number: 6,
        icon: <Smile className="w-8 h-8" />,
        title: 'Positivity',
        description: 'Cultivate gratitude and positive thinking as taught by the Prophet (PBUH).',
        week: 6,
        color: 'bg-amber-500'
    },
    {
        number: 7,
        icon: <UserCheck className="w-8 h-8" />,
        title: 'Personal Responsibility',
        description: 'Take ownership of your actions and decisions, embodying prophetic responsibility.',
        week: 7,
        color: 'bg-orange-500'
    },
    {
        number: 8,
        icon: <TrendingUp className="w-8 h-8" />,
        title: 'Growth Mindset',
        description: 'Develop a mindset focused on continuous learning and spiritual growth.',
        week: 8,
        color: 'bg-cyan-500'
    },
];

export const ExploreSkills: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 text-primary-600 rounded-[32px] mb-8 shadow-xl shadow-primary-200/50">
                    <Compass className="w-10 h-10" />
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase mb-4">Prophetic Mastery</h1>
                <p className="text-slate-500 font-medium text-xl max-w-2xl mx-auto">Master essential life skills through the lens of prophetic wisdom and modern psychology.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {skills.map((skill, idx) => (
                    <motion.div
                        key={skill.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 hover:shadow-2xl hover:shadow-primary-200/30 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${skill.color} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-16 h-16 ${skill.color.replace('bg-', 'bg-').replace('-500', '-50')} ${skill.color.replace('bg-', 'text-')} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                    {skill.icon}
                                </div>
                                <span className="text-4xl font-black text-slate-100 group-hover:text-slate-200 transition-colors">0{skill.number}</span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 group-hover:text-primary-600 transition-colors">{skill.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm">{skill.description}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available In</span>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${skill.color}`}>Class {skill.class_number}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* CTA Section */}
            <div className="mt-24 card p-14 bg-gradient-to-br from-slate-900 to-slate-800 border-none relative overflow-hidden flex flex-col items-center text-center">
                <div className="relative z-10 max-w-3xl">
                    <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">Your Journey to Excellence</h2>
                    <p className="text-slate-400 font-medium text-lg mb-10 italic">"The most beloved of deeds to Allah are those that are most consistent, even if they are small."</p>
                    <button className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-primary-50 hover:text-primary-700 transition-all hover:scale-105 active:scale-95">
                        Start Class 1
                    </button>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
        </div>
    );
};
