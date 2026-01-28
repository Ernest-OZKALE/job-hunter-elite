import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JobApplication } from "../types";

// Note: In a production app, the API key should be in VITE_GEMINI_API_KEY
const API_KEY = "AIzaSyCygxxOYkJZOctGOQZnf79GF6OkC4v5MI4";
const genAI = new GoogleGenerativeAI(API_KEY);

const DEFAULT_PROFILE = "Développeur Fullstack avec expérience en React, TypeScript, Node.js et Firebase.";

export const analyzeJobOpportunity = async (app: JobApplication, userProfile: string = DEFAULT_PROFILE): Promise<{ score: number; strengths: string[]; weaknesses: string[] }> => {
    if (!API_KEY) {
        console.warn("Gemini API Key missing. Falling back to heuristic scoring.");
        return { score: -1, strengths: [], weaknesses: [] };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

        const prompt = `
      Analyse cette offre d'emploi par rapport au profil suivant.
      
      PROFIL CANDIDAT :
      ${userProfile}

      OFFRE :
      Entreprise: ${app.company}
      Poste: ${app.position}
      Localisation: ${app.location}
      Description: ${app.jobDescription || "Non fournie"}
      Salaire: ${app.salary || "Non spécifié"}
      Remote: ${app.remotePolicy || "Non spécifié"}
      
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

        // Clean potential markdown around JSON
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return { score: -1, strengths: [], weaknesses: [] };
    }
};

export const generateEmail = async (app: JobApplication, type: 'cover' | 'followup', userProfile: string = DEFAULT_PROFILE): Promise<string> => {
    if (!API_KEY) return "Erreur : Clé API Gemini manquante.";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

        const prompt = type === 'cover'
            ? `Rédige une lettre de motivation courte et percutante (format email) pour ce poste, en te basant sur mon profil.
               
               MON PROFIL : ${userProfile}
               
               L'OFFRE :
               Entreprise: ${app.company}
               Poste: ${app.position}
               Description: ${app.jobDescription || "Non spécifiée"}
               
               Ton: Professionnel, enthousiaste, confiant. Pas de bla-bla générique.`
            : `Rédige un email de relance professionnel pour cette candidature envoyée il y a quelques jours sans réponse.
               
               Entreprise: ${app.company}
               Poste: ${app.position}
               Contact: ${app.contactName || "Recruteur"}
               
               Ton: Poli, concis, rappelant ma motivation.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Email Error:", error);
        return "Erreur lors de la génération de l'email.";
    }
};

export const extractJobDetailsFromText = async (text: string): Promise<any> => {
    if (!API_KEY) {
        console.warn("Gemini API Key missing.");
        throw new Error("Clé API Gemini manquante. Vérifiez votre configuration .env");
    }

    const modelsToTry = ["gemini-1.5-pro-latest", "gemini-1.5-pro", "gemini-1.5-flash-latest", "gemini-1.5-flash"];
    let lastError;

    // Debug info
    console.log(`[Gemini Debug] Key loaded: ${API_KEY ? 'Yes (' + API_KEY.substring(0, 4) + '...)' : 'No'}`);

    for (const modelName of modelsToTry) {
        try {
            console.log(`[SDK] Tentative avec le modèle : ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
                Tu es un expert en recrutement et en analyse sémantique d'offres d'emploi.
                
                TA MISSION :
                Analyse le texte brut ci-dessous (qui peut être mal formaté coller depuis un site comme France Travail, LinkedIn, Indeed...) et extrais structurément les données pour remplir un formulaire de candidature.
                
                TEXTE À ANALYSER :
                "${text.substring(0, 15000)}"

                CONSIGNES D'EXTRACTION :
                - Sois "smart" : Distingue le LIEU DU POSTE du siège social. Si "78 - Jouy-en-Josas" est écrit, c'est le lieu (pas Paris).
                - Si le salaire est "24k", convertis-le. Si c'est "24 377", nettoie-le.
                - Détecte l'expérience même mal formatée (ex: "1 An(s)", "Exper. : 2-3 ans", "Junior accepté").
                - Détecte les avantages même s'ils sont dans une liste à puces.
                - Pour "Missions", "Mots clés" (tags), "Compétences", fais une synthèse intelligente.
                - Si tu trouves "Secteur d'activité" ou "Domaine", mets-le dans "industry".
                - Si tu trouves "Taille" ou "Effectif", mets-le dans "companySize".
                - Analyse le lien (si trouvé) ou le texte pour déduire la "source" (ex: linkedin.com -> LinkedIn, francetravail.fr -> France Travail).

                RETOURNE UNIQUEMENT UN OBJET JSON (sans markdown) avec ce format exact :
                {
                    "company": "Nom de l'entreprise (ou 'Confidentiel')",
                    "position": "Intitulé du poste (ex: Développeur Fullstack)",
                    "location": "Lieu (Ville, CP, ou Région)",
                    "contractType": "Type de contrat (ex: CDI, Freelance, CDD, Intérim...)",
                    "remotePolicy": "Politique Télétravail (ex: Full Remote, Hybride 3j, Sur site...)",
                    "salary": "Format brut original (ex: 35-45k€)",
                    "salaryDetails": {
                        "brutYear": "Montant annuel estimé (chiffres et texte)",
                        "analysis": "Ton avis d'expert court (ex: 'Bon salaire pour Junior')"
                    },
                    "missions": ["Mission 1", "Mission 2", "Mission 3"],
                    "detectedSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
                    "redFlags": ["Warning 1 (ex: stress)", "Warning 2"],
                    "jobDescription": "Résumé pro (max 600 chars)",
                    "contactName": "Nom contact",
                    "contactEmail": "Email contact",
                    "contactPhone": "Téléphone contact",
                    "link": "URL détectée",
                    "tags": ["MotClé1", "MotClé2", "MotClé3"],
                    "source": "Plateforme source (ex: LinkedIn, France Travail, Indeed, Site Entreprise...)",
                    "qualification": "Niveau (ex: Cadre, Employé qualifié)",
                    "industry": "Secteur (ex: Informatique, BTP)",
                    "companySize": "Taille (ex: 50-99 salariés)",
                    "experience": "Expérience requise (ex: '2 ans', 'Débutant accepté', 'Senior', 'Expérience souhaitée')",
                    "benefits": ["Ticket resto", "Mutuelle"]
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text();

            // Clean markdown
            const jsonStr = responseText.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(jsonStr);
            console.log(`[SDK] Succès avec le modèle : ${modelName}`);
            return parsed;

        } catch (error: any) {
            console.warn(`[SDK] Échec avec le modèle ${modelName}:`, error.message);
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
                            salaryDetails (avec brutYear, brutMonth, netYear, netMonth, et analysis: "Analyse critique vs marché"),
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

        if (!rawText) throw new Error("Réponse vide de l'API REST");

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
            currency: "€",
            analysis: "En attente d'IA pour analyse marché précise."
        };

        // Match: "25k", "25.5k", "25000", "25 000", "25000.0"
        const salaryRegex = /(?:(\d{1,3}(?:[.,]\d+)?)\s?k)|(?:(\d{1,3}(?:[\s,.]\d{3})*|\d{4,8})(?:[.,]\d+)?\s?(?:€|euros?))/i;
        const salaryMatch = text.match(salaryRegex);

        if (salaryMatch) {
            // 1. Normalize Extracted Amount
            let rawValue = 0;
            let isAnnual = true; // Default assumption
            let isBrut = true;   // Default assumption

            if (salaryMatch[1]) { // Format "35k"
                rawValue = parseFloat(salaryMatch[1].replace(',', '.')) * 1000;
            } else if (salaryMatch[0]) { // Format "35000 €"
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
            const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR') + " €";

            salaryDetails = {
                brutYear: fmt(annualBrut),
                brutMonth: fmt(annualBrut / 12),
                brutDay: fmt(annualBrut / DAYS_YEAR_FORFAIT),
                brutHour: fmt(annualBrut / HOURS_YEAR_LEGAL),

                netYear: fmt(annualNet),
                netMonth: fmt(annualNet / 12),
                netDay: fmt(annualNet / DAYS_YEAR_FORFAIT),
                netHour: fmt(annualNet / HOURS_YEAR_LEGAL),

                currency: "€",
                analysis: isAnnual ?
                    (annualBrut > 45000 ? `Salaire ${statusLabel} attractif (Top 30%).` : `Salaire standard ${statusLabel}.`)
                    : `Estimation sur base mensuelle (${statusLabel}).`,
            };

            salary = `${fmt(isAnnual ? annualBrut : annualBrut / 12)} ${isAnnual ? 'Annuel' : 'Mensuel'} Brut`;
        }

        // --- Missions Extraction ---
        // Look for block starts like "Missions", "Responsabilités", "Tasks"
        const missions: string[] = [];
        const missionBlockRegex = /(?:Missions?|Responsabilit(?:é|e)s?|Tâches?|Rôle)(?:\s*:?)([\s\S]{0,1000}?)(?=\n\n|\n[A-Z]|$)/i;
        const missionMatch = text.match(missionBlockRegex);

        if (missionMatch) {
            const missionText = missionMatch[1];
            // Split by hyphens or bullets
            const items = missionText.split(/\n/).map(s => s.trim())
                .filter(s => s.length > 5) // Skip empty/very short
                .filter(s => !s.endsWith(':')) // Skip headers/intros like "Les missions sont :"
                .map(s => s.replace(/^[-•*]\s*/, '')); // Remove bullet chars

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
            'Autonomie', 'Rigueur', 'Curiosité', 'Communication', 'Force de proposition', 'Esprit d\'équipe',
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
            { term: /(?:résistan|toléran)(?:ce|t)?\s*(?:au|aux?)\s*stress/i, label: "Environnement Stressant" },
            { term: /work\s*hard\s*,?\s*play\s*hard/i, label: "Culture 'Burnout'" },
            { term: /heures?\s*sup/i, label: "Heures Sup fréquentes" },
            { term: /(?:famille|family)/i, label: "\"On est une famille\" (Frontières floues)" },
            { term: /rockstar|ninja|super-?h[ée]ros/i, label: "Attentes Irréalistes (Rockstar/Ninja)" },
            { term: /salaire\s*selon\s*profil/i, label: "Salaire non transparent" },
            { term: /urgent/i, label: "Recrutement Urgent (Désorganisation ?)" },
            { term: /multi-?casquettes?/i, label: "Rôle mal défini / 3 postes en 1" },
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


        let expMatch = lowerText.match(/(?:expérience|experience)(?:\s*:?)\s*([\d\w\s+]+?)(?=\n|$)/i);
        // Better regex strategies
        // Strategy 1: "Expérience : 2 ans" or "Expérience\n2 ans"
        const expRegex1 = /(?:expérience|experience)(?:[\s\S]{0,50}?)\b(\d+(?:\s?-\s?\d+)?)\s*(?:an|ans|année|années|mois)\b/i;
        // Strategy 2: "2 ans d'expérience"
        const expRegex2 = /\b(\d+(?:\s?-\s?\d+)?)\s*(?:an|ans|année|années)\s*d['’]?\s*expérience/i; // 2 ans d'expérience
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

        // Extract Contract
        let contractType = 'CDI'; // Default
        if (lowerText.includes('cdd')) contractType = 'CDD';
        if (lowerText.includes('freelance') || lowerText.includes('indépendant') || lowerText.includes('prestataire')) contractType = 'Freelance';
        if (lowerText.includes('stage') || lowerText.includes('internship')) contractType = 'Stage';
        if (lowerText.includes('alternance') || lowerText.includes('apprentissage') || lowerText.includes('contrat pro')) contractType = 'Alternance';

        // Extract Remote
        let remotePolicy = 'Sur site'; // Default
        if (lowerText.includes('full remote') || lowerText.includes('100% télétravail') || lowerText.includes('télétravail total')) remotePolicy = 'Full Remote';
        else if (lowerText.includes('remote') || lowerText.includes('télétravail') || lowerText.includes('hybride') || lowerText.includes('hybrid')) remotePolicy = 'Hybride';

        // Extract Company
        let company = "";
        const employerMatch = text.match(/(?:Employeur|Entreprise|Société)\s*[:\n]\s*([^\n\r]+)/i);
        if (employerMatch) {
            company = employerMatch[1].trim();
        } else {
            const chezMatch = text.match(/(?:chez|pour)\s+([A-Z][a-z0-9]+(?:\s[A-Z][a-z0-9]+)*)/);
            if (chezMatch) company = chezMatch[1];
        }

        // Extract Position/Title
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let position = "";
        for (let i = 0; i < Math.min(lines.length, 5); i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();
            if (lowerLine.startsWith('offre n') || lowerLine.startsWith('publié') || lowerLine.includes('localiser avec')) continue;
            if (line.length > 5 && line.length < 80) {
                position = line;
                break;
            }
        }

        // Extract Location
        // Extract Location
        let location = "";
        // Match "75001 - Paris", "78 - Jouy-en-Josas", "33 - Bordeaux"
        const locationMatch = text.match(/(:?Lieu|Localisation)?\s*:?\s*(\d{2,5})\s*[-–]\s*([^\n\r,.(]+)/i) ||
            text.match(/(\d{2,5})\s*[-–]\s*([^\n\r,.(]+)/);

        if (locationMatch) {
            // Group 2 is code, Group 3 is city (in first regex) OR Group 1 is code, Group 2 is city (in second)
            // Let's simplify: simple regex first
            const simpleMatch = text.match(/(\d{2,5})\s*[-–]\s*([^\n\r,.(]+)/);
            if (simpleMatch) location = `${simpleMatch[1]} - ${simpleMatch[2].trim()}`;
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
        const industryMatch = text.match(/Secteur\s*d['’]?\s*activité\s*:\s*([^\n]+)/i);
        if (industryMatch) industry = industryMatch[1].trim();

        // Extract Company Size
        let companySize = "";
        const sizeMatch = text.match(/(\d+\s*(?:à|to|-)\s*\d+\s*salariés?)/i);
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
            position: position || "Poste à définir",
            location: location || "",
            contractType: contractType,
            remotePolicy: remotePolicy,
            salary: salary,
            salaryDetails: salaryDetails,
            missions: missions,
            detectedSkills: detectedSkills,
            redFlags: redFlags,
            jobDescription: text.substring(0, 500) + "...\n\n(Texte complet sauvegardé)",
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
                        (lowerText.includes('débutant') || lowerText.includes('debutant') ? 'Débutant accepté' : ''))
            ),
            benefits: text.match(/(?:Primes?|Tickets? resto|Panier|Participation|Intéressement|Mutuelle|Transport|RTT)/gi) || [],
            qualification: qualification,
            industry: industry,
            companySize: companySize
        };

    } catch (localError) {
        console.error("Local Regex Error:", localError);
    }

    console.error("All extraction methods failed.");
    throw new Error(`Échec total de l'analyse (IA & Offline). Vérifiez votre clé API ou le texte fourni.`);
};
