import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JobApplication } from "../types";

// Note: In a production app, the API key should be in VITE_GEMINI_API_KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const DEFAULT_PROFILE = "Développeur Fullstack avec expérience en React, TypeScript, Node.js et Firebase.";

export const analyzeJobOpportunity = async (app: JobApplication, userProfile: string = DEFAULT_PROFILE): Promise<{ score: number; strengths: string[]; weaknesses: string[] }> => {
    if (!API_KEY) {
        console.warn("Gemini API Key missing. Falling back to heuristic scoring.");
        return { score: -1, strengths: [], weaknesses: [] };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    let lastError;

    // Debug info
    console.log(`[Gemini Debug] Key loaded: ${API_KEY ? 'Yes (' + API_KEY.substring(0, 4) + '...)' : 'No'}`);

    for (const modelName of modelsToTry) {
        try {
            console.log(`[SDK] Tentative avec le modèle : ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
                Tu es un expert en recrutement et en analyse d'offres d'emploi.
                Analyse le texte suivant qui contient (probablement) une offre d'emploi ou des informations sur un poste.
                
                TEXTE À ANALYSER :
                "${text.substring(0, 10000)}"

                TA MISSION :
                Extrais un maximum d'informations utiles pour remplir un formulaire de candidature.
                
                RETOURNE UNIQUEMENT UN OBJET JSON (sans markdown) avec les champs suivants (si l'info n'est pas trouvée, laisse vide ou null) :
                {
                    "company": "Nom de l'entreprise",
                    "position": "Intitulé du poste",
                    "location": "Lieu (Ville, Pays)",
                    "contractType": "CDI" | "CDD" | "Freelance" | "Stage" | "Alternance" (devine le plus probable),
                    "remotePolicy": "Full Remote" | "Hybride" | "Sur site" (devine le plus probable),
                    "salary": "Fourchette ou montant (ex: 45-55k)",
                    "jobDescription": "Résumé propre et structuré de l'offre (max 500 caractères)",
                    "contactName": "Nom du recruteur si mentionné",
                    "contactEmail": "Email de contact si mentionné",
                    "contactPhone": "Téléphone si mentionné",
                    "link": "Lien de l'offre si trouvé dans le texte",
                    "tags": ["Tag1", "Tag2"] (5 mots clés techniques ou importants max)
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
                            Extrais les infos de ce job en JSON (company, position, location, contractType, remotePolicy, salary, jobDescription, contactName, contactEmail, contactPhone, link, tags):
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

    console.error("Gemini Extraction Error after trying all models and fallback:", lastError);
    throw new Error(`Échec total de l'analyse (SDK & REST). Vérifiez votre clé API.`);
};
