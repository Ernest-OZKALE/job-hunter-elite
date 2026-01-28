export interface Attachment {
    name: string;
    url: string;
    type: 'cv' | 'lm' | 'autre';
    size?: number;
    storagePath?: string;
}

export interface TimelineEvent {
    id: string;
    date: string;
    type: 'status_change' | 'note' | 'email' | 'call' | 'meeting' | 'reminder' | 'document';
    title: string;
    description?: string;
    metadata?: any;
}

export interface Reminder {
    id: string;
    date: string;
    time: string;
    message: string;
    completed: boolean;
}

export type ApplicationStatus =
    | 'Brouillon'
    | 'À Postuler'
    | 'Candidature Envoyée'
    | 'CV Vu'
    | 'En Cours d\'Examen'
    | 'Test Technique Reçu'
    | 'Test Technique Envoyé'
    | 'Entretien RH Programmé'
    | 'Entretien RH Passé'
    | 'Entretien Technique Programmé'
    | 'Entretien Technique Passé'
    | 'Entretien Final Programmé'
    | 'Entretien Final Passé'
    | 'En Attente de Retour'
    | 'Négociation Salaire'
    | 'Offre Reçue'
    | 'Offre Acceptée'
    | 'Refus Candidat'
    | 'Refus Entreprise'
    | 'Ghosting'
    | 'Archivé';

export interface JobApplication {
    id: string;
    company: string;
    position: string;
    location: string;
    salary: string;
    link: string;
    status: ApplicationStatus;
    date: string;
    notes: string;
    attachments: Attachment[];
    createdAt?: any;
    cvUsed?: string;
    lmUsed?: string;
    source?: string;
    origin?: 'manual' | 'auto'; // 'manual' = user added, 'auto' = n8n/bot added
    rawSalary?: string; // Scraped string e.g. "35k-40k"
    externalUrl?: string; // Link to the original job post
    detectedAt?: string; // ISO Date when the bot found it
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactLinkedin?: string;
    contractType?: 'CDI' | 'CDD' | 'Freelance' | 'Alternance' | 'Stage';
    remotePolicy?: 'Full Remote' | 'Hybride' | 'Sur site';
    interestLevel?: number;
    jobDescription?: string;
    nextStep?: string;

    // New Advanced Fields
    timeline?: TimelineEvent[];
    reminders?: Reminder[];
    tags?: string[];
    priorityScore?: number;
    salaryMin?: number;
    salaryMax?: number;
    benefits?: string[];
    companySize?: string;
    techStack?: string[];
    applicationMethod?: 'Site Entreprise' | 'LinkedIn' | 'Indeed' | 'Email Direct' | 'Recommandation' | 'Autre';
    responseTime?: number; // days
    interviewCount?: number;
    lastContactDate?: string;
    expectedResponseDate?: string;
    recruiterNotes?: string;
    pros?: string[];
    cons?: string[];
    color?: string; // For visual organization

    // Automation fields
    tasks?: ApplicationTask[];
    lastActivityAt?: string;
    aiScore?: number;
    contactId?: string; // Reference to a Contact

    // New Analysis Fields
    salaryDetails?: {
        brutYear?: string;
        brutMonth?: string;
        brutDay?: string;  // New
        brutHour?: string; // New
        netYear?: string;
        netMonth?: string;
        netDay?: string;   // New
        netHour?: string;  // New
        currency?: string;
        analysis?: string;
    };
    missions?: string[];
    detectedSkills?: string[]; // Extracted tech/soft skills
    redFlags?: string[];       // Potential warning signs
}

export interface Contact {
    id: string;
    name: string;
    company?: string;
    position?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApplicationTask {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
}

export interface MoodLog {
    id: string;
    level: 1 | 2 | 3 | 4 | 5; // 1: Very Sad, 5: Very Happy
    note?: string;
    date: string;
}
