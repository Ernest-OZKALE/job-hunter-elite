import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import type { ApplicationStatus } from '../../types';
import { getStatusOption, getStatusesByCategory } from '../../lib/statusConfig';

interface StatusSelectorProps {
    value: ApplicationStatus;
    onChange: (status: ApplicationStatus) => void;
    className?: string;
}

export const StatusSelector = ({ value, onChange, className = '' }: StatusSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
    const [openUpward, setOpenUpward] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentStatus = getStatusOption(value);
    const categories = getStatusesByCategory();

    const categoryLabels = {
        preparation: 'ðŸ“‹ Préparation',
        candidature: 'ðŸ“¤ Candidature',
        entretien: 'ðŸŽ¯ Entretiens & Tests',
        decision: 'ðŸ’¡ Décision',
        cloture: 'ðŸ Clôture',
    };

    const handleOpen = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownHeight = 500; // max-height du dropdown
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Ouvrir vers le haut si pas assez d'espace en bas
            setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
            setButtonRect(rect);
            setIsOpen(!isOpen);
        }
    };

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const dropdown = isOpen && buttonRect ? (
        <div
            ref={dropdownRef}
            className="fixed bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[9999] w-96 max-h-[500px] overflow-y-auto"
            style={{
                top: openUpward ? undefined : `${buttonRect.bottom + 8}px`,
                bottom: openUpward ? `${window.innerHeight - buttonRect.top + 8}px` : undefined,
                left: `${buttonRect.left}px`,
            }}
        >
            {Object.entries(categories).map(([category, statuses]) => (
                <div key={category} className="p-2">
                    <div className="px-3 py-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-800 z-10">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                    </div>
                    <div className="space-y-1">
                        {statuses.map(status => (
                            <button
                                key={status.value}
                                type="button"
                                onClick={() => {
                                    onChange(status.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${value === status.value
                                        ? `${status.color} shadow-sm`
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                            >
                                <span className="text-lg">{status.icon}</span>
                                <span className="font-bold text-sm flex-1">{status.label}</span>
                                {value === status.value && <span className="text-xs">âœ“</span>}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    ) : null;

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={handleOpen}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${currentStatus.color} hover:shadow-lg ${className}`}
            >
                <span>{currentStatus.icon}</span>
                <span>{currentStatus.label}</span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdown && createPortal(dropdown, document.body)}
        </>
    );
};
