import MagicFillService from '../services/magicFillService';

const testCases = [
    `DÃ©veloppeur Full Stack H/F - CDI - Paris
Poste: DÃ©veloppeur Full Stack (React/Node.js)
Entreprise: TechCorp Innovations
Lieu: Paris (Remote partiel)
Salaire: 45-55Kâ‚¬ selon expÃ©rience
Contrat: CDI`,

    `Stage Assistant RH - 6 mois - Lyon
Organisme: UniversitÃ© LumiÃ¨re Lyon 2
Localisation: Bron (Lyon)
Gratification: 560â‚¬/mois
Dates: Septembre 2024 - Mars 2025`,

    `Freelance - DÃ©veloppeur React Senior
Mission: Refonte application web
TJM: 400-450â‚¬/jour
DurÃ©e: 3 mois renouvelables
Technos: React, TypeScript, Node.js`
];


export const testMagicFill = async () => {
    for (const [index, text] of testCases.entries()) {
        console.log(`\nðŸ§ª Test Case ${index + 1}:`);
        const result = await MagicFillService.extractFromText(text);
        console.log(JSON.stringify(result, null, 2));
    }
};

// Auto-execute if run directly
testMagicFill().catch(console.error);
