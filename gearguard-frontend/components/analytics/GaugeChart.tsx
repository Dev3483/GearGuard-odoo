"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
    value: number;
    label: string;
    color?: 'indigo' | 'emerald' | 'amber' | 'red';
}

export default function GaugeChart({ value, label, color = 'indigo' }: GaugeChartProps) {
    const percentage = Math.min(Math.max(value, 0), 100);
    const rotation = (percentage / 100) * 180 - 90;

    const colorClasses: Record<string, string> = {
        indigo: 'from-indigo-500 to-violet-500',
        emerald: 'from-emerald-500 to-green-500',
        amber: 'from-amber-500 to-orange-500',
        red: 'from-red-500 to-rose-500',
    };

    const getColorByValue = (val: number): string => {
        if (val >= 80) return 'emerald';
        if (val >= 60) return 'indigo';
        if (val >= 40) return 'amber';
        return 'red';
    };

    const gaugeColor = getColorByValue(percentage);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-24">
                {/* Background arc */}
                <svg className="absolute inset-0" viewBox="0 0 200 100">
                    <path
                        d="M 20 80 A 80 80 0 0 1 180 80"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id={`gauge-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={gaugeColor === 'emerald' ? '#10b981' : gaugeColor === 'amber' ? '#f59e0b' : gaugeColor === 'red' ? '#ef4444' : '#6366f1'} />
                            <stop offset="100%" stopColor={gaugeColor === 'emerald' ? '#059669' : gaugeColor === 'amber' ? '#d97706' : gaugeColor === 'red' ? '#dc2626' : '#8b5cf6'} />
                        </linearGradient>
                    </defs>
                    {/* Value arc */}
                    <motion.path
                        d="M 20 80 A 80 80 0 0 1 180 80"
                        fill="none"
                        stroke={`url(#gauge-gradient-${label})`}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="251.2"
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * percentage / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>

                {/* Center value */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center mt-4">
                        <motion.p
                            className={cn("text-4xl font-bold", `bg-gradient-to-r ${colorClasses[gaugeColor]} bg-clip-text text-transparent`)}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {percentage}
                        </motion.p>
                        <p className="text-xs text-slate-500 mt-1">{label}</p>
                    </div>
                </div>

                {/* Needle */}
                <motion.div
                    className="absolute bottom-0 left-1/2 origin-bottom"
                    style={{ height: '70px', width: '3px', marginLeft: '-1.5px' }}
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <div className="w-full h-full bg-slate-800 rounded-full" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rounded-full border-2 border-white" />
                </motion.div>
            </div>
        </div>
    );
}
