import { useState } from 'react';
import { Bell, AlertTriangle, Clock, ChevronDown, ChevronUp, Mail, X } from 'lucide-react';
import { useAutoRelance } from '../../hooks/useAutoRelance';
import type { JobApplication } from '../../types';

interface RelancePanelProps {
    applications: JobApplication[];
    onCreateRelance: (appId: string) => void;
}

export const RelancePanel = ({ applications, onCreateRelance }: RelancePanelProps) => {
    const { relanceCandidates, stats } = useAutoRelance(applications);
    const [isExpanded, setIsExpanded] = useState(false);

    if (stats.total === 0) return null;

    const priorityColors = {
        high: 'bg-red-500',
        medium: 'bg-orange-500',
        low: 'bg-yellow-500'
    };

    const priorityBgColors = {
        high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        medium: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
        low: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    };

    return (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Bell className="text-orange-600 dark:text-orange-400" size={20} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                            Relances Ã  Faire
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {stats.total} candidature{stats.total > 1 ? 's' : ''} en attente de suivi
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {stats.high > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            {stats.high} urgente{stats.high > 1 ? 's' : ''}
                        </span>
                    )}
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 pt-0 space-y-3 max-h-96 overflow-y-auto">
                    {relanceCandidates.map(candidate => (
                        <div
                            key={candidate.application.id}
                            className={`p-3 rounded-xl border ${priorityBgColors[candidate.priority]}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-2 h-2 rounded-full ${priorityColors[candidate.priority]}`} />
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                            {candidate.application.company}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {candidate.application.position}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Clock size={12} />
                                    {candidate.daysSinceAction}j
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                                âš ï¸ {candidate.reason}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => onCreateRelance(candidate.application.id)}
                                    className="flex-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-1"
                                >
                                    <Mail size={12} />
                                    Relancer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
