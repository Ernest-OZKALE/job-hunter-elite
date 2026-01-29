import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { calculateSalaryDetails, type SalaryDetails } from '../../lib/salaryCalculator';
import { Euro, TrendingUp } from 'lucide-react';

interface SalaryTooltipProps {
    rawSalary: string;
    existingDetails?: SalaryDetails;
    children?: React.ReactNode;
}

export const SalaryTooltip = ({ rawSalary, existingDetails, children }: SalaryTooltipProps) => {
    // If we have pre-calculated details, use them. Otherwise calculate on fly.
    const details = existingDetails || calculateSalaryDetails(rawSalary);

    // Portal Logic
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const handleMouseEnter = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();

        setCoords({
            // Absolute positioning relative to document body requires scrollY
            top: rect.top + window.scrollY - 10,
            left: rect.left + window.scrollX + (rect.width / 2)
        });
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    if (!details || !details.brutYear) return <>{children}</>;

    const tooltip = (
        <div
            className="absolute z-[9999] pointer-events-none transition-opacity duration-200"
            style={{
                top: coords.top,
                left: coords.left,
                transform: 'translate(-50%, -100%)', // Shift Up and Center
                opacity: isVisible ? 1 : 0
            }}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 w-96 relative">
                <h4 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <Euro size={20} className="text-emerald-500" /> Analyse Rémunération
                </h4>

                <div className="space-y-4">
                    {/* Main Figures */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                            <span className="block text-slate-500 font-bold uppercase text-xs mb-1">Brut Annuel</span>
                            <span className="block font-black text-slate-800 dark:text-slate-100 text-lg">{details.brutYear}</span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                            <span className="block text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs mb-1">Net Mensuel</span>
                            <span className="block font-black text-emerald-700 dark:text-emerald-300 text-lg">{details.netMonth}</span>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <table className="w-full text-xs text-left">
                        <thead className="text-slate-400 font-bold bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="p-2 rounded-l">Période</th>
                                <th className="p-2">Brut</th>
                                <th className="p-2 text-emerald-600 dark:text-emerald-400 rounded-r">Net (Est.)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-600 dark:text-slate-300">
                            <tr>
                                <td className="p-2 font-bold">Annuel</td>
                                <td className="p-2">{details.brutYear}</td>
                                <td className="p-2 font-bold text-emerald-600 dark:text-emerald-400">{details.netYear}</td>
                            </tr>
                            <tr>
                                <td className="p-2 font-bold">Mensuel</td>
                                <td className="p-2">{details.brutMonth}</td>
                                <td className="p-2 font-bold text-emerald-600 dark:text-emerald-400">{details.netMonth}</td>
                            </tr>
                            <tr>
                                <td className="p-2">Journalier</td>
                                <td className="p-2">{details.brutDay}</td>
                                <td className="p-2">{details.netDay}</td>
                            </tr>
                            <tr>
                                <td className="p-2">Horaire</td>
                                <td className="p-2">{details.brutHour}</td>
                                <td className="p-2">{details.netHour}</td>
                            </tr>
                        </tbody>
                    </table>

                    {details.analysis && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl flex gap-2">
                            <TrendingUp size={16} className="shrink-0 mt-0.5" />
                            {details.analysis}
                        </div>
                    )}
                </div>

                {/* Arrow (Bottom center of tooltip pointing down to element) */}
                <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 rotate-45"></div>
            </div>
        </div>
    );

    return (
        <>
            <div ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="inline-block relative">
                {children}
            </div>
            {isVisible && createPortal(tooltip, document.body)}
        </>
    );
};

