import useDrivePicker from 'react-google-drive-picker';
import {
    Search, ExternalLink, Edit2, Trash2, FileText, File, XCircle, Paperclip, Bot, X, TrendingUp, CheckSquare, Square
} from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { StatusSelector } from '../ui/StatusSelector';
import { ApplicationDetailModal } from '../ApplicationDetailModal';
import { SalaryTooltip } from '../ui/SalaryTooltip';
import type { JobApplication, Attachment } from '../../types';
import { getRelanceInfo } from '../../lib/relance';
import { calculateAiScore, getScoreColor } from '../../lib/aiScoring';
import { calculateSalaryDetails } from '../../lib/salaryCalculator';
import { useStorage } from '../../hooks/useStorage';

interface ApplicationListProps {
    applications: JobApplication[];
    onStatusChange: (id: string, newStatus: string) => void;
    onEdit: (app: JobApplication) => void;
    onDelete: (id: string) => void;
    onAddAttachment: (appId: string, attachment: Attachment) => void;
    onDeleteAttachmentFromApp: (appId: string, index: number, att: Attachment) => void;
    onUpdate: (id: string, data: Partial<JobApplication>) => Promise<void>;
    selectedIds?: string[];
    onToggleSelect?: (id: string, shiftKey?: boolean) => void;
    onSelectAll?: () => void;
    onDeselectAll?: () => void;
}

export const ApplicationList = ({
    applications,
    onStatusChange,
    onEdit,
    onDelete,
    onAddAttachment,
    onDeleteAttachmentFromApp,
    onUpdate,
    selectedIds = [],
    onToggleSelect,
    onSelectAll,
    onDeselectAll
}: ApplicationListProps) => {

    const [openPicker] = useDrivePicker();
    const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const { uploadFile } = useStorage();

    const handleManualUpload = async (appId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(appId);
        try {
            const path = `applications/${appId}/${file.name}`;
            const publicUrl = await uploadFile(file, path);

            if (publicUrl) {
                const newAtt: Attachment = {
                    name: file.name,
                    url: publicUrl,
                    type: file.type.includes('pdf') ? 'cv' : 'autre'
                };
                onAddAttachment(appId, newAtt);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUploadingId(null);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDrivePick = (appId: string) => {
        openPicker({
            clientId: "503263523556-jkfq2vspj6ie65d2qha64e4q794madj7.apps.googleusercontent.com",
            developerKey: "AIzaSyC3ZWOpeaEvkCAruwm5SSHj2qzVWIQ59Ro",
            appId: "503263523556",
            viewId: "DOCS",
            // @ts-ignore
            mimeTypes: "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.google-apps.document",
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: false,
            locale: "fr",
            callbackFunction: (data) => {
                if (data.action === 'picked') {
                    const doc = data.docs[0];
                    let cleanUrl = doc.url;
                    if (doc.type === 'file' && doc.id) {
                        const isGoogleDoc = doc.mimeType?.includes('application/vnd.google-apps');
                        if (!isGoogleDoc) {
                            cleanUrl = `https://drive.google.com/file/d/${doc.id}/view`;
                        }
                    }

                    const newAtt: Attachment = {
                        name: doc.name,
                        url: cleanUrl,
                        type: 'autre'
                    };

                    onAddAttachment(appId, newAtt);
                }
            },
        });
    };

    const [originFilter, setOriginFilter] = useState<'all' | 'manual' | 'auto'>('all');

    const filteredApplications = applications.filter(app => {
        if (originFilter === 'all') return true;
        // Handle legacy data where origin might be undefined (treat as manual)
        const appOrigin = app.origin || 'manual';
        return appOrigin === originFilter;
    });

    if (applications.length === 0) {
        return (
            <div className="glass-panel text-center py-20 rounded-3xl border border-dashed border-slate-300/50">
                <div className="bg-white/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Search className="text-blue-400" size={36} />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Aucune candidature</h3>
                <p className="text-slate-500">Lancez votre recherche et ajoutez votre première opportunité !</p>
            </div>
        );
    }

    const allSelected = filteredApplications.length > 0 && filteredApplications.every(app => selectedIds.includes(app.id));
    const someSelected = selectedIds.length > 0;

    return (
        <div className="space-y-4">
            {/* Selection & Origin Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Select All / Deselect All */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => allSelected ? onDeselectAll?.() : onSelectAll?.()}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${allSelected
                            ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600'
                            }`}
                    >
                        {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                        {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                    {someSelected && !allSelected && (
                        <span className="text-xs text-slate-500">
                            {selectedIds.length} sur {filteredApplications.length}
                        </span>
                    )}
                </div>

                {/* Origin Filter - Only show if there are mixed sources */}
                {applications.some(a => a.origin === 'auto') && (
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 inline-flex">
                        <button
                            onClick={() => setOriginFilter('all')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${originFilter === 'all' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Tout
                        </button>
                        <button
                            onClick={() => setOriginFilter('manual')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${originFilter === 'manual' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Edit2 size={10} /> Manuel
                        </button>
                        <button
                            onClick={() => setOriginFilter('auto')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${originFilter === 'auto' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Bot size={10} /> Auto
                        </button>
                    </div>
                )}
            </div>

            <p className="text-xs text-slate-400 italic">💡 Astuce : Maintenez Shift pour sélectionner une plage</p>

            {filteredApplications.map(app => {
                const relance = getRelanceInfo(app.date, app.status);
                const isSelected = selectedIds.includes(app.id);

                return (
                    <div
                        key={app.id}
                        className={`glass-card group relative transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 ${isSelected ? 'ring-2 ring-blue-500 border-blue-500/50 bg-blue-50/10' : 'border-slate-200 dark:border-slate-800'
                            }`}
                    >
                        {/* Selection Checkbox */}
                        <div className={`absolute left-3 top-3 lg:top-1/2 lg:-translate-y-1/2 z-20 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-100 lg:opacity-40 lg:group-hover:opacity-100'}`}>
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect?.(app.id, e.shiftKey);
                                }}
                                onChange={() => { }} // Controlled by onClick
                                className="w-6 h-6 lg:w-5 lg:h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-blue-500 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
                            />
                        </div>

                        {/* Status Stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-2 lg:w-1.5 transition-colors duration-300 ${app.status.includes('Offre') ? 'bg-emerald-500' :
                            app.status.includes('Refus') || app.status === 'Ghosting' ? 'bg-red-400' :
                                app.status.includes('Entretien') ? 'bg-purple-500' : 'bg-blue-500'
                            }`}></div>

                        <div className="card-content flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between items-start lg:items-center p-5 pt-12 lg:pl-14 lg:py-6 lg:pr-6">

                            {/* Main Info */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-extrabold text-xl text-slate-800 dark:text-white tracking-tight">{app.company}</h3>
                                    {/* AI Score Badge */}
                                    {(() => {
                                        const score = app.aiScore ?? calculateAiScore(app);
                                        return (
                                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 shadow-sm ${getScoreColor(score)}`}>
                                                <TrendingUp size={10} /> {score}% match
                                            </div>
                                        );
                                    })()}
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                                        {new Date(app.date).toLocaleDateString('fr-FR')}
                                    </span>
                                    {app.origin === 'auto' && (
                                        <span className="animate-pulse px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-bold flex items-center gap-1">
                                            <Bot size={12} /> NOUVEAU
                                        </span>
                                    )}
                                </div>
                                <div className="text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center gap-2">
                                    {app.position}
                                    {app.contractType && <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">{app.contractType}</span>}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 font-medium">
                                    {app.location && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> {app.location}</span>}
                                    {app.salary && (() => {
                                        const details = app.salaryDetails || calculateSalaryDetails(app.salary);
                                        return (
                                            <SalaryTooltip rawSalary={app.salary} existingDetails={details || undefined}>
                                                {/* High Visibility Badge */}
                                                <div className="flex items-center gap-3 cursor-help bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border-2 border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:border-emerald-300 transition-colors">

                                                    {/* Primary: Net Monthly */}
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net / mois</span>
                                                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg leading-tight">
                                                            {details?.netMonth || app.salary}
                                                        </span>
                                                    </div>

                                                    {/* Separator */}
                                                    {details?.brutYear && <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>}

                                                    {/* Secondary: Brut Annual */}
                                                    {details?.brutYear && (
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brut / an</span>
                                                            <span className="font-bold text-slate-700 dark:text-slate-300 text-base leading-tight">
                                                                {details.brutYear}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </SalaryTooltip>
                                        );
                                    })()}
                                    {app.source && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div> {app.source}</span>}
                                    {app.remotePolicy && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-300"></div> {app.remotePolicy}</span>}
                                </div>

                                {/* Tags Row */}
                                {app.tags && app.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {app.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-black text-blue-500/80 uppercase tracking-tighter bg-blue-50/50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md border border-blue-100/50 dark:border-blue-800/50">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Status, Files, Actions */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full sm:w-auto">

                                {/* Status Selector */}
                                <div className="min-w-[200px] relative z-20">
                                    <StatusSelector
                                        value={app.status}
                                        onChange={(status) => onStatusChange(app.id, status)}
                                    />
                                </div>

                                {/* Files */}
                                <div className="flex items-center gap-2">
                                    {app.attachments && app.attachments.length > 0 ? (
                                        app.attachments.map((att, i) => (
                                            <div key={i} className="relative group/file">
                                                <a href={att.url} target="_blank" rel="noreferrer" title={att.name}
                                                    className="flex items-center justify-center w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:shadow-md transition-all">
                                                    <File size={16} />
                                                </a>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeleteAttachmentFromApp(app.id, i, att); }}
                                                    className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full p-0.5 shadow-sm opacity-0 group-hover/file:opacity-100 transition-opacity border border-slate-100 dark:border-slate-700"
                                                    title="Supprimer">
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                        ))
                                    ) : null}

                                    {/* Drive Upload Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDrivePick(app.id); }}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                        title="Ajouter depuis Drive"
                                    >
                                        <Paperclip size={18} />
                                    </button>

                                    {/* Manual Upload Button */}
                                    <label
                                        onClick={(e) => e.stopPropagation()}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer ${uploadingId === app.id ? 'animate-pulse' : ''}`}
                                        title="Importer un fichier"
                                    >
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => handleManualUpload(app.id, e)}
                                            disabled={uploadingId === app.id}
                                        />
                                        {uploadingId === app.id ? (
                                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <FileText size={18} />
                                        )}
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 pl-2 border-l border-slate-200/50 dark:border-slate-700/50">
                                    {app.link && (
                                        <a href={app.link} target="_blank" rel="noreferrer" title="Voir l'offre" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><ExternalLink size={18} /></a>
                                    )}
                                    <button onClick={() => setSelectedApp(app)} title="Détails" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><FileText size={18} /></button>
                                    <button onClick={() => onEdit(app)} title="Modifier" className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"><Edit2 size={18} /></button>
                                    <button onClick={() => onDelete(app.id)} title="Supprimer" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {app.notes && (
                            <div className="mt-0 pt-4 pb-4 px-6 border-t border-slate-100/60 dark:border-slate-800/60 text-sm text-slate-600 dark:text-slate-400 italic flex items-start gap-2.5">
                                <FileText size={16} className="mt-0.5 text-blue-400/80" />
                                <span className="line-clamp-1">{app.notes}</span>
                            </div>
                        )}
                    </div>
                );
            })}

            {selectedApp && (
                <ApplicationDetailModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
};
