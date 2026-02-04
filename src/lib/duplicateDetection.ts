import type { JobApplication } from '../types';

export interface DuplicateMatch {
    application: JobApplication;
    similarity: number;
    reason: string;
}

/**
 * Detect potential duplicates based on company and position similarity
 */
export const detectDuplicates = (
    newApp: Omit<JobApplication, 'id'>,
    existingApps: JobApplication[]
): DuplicateMatch[] => {
    const matches: DuplicateMatch[] = [];

    const normalizeText = (text: string) =>
        text.toLowerCase().trim().replace(/[^\w\s]/g, '');

    const newCompany = normalizeText(newApp.company);
    const newPosition = normalizeText(newApp.position);

    for (const app of existingApps) {
        const existingCompany = normalizeText(app.company);
        const existingPosition = normalizeText(app.position);

        // Exact match
        if (newCompany === existingCompany && newPosition === existingPosition) {
            matches.push({
                application: app,
                similarity: 100,
                reason: 'Entreprise et poste identiques'
            });
            continue;
        }

        // Company match only
        if (newCompany === existingCompany) {
            const positionSimilarity = calculateSimilarity(newPosition, existingPosition);
            if (positionSimilarity > 0.7) {
                matches.push({
                    application: app,
                    similarity: 85,
                    reason: 'MÃªme entreprise, poste trÃ¨s similaire'
                });
            }
        }

        // Similar company and position
        const companySimilarity = calculateSimilarity(newCompany, existingCompany);
        const positionSimilarity = calculateSimilarity(newPosition, existingPosition);

        if (companySimilarity > 0.8 && positionSimilarity > 0.8) {
            matches.push({
                application: app,
                similarity: Math.round((companySimilarity + positionSimilarity) * 50),
                reason: 'Entreprise et poste trÃ¨s similaires'
            });
        }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
};

/**
 * Calculate string similarity using Levenshtein distance
 */
const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
};

/**
 * Levenshtein distance algorithm
 */
const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
};

/**
 * Check if application has incomplete data
 */
export const checkDataCompleteness = (app: JobApplication) => {
    const issues: string[] = [];

    if (!app.company) issues.push('Entreprise manquante');
    if (!app.position) issues.push('Poste manquant');
    if (!app.location) issues.push('Localisation manquante');
    if (!app.salary && !app.salaryMin && !app.salaryMax) issues.push('Salaire non renseignÃ©');
    if (!app.date) issues.push('Date manquante');
    if (!app.link) issues.push('Lien offre manquant');
    if (!app.contractType) issues.push('Type de contrat manquant');
    if (!app.remotePolicy) issues.push('Politique tÃ©lÃ©travail manquante');
    if (!app.jobDescription || app.jobDescription.length < 50) issues.push('Description trop courte');

    return {
        isComplete: issues.length === 0,
        completeness: Math.round(((9 - issues.length) / 9) * 100),
        issues
    };
};
