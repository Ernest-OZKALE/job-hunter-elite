import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JobApplication } from "../types";

// Note: In a production app, the API key should be in VITE_GEMINI_API_KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const DEFAULT_PROFILE = "DÃ©veloppeur Fullstack avec expÃ©rience en React, TypeScript, Node.js et Firebase.";

export const analyzeJobOpportunity = async (app: JobApplication, userProfile: string = DEFAULT_PROFILE): Promise<{ score: number; strengths: string[]; weaknesses: string[] }> => {
    if (!API_KEY) {
        console.warn("Gemini API Key missing. Falling back to heuristic scoring.");
        return { score: -1, strengths: [], weaknesses: [] };
    }

    try {
        console.log("[Gemini] Starting analysis...");
        console.log("[Gemini] Key available:", !!API_KEY);

        // Use flash model which is faster and often included in free tier
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Analyse cette offre d'emploi par rapport au profil suivant.
      
      PROFIL CANDIDAT :
      ${userProfile}

      OFFRE :
      Entreprise: ${app.company}
      Poste: ${app.position}
      Localisation: ${app.location}
      Description: ${app.jobDescription || "Non fournie"}
      Salaire: ${app.salary || "Non spÃ©cifiÃ©"}
      Remote: ${app.remotePolicy || "Non spÃ©cifiÃ©"}
      
      RETOURNE UNIQUEMENT UN OBJET JSON avec ce format exact :
      {
        "score": (nombre entre 0 et 100),
        "strengths": ["point 1", "point 2"],
        "weaknesses": ["point 1", "point 2"]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("[Gemini] Raw response:", text);

        // Clean potential markdown around JSON
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Analysis Error Full:", error);
        return { score: -1, strengths: [], weaknesses: [] };
    }
};

export const generateEmail = async (app: JobApplication, type: 'cover' | 'followup', userProfile: string = DEFAULT_PROFILE): Promise<string> => {
    if (!API_KEY) return "Erreur : ClÃ© API Gemini manquante.";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

        const prompt = type === 'cover'
            ? `RÃ©dige une lettre de motivation courte et percutante (format email) pour ce poste, en te basant sur mon profil.
               
               MON PROFIL : ${userProfile}
               
               L'OFFRE :
               Entreprise: ${app.company}
               Poste: ${app.position}
               Description: ${app.jobDescription || "Non spÃ©cifiÃ©e"}
               
               Ton: Professionnel, enthousiaste, confiant. Pas de bla-bla gÃ©nÃ©rique.`
            : `RÃ©dige un email de relance professionnel pour cette candidature envoyÃ©e il y a quelques jours sans rÃ©ponse.
               
               Entreprise: ${app.company}
               Poste: ${app.position}
               Contact: ${app.contactName || "Recruteur"}
               
               Ton: Poli, concis, rappelant ma motivation.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Email Error:", error);
        return "Erreur lors de la gÃ©nÃ©ration de l'email.";
    }
};

export const extractJobDetailsFromText = async (text: string): Promise<any> => {
    if (!API_KEY) {
        console.warn("Gemini API Key missing.");
        throw new Error("ClÃ© API Gemini manquante. VÃ©rifiez votre configuration .env");
    }

    const modelsToTry = ["gemini-1.5-pro-latest", "gemini-1.5-pro", "gemini-1.5-flash-latest", "gemini-1.5-flash"];
    let lastError;

    // Debug info
    console.log(`[Gemini Debug] Key loaded: ${API_KEY ? 'Yes (' + API_KEY.substring(0, 4) + '...)' : 'No'}`);

    for (const modelName of modelsToTry) {
        try {
            console.log(`[SDK] Tentative avec le modÃ¨le : ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
                Tu es un expert en recrutement et en analyse sÃ©mantique d'offres d'emploi.
                
                TA MISSION :
                Analyse le texte brut ci-dessous (qui peut Ãªtre mal formatÃ© coller depuis un site comme France Travail, LinkedIn, Indeed...) et extrais structurÃ©ment les donnÃ©es pour remplir un formulaire de candidature.
                
                TEXTE Ã€ ANALYSER :
                "${text.substring(0, 15000)}"

                CONSIGNES D'EXTRACTION :
                - Sois "smart" : Distingue le LIEU DU POSTE du siÃ¨ge social. Si "78 - Jouy-en-Josas" est Ã©crit, c'est le lieu (pas Paris).
                - Si le salaire est "24k", convertis-le. Si c'est "24 377", nettoie-le.
                - DÃ©tecte l'expÃ©rience mÃªme mal formatÃ©e (ex: "1 An(s)", "Exper. : 2-3 ans", "Junior acceptÃ©").
                - DÃ©tecte les avantages mÃªme s'ils sont dans une liste Ã  puces.
                - Pour "Missions", "Mots clÃ©s" (tags), "CompÃ©tences", fais une synthÃ¨se intelligente.
                - Si tu trouves "Secteur d'activitÃ©" ou "Domaine", mets-le dans "industry".
                - Si tu trouves "Taille" ou "Effectif", mets-le dans "companySize".
                - Analyse le lien (si trouvÃ©) ou le texte pour dÃ©duire la "source" (ex: linkedin.com -> LinkedIn, francetravail.fr -> France Travail).

                RETOURNE UNIQUEMENT UN OBJET JSON (sans markdown) avec ce format exact :
                {
                    "company": "Nom de l'entreprise (ou 'Confidentiel')",
                    "position": "IntitulÃ© du poste (ex: DÃ©veloppeur Fullstack)",
                    "location": "Lieu (Ville, CP, ou RÃ©gion)",
                    "contractType": "Type de contrat (ex: CDI, Freelance, CDD, IntÃ©rim...)",
                    "remotePolicy": "Politique TÃ©lÃ©travail (ex: Full Remote, Hybride 3j, Sur site...)",
                    "salary": "Format brut original (ex: 35-45kâ‚¬)",
                    "salaryDetails": {
                        "brutYear": "Montant annuel estimÃ© (chiffres et texte)",
                        "analysis": "Ton avis d'expert court (ex: 'Bon salaire pour Junior')"
                    },
                    "missions": ["Mission 1", "Mission 2", "Mission 3"],
                    "detectedSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
                    "redFlags": ["Warning 1 (ex: stress)", "Warning 2"],
                    "jobDescription": "RÃ©sumÃ© pro (max 600 chars)",
                    "contactName": "Nom contact",
                    "contactEmail": "Email contact",
                    "contactPhone": "TÃ©lÃ©phone contact",
                    "link": "URL dÃ©tectÃ©e",
                    "tags": ["MotClÃ©1", "MotClÃ©2", "MotClÃ©3"],
                    "source": "Plateforme source (ex: LinkedIn, France Travail, Indeed, Site Entreprise...)",
                    "qualification": "Niveau (ex: Cadre, EmployÃ© qualifiÃ©)",
                    "industry": "Secteur (ex: Informatique, BTP)",
                    "companySize": "Taille (ex: 50-99 salariÃ©s)",
                    "experience": "ExpÃ©rience requise (ex: '2 ans', 'DÃ©butant acceptÃ©', 'Senior', 'ExpÃ©rience souhaitÃ©e')",
                    "benefits": ["Ticket resto", "Mutuelle"]
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text();

            // Clean markdown
            const jsonStr = responseText.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(jsonStr);
            console.log(`[SDK] SuccÃ¨s avec le modÃ¨le : ${modelName}`);
            return parsed;

        } catch (error: any) {
            console.warn(`[SDK] Ã‰chec avec le modÃ¨le ${modelName}:`, error.message);
            lastError = error;
        }
    }

    // FALLBACK: Raw REST API (bypassing SDK)
    console.log("[Fallback] Tentative via API REST directe...");
    try {
        const fallbackModel = "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `
                            Extrais les infos de ce job en JSON complet : company, position, location, contractType, remotePolicy, salary,
                            salaryDetails (avec brutYear, brutMonth, netYear, netMonth, et analysis: "Analyse critique vs marchÃ©"),
                            missions (liste), detectedSkills (liste), redFlags (liste de warnings),
                            jobDescription, contactName, contactEmail, contactPhone, link, tags.
                            "${text.substring(0, 5000)}"
                        `
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`REST API Error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) throw new Error("RÃ©ponse vide de l'API REST");

        const jsonStr = rawText.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);

    } catch (restError: any) {
        console.error("REST Fallback Error:", restError);
        lastError = restError;
    }

    // FINAL FALLBACK: Local Regex Heuristic (Offline Mode)
    console.warn("Switching to Offline Regex Extraction.");
    try {
        const lowerText = text.toLowerCase();

        // Extract Emails
        const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);

        // --- Advanced Salary Analysis ---
        let salary = "";
        let salaryDetails = {
            brutYear: "",
            brutMonth: "",
            brutDay: "",   // New
            brutHour: "",  // New
            netYear: "",
            netMonth: "",
            netDay: "",    // New
            netHour: "",   // New
            currency: "â‚¬",
            analysis: "En attente d'IA pour analyse marchÃ© prÃ©cise."
        };

        // Match: "25k", "25.5k", "25000", "25 000", "25000.0"
        const salaryRegex = /(?:(\d{1,3}(?:[.,]\d+)?)\s?k)|(?:(\d{1,3}(?:[\s,.]\d{3})*|\d{4,8})(?:[.,]\d+)?\s?(?:â‚¬|euros?))/i;
        const salaryMatch = text.match(salaryRegex);

        if (salaryMatch) {
            // 1. Normalize Extracted Amount
            let rawValue = 0;
            let isAnnual = true; // Default assumption
            let isBrut = true;   // Default assumption

            if (salaryMatch[1]) { // Format "35k"
                rawValue = parseFloat(salaryMatch[1].replace(',', '.')) * 1000;
            } else if (salaryMatch[0]) { // Format "35000 â‚¬"
                rawValue = parseFloat(salaryMatch[0].replace(/[^0-9,.]/g, '').replace(',', '.'));
            }

            // 2. Context Analysis (Brut/Net, Monthly/Annual)
            const lowerSnippet = text.substring(Math.max(0, salaryMatch.index! - 30), Math.min(text.length, salaryMatch.index! + 50)).toLowerCase();

            if (lowerSnippet.includes('net')) isBrut = false;
            // Keywords for monthly
            if (lowerSnippet.includes('mois') || lowerSnippet.includes('mensuel') || lowerSnippet.includes('mjm')) isAnnual = false;
            // Keywords for daily
            if (lowerSnippet.includes('jour') || lowerSnippet.includes('tjm')) {
                isAnnual = false;
            }

            // CRITICAL FIX: "Annuel" takes precedence
            if (lowerSnippet.includes('annuel') || lowerSnippet.includes(' an ') || lowerSnippet.includes('/an')) {
                isAnnual = true;
            }

            // Heuristic correction: if < 10000 and not small (like TJM < 1000), probably monthly
            // ONLY if we didn't just force it to Annual
            if (rawValue > 1200 && rawValue < 10000 && !isAnnual) isAnnual = false;


            // 3. Calculator Engine (Calibrated on salaire-brut-en-net.fr)
            // Standards 2024/2025
            const HOURS_MONTH_LEGAL = 151.67; // 35h
            const HOURS_YEAR_LEGAL = 1820;    // 35h * 52 weeks
            const DAYS_YEAR_FORFAIT = 218;    // Standard Cadre Forfait Jour

            // Charges estimation: 
            // - Non-Cadre: ~22-23% (Coeff 0.77)
            // - Cadre: ~25% (Coeff 0.75)
            // - Public: ~15% (Coeff 0.85)
            let chargeRate = 0.23; // Default (Non-cadre avg)
            let statusLabel = "Non-Cadre";

            // Keyword detection for Status
            if (lowerSnippet.includes('cadre') || rawValue > 40000) { // Assume Cadre if >40k
                chargeRate = 0.25;
                statusLabel = "Cadre";
            }
            if (lowerSnippet.includes('fonctionnaire') || lowerSnippet.includes('public')) {
                chargeRate = 0.15;
                statusLabel = "Public";
            }

            const COEFF_NET = 1 - chargeRate;

            let annualBrut = 0;

            if (isAnnual) {
                annualBrut = isBrut ? rawValue : rawValue / COEFF_NET;
            } else {
                // Monthly
                annualBrut = isBrut ? rawValue * 12 : (rawValue / COEFF_NET) * 12;
            }

            const annualNet = annualBrut * COEFF_NET;

            // 4. Generate All Fields with High Precision
            const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR') + " â‚¬";

            salaryDetails = {
                brutYear: fmt(annualBrut),
                brutMonth: fmt(annualBrut / 12),
                brutDay: fmt(annualBrut / DAYS_YEAR_FORFAIT),
                brutHour: fmt(annualBrut / HOURS_YEAR_LEGAL),

                netYear: fmt(annualNet),
                netMonth: fmt(annualNet / 12),
                netDay: fmt(annualNet / DAYS_YEAR_FORFAIT),
                netHour: fmt(annualNet / HOURS_YEAR_LEGAL),

                currency: "â‚¬",
                analysis: isAnnual ?
                    (annualBrut > 45000 ? `Salaire ${statusLabel} attractif (Top 30%).` : `Salaire standard ${statusLabel}.`)
                    : `Estimation sur base mensuelle (${statusLabel}).`,
            };

            salary = `${fmt(isAnnual ? annualBrut : annualBrut / 12)} ${isAnnual ? 'Annuel' : 'Mensuel'} Brut`;
        }

        // --- Missions Extraction ---
        // Look for block starts like "Missions", "ResponsabilitÃ©s", "Tasks"
        const missions: string[] = [];
        const missionBlockRegex = /(?:Missions?|Responsabilit(?:Ã©|e)s?|TÃ¢ches?|RÃ´le)(?:\s*:?)([\s\S]{0,1000}?)(?=\n\n|\n[A-Z]|$)/i;
        const missionMatch = text.match(missionBlockRegex);

        if (missionMatch) {
            const missionText = missionMatch[1];
            // Split by hyphens or bullets
            const items = missionText.split(/\n/).map(s => s.trim())
                .filter(s => s.length > 5) // Skip empty/very short
                .filter(s => !s.endsWith(':')) // Skip headers/intros like "Les missions sont :"
                .map(s => s.replace(/^[-â€¢*]\s*/, '')); // Remove bullet chars

            // Pick the best lines (likely those that started with bullet points or look like sentences)
            const cleanItems = items.filter(s => s.length > 10 && s.length < 150).slice(0, 6);
            missions.push(...cleanItems);
        }


        // --- Skills Extraction ---
        const detectedSkills: string[] = [];
        const techKeywords = [
            'React', 'Vue', 'Angular', 'Svelte', 'Node', 'Next', 'Nuxt', 'TypeScript', 'JavaScript',
            'Python', 'Java', 'C#', 'PHP', 'Laravel', 'Symfony', 'Docker', 'Kubernetes', 'AWS', 'Azure',
            'GCP', 'Firebase', 'Supabase', 'SQL', 'PostgreSQL', 'Mongo', 'Redis', 'Git', 'CI/CD', 'Tailwind',
            'Sass', 'Figma', 'Adobe', 'Jira', 'Agile', 'Scrum'
        ];
        const softKeywords = [
            'Autonomie', 'Rigueur', 'CuriositÃ©', 'Communication', 'Force de proposition', 'Esprit d\'Ã©quipe',
            'Team player', 'Leadership', 'Mentoring', 'Anglais'
        ];

        [...techKeywords, ...softKeywords].forEach(skill => {
            // Whole word match, case insensitive, escape special chars if any (none in this list really)
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(text)) {
                // Store the properly cased version from our list
                detectedSkills.push(skill);
            }
        });

        // --- Red Flags Detection ---
        const redFlags: string[] = [];
        const toxicPatterns = [
            { term: /(?:rÃ©sistan|tolÃ©ran)(?:ce|t)?\s*(?:au|aux?)\s*stress/i, label: "Environnement Stressant" },
            { term: /work\s*hard\s*,?\s*play\s*hard/i, label: "Culture 'Burnout'" },
            { term: /heures?\s*sup/i, label: "Heures Sup frÃ©quentes" },
            { term: /(?:famille|family)/i, label: "\"On est une famille\" (FrontiÃ¨res floues)" },
            { term: /rockstar|ninja|super-?h[Ã©e]ros/i, label: "Attentes IrrÃ©alistes (Rockstar/Ninja)" },
            { term: /salaire\s*selon\s*profil/i, label: "Salaire non transparent" },
            { term: /urgent/i, label: "Recrutement Urgent (DÃ©sorganisation ?)" },
            { term: /multi-?casquettes?/i, label: "RÃ´le mal dÃ©fini / 3 postes en 1" },
            { term: /soir[s]?\s*et\s*week-?end[s]?/i, label: "Travail Soir/Week-end" }
        ];

        toxicPatterns.forEach(pattern => {
            if (pattern.term.test(text)) {
                redFlags.push(pattern.label);
            }
        });


        // Extract Experience for Tags
        const tags = ["Extraction_Offline"];
        // Extract Experience for Tags & Field


        let expMatch = lowerText.match(/(?:expÃ©rience|experience)(?:\s*:?)\s*([\d\w\s+]+?)(?=\n|$)/i);
        // Better regex strategies
        // Strategy 1: "ExpÃ©rience : 2 ans" or "ExpÃ©rience\n2 ans"
        const expRegex1 = /(?:expÃ©rience|experience)(?:[\s\S]{0,50}?)\b(\d+(?:\s?-\s?\d+)?)\s*(?:an|ans|annÃ©e|annÃ©es|mois)\b/i;
        // Strategy 2: "2 ans d'expÃ©rience"
        const expRegex2 = /\b(\d+(?:\s?-\s?\d+)?)\s*(?:an|ans|annÃ©e|annÃ©es)\s*d['â€™]?\s*expÃ©rience/i; // 2 ans d'expÃ©rience
        // Strategy 3: "1 An(s)" specific format
        const expRegex3 = /\b(\d+)\s*an\(s\)/i;

        const mainExpMatch = lowerText.match(expRegex1) || lowerText.match(expRegex2) || lowerText.match(expRegex3);

        // We use the capture group from the best match, or fallback to simpler parsing if needed.
        // Re-assign expMatch for usage below (keeping the variable name for compatibility)
        expMatch = mainExpMatch;

        if (expMatch) {
            tags.push(`Exp ${expMatch[1]} ans`);
        } else if (lowerText.match(/junior/)) {
            tags.push("Junior");
        } else if (lowerText.match(/senior/)) {
            tags.push("Senior");
        }

        // Extract Position/Title
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let position = "";
        for (let i = 0; i < Math.min(lines.length, 5); i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();
            if (lowerLine.startsWith('offre n') || lowerLine.startsWith('publiÃ©') || lowerLine.includes('localiser avec')) continue;
            if (line.length > 5 && line.length < 80) {
                position = line;
                break;
            }
        }

        // Extract Contract
        // Extract Contract
        let contractType = 'CDI'; // Default to CDI if unsure

        // Priority Detection: Check for explicit "Contrat : X" first
        const contractMatch = lowerText.match(/(?:type de contrat|contrat)\s*[:\n]\s*([^\n]+)/i);
        if (contractMatch) {
            const cVal = contractMatch[1].toLowerCase();
            if (cVal.includes('cdd')) contractType = 'CDD';
            else if (cVal.includes('freelance') || cVal.includes('indÃ©pendant')) contractType = 'Freelance'; // Prestataire removed
            else if (cVal.includes('stage')) contractType = 'Stage';
            else if (cVal.includes('alternance') || cVal.includes('profess') || cVal.includes('apprentissage')) contractType = 'Alternance';
            else if (cVal.includes('cdi')) contractType = 'CDI';
        } else {
            // Fallback: Keywords scan (with priority)
            // Prioritize Specific types > CDI > Freelance (Safe default)
            if (lowerText.includes('alternance') || lowerText.includes('contrat pro') || lowerText.includes('apprentissage')) contractType = 'Alternance';
            else if (lowerText.includes('stage') || lowerText.includes('internship')) contractType = 'Stage';
            else if (lowerText.includes('cdd')) contractType = 'CDD';
            else if (lowerText.includes('cdi')) contractType = 'CDI'; // CDI wins if present
            else if (lowerText.includes('freelance') || lowerText.includes('indÃ©pendant')) contractType = 'Freelance';
        }

        // Extract Remote
        let remotePolicy = 'Sur site'; // Default
        if (lowerText.includes('full remote') || lowerText.includes('100% tÃ©lÃ©travail') || lowerText.includes('tÃ©lÃ©travail total')) remotePolicy = 'Full Remote';
        else if (lowerText.includes('remote') || lowerText.includes('tÃ©lÃ©travail') || lowerText.includes('hybride') || lowerText.includes('hybrid')) remotePolicy = 'Hybride';

        // Extract Company
        let company = "";
        const employerMatch = text.match(/(?:Employeur|Entreprise|SociÃ©tÃ©)\s*[:\n]\s*([^\n\r]+)/i);
        if (employerMatch) {
            company = employerMatch[1].trim();
        } else {
            const chezMatch = text.match(/(?:chez|pour)\s+([A-Z][a-z0-9]+(?:\s[A-Z][a-z0-9]+)*)/);
            if (chezMatch) company = chezMatch[1];
        }

        // Extract Location
        let location = "";
        // Match "75001 - Paris", "78 - Jouy-en-Josas", "33 - Bordeaux"
        const locationMatch = text.match(/(:?Lieu|Localisation)?\s*:?\s*(\d{2,5})\s*[-â€“]\s*([^\n\r,.(]+)/i) ||
            text.match(/(\d{2,5})\s*[-â€“]\s*([^\n\r,.(]+)/);

        if (locationMatch) {
            // Normalize: remove garbage like "- Localiser avec Mappy"
            // The previous code had specific group logic, let's stick to the simple one which was robust enough IF we clean it.
            const simpleMatch = text.match(/(\d{2,5})\s*[-â€“]\s*([^\n\r,.(]+)/);
            if (simpleMatch) {
                let city = simpleMatch[2].trim();
                // CLEANUP: Remove common noise
                city = city.split('- Localiser')[0].trim();
                city = city.split('Localiser')[0].trim();
                location = `${simpleMatch[1]} - ${city}`;
            }
        }

        // Secondary Fallback: look for "Lieu : X"
        if (!location) {
            const lieuMatch = text.match(/(?:Lieu|Localisation|Ville)\s*:\s*([^\n\r]+)/i);
            if (lieuMatch) location = lieuMatch[1].trim();
            else if (text.match(/\bParis\b/i) && !text.match(/78|92|93|94|77|91|95/)) location = "Paris"; // Only default to Paris if no surrounding suburbs mentioned
        }

        // Extract Qualification
        let qualification = "";
        const qualifMatch = text.match(/Qualification\s*:\s*([^\n]+)/i);
        if (qualifMatch) qualification = qualifMatch[1].trim();

        // Extract Industry
        let industry = "";
        const industryMatch = text.match(/Secteur\s*d['â€™]?\s*activitÃ©\s*:\s*([^\n]+)/i);
        if (industryMatch) industry = industryMatch[1].trim();

        // Extract Company Size
        let companySize = "";
        const sizeMatch = text.match(/(\d+\s*(?:Ã |to|-)\s*\d+\s*salariÃ©s?)/i);
        if (sizeMatch) companySize = sizeMatch[1].trim();

        // Extract Source from Text/Link Heuristic
        let source = "Site Entreprise"; // Default
        if (lowerText.includes('linkedin.com') || lowerText.includes('linkedin')) source = "LinkedIn";
        else if (lowerText.includes('indeed')) source = "Indeed";
        else if (lowerText.includes('francetravail') || lowerText.includes('pole-emploi')) source = "France Travail";
        else if (lowerText.includes('welcometothejungle')) source = "Welcome to the Jungle";
        else if (lowerText.includes('hellowork')) source = "HelloWork";
        else if (lowerText.includes('apec')) source = "APEC";

        return {
            company: company || "",
            position: position || "Poste Ã  dÃ©finir",
            location: location || "",
            contractType: contractType,
            remotePolicy: remotePolicy,
            salary: salary,
            salaryDetails: salaryDetails,
            missions: missions,
            detectedSkills: detectedSkills,
            redFlags: redFlags,
            jobDescription: text.substring(0, 500) + "...\n\n(Texte complet sauvegardÃ©)",
            contactName: "",
            contactEmail: emailMatch ? emailMatch[0] : "",
            contactPhone: "",
            link: "",
            tags: tags,
            source: source, // NEW FIELD
            // New Fields
            experience: expMatch ? `${expMatch[1]} ans` : (
                lowerText.includes('junior') ? 'Junior' :
                    (lowerText.includes('senior') ? 'Senior' :
                        (lowerText.includes('dÃ©butant') || lowerText.includes('debutant') ? 'DÃ©butant acceptÃ©' : ''))
            ),
            benefits: text.match(/(?:Primes?|Tickets? resto|Panier|Participation|IntÃ©ressement|Mutuelle|Transport|RTT)/gi) || [],
            qualification: qualification,
            industry: industry,
            companySize: companySize
        };

    } catch (localError) {
        console.error("Local Regex Error:", localError);
    }

    console.error("All extraction methods failed.");
    throw new Error(`Ã‰chec total de l'analyse (IA & Offline). VÃ©rifiez votre clÃ© API ou le texte fourni.`);
};
