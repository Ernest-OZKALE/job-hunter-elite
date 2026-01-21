import { useState, useEffect, Suspense, lazy, useCallback, useRef } from 'react';
import { Filter } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardStats } from '../components/features/DashboardStats';
import { Toolbar } from '../components/features/Toolbar';
import { ApplicationList } from '../components/features/ApplicationList';
import { ApplicationForm } from '../components/features/ApplicationForm';
import { DataHealthPanel } from '../components/features/DataHealthPanel';
import { AchievementsPanel } from '../components/features/AchievementsPanel';
import { GoalTracker } from '../components/features/GoalTracker';
import { MoodTracker } from '../components/features/MoodTracker';
import { DailyMotivation } from '../components/features/DailyMotivation';
import { BulkActionsBar } from '../components/features/BulkActionsBar';
import { ActivityHeatmap } from '../components/features/ActivityHeatmap';
import { ContactsPage } from './ContactsPage';
import { DocumentLibrary } from '../components/features/DocumentLibrary';
import { AdvancedAnalytics } from '../components/features/AdvancedAnalytics';
import { RelancePanel } from '../components/features/RelancePanel';
import { useApplications } from '../hooks/useApplications';
import { useStorage } from '../hooks/useStorage';
import confetti from 'canvas-confetti';
import type { JobApplication, Attachment } from '../types';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { AnalyticsDashboard } from '../components/features/AnalyticsDashboard';
import { generatePDFReport } from '../lib/exportPdf';
import { EmailTemplatesModal } from '../components/EmailTemplatesModal';
import { PreferencesModal } from '../components/PreferencesModal';
import { usePreferences } from '../context/PreferencesContext';
import { FocusMode } from '../components/features/FocusMode';
import { SalaryComparatorModal } from '../components/tools/SalaryComparatorModal';
import { useFilters } from '../hooks/useFilters';
import { useSorting } from '../hooks/useSorting';
import { FilterPanel } from '../components/ui/FilterPanel';
import { SortControl } from '../components/ui/SortControl';
import { DuplicateWarningModal } from '../components/ui/DuplicateWarningModal';
import { CommandPalette, createCommands } from '../components/ui/CommandPalette';
import { detectDuplicates, type DuplicateMatch } from '../lib/duplicateDetection';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

// Lazy load modals
const HelpModal = lazy(() => import('../components/HelpModal'));
const SettingsModal = lazy(() => import('../components/SettingsModal'));

interface DashboardPageProps {
    user: User;
    onLogout: () => void;
}

export const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {

    const [activeView, setActiveView] = useState<'dashboard' | 'contacts' | 'documents'>('dashboard');
    const { showToast } = useToast();
    const { viewMode } = usePreferences();
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => Promise<void> | void;
        isDanger?: boolean;
    }>({ isOpen: false, title: '', message: '', action: () => { }, isDanger: false });

    const openConfirm = (title: string, message: string, action: () => Promise<void> | void, isDanger = false) => {
        setConfirmState({ isOpen: true, title, message, action, isDanger });
    };

    const handleConfirmAction = async () => {
        try {
            await confirmState.action();
            setConfirmState(prev => ({ ...prev, isOpen: false }));
        } catch (e) {
            console.error(e);
            showToast("Une erreur est survenue", 'error');
        }
    };

    const {
        applications,
        stats,
        loading,
        addApplication,
        updateApplication,
        deleteApplication
    } = useApplications(user.id);

    const handleStatusChange = async (id: string, status: string) => {
        if (status === 'Offre Reçue' || status === 'Offre Acceptée') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#f59e0b']
            });
        }
        await updateApplication(id, { status: status as any });
    };

    const { uploadFile, deleteFile, isUploading } = useStorage();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [initialForm, setInitialForm] = useState<Omit<JobApplication, 'id'>>({
        company: '', position: 'Technicien Support', location: 'Paris',
        salary: '', link: '', status: 'À Postuler', date: new Date().toISOString().split('T')[0],
        notes: '', attachments: [], contractType: 'CDI', interestLevel: 3, remotePolicy: 'Hybride'
    });

    const [showHelp, setShowHelp] = useState(false);
    const [showPrefs, setShowPrefs] = useState(false);
    const [showEmailTemplates, setShowEmailTemplates] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showFocusMode, setShowFocusMode] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
    const [duplicateWarning, setDuplicateWarning] = useState<{
        isOpen: boolean;
        matches: DuplicateMatch[];
        pendingData: Omit<JobApplication, 'id'> | null;
    }>({ isOpen: false, matches: [], pendingData: null });
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleBulkStatusChange = async (status: string) => {
        if (selectedIds.length === 0) return;
        try {
            await Promise.all(selectedIds.map(id => updateApplication(id, { status: status as any })));
            showToast(`${selectedIds.length} candidatures mises à jour`, 'success');
            setSelectedIds([]);
        } catch (e) {
            showToast("Erreur lors de la mise à jour groupée", 'error');
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        openConfirm(
            `Supprimer ${selectedIds.length} candidatures ?`,
            "Cette action est irréversible pour TOUTES les candidatures sélectionnées.",
            async () => {
                await Promise.all(selectedIds.map(id => deleteApplication(id)));
                showToast(`${selectedIds.length} candidatures supprimées`, 'info');
                setSelectedIds([]);
            },
            true
        );
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.altKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                setShowForm(true); // Changed from setIsFormOpen to setShowForm
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filters & Sorting
    const { filters, updateFilter, resetFilters, filteredApplications, filterOptions, activeFilterCount } = useFilters(applications);
    const { sortState, updateSort, sortedApplications } = useSorting(filteredApplications);

    const handleAddApplication = () => {
        setInitialForm({
            company: '', position: 'Technicien Support', location: 'Paris',
            salary: '', link: '', status: 'À Postuler', date: new Date().toISOString().split('T')[0],
            notes: '', attachments: []
        });
        setEditingId(null);
        setShowForm(!showForm);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (app: JobApplication) => {
        setInitialForm(app);
        setEditingId(app.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent, data: Omit<JobApplication, 'id'>) => {
        e.preventDefault();

        // Skip duplicate check if editing
        if (!editingId) {
            const duplicates = detectDuplicates(data, applications);
            if (duplicates.length > 0) {
                setDuplicateWarning({
                    isOpen: true,
                    matches: duplicates,
                    pendingData: data
                });
                return;
            }
        }

        await saveApplication(data);
    };

    const saveApplication = async (data: Omit<JobApplication, 'id'>) => {
        try {
            if (editingId) {
                await updateApplication(editingId, data);
                showToast('Candidature mise à jour avec succès', 'success');
            } else {
                await addApplication(data);
                showToast('Nouvelle candidature ajoutée !', 'success');
            }
            setShowForm(false);
            setEditingId(null);
        } catch (error) {
            console.error("Save failed", error);
            showToast("Erreur lors de la sauvegarde", 'error');
        }
    };

    const handleExport = async () => {
        try {
            const mod = await import('../lib/exportCsv');
            const csv = mod.applicationsToCsv(applications);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `JobHunter_Export_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('Export CSV réussi', 'success');
        } catch (e) {
            console.error('Export CSV failed', e);
            showToast("Impossible d'exporter le CSV", 'error');
        }
    };

    const handleExportPDF = () => {
        try {
            generatePDFReport(applications, user.user_metadata?.full_name || user.email || 'Utilisateur');
            showToast('Rapport PDF généré avec succès !', 'success');
        } catch (e) {
            console.error('PDF Export failed', e);
            showToast("Erreur lors de la génération du PDF", 'error');
        }
    };

    // Keyboard Shortcuts
    useKeyboardShortcuts([
        { key: 'n', action: () => handleAddApplication(), description: 'Nouvelle candidature' },
        { key: '/', action: () => searchInputRef.current?.focus(), description: 'Rechercher' },
        { key: 'k', ctrl: true, action: () => setShowCommandPalette(true), description: 'Command Palette' },
        { key: 'a', action: () => setShowAdvancedAnalytics(true), description: 'Analytics' },
        { key: 'f', action: () => setShowFocusMode(true), description: 'Focus Mode' },
        { key: 'Escape', action: () => { setShowCommandPalette(false); setShowAdvancedAnalytics(false); setShowFilterPanel(false); }, description: 'Fermer' }
    ]);

    // Command palette commands
    const commands = createCommands({
        newApplication: () => handleAddApplication(),
        openAnalytics: () => setShowAdvancedAnalytics(true),
        openFocusMode: () => setShowFocusMode(true),
        exportPdf: () => handleExportPDF(),
        openFilters: () => setShowFilterPanel(true),
        openPreferences: () => setShowPrefs(true),
        openEmailTemplates: () => setShowEmailTemplates(true),
        openSalaryComparator: () => setShowSalaryModal(true),
        toggleDarkMode: () => { },
        isDarkMode: false
    });

    const handleAddAttachment = async (appId: string, attachment: Attachment) => {
        const app = applications.find(a => a.id === appId);
        if (app) {
            try {
                await updateApplication(appId, { attachments: [...app.attachments, attachment] });
                showToast('Fichier ajouté avec succès', 'success');
            } catch (error) {
                showToast("Erreur lors de l'ajout du fichier", 'error');
            }
        }
    };

    const handleDeleteAttachmentFromApp = async (appId: string, index: number, att: Attachment) => {
        openConfirm(
            "Supprimer le fichier ?",
            "Voulez-vous vraiment supprimer ce fichier de la candidature ?",
            async () => {
                const app = applications.find(a => a.id === appId);
                if (app) {
                    const newAtts = [...app.attachments];
                    newAtts.splice(index, 1);
                    await updateApplication(appId, { attachments: newAtts });
                    showToast('Fichier supprimé', 'info');
                    if (att.url.includes('firebasestorage')) {
                        await deleteFile(att.url);
                    }
                }
            },
            true
        );
    };

    const handleDeleteApp = (id: string) => {
        openConfirm(
            "Supprimer la candidature ?",
            "Cette action est irréversible. Toutes les données associées seront perdues.",
            async () => {
                await deleteApplication(id);
                showToast('Candidature supprimée', 'info');
            },
            true
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300 flex">

            {/* Sidebar Navigation */}
            <Sidebar
                user={user}
                activeView={activeView}
                onLogout={onLogout}
                onOpenPrefs={() => setShowPrefs(true)}
                onViewChange={setActiveView}
            />

            {/* Main Content Area */}
            <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-10 space-y-8 transition-all duration-300">

                {activeView === 'contacts' && <ContactsPage />}
                {activeView === 'documents' && <DocumentLibrary />}

                {activeView === 'dashboard' && (
                    <>

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Mes Candidatures</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Gérez vos opportunités professionnelles</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFocusMode(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-transparent rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm font-bold flex items-center gap-2"
                                >
                                    🎯 Mode Focus
                                </button>
                                <button
                                    onClick={() => setShowSalaryModal(true)}
                                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl transition-all text-sm font-bold flex items-center gap-2"
                                >
                                    💶 Salaires
                                </button>
                                <button
                                    onClick={() => setShowAnalytics(!showAnalytics)}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300"
                                >
                                    {showAnalytics ? '📊 Masquer Stats' : '📊 Voir Stats'}
                                </button>
                            </div>
                        </div>

                        {/* Analytics Dashboard - Collapsible */}
                        {showAnalytics && (
                            <div className="animate-in slide-in-from-top-4 duration-300">
                                <AnalyticsDashboard applications={applications} />
                            </div>
                        )}

                        <DashboardStats stats={stats} />

                        <DataHealthPanel applications={applications} />

                        <RelancePanel
                            applications={applications}
                            onCreateRelance={(appId) => {
                                const app = applications.find(a => a.id === appId);
                                if (app) {
                                    showToast(`Relance prévue pour ${app.company}`, 'info');
                                    // Update status to "Relance" or trigger email
                                    updateApplication(appId, {
                                        lastActivityAt: new Date().toISOString(),
                                        nextStep: 'Relancer le recruteur'
                                    });
                                }
                            }}
                        />

                        {/* Well-being Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                            <DailyMotivation />
                            <MoodTracker />
                        </div>

                        {/* Goals & Achievements Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                            <GoalTracker applications={applications} />
                            <AchievementsPanel applications={applications} />
                        </div>

                        <div className="sticky top-4 z-30 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                            <div className="flex flex-col md:flex-row gap-3 items-center">
                                <Toolbar
                                    searchTerm={filters.searchTerm}
                                    onSearchChange={(term) => updateFilter('searchTerm', term)}
                                    onExport={handleExport} onAdd={handleAddApplication} showForm={showForm}
                                />
                                <div className="flex gap-2">
                                    <SortControl sortState={sortState} onSort={updateSort} />
                                    <button
                                        onClick={() => setShowFilterPanel(true)}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeFilterCount > 0
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Filter size={16} />
                                        Filtres
                                        {activeFilterCount > 0 && (
                                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{activeFilterCount}</span>
                                        )}
                                    </button>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button
                                        onClick={handleExportPDF}
                                        className="flex-1 md:flex-none px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 font-bold shadow-lg shadow-red-200 dark:shadow-red-900/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        📄 PDF
                                    </button>
                                    <button
                                        onClick={() => setShowEmailTemplates(true)}
                                        className="flex-1 md:flex-none px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 font-bold shadow-lg shadow-purple-200 dark:shadow-purple-900/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        ✉️ Templates
                                    </button>
                                    <button
                                        onClick={() => setShowAdvancedAnalytics(true)}
                                        className="flex-1 md:flex-none px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-blue-600 font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        📊 Analytics
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showForm && (
                            <ApplicationForm
                                initialData={initialForm}
                                isEditing={!!editingId}
                                onSubmit={handleSubmit}
                                onCancel={() => { setShowForm(false); setEditingId(null); }}
                                onUpload={(file) => uploadFile(file, `uploads/${user.id}/${file.name}`)}
                                isUploading={isUploading}
                            />
                        )}

                        {!loading && applications.length === 0 && !showForm && (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400">Commencez par ajouter une nouvelle candidature !</div>
                        )}

                        {loading ? (
                            <div className="text-center py-20 text-slate-400">Chargement...</div>
                        ) : (
                            <div className="space-y-6">
                                {!showForm && <ActivityHeatmap applications={applications} />}

                                <div className={`view-${viewMode}`}>
                                    <ApplicationList
                                        applications={sortedApplications}
                                        onStatusChange={handleStatusChange}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteApp}
                                        onAddAttachment={handleAddAttachment}
                                        onDeleteAttachmentFromApp={handleDeleteAttachmentFromApp}
                                        onUpdate={updateApplication}
                                        selectedIds={selectedIds}
                                        onToggleSelect={(id) => setSelectedIds(prev =>
                                            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <ConfirmModal
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                isDanger={confirmState.isDanger}
            />

            {/* Modals */}
            <Suspense fallback={null}>
                {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
                <PreferencesModal isOpen={showPrefs} onClose={() => setShowPrefs(false)} />
            </Suspense>

            {showEmailTemplates && (
                <EmailTemplatesModal
                    onClose={() => setShowEmailTemplates(false)}
                    onSelectTemplate={(template) => {
                        navigator.clipboard.writeText(template.body);
                        showToast('Template copié dans le presse-papier !', 'success');
                        setShowEmailTemplates(false);
                    }}
                />
            )}

            {showFocusMode && (
                <FocusMode
                    applications={applications}
                    onClose={() => setShowFocusMode(false)}
                    onUpdate={updateApplication}
                />
            )}

            <SalaryComparatorModal
                isOpen={showSalaryModal}
                onClose={() => setShowSalaryModal(false)}
            />

            <FilterPanel
                isOpen={showFilterPanel}
                onClose={() => setShowFilterPanel(false)}
                filters={filters}
                onUpdateFilter={updateFilter}
                onReset={resetFilters}
                filterOptions={filterOptions}
                activeFilterCount={activeFilterCount}
            />

            <DuplicateWarningModal
                isOpen={duplicateWarning.isOpen}
                matches={duplicateWarning.matches}
                onProceed={async () => {
                    if (duplicateWarning.pendingData) {
                        await saveApplication(duplicateWarning.pendingData);
                    }
                    setDuplicateWarning({ isOpen: false, matches: [], pendingData: null });
                }}
                onCancel={() => {
                    setDuplicateWarning({ isOpen: false, matches: [], pendingData: null });
                }}
            />

            {showAdvancedAnalytics && (
                <AdvancedAnalytics
                    applications={applications}
                    onClose={() => setShowAdvancedAnalytics(false)}
                />
            )}

            <CommandPalette
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                commands={commands}
            />

            <BulkActionsBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                onStatusChange={handleBulkStatusChange}
                onDelete={handleBulkDelete}
            />
        </div>
    );
};
