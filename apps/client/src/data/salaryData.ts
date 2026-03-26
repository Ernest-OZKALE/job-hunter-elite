export interface SalaryRange {
    min: number;
    max: number;
    avg: number;
}

export interface RoleData {
    junior: SalaryRange; // 0-2 ans
    mid: SalaryRange;    // 2-5 ans
    senior: SalaryRange; // 5-8+ ans
    lead: SalaryRange;   // Lead / Managers
}

export const SALARY_DATA_2026: Record<string, RoleData> = {
    'Frontend Developer (React/Vue)': {
        junior: { min: 35000, max: 42000, avg: 38000 },
        mid: { min: 45000, max: 58000, avg: 52000 },
        senior: { min: 60000, max: 75000, avg: 68000 },
        lead: { min: 70000, max: 90000, avg: 80000 }
    },
    'Backend Developer (Node/Python/Go)': {
        junior: { min: 38000, max: 45000, avg: 42000 },
        mid: { min: 48000, max: 62000, avg: 55000 },
        senior: { min: 65000, max: 80000, avg: 72000 },
        lead: { min: 75000, max: 95000, avg: 85000 }
    },
    'Fullstack Javascript': {
        junior: { min: 38000, max: 46000, avg: 42000 },
        mid: { min: 50000, max: 65000, avg: 58000 },
        senior: { min: 65000, max: 85000, avg: 75000 },
        lead: { min: 80000, max: 100000, avg: 90000 }
    },
    'Data Scientist / ML Engineer': {
        junior: { min: 42000, max: 52000, avg: 47000 },
        mid: { min: 55000, max: 70000, avg: 62000 },
        senior: { min: 75000, max: 95000, avg: 85000 },
        lead: { min: 90000, max: 120000, avg: 105000 }
    },
    'Product Owner / Product Manager': {
        junior: { min: 40000, max: 50000, avg: 45000 },
        mid: { min: 55000, max: 70000, avg: 62000 },
        senior: { min: 70000, max: 90000, avg: 80000 },
        lead: { min: 85000, max: 110000, avg: 95000 }
    },
    'DevOps / Cloud Engineer': {
        junior: { min: 40000, max: 48000, avg: 44000 },
        mid: { min: 52000, max: 68000, avg: 60000 },
        senior: { min: 70000, max: 90000, avg: 80000 },
        lead: { min: 85000, max: 110000, avg: 95000 }
    },
    'UI/UX Designer': {
        junior: { min: 32000, max: 40000, avg: 36000 },
        mid: { min: 45000, max: 55000, avg: 50000 },
        senior: { min: 60000, max: 75000, avg: 68000 },
        lead: { min: 70000, max: 90000, avg: 80000 }
    }
};

export const LOCATION_COEFFS = {
    'Paris / IDF': 1.0,
    'Lyon / Bordeaux / Nantes': 0.85,
    'Lille / Toulouse / Sophia': 0.80,
    'Full Remote (France)': 0.90, // Tendance : le full remote s'aligne doucement vers le national/Paris
    'Reste de la France': 0.75
};
