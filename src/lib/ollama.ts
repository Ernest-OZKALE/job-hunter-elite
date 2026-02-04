import type { JobApplication } from "../types";

export interface LocalAIConfig {
    provider: 'ollama' | 'gemini'; // Ready for switch
    baseUrl: string;
    model: string;
    apiKey?: string;
}

// Default config for fallback (Standard Ollama defaults)
export const DEFAULT_OLLAMA_CONFIG: LocalAIConfig = {
    provider: 'ollama',
    baseUrl: "https://ai.nodecore.dev/v1", // User custom endpoint
    model: "llama3.1:8b" // Default model, user can change in settings
};

const DEFAULT_PROFILE = "DÃ©veloppeur Fullstack avec expÃ©rience en React, TypeScript, Node.js et Firebase.";

interface OpenAIResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

/**
 * Generic fetch wrapper for OpenAI-compatible API
 */
async function callLocalAI(messages: { role: string; content: string }[], config: LocalAIConfig, jsonMode: boolean = true): Promise<string> {
    // Mixed Content Check
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && config.baseUrl.startsWith('http:')) {
        throw new Error(
            "ðŸ”’ Blocage SÃ©curitÃ© Navigateur (Mixed Content) :\n" +
            "Impossible d'appeler une IA Locale (http) depuis un site sÃ©curisÃ© (https).\n\n" +
            "ðŸ‘‰ SOLUTION : Lancez le site en local avec `npm run dev` pour utiliser Ollama."
        );
    }

    try {
        // Ensure no trailing slash
        const cleanUrl = config.baseUrl.replace(/\/$/, "");
        const endpoint = `${cleanUrl}/chat/completions`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout (Local AI can be slow)

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": config.apiKey ? `Bearer ${config.apiKey}` : "Bearer ollama"
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: messages,
                    temperature: 0.7,
                    response_format: jsonMode ? { type: "json_object" } : undefined,
                    stream: false
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur API (${response.status}): ${errorText || response.statusText}`);
            }

            const data: OpenAIResponse = await response.json();
            return data.choices[0].message.content;

        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error("â³ Timeout (90s): L'IA met trop de temps Ã  rÃ©pondre. Essayez un modÃ¨le plus petit (ex: llama3.1:8b) ou vÃ©rifiez votre PC.");
            }
            throw error;
        }
    } catch (error: any) {
        console.error("AI Connection Error:", error);
        if (error.message.includes('Failed to fetch')) {
            throw new Error(
                "âŒ Impossible de joindre l'IA Locale.\n" +
                "VÃ©rifiez que :\n" +
                "1. Ollama tourne (essayez `http://localhost:11434` dans le navigateur)\n" +
                "2. L'URL est correcte (Port 11434 ou 3000)\n" +
                "3. Si vous Ãªtes sur Vercel : passez en local (`npm run dev`) !"
            );
        }
        throw error;
    }
}

// Helper for robust JSON cleaning
function cleanAndParseJson(content: string): any {
    let clean = content;

    // 1. Remove Markdown Code Blocks
    clean = clean.replace(/```json/g, "").replace(/```/g, "").trim();

    // 2. Extract JSON Block (First { to Last })
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        clean = jsonMatch[0];
    } else {
        // Fallback: if no {} found, user might have sent just the content? Unlikely.
        // But maybe it starts with [ for generic? For this usage we expect object.
    }

    // 3. Fix Trailing Commas (Common LLM Error: "key": "val", })
    clean = clean.replace(/,\s*([}\]])/g, '$1');

    try {
        return JSON.parse(clean);
    } catch (e) {
        console.error("JSON Parse Debug:", e);
        console.log("Raw Content that failed:", content);
        console.log("Cleaned Content that failed:", clean);

        // Final desperate attempt: aggressive escape fix? 
        // Sometimes LLM puts unescaped quotes in strings. Hard to fix reliably with regex.
        throw new Error("Echec parcing JSON: " + (e as Error).message);
    }
}

export const analyzeJobOpportunityOllama = async (app: JobApplication, config: LocalAIConfig = DEFAULT_OLLAMA_CONFIG, userProfile: string = DEFAULT_PROFILE): Promise<{ score: number; strengths: string[]; weaknesses: string[] }> => {
    const systemPrompt = `Tu es un recruteur expert et un coach carriÃ¨re de haut niveau. Ton but est d'Ã©valuer la compatibilitÃ© entre un candidat et une offre d'emploi.
    
    CRITÃˆRES D'ANALYSE :
    1. Score strict (0-100) : Sois sÃ©vÃ¨re. 100 = Match parfait. 50 = Match moyen. <30 = Ne postule pas.
    2. Analyse sÃ©mantique : Ne cherche pas juste les mots-clÃ©s exacts. Si l'offre dit "Laravel" et le profil "PHP", c'est un match partiel.
    3. Contexte : Si le profil est senior et l'offre junior, c'est un point faible (sauf si salaire Ã©levÃ©).
    
    FORMAT DE RÃ‰PONSE ATTENDU :
    Uniquement un JSON valide. Pas de texte avant ni aprÃ¨s.`;

    const prompt = `
      ANALYSE CETTE OPPORTUNITÃ‰ DE MANIÃˆRE CRITIQUE.

      --- PROFIL DU CANDIDAT ---
      ${userProfile}
      ---------------------------

      --- OFFRE D'EMPLOI ---
      ENTREPRISE : ${app.company || 'Non spÃ©cifiÃ©e'}
      POSTE : ${app.position || 'Non spÃ©cifiÃ©'}
      DESCRIPTION : 
      ${app.jobDescription || "Pas de description fournie."}
      ----------------------
      
      TÃ‚CHES :
      1. Calcule un SCORE de compatibilitÃ© (0 Ã  100) basÃ© sur les compÃ©tences techniques (Hard Skills) et le niveau d'expÃ©rience.
      2. Liste 3 Ã  5 POINTS FORTS (pourquoi le candidat est bon pour ce poste).
      3. Liste 3 Ã  5 POINTS D'ATTENTION (ce qui manque ou pourrait poser problÃ¨me).

      Format JSON Ã  retourner :
      {
        "score": (nombre),
        "strengths": ["Analyse 1", "Analyse 2", ...],
        "weaknesses": ["Manque X", "ExpÃ©rience Y insuffisante", ...]
      }
    `;

    try {
        const content = await callLocalAI([
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ], config, false);
        return cleanAndParseJson(content);
    } catch (e) {
        console.error("Ollama Analysis Failed", e);
        throw e;
    }
};

export const generateEmailOllama = async (app: JobApplication, type: 'cover' | 'followup', config: LocalAIConfig = DEFAULT_OLLAMA_CONFIG, userProfile: string = DEFAULT_PROFILE): Promise<string> => {
    const systemPrompt = "Tu es un expert en rÃ©daction professionnelle. RÃ©ponds directment avec le corps de l'email.";
    const userPrompt = type === 'cover'
        ? `RÃ©dige une lettre de motivation courte et percutante (format email) pour ce poste.
           
           MON PROFIL : ${userProfile}
           
           L'OFFRE :
           Entreprise: ${app.company}
           Poste: ${app.position}
           Description: ${app.jobDescription || "Non spÃ©cifiÃ©e"}
           
           Ton: Professionnel, enthousiaste, confiant. Pas de bla-bla inutile.`
        : `RÃ©dige un email de relance professionnel pour cette candidature envoyÃ©e il y a quelques jours sans rÃ©ponse.
           
           Entreprise: ${app.company}
           Poste: ${app.position}
           Contact: ${app.contactName || "Recruteur"}
           
           Ton: Poli, concis, rappelant ma motivation.`;

    try {
        // No JSON mode for email
        return await callLocalAI([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], config, false);
    } catch (e) {
        console.error("Ollama Email Failed", e);
        return "Erreur de gÃ©nÃ©ration avec l'IA locale.";
    }
};

export const extractJobDetailsOllama = async (text: string, config: LocalAIConfig = DEFAULT_OLLAMA_CONFIG): Promise<any> => {
    const systemPrompt = `Tu es un assistant expert en extraction de donnÃ©es d'offres d'emploi.
    Tu dois extraire les informations et les retourner au format JSON strict selon le schÃ©ma fourni.
    Sois prÃ©cis sur le salaire (annuel vs mensuel) et le contrat (CDI prime sur Freelance).`;

    const userPrompt = `
        Analyse ce texte d'offre d'emploi et extrais les donnÃ©es suivantes en JSON :
        
        TEXTE :
        "${text.substring(0, 10000)}"

        FORMAT ATTENDU :
        {
            "company": "Nom ou 'Confidentiel'",
            "position": "IntitulÃ© du poste",
            "location": "Ville/CP (ex: 78 - Jouy-en-Josas). Supprime 'Localiser...'",
            "contractType": "CDI, CDD, Freelance, Stage, Alternance",
            "remotePolicy": "Full Remote, Hybride, Sur site",
            "salary": "Format brut original",
            "salaryDetails": { "brutYear": "Estimation annuelle", "analysis": "Court avis" },
            "missions": ["mission 1", ...],
            "detectedSkills": ["skill 1", ...],
            "redFlags": ["warning 1", ...],
            "jobDescription": "RÃ©sumÃ© court",
            "contactName": "",
            "contactEmail": "",
            "contactPhone": "",
            "link": "",
            "tags": [],
            "source": "Source dÃ©duite (LinkedIn, Indeed...)",
            "qualification": "Niveau",
            "industry": "Secteur",
            "companySize": "Taille",
            "experience": "AnnÃ©es demandÃ©es (ex: '2 ans', '3-5 ans')",
            "benefits": ["ticket resto", ...]
        }

        RÃˆGLES IMPORTANTES :
        1. PrioritÃ© CDI : Si "CDI" est mentionnÃ©, mets "CDI", mÃªme si "prestataire" apparait.
        2. Lieu : Nettoie le lieu (pas de "Localiser avec Mappy").
        3. Salaire : Si "sur 12 mois" ou "Annuel", c'est Annuel.
    `;

    try {
        const content = await callLocalAI([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], config, true);

        return cleanAndParseJson(content);
    } catch (e) {
        console.error("Ollama Extraction Failed", e);
        throw e; // Let the caller handle the fallback logic if needed
    }
};
