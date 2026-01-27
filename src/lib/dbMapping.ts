import type { JobApplication } from '../types';

export const toDbFormat = (app: Partial<JobApplication>) => {
    const dbData: any = { ...app };

    // Only map userId to user_id as that's the standard Supabase Auth field
    // Leave all other fields in camelCase to match the existing database schema
    if ('userId' in app) { dbData.user_id = app.userId; delete dbData.userId; }

    return dbData;
};

export const fromDbFormat = (dbData: any): JobApplication => {
    return {
        ...dbData,
        // Map back user_id to userId
        userId: dbData.user_id,

        // Ensure arrays are initialized if missing
        attachments: dbData.attachments || [],
        timeline: dbData.timeline || [],
        reminders: dbData.reminders || [],
        tags: dbData.tags || [],
        benefits: dbData.benefits || [],
        techStack: dbData.techStack || [],
    } as JobApplication;
};
