import { useState } from 'react';
import { X, Mail, Send, Copy, Sparkles } from 'lucide-react';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: 'candidature' | 'relance' | 'remerciement';
}

const defaultTemplates: EmailTemplate[] = [
    {
        id: '1',
        name: 'Candidature SpontanÃ©e',
        subject: 'Candidature pour le poste de {position}',
        body: `Bonjour {contactName},

Je me permets de vous contacter concernant le poste de {position} au sein de {company}.

Fort(e) de mon expÃ©rience en dÃ©veloppement et de ma passion pour les technologies modernes, je suis convaincu(e) que mon profil correspond parfaitement aux besoins de votre Ã©quipe.

Mes compÃ©tences incluent :
- DÃ©veloppement Full-Stack (React, TypeScript, Node.js)
- Gestion de projets agiles
- Collaboration en Ã©quipe

Je serais ravi(e) de discuter de la maniÃ¨re dont je peux contribuer au succÃ¨s de {company}.

Cordialement,
[Votre Nom]`,
        category: 'candidature'
    },
    {
        id: '2',
        name: 'Relance AprÃ¨s Candidature',
        subject: 'Suivi de ma candidature - {position}',
        body: `Bonjour {contactName},

Je me permets de revenir vers vous concernant ma candidature pour le poste de {position}, envoyÃ©e le [date].

Je reste trÃ¨s intÃ©ressÃ©(e) par cette opportunitÃ© et serais ravi(e) d'Ã©changer avec vous sur mon profil et mes motivations.

Seriez-vous disponible pour un entretien dans les prochains jours ?

Dans l'attente de votre retour,
Cordialement,
[Votre Nom]`,
        category: 'relance'
    },
    {
        id: '3',
        name: 'Remerciement Post-Entretien',
        subject: 'Merci pour l\'entretien - {position}',
        body: `Bonjour {contactName},

Je tenais Ã  vous remercier pour le temps que vous m'avez accordÃ© lors de notre entretien concernant le poste de {position}.

Notre Ã©change a renforcÃ© mon intÃ©rÃªt pour {company} et je suis encore plus motivÃ©(e) Ã  rejoindre votre Ã©quipe.

N'hÃ©sitez pas si vous avez besoin d'informations complÃ©mentaires.

Cordialement,
[Votre Nom]`,
        category: 'remerciement'
    }
];

interface EmailTemplatesModalProps {
    onClose: () => void;
    onSelectTemplate: (template: EmailTemplate) => void;
}

export const EmailTemplatesModal = ({ onClose, onSelectTemplate }: EmailTemplatesModalProps) => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'candidature' | 'relance' | 'remerciement'>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredTemplates = selectedCategory === 'all'
        ? defaultTemplates
        : defaultTemplates.filter(t => t.category === selectedCategory);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'candidature': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'relance': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'remerciement': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 transition-colors flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                            <Mail className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Templates d'Emails</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Gagnez du temps avec nos modÃ¨les prÃ©-Ã©crits</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                {/* Category Filter */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 transition-colors">
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'candidature', 'relance', 'remerciement'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat as any)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${selectedCategory === cat
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Templates List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {filteredTemplates.map(template => (
                        <div key={template.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg transition-all group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="text-yellow-500" size={20} />
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{template.name}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${getCategoryColor(template.category)}`}>
                                        {template.category}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyToClipboard(template.body, template.id)}
                                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="Copier"
                                    >
                                        {copiedId === template.id ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">âœ“ CopiÃ©</span>
                                        ) : (
                                            <Copy size={18} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => onSelectTemplate(template)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm flex items-center gap-2"
                                    >
                                        <Send size={16} />
                                        Utiliser
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm">
                                    <span className="font-bold text-slate-600 dark:text-slate-400">Objet : </span>
                                    <span className="text-slate-700 dark:text-slate-300">{template.subject}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                                        {template.body}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
