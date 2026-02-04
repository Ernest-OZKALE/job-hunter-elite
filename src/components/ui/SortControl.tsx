import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SortField, SortState } from '../../hooks/useSorting';

interface SortControlProps {
    sortState: SortState;
    onSort: (field: SortField) => void;
}

const SORT_OPTIONS: { value: SortField; label: string; icon: string }[] = [
    { value: 'date', label: 'Date', icon: 'ðŸ“…' },
    { value: 'priority', label: 'PrioritÃ©', icon: 'ðŸŽ¯' },
    { value: 'salary', label: 'Salaire', icon: 'ðŸ’°' },
    { value: 'company', label: 'Entreprise', icon: 'ðŸ¢' },
    { value: 'position', label: 'Poste', icon: 'ðŸ’¼' },
    { value: 'lastActivity', label: 'DerniÃ¨re ActivitÃ©', icon: 'â°' }
];

export const SortControl = ({ sortState, onSort }: SortControlProps) => {
    const currentOption = SORT_OPTIONS.find(o => o.value === sortState.field);

    return (
        <div className="relative group">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 text-sm font-bold">
                <ArrowUpDown size={16} className="text-slate-500" />
                <span>{currentOption?.icon} {currentOption?.label}</span>
                {sortState.direction === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
            </button>

            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2">
                    <div className="text-xs font-bold text-slate-400 px-3 py-2">Trier par</div>
                    {SORT_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            onClick={() => onSort(option.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm ${sortState.field === option.value
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                        >
                            <span>{option.icon}</span>
                            <span className="flex-1">{option.label}</span>
                            {sortState.field === option.value && (
                                sortState.direction === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
