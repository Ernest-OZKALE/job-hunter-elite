import { useState, useEffect, useMemo } from 'react';
import type { JobApplication } from '../types';

export type SortField = 'date' | 'priority' | 'salary' | 'company' | 'position' | 'lastActivity';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
    field: SortField;
    direction: SortDirection;
}

export const useSorting = (applications: JobApplication[]) => {
    const [sortState, setSortState] = useState<SortState>(() => {
        const saved = localStorage.getItem('job-hunter-sort');
        return saved ? JSON.parse(saved) : { field: 'date', direction: 'desc' };
    });

    useEffect(() => {
        localStorage.setItem('job-hunter-sort', JSON.stringify(sortState));
    }, [sortState]);

    const calculatePriority = (app: JobApplication): number => {
        let score = 0;
        score += (app.interestLevel || 0) * 20;
        if (app.status.includes('Entretien')) score += 30;
        if (app.status === 'Offre ReÃ§ue') score += 50;
        if (app.expectedResponseDate) {
            const daysUntil = Math.floor(
                (new Date(app.expectedResponseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            if (daysUntil < 3) score += 40;
            else if (daysUntil < 7) score += 20;
        }
        return Math.min(score, 100);
    };

    const sortedApplications = useMemo(() => {
        const sorted = [...applications];

        sorted.sort((a, b) => {
            let comparison = 0;

            switch (sortState.field) {
                case 'date':
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case 'priority':
                    comparison = calculatePriority(a) - calculatePriority(b);
                    break;
                case 'salary':
                    const aSalary = a.salaryMin && a.salaryMax ? (a.salaryMin + a.salaryMax) / 2 : 0;
                    const bSalary = b.salaryMin && b.salaryMax ? (b.salaryMin + b.salaryMax) / 2 : 0;
                    comparison = aSalary - bSalary;
                    break;
                case 'company':
                    comparison = a.company.localeCompare(b.company);
                    break;
                case 'position':
                    comparison = a.position.localeCompare(b.position);
                    break;
                case 'lastActivity':
                    const aTime = a.createdAt?.toMillis?.() || new Date(a.date).getTime();
                    const bTime = b.createdAt?.toMillis?.() || new Date(b.date).getTime();
                    comparison = aTime - bTime;
                    break;
            }

            return sortState.direction === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [applications, sortState]);

    const updateSort = (field: SortField) => {
        setSortState(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    return {
        sortState,
        updateSort,
        sortedApplications
    };
};
