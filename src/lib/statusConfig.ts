import type { ApplicationStatus } from '../types';

interface StatusOption {
    value: ApplicationStatus;
    label: string;
    color: string;
    icon: string;
    category: 'preparation' | 'candidature' | 'entretien' | 'decision' | 'cloture';
}

export const STATUS_OPTIONS: StatusOption[] = [
    // PrÃ©paration
    { value: 'Brouillon', label: 'Brouillon', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: 'ðŸ“', category: 'preparation' },
    { value: 'Ã€ Postuler', label: 'Ã€ Postuler', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: 'ðŸ“‹', category: 'preparation' },

    // Candidature
    { value: 'Candidature EnvoyÃ©e', label: 'Candidature EnvoyÃ©e', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'ðŸ“¤', category: 'candidature' },
    { value: 'CV Vu', label: 'CV Vu', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', icon: 'ðŸ‘€', category: 'candidature' },
    { value: 'En Cours d\'Examen', label: 'En Cours d\'Examen', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: 'ðŸ”', category: 'candidature' },

    // Tests
    { value: 'Test Technique ReÃ§u', label: 'Test Technique ReÃ§u', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: 'ðŸ’»', category: 'entretien' },
    { value: 'Test Technique EnvoyÃ©', label: 'Test Technique EnvoyÃ©', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: 'âœ…', category: 'entretien' },

    // Entretiens RH
    { value: 'Entretien RH ProgrammÃ©', label: 'Entretien RH ProgrammÃ©', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: 'ðŸ“…', category: 'entretien' },
    { value: 'Entretien RH PassÃ©', label: 'Entretien RH PassÃ©', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'âœ”ï¸', category: 'entretien' },

    // Entretiens Techniques
    { value: 'Entretien Technique ProgrammÃ©', label: 'Entretien Technique ProgrammÃ©', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: 'ðŸ–¥ï¸', category: 'entretien' },
    { value: 'Entretien Technique PassÃ©', label: 'Entretien Technique PassÃ©', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: 'ðŸ’¡', category: 'entretien' },

    // Entretiens Finaux
    { value: 'Entretien Final ProgrammÃ©', label: 'Entretien Final ProgrammÃ©', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', icon: 'ðŸŽ¯', category: 'entretien' },
    { value: 'Entretien Final PassÃ©', label: 'Entretien Final PassÃ©', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400', icon: 'ðŸ', category: 'entretien' },

    // DÃ©cision
    { value: 'En Attente de Retour', label: 'En Attente de Retour', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: 'â³', category: 'decision' },
    { value: 'NÃ©gociation Salaire', label: 'NÃ©gociation Salaire', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: 'ðŸ’°', category: 'decision' },
    { value: 'Offre ReÃ§ue', label: 'Offre ReÃ§ue', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: 'ðŸŽ', category: 'decision' },

    // ClÃ´ture
    { value: 'Offre AcceptÃ©e', label: 'Offre AcceptÃ©e', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: 'ðŸŽ‰', category: 'cloture' },
    { value: 'Refus Candidat', label: 'Refus Candidat', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: 'ðŸš«', category: 'cloture' },
    { value: 'Refus Entreprise', label: 'Refus Entreprise', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: 'âŒ', category: 'cloture' },
    { value: 'Ghosting', label: 'Ghosting', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: 'ðŸ‘»', category: 'cloture' },
    { value: 'ArchivÃ©', label: 'ArchivÃ©', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', icon: 'ðŸ“¦', category: 'cloture' },
];

export const getStatusOption = (status: ApplicationStatus): StatusOption => {
    return STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
};

export const getStatusesByCategory = () => {
    const categories = {
        preparation: STATUS_OPTIONS.filter(s => s.category === 'preparation'),
        candidature: STATUS_OPTIONS.filter(s => s.category === 'candidature'),
        entretien: STATUS_OPTIONS.filter(s => s.category === 'entretien'),
        decision: STATUS_OPTIONS.filter(s => s.category === 'decision'),
        cloture: STATUS_OPTIONS.filter(s => s.category === 'cloture'),
    };
    return categories;
};
