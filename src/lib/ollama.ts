import type { JobApplication } from "../types";

// Configuration for Local AI (Ollama)
const OLLAMA_BASE_URL = "http://localhost:3000/v1"; // User specified port 3000
const OLLAMA_MODEL = "qwen2.5:32b";

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
async function callLocalAI(messages: { role: string; content: string }[], jsonMode: boolean = true): Promise<string> {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "Authorization": "Bearer sk-dummy" // Not needed for local Ollama usually, but good practice if behind proxy
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: messages,
                temperature: 0.1, // Low temp for extraction
                response_format: jsonMode ? { type: "json_object" } : undefined,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Local AI Error (${response.status}): ${errorText}`);
        }

        const data: OpenAIResponse = await response.json();
        return data.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Local AI Connection Error:", error);
        throw error;
    }
}

export const analyzeJobOpportunityOllama = async (app: JobApplication, userProfile: string = DEFAULT_PROFILE): Promise<{ score: number; strengths: string[]; weaknesses: string[] }> => {
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
      
      Réponds UNIQUEMENT avec un JSON valide :
      {
        "score": (nombre 0-100),
        "strengths": ["point fort 1", "point fort 2"],
        "weaknesses": ["point faible 1", "point faible 2"]
      }
    `;

    try {
        const content = await callLocalAI([{ role: "user", content: prompt }], true);
        return JSON.parse(content.replace(/```json|```/g, "").trim());
    } catch (e) {
        console.error("Ollama Analysis Failed", e);
        return { score: -1, strengths: [], weaknesses: [] };
    }
};

export const generateEmailOllama = async (app: JobApplication, type: 'cover' | 'followup', userProfile: string = DEFAULT_PROFILE): Promise<string> => {
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
        ], false);
    } catch (e) {
        console.error("Ollama Email Failed", e);
        return "Erreur de génération avec l'IA locale.";
    }
};

export const extractJobDetailsOllama = async (text: string): Promise<any> => {
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
        ], true);

        const jsonStr = content.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Ollama Extraction Failed", e);
        throw e; // Let the caller handle the fallback logic if needed
    }
};
