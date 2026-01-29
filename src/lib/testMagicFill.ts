import MagicFillService from '../services/magicFillService';

const testCases = [
    `Développeur Full Stack H/F - CDI - Paris
Poste: Développeur Full Stack (React/Node.js)
Entreprise: TechCorp Innovations
Lieu: Paris (Remote partiel)
Salaire: 45-55K€ selon expérience
Contrat: CDI`,

    `Stage Assistant RH - 6 mois - Lyon
Organisme: Université Lumière Lyon 2
Localisation: Bron (Lyon)
Gratification: 560€/mois
Dates: Septembre 2024 - Mars 2025`,

    `Freelance - Développeur React Senior
Mission: Refonte application web
TJM: 400-450€/jour
Durée: 3 mois renouvelables
Technos: React, TypeScript, Node.js`
];


export const testMagicFill = async () => {
    for (const [index, text] of testCases.entries()) {
        console.log(`\n🧪 Test Case ${index + 1}:`);
        const result = await MagicFillService.extractFromText(text);
        console.log(JSON.stringify(result, null, 2));
    }
};

// Auto-execute if run directly
testMagicFill().catch(console.error);
