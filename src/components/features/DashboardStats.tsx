import { TrendingUp, Send, Calendar, Award } from 'lucide-react';

interface Stats {
    total: number;
    sent: number;
    interview: number;
    offer: number;
    cvImpact: number;
    conversion: number;
}

interface DashboardStatsProps {
    stats: Stats;
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <Calendar className="text-blue-600 dark:text-blue-400" size={18} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <Send className="text-indigo-600 dark:text-indigo-400" size={18} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.sent}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Envoyées</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <TrendingUp className="text-purple-600 dark:text-purple-400" size={18} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.interview}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Entretiens</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <Award className="text-emerald-600 dark:text-emerald-400" size={18} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.offer}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Offres</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
