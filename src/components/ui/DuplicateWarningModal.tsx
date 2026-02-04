import { AlertTriangle, X } from 'lucide-react';
import type { DuplicateMatch } from '../../lib/duplicateDetection';

interface DuplicateWarningModalProps {
    isOpen: boolean;
    matches: DuplicateMatch[];
    onProceed: () => void;
    onCancel: () => void;
}

export const DuplicateWarningModal = ({
    isOpen,
    matches,
    onProceed,
    onCancel
}: DuplicateWarningModalProps) => {
    if (!isOpen || matches.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={28} />
                        <div>
                            <h2 className="text-2xl font-black">Candidature Similaire DÃ©tectÃ©e</h2>
                            <p className="text-sm text-orange-100">
                                {matches.length} candidature{matches.length > 1 ? 's' : ''} similaire{matches.length > 1 ? 's' : ''} trouvÃ©e{matches.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                        Une ou plusieurs candidatures existantes ressemblent fortement Ã  celle que vous essayez d'ajouter.
                        Voulez-vous vraiment continuer ?
                    </p>

                    <div className="space-y-3">
                        {matches.map((match, idx) => (
                            <div
                                key={match.application.id}
                                className="p-4 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            {match.application.company}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {match.application.position}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                                        {match.similarity}% similaire
                                    </span>
                                </div>
                                <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                                    âš ï¸ {match.reason}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    CrÃ©Ã©e le {new Date(match.application.date).toLocaleDateString('fr-FR')} â€¢
                                    Statut: {match.application.status}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onProceed}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 dark:shadow-orange-900/50"
                    >
                        Continuer quand mÃªme
                    </button>
                </div>
            </div>
        </div>
    );
};
