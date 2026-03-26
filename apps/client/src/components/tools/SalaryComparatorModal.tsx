import React, { useState, useEffect } from 'react';
import { X, TrendingUp, AlertTriangle, CheckCircle, MapPin, Briefcase, Calculator } from 'lucide-react';
import { SALARY_DATA_2026, LOCATION_COEFFS, type RoleData } from '../../data/salaryData';

interface SalaryComparatorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SalaryComparatorModal: React.FC<SalaryComparatorModalProps> = ({ isOpen, onClose }) => {
    const [selectedRole, setSelectedRole] = useState<string>(Object.keys(SALARY_DATA_2026)[0]);
    const [startExp, setStartExp] = useState<keyof RoleData>('mid');
    const [location, setLocation] = useState<string>('Paris / IDF');
    const [offer, setOffer] = useState<number>(0);
    const [result, setResult] = useState<{ min: number; max: number; avg: number; status: string; diff: number } | null>(null);

    useEffect(() => {
        calculateMarket();
    }, [selectedRole, startExp, location]);

    const calculateMarket = () => {
        const roleData = SALARY_DATA_2026[selectedRole][startExp];
        const coeff = LOCATION_COEFFS[location as keyof typeof LOCATION_COEFFS];

        const min = Math.round(roleData.min * coeff);
        const max = Math.round(roleData.max * coeff);
        const avg = Math.round(roleData.avg * coeff);

        // Analyze current offer if present
        let status = 'neutral';
        let diff = 0;

        if (offer > 0) {
            const diffVal = offer - avg;
            diff = Math.round((diffVal / avg) * 100);

            if (offer < min) status = 'underpaid';
            else if (offer >= min && offer <= max) status = 'market';
            else if (offer > max) status = 'top-tier';
        }

        setResult({ min, max, avg, status, diff });
    };

    // Calculate on offer change
    useEffect(() => {
        if (result) calculateMarket();
    }, [offer]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Calculator className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Comparateur de Salaires 2026</h2>
                            <p className="text-slate-400 text-sm">Données de marché réelles (Non simulées)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-8">

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-indigo-400" /> Rôle
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {Object.keys(SALARY_DATA_2026).map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-indigo-400" /> Expérience
                            </label>
                            <select
                                value={startExp}
                                onChange={(e) => setStartExp(e.target.value as keyof RoleData)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="junior">Junior (0-2 ans)</option>
                                <option value="mid">Confirmé (2-5 ans)</option>
                                <option value="senior">Senior (5-8 ans)</option>
                                <option value="lead">Lead / Expert (+8 ans)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-indigo-400" /> Localisation
                            </label>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {Object.keys(LOCATION_COEFFS).map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                                ðŸ’¶ Votre Proposition / Actuel
                            </label>
                            <input
                                type="number"
                                value={offer || ''}
                                onChange={(e) => setOffer(Number(e.target.value))}
                                placeholder="ex: 45000"
                                className="w-full bg-slate-800 border border-emerald-500/30 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder-slate-600"
                            />
                        </div>
                    </div>

                    {/* Visualizer */}
                    {result && (
                        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 space-y-6">

                            {/* Stats Cards */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Minimum</div>
                                    <div className="text-xl font-bold text-slate-200">{result.min.toLocaleString()} â‚¬</div>
                                </div>
                                <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                                    <div className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Moyenne Marché</div>
                                    <div className="text-2xl font-bold text-indigo-400">{result.avg.toLocaleString()} â‚¬</div>
                                </div>
                                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Top Market</div>
                                    <div className="text-xl font-bold text-slate-200">{result.max.toLocaleString()} â‚¬</div>
                                </div>
                            </div>

                            {/* Gauge / Bar */}
                            <div className="relative pt-6 pb-2">
                                {/* Bar Background */}
                                <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-red-500/20 flex-1 border-r border-slate-900" title="Sous-payé"></div>
                                    <div className="h-full bg-emerald-500/20 flex-[2] border-r border-slate-900" title="Marché"></div>
                                    <div className="h-full bg-purple-500/20 flex-1" title="Top Tier"></div>
                                </div>

                                {/* Cursor for Input Offer */}
                                {offer > 0 && (
                                    <div
                                        className="absolute top-2 w-1 h-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-500 ease-out z-10"
                                        style={{
                                            left: `${Math.min(Math.max(((offer - (result.min * 0.8)) / ((result.max * 1.2) - (result.min * 0.8))) * 100, 0), 100)}%`
                                        }}
                                    >
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded shadow">
                                            {offer.toLocaleString()}
                                        </div>
                                    </div>
                                )}

                                {/* Labels under bar */}
                                <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                                    <span>{Math.round(result.min * 0.8).toLocaleString()} â‚¬</span>
                                    {/* <span>{result.min.toLocaleString()} â‚¬</span> */}
                                    {/* <span>{result.max.toLocaleString()} â‚¬</span> */}
                                    <span>{Math.round(result.max * 1.2).toLocaleString()} â‚¬</span>
                                </div>
                            </div>

                            {/* Verdict */}
                            {offer > 0 && (
                                <div className={`p-4 rounded-lg flex items-start gap-4 ${result.status === 'underpaid' ? 'bg-red-500/10 border border-red-500/30' :
                                    result.status === 'market' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                                        'bg-purple-500/10 border border-purple-500/30'
                                    }`}>
                                    {result.status === 'underpaid' ? <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" /> :
                                        result.status === 'market' ? <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" /> :
                                            <TrendingUp className="w-6 h-6 text-purple-400 shrink-0" />}

                                    <div>
                                        <h4 className={`font-bold ${result.status === 'underpaid' ? 'text-red-400' :
                                            result.status === 'market' ? 'text-emerald-400' :
                                                'text-purple-400'
                                            }`}>
                                            {result.status === 'underpaid' ? 'En dessous du marché' :
                                                result.status === 'market' ? 'Offre Cohérente' :
                                                    'Offre Exceptionnelle'}
                                        </h4>
                                        <p className="text-sm text-slate-300 mt-1">
                                            {result.status === 'underpaid'
                                                ? `Attention, cette offre est environ ${Math.abs(result.diff)}% en dessous de la moyenne constatée pour ce profil.`
                                                : result.status === 'market'
                                                    ? `Cette proposition est dans la fourchette standard du marché (Moyenne : ${result.avg.toLocaleString()} â‚¬).`
                                                    : `Bravo ! Cette offre est ${result.diff}% au-dessus de la moyenne du marché.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {offer === 0 && (
                                <div className="text-center text-slate-500 text-sm py-2">
                                    Entrez un montant pour comparer
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
