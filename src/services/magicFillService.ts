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
    // New Proxy URL (Relative path works automatically with Vercel)
    private static API_URL = '/api/magic-fill';

    static async extractFromText(rawText: string): Promise<JobOffer | null> {
        try {
            console.log("🚀 Magic Fill: Sending to Proxy...");

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: rawText,
                    source_url: window.location.href
                })
            });

            if (!response.ok) {
                // Handle 401/403 specifically
                if (response.status === 401 || response.status === 403) {
                    throw new Error("⛔ Accès refusé par le serveur. Vérifiez les credentials Cloudflare/Auth.");
                }
                const errText = await response.text();
                throw new Error(`Erreur Proxy (${response.status}): ${errText}`);
            }

            const data = await response.json();

            // The backend is expected to return the structured JSON directly.
            // But we should validate it looks like a JobOffer or has the right shape.
            if (!data) {
                throw new Error("Réponse vide du serveur.");
            }

            // If the backend wraps it in "result" or "data", adjust here.
            // Assuming direct return based on user prompt requirements.
            return data as JobOffer;

        } catch (error) {
            console.error('❌ Magic Fill Error:', error);
            // Returning null triggers the UI error state
            return null;
        }
    }

    // Deprecated local methods removed (OLLAMA_URL, createOptimizedPrompt, callOllama, validateAndParseResponse)
}

export default MagicFillService;
