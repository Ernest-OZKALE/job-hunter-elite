import { Trash2, CheckCircle, Clock, X } from 'lucide-react';
import { STATUS_OPTIONS } from '../../lib/statusConfig';

interface BulkActionsBarProps {
    count: number;
    onClear: () => void;
    onStatusChange: (status: string) => void;
    onDelete: () => void;
}

export const BulkActionsBar = ({ count, onClear, onStatusChange, onDelete }: BulkActionsBarProps) => {
    if (count === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-300">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-6 backdrop-blur-xl bg-opacity-90">
                <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                    <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/40">
                        {count}
                    </div>
                    <span className="font-bold text-sm whitespace-nowrap">sélectionnés</span>
                </div>

                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase text-slate-500 mr-2">Status</p>
                    <div className="flex gap-1">
                        {['Ã€ Postuler', 'Candidature Envoyée', 'Entretien RH Passé', 'Offre Reçue', 'Archivé'].map(status => {
                            const config = STATUS_OPTIONS.find(s => s.value === status);
                            return (
                                <button
                                    key={status}
                                    onClick={() => onStatusChange(status)}
                                    title={status}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all group"
                                >
                                    <span className="text-xl group-hover:scale-125 transition-transform block">{config?.icon || 'âœï¸'}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                    <button
                        onClick={onDelete}
                        className="p-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all flex items-center gap-2 font-bold text-sm"
                    >
                        <Trash2 size={18} />
                        <span className="hidden sm:inline">Supprimer</span>
                    </button>

                    <button
                        onClick={onClear}
                        className="p-3 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all"
                        title="Désélectionner tout"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
