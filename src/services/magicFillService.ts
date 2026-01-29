interface JobOffer {
    company: string | null;
    position: string | null;
    location: string | null;
    salary: string | null;
    contractType: string | null;
    remotePolicy: string | null;
    experience: string | null;
    industry: string | null;
    description: string | null;
    missions: string[];
    hardSkills: string[];
    softSkills: string[];
    benefits: string[];
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    confidence?: number;
    rawText: string;
}

class MagicFillService {
    private static OLLAMA_URL = 'http://localhost:11434/v1/chat/completions';
    private static MODEL = 'llama3.1:8b'; // Optimized for speed/accuracy balance

    static async extractFromText(rawText: string): Promise<JobOffer | null> {
        try {
            const prompt = this.createOptimizedPrompt(rawText);
            const response = await this.callOllama(prompt);
            return this.validateAndParseResponse(response);
        } catch (error) {
            console.error('Magic Fill Error:', error);
            return null;
        }
    }

    private static createOptimizedPrompt(text: string): string {
        return `
ANALYSE EXPERTE D'OFFRE D'EMPLOI

EXTRAIRE TOUTES LES DONNÉES AU FORMAT JSON STRICT.

TEXTE À ANALYSER:
"${text}"

FORMAT DE SORTIE (JSON UNIQUEMENT):
{
  "company": "Nom exact de l'entreprise",
  "position": "Intitulé du poste",
  "location": "Ville/Région (ex: Paris)",
  "salary": "Salaire ou TJM (ex: 45-55k, 400TJ)",
  "contractType": "CDI|CDD|Freelance|Alternance|Stage",
  "remotePolicy": "Politique télétravail (ex: Hybride 2j/sem, Full Remote)",
  "experience": "Expérience requise (ex: 2 ans, Junior, Senior, Première expérience)",
  "industry": "Secteur (ex: Tech, Finance)",
  "description": "Résumé court de l'offre en 2 phrases",
  "missions": ["Mission 1", "Mission 2", "Mission 3"],
  "hardSkills": ["React", "Node.js", "Python"],
  "softSkills": ["Rigueur", "Communication"],
  "benefits": ["Tickets Resto", "Mutuelle", "BSPCE"],
  "contactName": "Nom du recruteur si présent",
  "contactEmail": "Email du recruteur si présent",
  "contactPhone": "Téléphone si présent",
  "confidence": 0.95 (0.0 à 1.0)
}

RÈGLES:
1. Si info inconnue -> null (ou [] pour les tableaux)
2. Normaliser le salaire (k€ ou €/mois)
3. Experience: Convertir si possible en texte court (ex: "Junior" ou "2 ans")
4. Pas de bla-bla, QUE du JSON.
`;
    }

    private static async callOllama(prompt: string): Promise<string> {
        // Warning: This fetch will fail on deployed HTTPS sites due to Mixed Content
        const response = await fetch(this.OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1, // Très déterministe
                format: "json", // Force JSON mode for supported models
                max_tokens: 1500, // Increased for fuller extraction
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || data.message?.content?.trim() || "";
    }

    private static validateAndParseResponse(response: string): JobOffer | null {
        try {
            console.log("Raw AI Response:", response); // Debug log

            // 1. Try to find a JSON block between curly braces
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : response;

            // 2. Clean up common markdown artifacts just in case
            const cleaned = jsonString
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            const parsed = JSON.parse(cleaned);

            return parsed;
        } catch (error) {
            console.error('Parsing error. Response was:', response);
            console.error('Error details:', error);

            // Fallback: If parsing fails, try to return a partial object if possible
            // But for now, returning null is safer to trigger the error UI
            return null;
        }
    }
}

export default MagicFillService;
