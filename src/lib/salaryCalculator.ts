
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
    } else if (salaryMatch[0]) { // Format "35000 €" or "24 377.00"
        let clean = salaryMatch[0].replace(/[^0-9,.]/g, ''); // "24377.00" or "24.377,00"

        // Advanced Parsing Logic for "Intuition"
        // 1. If contains 'k', handle separate
        if (clean.toLowerCase().includes('k')) {
            rawValue = parseFloat(clean.replace('k', '').replace(',', '.')) * 1000;
        } else {
            // 2. Normalize separator
            // If both . and , exist: last one is decimal, first is thousands
            if (clean.includes('.') && clean.includes(',')) {
                const lastDot = clean.lastIndexOf('.');
                const lastComma = clean.lastIndexOf(',');
                if (lastDot > lastComma) {
                    // 24,377.00 -> remove commas
                    clean = clean.replace(/,/g, '');
                } else {
                    // 24.377,00 -> remove dots, replace comma with dot
                    clean = clean.replace(/\./g, '').replace(',', '.');
                }
            } else if (clean.includes(',')) {
                // only comma: "24,377" (English) or "24377,00" (French)?
                // Heuristic: check decimals. 
                // If ",00" or ",50" (2 digits) -> likely decimal
                // If ",377" (3 digits) -> likely thousands
                if (/,\d{3}$/.test(clean) && !/,\d{2}$/.test(clean)) {
                    // matches ,123 but maybe not ,12 (wait ,123 matches ,12? No ,123$ matches ,123)
                    // Assume thousands
                    clean = clean.replace(/,/g, '');
                } else {
                    // Assume decimal
                    clean = clean.replace(',', '.');
                }
            }
            // if only dot, JS parseFloat handles it, unless "24.377" is thousands?
            // JS: parseFloat("24.377") = 24.377
            // If user meant 24377? 
            // Logic: Salaries are usually > 1000. 
            // If result is small (e.g. 24.377) and "Annual", multiply by 1000? 
            // Risk: Hourly rate 15.50 -> 15500?

            rawValue = parseFloat(clean);

            // Intuition for "Forgot Comma" or "Weird format"
            // If Annual and < 100, likely k multiplier needed (e.g. "35" -> "35k")
            if (isAnnual && rawValue > 10 && rawValue < 150) {
                rawValue *= 1000;
            }
            // If "24.377" was parsed as 24.37, convert to 24377 if Annual
            if (isAnnual && rawValue > 10 && rawValue < 100 && clean.split('.')[1]?.length === 3) {
                rawValue *= 1000;
            }
        }
    }

    // 2. Context Analysis (Brut/Net, Monthly/Annual)
    const lowerSnippet = text.toLowerCase();

    if (lowerSnippet.includes('net')) isBrut = false;
    // Keywords for monthly
    if (lowerSnippet.includes('mois') || lowerSnippet.includes('mensuel') || lowerSnippet.includes('mjm')) isAnnual = false;
    // Keywords for daily
    if (lowerSnippet.includes('jour') || lowerSnippet.includes('tjm')) {
        isAnnual = false;
    }

    // CRITICAL FIX: "Annuel" takes precedence over "sur 12 mois"
    // Example: "26000.0 Euros sur 12.0 mois" -> The presence of "mois" made it monthly.
    // We override it back to Annual if "annuel" or " an " is explicitly detected.
    if (lowerSnippet.includes('annuel') || lowerSnippet.includes(' an ') || lowerSnippet.includes('/an')) {
        isAnnual = true;
    }

    // Heuristic correction: if < 10000 and explicitly NOT annual, probably monthly
    // But if it IS annual (detected above), we trust the user/text (e.g. stage gratifications or very low part-time)
    if (rawValue > 1200 && rawValue < 10000 && !isAnnual) isAnnual = false;


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
