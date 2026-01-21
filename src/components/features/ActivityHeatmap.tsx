import React, { useMemo } from 'react';
import type { JobApplication } from '../../types';
import { Calendar, Info } from 'lucide-react';

interface ActivityHeatmapProps {
    applications: JobApplication[];
}

export const ActivityHeatmap = ({ applications }: ActivityHeatmapProps) => {
    // Generate dates for the last 12 weeks
    const data = useMemo(() => {
        const weeks = 12;
        const totalDays = weeks * 7;
        const result = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = totalDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const count = applications.filter(app => app.date === dateStr).length;

            result.push({
                date: dateStr,
                count,
                level: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3
            });
        }
        return result;
    }, [applications]);

    const getLevelColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-slate-100 dark:bg-slate-800/50';
            case 1: return 'bg-blue-200 dark:bg-blue-900/30';
            case 2: return 'bg-blue-400 dark:bg-blue-700/50';
            case 3: return 'bg-blue-600 dark:bg-blue-500';
            default: return 'bg-slate-100 dark:bg-slate-800/50';
        }
    };

    return (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <Calendar className="text-blue-500" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Intensité de Recherche</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Activité sur les 12 dernières semaines</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span>Moins</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800/50"></div>
                        <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900/30"></div>
                        <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-700/50"></div>
                        <div className="w-3 h-3 rounded-sm bg-blue-600 dark:bg-blue-500"></div>
                    </div>
                    <span>Plus</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-start">
                {data.map((day, i) => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-sm transition-all duration-300 hover:scale-125 hover:z-10 cursor-help ${getLevelColor(day.level)}`}
                        title={`${new Date(day.date).toLocaleDateString('fr-FR')} : ${day.count} candidature(s)`}
                    />
                ))}
            </div>

            <div className="mt-6 flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed font-medium">
                    Régularité payante ! Postuler régulièrement à raison de 1 à 2 offres par jour augmente tes chances de succès de 40%.
                </p>
            </div>
        </div>
    );
};
