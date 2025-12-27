"use client"

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeatmapDataItem {
    department: string;
    requests: number;
}

interface HeatmapChartProps {
    data: HeatmapDataItem[];
    title?: string;
}

export default function HeatmapChart({ data, title = "Requests by Department" }: HeatmapChartProps) {
    const maxRequests = Math.max(...data.map(d => d.requests), 1);

    const getHeatColor = (requests: number): string => {
        const intensity = requests / maxRequests;
        if (intensity >= 0.8) return 'bg-red-500';
        if (intensity >= 0.6) return 'bg-orange-500';
        if (intensity >= 0.4) return 'bg-amber-500';
        if (intensity >= 0.2) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    const getHeatOpacity = (requests: number): number => {
        const intensity = requests / maxRequests;
        return Math.max(0.3, intensity);
    };

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">{title}</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.map((item, index) => (
                    <motion.div
                        key={item.department}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                    >
                        <div
                            className={cn(
                                "rounded-xl p-6 transition-all duration-300 cursor-pointer hover:scale-105",
                                getHeatColor(item.requests)
                            )}
                            style={{ opacity: getHeatOpacity(item.requests) }}
                        >
                            <p className="text-white font-semibold text-lg mb-1">{item.requests}</p>
                            <p className="text-white/90 text-sm">{item.department}</p>
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-xl">
                                {item.requests} requests
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-100">
                <span className="text-xs text-slate-500">Low</span>
                <div className="flex gap-1">
                    {['bg-emerald-500', 'bg-yellow-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'].map((color, i) => (
                        <div key={i} className={cn("w-8 h-4 rounded", color)} />
                    ))}
                </div>
                <span className="text-xs text-slate-500">High</span>
            </div>
        </div>
    );
}
