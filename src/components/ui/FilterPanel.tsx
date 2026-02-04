import { X, Filter, RotateCcw } from 'lucide-react';
import type { FilterState } from '../../hooks/useFilters';
import type { ApplicationStatus } from '../../types';
import { STATUS_OPTIONS } from '../../lib/statusConfig';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    onReset: () => void;
    filterOptions: { locations: string[]; sources: string[]; tags: string[] };
    activeFilterCount: number;
}

export const FilterPanel = ({
    isOpen,
    onClose,
    filters,
    onUpdateFilter,
    onReset,
    filterOptions,
    activeFilterCount
}: FilterPanelProps) => {
    if (!isOpen) return null;

    const toggleStatus = (status: ApplicationStatus) => {
        const newStatuses = filters.statuses.includes(status)
            ? filters.statuses.filter(s => s !== status)
            : [...filters.statuses, status];
        onUpdateFilter('statuses', newStatuses);
    };

    const toggleLocation = (location: string) => {
        const newLocations = filters.locations.includes(location)
            ? filters.locations.filter(l => l !== location)
            : [...filters.locations, location];
        onUpdateFilter('locations', newLocations);
    };

    const toggleRemotePolicy = (policy: 'Full Remote' | 'Hybride' | 'Sur site') => {
        const newPolicies = filters.remotePolicies.includes(policy)
            ? filters.remotePolicies.filter(p => p !== policy)
            : [...filters.remotePolicies, policy];
        onUpdateFilter('remotePolicies', newPolicies);
    };

    const toggleSource = (source: string) => {
        const newSources = filters.sources.includes(source)
            ? filters.sources.filter(s => s !== source)
            : [...filters.sources, source];
        onUpdateFilter('sources', newSources);
    };

    const toggleOrigin = (origin: 'manual' | 'auto') => {
        const newOrigins = filters.origins.includes(origin)
            ? filters.origins.filter(o => o !== origin)
            : [...filters.origins, origin];
        onUpdateFilter('origins', newOrigins);
    };

    const toggleTag = (tag: string) => {
        const newTags = filters.tags.includes(tag)
            ? filters.tags.filter(t => t !== tag)
            : [...filters.tags, tag];
        onUpdateFilter('tags', newTags);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md h-full bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center text-white z-10">
                    <div className="flex items-center gap-3">
                        <Filter size={24} />
                        <div>
                            <h2 className="text-2xl font-black">Filtres</h2>
                            <p className="text-sm text-blue-100">{activeFilterCount} filtre(s) actif(s)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Tags */}
                    {filterOptions.tags.length > 0 && (
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                ðŸ”– Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.tags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${filters.tags.includes(tag)
                                            ? 'bg-blue-500 border-blue-500 text-white shadow-md transform scale-105'
                                            : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-blue-200'
                                            }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Statuts */}
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            ðŸ“Š Statuts
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {STATUS_OPTIONS.map(status => (
                                <label
                                    key={status.value}
                                    className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.statuses.includes(status.value)}
                                        onChange={() => toggleStatus(status.value)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                                        {status.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            ðŸ“… PÃ©riode
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">DÃ©but</label>
                                <input
                                    type="date"
                                    value={filters.dateRange?.start || ''}
                                    onChange={e => onUpdateFilter('dateRange', { ...filters.dateRange, start: e.target.value } as any)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Fin</label>
                                <input
                                    type="date"
                                    value={filters.dateRange?.end || ''}
                                    onChange={e => onUpdateFilter('dateRange', { ...filters.dateRange, end: e.target.value } as any)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Locations */}
                    {filterOptions.locations.length > 0 && (
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                ðŸ“ Localisation
                            </h3>
                            <div className="space-y-2">
                                {filterOptions.locations.map(location => (
                                    <label
                                        key={location}
                                        className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.locations.includes(location)}
                                            onChange={() => toggleLocation(location)}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{location}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Remote Policy */}
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            ðŸ  TÃ©lÃ©travail
                        </h3>
                        <div className="space-y-2">
                            {(['Full Remote', 'Hybride', 'Sur site'] as const).map(policy => (
                                <label
                                    key={policy}
                                    className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.remotePolicies.includes(policy)}
                                        onChange={() => toggleRemotePolicy(policy)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{policy}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Sources */}
                    {filterOptions.sources.length > 0 && (
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                ðŸ”— Source
                            </h3>
                            <div className="space-y-2">
                                {filterOptions.sources.map(source => (
                                    <label
                                        key={source}
                                        className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.sources.includes(source)}
                                            onChange={() => toggleSource(source)}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{source}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Origin */}
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            ðŸ¤– Origine
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.origins.includes('manual')}
                                    onChange={() => toggleOrigin('manual')}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Manuelle</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.origins.includes('auto')}
                                    onChange={() => toggleOrigin('auto')}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Automatique (n8n)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6">
                    <button
                        onClick={onReset}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={18} />
                        RÃ©initialiser les filtres
                    </button>
                </div>
            </div>
        </div>
    );
};
