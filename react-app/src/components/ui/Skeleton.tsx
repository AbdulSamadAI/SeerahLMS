import React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface SkeletonProps extends HTMLMotionProps<"div"> {
    variant?: 'text' | 'rectangular' | 'circular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'rectangular',
    width,
    height,
    className,
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
            }}
            className={cn(
                'bg-slate-200/50 rounded-xl relative overflow-hidden',
                variant === 'circular' && 'rounded-full',
                variant === 'text' && 'h-4 rounded',
                className
            )}
            style={{ width, height }}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer" />
        </motion.div>
    );
};
