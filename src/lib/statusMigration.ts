import type { ApplicationStatus } from '../types';

// Migration map from old status to new granular status
export const migrateOldStatus = (oldStatus: string): ApplicationStatus => {
    const migrationMap: Record<string, ApplicationStatus> = {
        'A faire': 'Ã€ Postuler',
        'EnvoyÃ©': 'Candidature EnvoyÃ©e',
        'Entretien': 'Entretien RH ProgrammÃ©',
        'Offre': 'Offre ReÃ§ue',
        'Refus': 'Refus Entreprise',
    };

    return (migrationMap[oldStatus] as ApplicationStatus) || (oldStatus as ApplicationStatus);
};
