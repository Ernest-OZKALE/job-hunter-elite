import React, { useState } from 'react';
import type { JobApplication } from '../../types';
import { MessageSquare, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';

interface AiMessageGeneratorProps {
    application: JobApplication;
}

export const AiMessageGenerator = ({ application }: AiMessageGeneratorProps) => {
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateMessage = () => {
        setIsGenerating(true);
        // Simulated AI Generation (Heuristic based)
        setTimeout(() => {
            const template = `Bonjour,\n\nJe suis très intéressé par le poste de ${application.position} chez ${application.company} que j'ai vu sur ${application.source || 'votre site'}.\n\nMon profil semble correspondre à vos attentes, notamment sur les aspects techniques évoqués dans l'offre. ${application.location ? `Étant basé à ${application.location}, je` : 'Je'} serais ravi d'échanger avec vous sur cette opportunité.\n\nBien cordialement,`;
            setMessage(template);
            setIsGenerating(false);
        }, 1200);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel p-6 rounded-3xl border border-blue-100/50 dark:border-blue-900/30 bg-blue-50/10 dark:bg-blue-900/5 mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">Assistant de Contact IA</h4>
                        <p className="text-xs text-slate-500">Génère une accroche personnalisée</p>
                    </div>
                </div>
                {!message ? (
                    <button
                        onClick={generateMessage}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <MessageSquare size={16} />}
                        Générer
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={generateMessage}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Régénérer"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={copyToClipboard}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copié !' : 'Copier'}
                        </button>
                    </div>
                )}
            </div>

            {message && (
                <div className="relative group">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-40 p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none italic font-serif"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest border border-blue-100/50">
                            Prêt à l'emploi
                        </div>
                    </div>
                </div>
            )}

            {!message && !isGenerating && (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-sm text-slate-400">Clique sur générer pour créer un message basé sur l'offre de {application.company}.</p>
                </div>
            )}
        </div>
    );
};
