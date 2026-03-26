import { useMemo } from 'react';
import { Award, Star, Zap, Trophy, Target, Briefcase, Medal, Crown } from 'lucide-react';
import type { JobApplication } from '../../types';

interface Achievement {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    unlocked: boolean;
    progress?: { current: number; target: number };
}

interface AchievementsPanelProps {
    applications: JobApplication[];
}

export const AchievementsPanel = ({ applications }: AchievementsPanelProps) => {
    const achievements = useMemo((): Achievement[] => {
        const totalApps = applications.length;

        const INTERVIEW_STATUSES = [
            'Entretien RH Programmé', 'Entretien RH Passé',
            'Entretien Technique Programmé', 'Entretien Technique Passé',
            'Entretien Final Programmé', 'Entretien Final Passé',
            'Offre Reçue', 'Offre Acceptée'
        ];
        const OFFER_STATUSES = ['Offre Reçue', 'Offre Acceptée'];

        const interviews = applications.filter(a => INTERVIEW_STATUSES.includes(a.status)).length;
        const offers = applications.filter(a => OFFER_STATUSES.includes(a.status)).length;
        const accepted = applications.filter(a => a.status === 'Offre Acceptée').length;

        return [
            {
                id: 'first',
                icon: <Star className="text-amber-400" size={20} />,
                title: 'Premier Pas',
                description: 'Créer votre première candidature',
                unlocked: totalApps >= 1,
                progress: { current: Math.min(1, totalApps), target: 1 }
            },
            {
                id: 'ten',
                icon: <Zap className="text-blue-400" size={20} />,
                title: 'Lancé',
                description: '10 candidatures créées',
                unlocked: totalApps >= 10,
                progress: { current: Math.min(10, totalApps), target: 10 }
            },
            {
                id: 'fifty',
                icon: <Target className="text-purple-400" size={20} />,
                title: 'Persévérant',
                description: '50 candidatures envoyées',
                unlocked: totalApps >= 50,
                progress: { current: Math.min(50, totalApps), target: 50 }
            },
            {
                id: 'hundred',
                icon: <Crown className="text-amber-500" size={20} />,
                title: 'Centurion',
                description: '100 candidatures au total',
                unlocked: totalApps >= 100,
                progress: { current: Math.min(100, totalApps), target: 100 }
            },
            {
                id: 'interview',
                icon: <Briefcase className="text-emerald-400" size={20} />,
                title: 'Première Rencontre',
                description: 'Décrocher un premier entretien',
                unlocked: interviews >= 1,
                progress: { current: Math.min(1, interviews), target: 1 }
            },
            {
                id: 'five_interviews',
                icon: <Medal className="text-indigo-400" size={20} />,
                title: 'Séducteur',
                description: '5 entretiens décrochés',
                unlocked: interviews >= 5,
                progress: { current: Math.min(5, interviews), target: 5 }
            },
            {
                id: 'offer',
                icon: <Trophy className="text-amber-400" size={20} />,
                title: 'Offre Reçue',
                description: 'Recevoir une proposition',
                unlocked: offers >= 1,
                progress: { current: Math.min(1, offers), target: 1 }
            },
            {
                id: 'hired',
                icon: <Award className="text-emerald-500" size={20} />,
                title: 'Mission Accomplie',
                description: 'Accepter une offre d\'emploi',
                unlocked: accepted >= 1,
                progress: { current: Math.min(1, accepted), target: 1 }
            }
        ];
    }, [applications]);

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Award className="text-amber-500" size={20} />
                    <h3 className="font-bold text-slate-900 dark:text-white">Succès</h3>
                </div>
                <span className="text-sm font-bold text-amber-500">
                    {unlockedCount}/{achievements.length} ðŸ†
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {achievements.map(achievement => (
                    <div
                        key={achievement.id}
                        className={`p-3 rounded-xl border transition-all ${achievement.unlocked
                            ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700'
                            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 opacity-50'
                            }`}
                    >
                        <div className="flex items-start gap-2">
                            <div className={`p-1.5 rounded-lg ${achievement.unlocked
                                ? 'bg-amber-100 dark:bg-amber-800/50'
                                : 'bg-slate-200 dark:bg-slate-600'
                                }`}>
                                {achievement.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold truncate ${achievement.unlocked
                                    ? 'text-amber-900 dark:text-amber-300'
                                    : 'text-slate-500'
                                    }`}>
                                    {achievement.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {achievement.description}
                                </p>
                                {achievement.progress && !achievement.unlocked && (
                                    <div className="mt-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-slate-400 dark:bg-slate-500 transition-all"
                                            style={{
                                                width: `${(achievement.progress.current / achievement.progress.target) * 100}%`
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
