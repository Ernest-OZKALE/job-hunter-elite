import { useMemo } from 'react';
import type { JobApplication, ApplicationStatus } from '../types';

interface RelanceCandidate {
    application: JobApplication;
    daysSinceAction: number;
    reason: string;
    priority: 'high' | 'medium' | 'low';
}

// Statuses that should trigger relance checks
const RELANCE_ELIGIBLE_STATUSES: ApplicationStatus[] = [
    'Candidature Envoyée',
    'CV Vu',
    'En Cours d\'Examen',
    'Test Technique Envoyé',
    'Entretien RH Passé',
    'Entretien Technique Passé',
    'Entretien Final Passé',
    'En Attente de Retour'
];

// Days to wait before suggesting relance
const RELANCE_THRESHOLDS: Record<string, number> = {
    'Candidature Envoyée': 7,
    'CV Vu': 5,
    'En Cours d\'Examen': 7,
    'Test Technique Envoyé': 5,
    'Entretien RH Passé': 3,
    'Entretien Technique Passé': 3,
    'Entretien Final Passé': 2,
    'En Attente de Retour': 5
};

export const useAutoRelance = (applications: JobApplication[]) => {
    const relanceCandidates = useMemo((): RelanceCandidate[] => {
        const now = new Date();
        const candidates: RelanceCandidate[] = [];

        for (const app of applications) {
            if (!RELANCE_ELIGIBLE_STATUSES.includes(app.status)) continue;

            const lastActivityDate = app.lastActivityAt
                ? new Date(app.lastActivityAt)
                : new Date(app.date);

            const daysSince = Math.floor(
                (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            const threshold = RELANCE_THRESHOLDS[app.status] || 7;

            if (daysSince >= threshold) {
                const overdueDays = daysSince - threshold;
                let priority: 'high' | 'medium' | 'low' = 'low';

                if (overdueDays >= 7) priority = 'high';
                else if (overdueDays >= 3) priority = 'medium';

                candidates.push({
                    application: app,
                    daysSinceAction: daysSince,
                    reason: getRelanceReason(app.status, daysSince),
                    priority
                });
            }
        }

        // Sort by priority and days
        return candidates.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.daysSinceAction - a.daysSinceAction;
        });
    }, [applications]);

    const stats = useMemo(() => ({
        total: relanceCandidates.length,
        high: relanceCandidates.filter(c => c.priority === 'high').length,
        medium: relanceCandidates.filter(c => c.priority === 'medium').length,
        low: relanceCandidates.filter(c => c.priority === 'low').length
    }), [relanceCandidates]);

    return { relanceCandidates, stats };
};

function getRelanceReason(status: ApplicationStatus, days: number): string {
    const messages: Record<string, string> = {
        'Candidature Envoyée': `Aucune réponse depuis ${days} jours`,
        'CV Vu': `CV consulté il y a ${days} jours, pas de suite`,
        'En Cours d\'Examen': `En examen depuis ${days} jours`,
        'Test Technique Envoyé': `Test envoyé il y a ${days} jours`,
        'Entretien RH Passé': `Entretien RH passé il y a ${days} jours`,
        'Entretien Technique Passé': `Entretien tech passé il y a ${days} jours`,
        'Entretien Final Passé': `Entretien final passé il y a ${days} jours`,
        'En Attente de Retour': `Attente depuis ${days} jours`
    };
    return messages[status] || `Pas d'activité depuis ${days} jours`;
}
