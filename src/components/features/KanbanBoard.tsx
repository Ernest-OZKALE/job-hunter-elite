import { useMemo } from 'react';
import type { JobApplication, ApplicationStatus } from '../../types';
import { MoreVertical, Calendar, DollarSign } from 'lucide-react';
import { getRelanceInfo } from '../../lib/relance';
import { STATUS_OPTIONS } from '../../lib/statusConfig';

interface KanbanBoardProps {
    applications: JobApplication[];
    onStatusChange: (id: string, status: string) => void;
    onEdit: (app: JobApplication) => void;
}

// Group statuses into meaningful Kanban columns
const KANBAN_COLUMNS = [
    {
        id: 'preparation',
        label: '📋 Préparation',
        color: 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700',
        statuses: ['Brouillon', 'À Postuler'] as ApplicationStatus[]
    },
    {
        id: 'candidature',
        label: '📤 Candidature',
        color: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800',
        statuses: ['Candidature Envoyée', 'CV Vu', 'En Cours d\'Examen'] as ApplicationStatus[]
    },
    {
        id: 'tests',
        label: '💻 Tests',
        color: 'bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800',
        statuses: ['Test Technique Reçu', 'Test Technique Envoyé'] as ApplicationStatus[]
    },
    {
        id: 'entretiens',
        label: '🎯 Entretiens',
        color: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800',
        statuses: [
            'Entretien RH Programmé',
            'Entretien RH Passé',
            'Entretien Technique Programmé',
            'Entretien Technique Passé',
            'Entretien Final Programmé',
            'Entretien Final Passé'
        ] as ApplicationStatus[]
    },
    {
        id: 'decision',
        label: '💡 Décision',
        color: 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
        statuses: ['En Attente de Retour', 'Négociation Salaire', 'Offre Reçue'] as ApplicationStatus[]
    },
    {
        id: 'succes',
        label: '🎉 Succès',
        color: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800',
        statuses: ['Offre Acceptée'] as ApplicationStatus[]
    },
    {
        id: 'cloture',
        label: '🏁 Clôture',
        color: 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800',
        statuses: ['Refus Candidat', 'Refus Entreprise', 'Ghosting', 'Archivé'] as ApplicationStatus[]
    },
];

export const KanbanBoard = ({ applications, onStatusChange, onEdit }: KanbanBoardProps) => {

    const columns = useMemo(() => {
        const cols: Record<string, JobApplication[]> = {};
        KANBAN_COLUMNS.forEach(col => {
            cols[col.id] = [];
        });

        applications.forEach(app => {
            const column = KANBAN_COLUMNS.find(col => col.statuses.includes(app.status));
            if (column) {
                cols[column.id].push(app);
            }
        });

        return cols;
    }, [applications]);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('applicationId', id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('applicationId');
        if (id) {
            const column = KANBAN_COLUMNS.find(col => col.id === columnId);
            if (column && column.statuses.length > 0) {
                // Use the first status of the column as default
                onStatusChange(id, column.statuses[0]);
            }
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map(column => (
                <div
                    key={column.id}
                    className={`flex-shrink-0 w-80 ${column.color} rounded-2xl border-2 p-4 transition-all`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-lg text-slate-900 dark:text-white">{column.label}</h3>
                        <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm">
                            {columns[column.id]?.length || 0}
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                        {columns[column.id]?.map(app => {
                            const relanceInfo = getRelanceInfo(app.date, app.status);
                            const statusOption = STATUS_OPTIONS.find(s => s.value === app.status);

                            return (
                                <div
                                    key={app.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, app.id)}
                                    onClick={() => onEdit(app)}
                                    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-move border border-slate-200 dark:border-slate-700 group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {app.company}
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{app.position}</p>
                                        </div>
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>

                                    {statusOption && (
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold mb-3 ${statusOption.color}`}>
                                            <span>{statusOption.icon}</span>
                                            <span>{statusOption.label}</span>
                                        </div>
                                    )}

                                    <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>{new Date(app.date).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                        {app.salary && (
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={14} />
                                                <span>{app.salary}</span>
                                            </div>
                                        )}
                                        {relanceInfo.shouldRelance && (
                                            <div className={`text-xs font-bold ${relanceInfo.isUrgent ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                                ⚠️ {relanceInfo.message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {columns[column.id]?.length === 0 && (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                                Aucune candidature
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
