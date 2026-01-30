import type { JobApplication } from '../types';

/**
 * Calculates a score from 0 to 100 based on job application relevance.
 * This is a heuristic model that can be later replaced/supplemented by a LLM.
 */
import { analyzeJobOpportunityOllama } from './ollama';

/**
 * Calculates a score from 0 to 100 based on job application relevance.
 * This is a heuristic model that can be later replaced/supplemented by a LLM.
 */
export const calculateAiScore = (app: JobApplication): number => {
    // ... (existing code remains for fast local scoring)
    let score = 50;
    const techKeywords = ['react', 'typescript', 'javascript', 'node', 'firebase', 'tailwind', 'next.js'];
    const jd = (app.jobDescription || '').toLowerCase();
    let techMatchCount = 0;
    techKeywords.forEach(tech => {
        if (jd.includes(tech)) techMatchCount++;
    });
    score += Math.min(techMatchCount * 5, 25);
    if (app.salary) {
        if (app.salary.includes('50k') || app.salary.includes('60k')) score += 10;
        if (app.salary.includes('40k')) score += 5;
    }
    if (app.remotePolicy === 'Full Remote') score += 15;
    if (app.remotePolicy === 'Hybride') score += 10;
    if (app.remotePolicy === 'Sur site') score -= 10;
    if (app.interestLevel) {
        score += (app.interestLevel - 3) * 10;
    }
    if (!app.jobDescription || app.jobDescription.length < 100) score -= 10;
    if (!app.salary) score -= 5;
    return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Uses Custom AI (formerly Gemini) to perform a deeper analysis of the job opportunity.
 */
export const calculateRealAiScore = async (app: JobApplication, userProfile?: string): Promise<number> => {
    try {
        const analysis = await analyzeJobOpportunityOllama(app, undefined, userProfile);
        return analysis.score;
    } catch (error) {
        console.warn("AI Scoring failed, falling back to heuristic:", error);
        return calculateAiScore(app);
    }
};

export const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'text-orange-500 bg-orange-50 border-orange-100';
    return 'text-red-500 bg-red-50 border-red-100';
};
