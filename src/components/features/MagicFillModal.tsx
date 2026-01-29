import React, { useState } from 'react';
import { useMagicFill } from '../../hooks/useMagicFill';
import { Wand2, X, Check, RefreshCw } from 'lucide-react'; // Using Lucide icons to match project style

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onApply: (data: any, rawText: string) => void;
}

const MagicFillModal: React.FC<Props> = ({ isOpen, onClose, onApply }) => {
    const [inputText, setInputText] = useState('');
    const { extractJobOffer, result, isLoading, error, reset } = useMagicFill();

    const handleReset = () => {
        reset();
        setInputText('');
    };

    const handleExtract = async () => {
        if (!inputText.trim()) {
            alert('Veuillez entrer du texte');
            return;
        }
        await extractJobOffer(inputText);
    };

    const handleApply = () => {
        if (result) {
            onApply(result, inputText);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Wand2 className="animate-pulse" size={24} />
                        Magic Fill <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">IA Locale</span>
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {!result ? (
                        <div className="space-y-4">
                            <p className="text-slate-600 text-sm">
                                Collez ci-dessous la description complète de l'offre. L'IA va extraire les détails clés pour vous.
                            </p>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Collez ici l'offre d'emploi..."
                                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-medium text-slate-700 placeholder:text-slate-400"
                            />
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                    <X size={16} /> {error}
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleExtract}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="animate-spin" size={18} /> Analyse en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={18} /> Exécuter la magie
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800">Résultat extrait</h3>
                                {result.confidence && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.confidence > 0.8 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        Confiance: {(result.confidence * 100).toFixed(0)}%
                                    </span>
                                )}
                            </div>

                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {/* Core Info */}
                                <div className="space-y-3 pb-4 border-b border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informations Clés</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><span className="text-sm text-slate-500 block">Entreprise</span> <span className="font-bold text-slate-800">{result.company || '-'}</span></div>
                                        <div><span className="text-sm text-slate-500 block">Poste</span> <span className="font-bold text-slate-800">{result.position || '-'}</span></div>
                                        <div><span className="text-sm text-slate-500 block">Lieu</span> <span className="font-bold text-slate-800">{result.location || '-'}</span></div>
                                        <div><span className="text-sm text-slate-500 block">Contrat</span> <span className="font-bold text-blue-600">{result.contractType || '-'}</span></div>
                                        <div className="md:col-span-2">
                                            <span className="text-sm text-slate-500 block">Salaire</span>
                                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{result.salary || 'Non spécifié'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills & Missions */}
                                {(result.hardSkills?.length > 0 || result.missions?.length > 0) && (
                                    <div className="space-y-3 pb-4 border-b border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contenu</h4>
                                        {result.hardSkills?.length > 0 && (
                                            <div>
                                                <span className="text-xs font-semibold text-slate-500 mb-1 block">Compétences Détectées</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.hardSkills.map((s: string, i: number) => (
                                                        <span key={i} className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-700">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {result.missions?.length > 0 && (
                                            <div className="mt-3">
                                                <span className="text-xs font-semibold text-slate-500 mb-1 block">Missions</span>
                                                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                                                    {result.missions.slice(0, 3).map((m: string, i: number) => (
                                                        <li key={i} className="truncate">{m}</li>
                                                    ))}
                                                    {result.missions.length > 3 && <li>...et {result.missions.length - 3} autres</li>}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Contact & Benefits */}
                                {(result.contactName || result.benefits?.length > 0) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.contactName && (
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact</h4>
                                                <div className="text-sm font-semibold text-slate-700">{result.contactName}</div>
                                                {result.contactEmail && <div className="text-xs text-slate-500">{result.contactEmail}</div>}
                                            </div>
                                        )}
                                        {result.benefits?.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Avantages</h4>
                                                <div className="text-xs text-slate-600">{result.benefits.join(', ')}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Recommencer
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <Check size={18} /> Appliquer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MagicFillModal;
