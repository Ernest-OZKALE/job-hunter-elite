import type { ApplicationStatus } from '../types';

// Migration map from old status to new granular status
export const migrateOldStatus = (oldStatus: string): ApplicationStatus => {
    const migrationMap: Record<string, ApplicationStatus> = {
        'A faire': 'À Postuler',
        'Envoyé': 'Candidature Envoyée',
        'Entretien': 'Entretien RH Programmé',
        'Offre': 'Offre Reçue',
        'Refus': 'Refus Entreprise',
    };

    return (migrationMap[oldStatus] as ApplicationStatus) || (oldStatus as ApplicationStatus);
};
