
export interface SalaryDetails {
    brutYear?: string;
    brutMonth?: string;
    brutDay?: string;
    brutHour?: string;
    netYear?: string;
    netMonth?: string;
    netDay?: string;
    netHour?: string;
    currency?: string;
    analysis?: string;
}

export function calculateSalaryDetails(text: string): SalaryDetails | null {
    // Match: "25k", "25.5k", "25000", "25 000", "25000.0"
    const salaryRegex = /(?:(\d{1,3}(?:[.,]\d+)?)\s?k)|(?:(\d{1,3}(?:[\s,.]\d{3})*|\d{4,8})(?:[.,]\d+)?\s?(?:€|euros?))/i;
    const salaryMatch = text.match(salaryRegex);

    if (!salaryMatch) return null;

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
    const lowerSnippet = text.toLowerCase();

    if (lowerSnippet.includes('net')) isBrut = false;
    // Keywords for monthly
    if (lowerSnippet.includes('mois') || lowerSnippet.includes('mensuel') || lowerSnippet.includes('mjm')) isAnnual = false;
    // Keywords for daily
    if (lowerSnippet.includes('jour') || lowerSnippet.includes('tjm')) {
        isAnnual = false; // logic handled below
        // Special case for TJM checks later if needed
    }

    // Heuristic correction: if < 10000 and not small (like TJM < 1000), probably monthly
    if (rawValue > 1200 && rawValue < 10000 && !lowerSnippet.includes('an')) isAnnual = false;


    // 3. Calculator Engine (Calibrated on salaire-brut-en-net.fr)
    const HOURS_MONTH_LEGAL = 151.67;
    const HOURS_YEAR_LEGAL = 1820;
    const DAYS_YEAR_FORFAIT = 218;

    // Charges estimation
    let chargeRate = 0.23; // Default (Non-cadre avg)
    let statusLabel = "Non-Cadre";

    // Keyword detection
    if (lowerSnippet.includes('cadre') || (isAnnual && rawValue > 40000) || (!isAnnual && rawValue > 3300)) {
        chargeRate = 0.25;
        statusLabel = "Cadre";
    }
    if (lowerSnippet.includes('fonctionnaire') || lowerSnippet.includes('public')) {
        chargeRate = 0.15;
        statusLabel = "Public";
    }

    const COEFF_NET = 1 - chargeRate; // Net = Brut * (1 - rate)
    // Inverse: Brut = Net / (1 - rate)

    let annualBrut = 0;

    if (isAnnual) {
        annualBrut = isBrut ? rawValue : rawValue / COEFF_NET;
    } else {
        // Monthly
        const monthlyBrut = isBrut ? rawValue : rawValue / COEFF_NET;
        annualBrut = monthlyBrut * 12;
    }

    const annualNet = annualBrut * COEFF_NET;

    // 4. Generate All Fields with High Precision
    const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR') + " €";

    return {
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
}
