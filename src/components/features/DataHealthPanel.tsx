import { AlertCircle, CheckCircle } from 'lucide-react';
import type { JobApplication } from '../../types';
import { checkDataCompleteness } from '../../lib/duplicateDetection';

interface DataHealthPanelProps {
    applications: JobApplication[];
}

export const DataHealthPanel = ({ applications }: DataHealthPanelProps) => {
    const healthData = applications.map(app => ({
        app,
        health: checkDataCompleteness(app)
    }));

    const incompleteApps = healthData.filter(d => !d.health.isComplete);
    const averageCompleteness = Math.round(
        healthData.reduce((sum, d) => sum + d.health.completeness, 0) / healthData.length
    );

    if (applications.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CheckCircle className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        SantÃ© des DonnÃ©es
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {averageCompleteness}% de complÃ©tude moyenne
                    </p>
                </div>
            </div>

            {incompleteApps.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="text-orange-600 dark:text-orange-400" size={18} />
                        <span className="font-bold text-orange-900 dark:text-orange-300">
                            {incompleteApps.length} candidature{incompleteApps.length > 1 ? 's' : ''} incomplÃ¨te{incompleteApps.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {incompleteApps.slice(0, 5).map(({ app, health }) => (
                            <div
                                key={app.id}
                                className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-orange-200 dark:border-orange-700"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                                            {app.company} - {app.position}
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                        {health.completeness}%
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {health.issues.slice(0, 3).map((issue, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full"
                                        >
                                            {issue}
                                        </span>
                                    ))}
                                    {health.issues.length > 3 && (
                                        <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                                            +{health.issues.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {incompleteApps.length > 5 && (
                            <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2">
                                Et {incompleteApps.length - 5} autre{incompleteApps.length - 5 > 1 ? 's' : ''}...
                            </p>
                        )}
                    </div>
                </div>
            )}

            {incompleteApps.length === 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center">
                    <CheckCircle className="mx-auto mb-2 text-emerald-600 dark:text-emerald-400" size={32} />
                    <p className="font-bold text-emerald-900 dark:text-emerald-300">
                        âœ¨ Toutes vos candidatures sont complÃ¨tes !
                    </p>
                </div>
            )}
        </div>
    );
};
