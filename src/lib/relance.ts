import type { ApplicationStatus } from '../types';

export const getRelanceInfo = (dateEnvoi: string, status: ApplicationStatus) => {
  // Only show relance for statuses where we're waiting for a response
  const waitingStatuses: ApplicationStatus[] = [
    'Candidature EnvoyÃ©e',
    'CV Vu',
    'En Cours d\'Examen',
    'Test Technique EnvoyÃ©',
    'Entretien RH PassÃ©',
    'Entretien Technique PassÃ©',
    'Entretien Final PassÃ©',
    'En Attente de Retour'
  ];

  if (!waitingStatuses.includes(status)) {
    return { shouldRelance: false, message: '', isUrgent: false };
  }

  const date = new Date(dateEnvoi);
  const today = new Date();
  const relanceDate = new Date(date);
  relanceDate.setDate(date.getDate() + 3);

  today.setHours(0, 0, 0, 0);
  relanceDate.setHours(0, 0, 0, 0);

  const diffTime = relanceDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      shouldRelance: true,
      message: "Ã€ RELANCER AUJOURD'HUI !",
      isUrgent: true
    };
  }
  if (diffDays < 0) {
    return {
      shouldRelance: true,
      message: `Relance en retard (${Math.abs(diffDays)}j)`,
      isUrgent: true
    };
  }
  return {
    shouldRelance: true,
    message: `Relance dans ${diffDays}j`,
    isUrgent: false
  };
};

export default getRelanceInfo;
