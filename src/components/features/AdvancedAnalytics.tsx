import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, Target, X } from 'lucide-react';
import type { JobApplication } from '../../types';

interface AdvancedAnalyticsProps {
    applications: JobApplication[];
    onClose: () => void;
}

const INTERVIEW_STATUSES = [
    'Entretien RH Programmé', 'Entretien RH Passé',
    'Entretien Technique Programmé', 'Entretien Technique Passé',
    'Entretien Final Programmé', 'Entretien Final Passé',
    'Offre Reçue', 'Offre Acceptée'
];
const OFFER_STATUSES = ['Offre Reçue', 'Offre Acceptée'];

export const AdvancedAnalytics = ({ applications, onClose }: AdvancedAnalyticsProps) => {
    const [activeTab, setActiveTab] = useState<'sources' | 'timeline' | 'calendar'>('sources');

    const sourceStats = useMemo(() => {
        const sources: Record<string, { total: number; interviews: number; offers: number }> = {};

        applications.forEach(app => {
            const source = app.source || 'Autre';
            if (!sources[source]) {
                sources[source] = { total: 0, interviews: 0, offers: 0 };
            }
            sources[source].total++;
            if (INTERVIEW_STATUSES.includes(app.status)) {
                sources[source].interviews++;
            }
            if (OFFER_STATUSES.includes(app.status)) {
                sources[source].offers++;
            }
        });

        return Object.entries(sources).map(([name, stats]) => ({
            name,
            total: stats.total,
            conversionRate: stats.total > 0 ? Math.round((stats.interviews / stats.total) * 100) : 0
        })).sort((a, b) => b.total - a.total);
    }, [applications]);

    const monthlyTrend = useMemo(() => {
        const months: Record<string, number> = {};
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
            months[key] = 0;
        }

        applications.forEach(app => {
            const date = new Date(app.date);
            const key = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
            if (months[key] !== undefined) {
                months[key]++;
            }
        });

        return Object.entries(months).map(([month, count]) => ({ month, count }));
    }, [applications]);

    const calendarData = useMemo(() => {
        const days: Record<string, number> = {};
        const now = new Date();

        for (let i = 89; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            days[date.toISOString().split('T')[0]] = 0;
        }

        applications.forEach(app => {
            const dateKey = app.date.split('T')[0];
            if (days[dateKey] !== undefined) {
                days[dateKey]++;
            }
        });

        return Object.entries(days).map(([date, count]) => ({ date, count }));
    }, [applications]);

    const weeklyStats = useMemo(() => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const thisWeek = applications.filter(app => new Date(app.date) >= weekStart).length;
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeek = applications.filter(app => {
            const date = new Date(app.date);
            return date >= lastWeekStart && date < weekStart;
        }).length;

        return { thisWeek, lastWeek, change: thisWeek - lastWeek };
    }, [applications]);

    const renderHeatmap = () => {
        const weeks: { date: string; count: number }[][] = [];
        let currentWeek: { date: string; count: number }[] = [];

        calendarData.forEach((day) => {
            const dayOfWeek = new Date(day.date).getDay();
            if (dayOfWeek === 0 && currentWeek.length > 0) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push(day);
        });
        if (currentWeek.length > 0) weeks.push(currentWeek);

        return (
            <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                    {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-1">
                            {week.map(day => (
                                <div
                                    key={day.date}
                                    title={`${day.date}: ${day.count} candidature(s)`}
                                    className="w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-pointer"
                                    style={{
                                        backgroundColor: day.count === 0 ? 'rgb(30 41 59)'
                                            : day.count === 1 ? 'rgb(34 197 94 / 0.3)'
                                                : day.count === 2 ? 'rgb(34 197 94 / 0.5)'
                                                    : day.count <= 4 ? 'rgb(34 197 94 / 0.7)'
                                                        : 'rgb(34 197 94)'
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span>Moins</span>
                    <div className="w-3 h-3 rounded-sm bg-slate-800" />
                    <div className="w-3 h-3 rounded-sm bg-green-500/30" />
                    <div className="w-3 h-3 rounded-sm bg-green-500/50" />
                    <div className="w-3 h-3 rounded-sm bg-green-500/70" />
                    <div className="w-3 h-3 rounded-sm bg-green-500" />
                    <span>Plus</span>
                </div>
            </div>
        );
    };

    const interviewCount = applications.filter(a => INTERVIEW_STATUSES.includes(a.status)).length;
    const interviewRate = applications.length > 0 ? Math.round((interviewCount / applications.length) * 100) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={28} />
                        <div>
                            <h2 className="text-2xl font-black">Analytics Avancés</h2>
                            <p className="text-sm text-indigo-100">Insights détaillés sur votre recherche</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-3 gap-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl text-white">
                        <p className="text-sm font-medium text-blue-100">Cette Semaine</p>
                        <p className="text-3xl font-black">{weeklyStats.thisWeek}</p>
                        <p className={`text-xs ${weeklyStats.change >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                            {weeklyStats.change >= 0 ? '+' : ''}{weeklyStats.change} vs semaine dernière
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl text-white">
                        <p className="text-sm font-medium text-emerald-100">Taux d'Entretiens</p>
                        <p className="text-3xl font-black">{interviewRate}%</p>
                        <p className="text-xs text-emerald-200">Sur toutes les candidatures</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-2xl text-white">
                        <p className="text-sm font-medium text-amber-100">Meilleure Source</p>
                        <p className="text-3xl font-black">{sourceStats[0]?.name || '-'}</p>
                        <p className="text-xs text-amber-200">{sourceStats[0]?.conversionRate || 0}% conversion</p>
                    </div>
                </div>

                <div className="px-6 pt-4 flex gap-2">
                    {[
                        { id: 'sources' as const, label: 'Par Source', icon: Target },
                        { id: 'timeline' as const, label: 'Évolution', icon: TrendingUp },
                        { id: 'calendar' as const, label: 'Calendrier', icon: Calendar }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === tab.id
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 overflow-y-auto max-h-96">
                    {activeTab === 'sources' && (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sourceStats}>
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="conversionRate" name="Conversion %" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTrend}>
                                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Candidatures"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={{ fill: '#8b5cf6', r: 6 }}
                                        activeDot={{ r: 8, fill: '#a78bfa' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {activeTab === 'calendar' && (
                        <div className="flex flex-col items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Activité des 90 derniers jours
                            </h3>
                            {renderHeatmap()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
