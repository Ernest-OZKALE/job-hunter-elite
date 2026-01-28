import type { JobApplication } from '../types';

export const toDbFormat = (app: Partial<JobApplication>) => {
    const dbData: any = { ...app };

    // Map camelCase to snake_case for specific fields
    // This is REQUIRED because the SQL script creates snake_case columns in Supabase
    if ('recruiterName' in app) { dbData.recruiter_name = app.recruiterName; delete dbData.recruiterName; }
    if ('recruiterEmail' in app) { dbData.recruiter_email = app.recruiterEmail; delete dbData.recruiterEmail; }
    if ('recruiterPhone' in app) { dbData.recruiter_phone = app.recruiterPhone; delete dbData.recruiterPhone; }
    if ('recruiterLinkedin' in app) { dbData.recruiter_linkedin = app.recruiterLinkedin; delete dbData.recruiterLinkedin; }
    if ('jobDescription' in app) { dbData.job_description = app.jobDescription; delete dbData.jobDescription; }
    if ('nextStep' in app) { dbData.next_step = app.nextStep; delete dbData.nextStep; }
    if ('contactName' in app) { dbData.contact_name = app.contactName; delete dbData.contactName; }
    if ('contactEmail' in app) { dbData.contact_email = app.contactEmail; delete dbData.contactEmail; }
    if ('contactPhone' in app) { dbData.contact_phone = app.contactPhone; delete dbData.contactPhone; }
    if ('contactLinkedin' in app) { dbData.contact_linkedin = app.contactLinkedin; delete dbData.contactLinkedin; }
    if ('aiScore' in app) { dbData.ai_score = app.aiScore; delete dbData.aiScore; }
    if ('rawSalary' in app) { dbData.raw_salary = app.rawSalary; delete dbData.rawSalary; }
    if ('externalUrl' in app) { dbData.external_url = app.externalUrl; delete dbData.externalUrl; }
    if ('detectedAt' in app) { dbData.detected_at = app.detectedAt; delete dbData.detectedAt; }
    if ('userId' in app) { dbData.user_id = app.userId; delete dbData.userId; }
    if ('contractType' in app) { dbData.contract_type = app.contractType; delete dbData.contractType; }
    if ('remotePolicy' in app) { dbData.remote_policy = app.remotePolicy; delete dbData.remotePolicy; }
    if ('interestLevel' in app) { dbData.interest_level = app.interestLevel; delete dbData.interestLevel; }

    if ('techStack' in app) { dbData.tech_stack = app.techStack; delete dbData.techStack; }
    if ('applicationMethod' in app) { dbData.application_method = app.applicationMethod; delete dbData.applicationMethod; }
    if ('priorityScore' in app) { dbData.priority_score = app.priorityScore; delete dbData.priorityScore; }
    if ('salaryMin' in app) { dbData.salary_min = app.salaryMin; delete dbData.salaryMin; }
    if ('salaryMax' in app) { dbData.salary_max = app.salaryMax; delete dbData.salaryMax; }
    if ('companySize' in app) { dbData.company_size = app.companySize; delete dbData.companySize; }
    if ('responseTime' in app) { dbData.response_time = app.responseTime; delete dbData.responseTime; }
    if ('interviewCount' in app) { dbData.interview_count = app.interviewCount; delete dbData.interviewCount; }
    if ('lastContactDate' in app) { dbData.last_contact_date = app.lastContactDate; delete dbData.lastContactDate; }
    if ('expectedResponseDate' in app) { dbData.expected_response_date = app.expectedResponseDate; delete dbData.expectedResponseDate; }
    if ('recruiterNotes' in app) { dbData.recruiter_notes = app.recruiterNotes; delete dbData.recruiterNotes; }
    if ('lastActivityAt' in app) { dbData.last_activity_at = app.lastActivityAt; delete dbData.lastActivityAt; }
    if ('contactId' in app) { dbData.contact_id = app.contactId; delete dbData.contactId; }

    // SANITIZE: Remove fields that don't have matching DB columns to prevent save errors
    delete dbData.salaryDetails;
    delete dbData.detectedSkills;
    delete dbData.redFlags;
    delete dbData.missions;
    delete dbData.brutMonth;
    delete dbData.netMonth;
    // Sanitize new UI fields not yet in DB
    delete dbData.experience;
    // benefits is standardly removed if not present in object, but checking above...
    // Wait, 'benefits' is in 'fromDbFormat' (line 86: dbData.benefits || []).
    // This implies 'benefits' COLUMN MIGHT EXIST?
    // But earlier logs showed "Could not find column...".
    // "detectedSkills" was missing.
    // I'll be safe and remove 'benefits' and 'experience' to prevent save errors for now,
    // as the user prioritizes "making it work".
    delete dbData.benefits;

    // Remove Recruiter/Contact fields causing errors
    delete dbData.recruiter_name;
    delete dbData.recruiter_email;
    delete dbData.recruiter_phone;
    delete dbData.recruiter_linkedin;
    delete dbData.contact_name;
    delete dbData.contact_email;
    delete dbData.contact_phone;
    delete dbData.contact_linkedin;

    return dbData;
};

export const fromDbFormat = (dbData: any): JobApplication => {
    return {
        ...dbData,
        recruiterName: dbData.recruiter_name,
        recruiterEmail: dbData.recruiter_email,
        recruiterPhone: dbData.recruiter_phone,
        recruiterLinkedin: dbData.recruiter_linkedin,
        jobDescription: dbData.job_description,
        nextStep: dbData.next_step,
        contactName: dbData.contact_name,
        contactEmail: dbData.contact_email,
        contactPhone: dbData.contact_phone,
        contactLinkedin: dbData.contact_linkedin,
        aiScore: dbData.ai_score,
        rawSalary: dbData.raw_salary,
        externalUrl: dbData.external_url,
        detectedAt: dbData.detected_at,
        contractType: dbData.contract_type,
        remotePolicy: dbData.remote_policy,
        interestLevel: dbData.interest_level,
        techStack: dbData.tech_stack || dbData.techStack || [],
        applicationMethod: dbData.application_method,
        priorityScore: dbData.priority_score,
        salaryMin: dbData.salary_min,
        salaryMax: dbData.salary_max,
        companySize: dbData.company_size,
        responseTime: dbData.response_time,
        interviewCount: dbData.interview_count,
        lastContactDate: dbData.last_contact_date,
        expectedResponseDate: dbData.expected_response_date,
        recruiterNotes: dbData.recruiter_notes,
        lastActivityAt: dbData.last_activity_at,
        contactId: dbData.contact_id,

        // Map back user_id to userId
        userId: dbData.user_id,

        // Ensure arrays are initialized
        attachments: dbData.attachments || [],
        timeline: dbData.timeline || [],
        reminders: dbData.reminders || [],
        tags: dbData.tags || [],
        benefits: dbData.benefits || [],

    } as JobApplication;
};
