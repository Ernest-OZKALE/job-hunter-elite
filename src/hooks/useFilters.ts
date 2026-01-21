import { useState, useEffect, useMemo } from 'react';
import type { JobApplication, ApplicationStatus } from '../types';

export interface FilterState {
    statuses: ApplicationStatus[];
    dateRange: { start: string; end: string } | null;
    salaryRange: { min: number; max: number } | null;
    locations: string[];
    remotePolicies: ('Full Remote' | 'Hybride' | 'Sur site')[];
    sources: string[];
    origins: ('manual' | 'auto')[];
    searchTerm: string;
    tags: string[];
}

const INITIAL_FILTERS: FilterState = {
    statuses: [],
    dateRange: null,
    salaryRange: null,
    locations: [],
    remotePolicies: [],
    sources: [],
    origins: [],
    searchTerm: '',
    tags: []
};

export const useFilters = (applications: JobApplication[]) => {
    const [filters, setFilters] = useState<FilterState>(() => {
        const saved = localStorage.getItem('job-hunter-filters');
        return saved ? JSON.parse(saved) : INITIAL_FILTERS;
    });

    useEffect(() => {
        localStorage.setItem('job-hunter-filters', JSON.stringify(filters));
    }, [filters]);

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters(INITIAL_FILTERS);
    };

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            // Search
            if (filters.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                const tagsMatch = (app.tags || []).some(t => t.toLowerCase().includes(term));
                const matchesSearch =
                    app.company.toLowerCase().includes(term) ||
                    app.position.toLowerCase().includes(term) ||
                    app.location?.toLowerCase().includes(term) ||
                    app.notes?.toLowerCase().includes(term) ||
                    (app.source || '').toLowerCase().includes(term) ||
                    tagsMatch;
                if (!matchesSearch) return false;
            }

            // Statuses
            if (filters.statuses.length > 0 && !filters.statuses.includes(app.status)) {
                return false;
            }

            // Date range
            if (filters.dateRange) {
                const appDate = new Date(app.date);
                const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
                const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
                if (start && appDate < start) return false;
                if (end && appDate > end) return false;
            }

            // Salary range
            if (filters.salaryRange && app.salaryMin && app.salaryMax) {
                const appAvg = (app.salaryMin + app.salaryMax) / 2;
                if (appAvg < filters.salaryRange.min || appAvg > filters.salaryRange.max) {
                    return false;
                }
            }

            // Locations
            if (filters.locations.length > 0 && !filters.locations.includes(app.location || '')) {
                return false;
            }

            // Remote policies
            if (filters.remotePolicies.length > 0 && !filters.remotePolicies.includes(app.remotePolicy as any)) {
                return false;
            }

            // Sources
            if (filters.sources.length > 0 && !filters.sources.includes(app.source || '')) {
                return false;
            }

            // Origins
            if (filters.origins.length > 0 && !filters.origins.includes(app.origin || 'manual')) {
                return false;
            }

            // Tags
            if (filters.tags.length > 0) {
                const appTags = app.tags || [];
                // Intersection check: must match ALL selected tags or ANY? Let's go with ANY for now.
                const hasMatch = filters.tags.some(t => appTags.includes(t));
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [applications, filters]);

    // Extract unique values for filter options
    const filterOptions = useMemo(() => {
        const locations = [...new Set(applications.map(a => a.location).filter((l): l is string => Boolean(l)))];
        const sources = [...new Set(applications.map(a => a.source).filter((s): s is string => Boolean(s)))];
        const allTags = applications.flatMap(a => a.tags || []);
        const tags = [...new Set(allTags)];
        return { locations, sources, tags };
    }, [applications]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.statuses.length > 0) count++;
        if (filters.dateRange) count++;
        if (filters.salaryRange) count++;
        if (filters.locations.length > 0) count++;
        if (filters.remotePolicies.length > 0) count++;
        if (filters.sources.length > 0) count++;
        if (filters.origins.length > 0) count++;
        if (filters.searchTerm) count++;
        if (filters.tags.length > 0) count++;
        return count;
    }, [filters]);

    return {
        filters,
        updateFilter,
        resetFilters,
        filteredApplications,
        filterOptions,
        activeFilterCount
    };
};
