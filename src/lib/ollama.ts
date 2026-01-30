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

const DEFAULT_PROFILE = "Développeur Fullstack avec expérience en React, TypeScript, Node.js et Firebase.";

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
            "🔒 Blocage Sécurité Navigateur (Mixed Content) :\n" +
            "Impossible d'appeler une IA Locale (http) depuis un site sécurisé (https).\n\n" +
            "👉 SOLUTION : Lancez le site en local avec `npm run dev` pour utiliser Ollama."
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
                throw new Error("⏳ Timeout (90s): L'IA met trop de temps à répondre. Essayez un modèle plus petit (ex: llama3.1:8b) ou vérifiez votre PC.");
            }
            throw error;
        }
    } catch (error: any) {
        console.error("AI Connection Error:", error);
        if (error.message.includes('Failed to fetch')) {
            throw new Error(
                "❌ Impossible de joindre l'IA Locale.\n" +
                "Vérifiez que :\n" +
                "1. Ollama tourne (essayez `http://localhost:11434` dans le navigateur)\n" +
                "2. L'URL est correcte (Port 11434 ou 3000)\n" +
                "3. Si vous êtes sur Vercel : passez en local (`npm run dev`) !"
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
    const systemPrompt = `Tu es un recruteur expert et un coach carrière de haut niveau. Ton but est d'évaluer la compatibilité entre un candidat et une offre d'emploi.
    
    CRITÈRES D'ANALYSE :
    1. Score strict (0-100) : Sois sévère. 100 = Match parfait. 50 = Match moyen. <30 = Ne postule pas.
    2. Analyse sémantique : Ne cherche pas juste les mots-clés exacts. Si l'offre dit "Laravel" et le profil "PHP", c'est un match partiel.
    3. Contexte : Si le profil est senior et l'offre junior, c'est un point faible (sauf si salaire élevé).
    
    FORMAT DE RÉPONSE ATTENDU :
    Uniquement un JSON valide. Pas de texte avant ni après.`;

    const prompt = `
      ANALYSE CETTE OPPORTUNITÉ DE MANIÈRE CRITIQUE.

      --- PROFIL DU CANDIDAT ---
      ${userProfile}
      ---------------------------

      --- OFFRE D'EMPLOI ---
      ENTREPRISE : ${app.company || 'Non spécifiée'}
      POSTE : ${app.position || 'Non spécifié'}
      DESCRIPTION : 
      ${app.jobDescription || "Pas de description fournie."}
      ----------------------
      
      TÂCHES :
      1. Calcule un SCORE de compatibilité (0 à 100) basé sur les compétences techniques (Hard Skills) et le niveau d'expérience.
      2. Liste 3 à 5 POINTS FORTS (pourquoi le candidat est bon pour ce poste).
      3. Liste 3 à 5 POINTS D'ATTENTION (ce qui manque ou pourrait poser problème).

      Format JSON à retourner :
      {
        "score": (nombre),
        "strengths": ["Analyse 1", "Analyse 2", ...],
        "weaknesses": ["Manque X", "Expérience Y insuffisante", ...]
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
    const systemPrompt = "Tu es un expert en rédaction professionnelle. Réponds directment avec le corps de l'email.";
    const userPrompt = type === 'cover'
        ? `Rédige une lettre de motivation courte et percutante (format email) pour ce poste.
           
           MON PROFIL : ${userProfile}
           
           L'OFFRE :
           Entreprise: ${app.company}
           Poste: ${app.position}
           Description: ${app.jobDescription || "Non spécifiée"}
           
           Ton: Professionnel, enthousiaste, confiant. Pas de bla-bla inutile.`
        : `Rédige un email de relance professionnel pour cette candidature envoyée il y a quelques jours sans réponse.
           
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
        return "Erreur de génération avec l'IA locale.";
    }
};

export const extractJobDetailsOllama = async (text: string, config: LocalAIConfig = DEFAULT_OLLAMA_CONFIG): Promise<any> => {
    const systemPrompt = `Tu es un assistant expert en extraction de données d'offres d'emploi.
    Tu dois extraire les informations et les retourner au format JSON strict selon le schéma fourni.
    Sois précis sur le salaire (annuel vs mensuel) et le contrat (CDI prime sur Freelance).`;

    const userPrompt = `
        Analyse ce texte d'offre d'emploi et extrais les données suivantes en JSON :
        
        TEXTE :
        "${text.substring(0, 10000)}"

        FORMAT ATTENDU :
        {
            "company": "Nom ou 'Confidentiel'",
            "position": "Intitulé du poste",
            "location": "Ville/CP (ex: 78 - Jouy-en-Josas). Supprime 'Localiser...'",
            "contractType": "CDI, CDD, Freelance, Stage, Alternance",
            "remotePolicy": "Full Remote, Hybride, Sur site",
            "salary": "Format brut original",
            "salaryDetails": { "brutYear": "Estimation annuelle", "analysis": "Court avis" },
            "missions": ["mission 1", ...],
            "detectedSkills": ["skill 1", ...],
            "redFlags": ["warning 1", ...],
            "jobDescription": "Résumé court",
            "contactName": "",
            "contactEmail": "",
            "contactPhone": "",
            "link": "",
            "tags": [],
            "source": "Source déduite (LinkedIn, Indeed...)",
            "qualification": "Niveau",
            "industry": "Secteur",
            "companySize": "Taille",
            "experience": "Années demandées (ex: '2 ans', '3-5 ans')",
            "benefits": ["ticket resto", ...]
        }

        RÈGLES IMPORTANTES :
        1. Priorité CDI : Si "CDI" est mentionné, mets "CDI", même si "prestataire" apparait.
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
