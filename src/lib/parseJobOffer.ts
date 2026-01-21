export interface ParsedJob {
    company: string;
    position: string;
    location: string;
    description: string;
    tags?: string[];
}

export const parseJobOffer = (text: string): ParsedJob => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let company = '';
    let position = '';
    let location = '';

    // Heuristics
    // often the first line is the Title or the Company
    if (lines.length > 0) {
        // Check if first line looks like a title (simple heuristic: generic roles)
        const commonRoles = ['Développeur', 'Developer', 'Engineer', 'Manager', 'Directeur', 'Lead', 'Consultant', 'Chef', 'Architecte', 'Designer', 'Product', 'Data'];
        if (commonRoles.some(r => lines[0].includes(r))) {
            position = lines[0];
            if (lines.length > 1) company = lines[1];
        } else {
            // Maybe first line is company?
            company = lines[0];
            if (lines.length > 1) position = lines[1];
        }
    }

    // Look for keywords
    const locationKeywords = ['Lieu :', 'Location:', '📍', 'Localisation :'];
    const companyKeywords = ['Entreprise :', 'Company:', '🏢', 'Société :'];
    const postKeywords = ['Poste :', 'Job:', '💼', 'Intitulé :'];

    lines.forEach(line => {
        // Location detection
        if (locationKeywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
            const parts = line.split(/:|📍/);
            if (parts.length > 1) location = parts[1].trim();
        }

        // Company detection override
        if (companyKeywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
            const parts = line.split(/:|🏢/);
            if (parts.length > 1) company = parts[1].trim();
        }

        // Position detection override
        if (postKeywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
            const parts = line.split(/:|💼/);
            if (parts.length > 1) position = parts[1].trim();
        }
    });

    // Extract Tags (Tech & Industry)
    const tags: string[] = [];
    const techDictionary: Record<string, string> = {
        'react': 'React', 'vue': 'Vue.js', 'angular': 'Angular', 'next.js': 'Next.js', 'typescript': 'TypeScript',
        'javascript': 'JavaScript', 'python': 'Python', 'node': 'Node.js', 'java': 'Java', 'go': 'Go',
        'rust': 'Rust', 'aws': 'AWS', 'docker': 'Docker', 'kubernetes': 'K8s', 'firebase': 'Firebase',
        'sql': 'SQL', 'nosql': 'NoSQL', 'php': 'PHP', 'laravel': 'Laravel', 'symfony': 'Symfony',
        'c#': 'C#', 'dotnet': '.NET', 'swift': 'Swift', 'kotlin': 'Kotlin', 'flutter': 'Flutter'
    };
    const industryDictionary: Record<string, string> = {
        'fintech': 'FinTech', 'finance': 'Finance', 'saas': 'SaaS', 'e-commerce': 'E-commerce',
        'santé': 'HealthTech', 'health': 'HealthTech', 'cyber': 'CyberSecurity', 'ai': 'AI/ML',
        'ia': 'AI/ML', 'data': 'Data', 'blockchain': 'Web3', 'crypto': 'Web3'
    };

    Object.entries(techDictionary).forEach(([key, val]) => {
        if (text.toLowerCase().includes(key)) tags.push(val);
    });
    Object.entries(industryDictionary).forEach(([key, val]) => {
        if (text.toLowerCase().includes(key)) tags.push(val);
    });

    return {
        company: company.replace(/[^\w\sàâéèêëîïôöùûüçÀÂÉÈÊËÎÏÔÖÙÛÜÇ&-]/g, '').slice(0, 50).trim(),
        position: position.slice(0, 50).trim(),
        location: location.slice(0, 30).trim(),
        description: text,
        tags: [...new Set(tags)]
    };
};
