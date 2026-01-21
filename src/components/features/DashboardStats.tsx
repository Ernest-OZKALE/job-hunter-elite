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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl group-hover:scale-110 transition-transform">
                        <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</span>
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.total}</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl group-hover:scale-110 transition-transform">
                        <Send className="text-indigo-600 dark:text-indigo-400" size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Envoyées</span>
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.sent}</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between ring-2 ring-transparent hover:ring-purple-100 dark:hover:ring-purple-900/30">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl group-hover:scale-110 transition-transform">
                        <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
                    </div>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Entretiens</span>
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.interview}</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Award size={80} />
                </div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Award className="text-white" size={24} />
                    </div>
                    <span className="text-sm font-bold text-emerald-100 uppercase tracking-wide">Offres</span>
                </div>
                <div className="text-4xl font-black relative z-10">{stats.offer}</div>
            </div>
        </div>
    );
};
