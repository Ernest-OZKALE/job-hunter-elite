import { useState, useEffect, Suspense, lazy, useCallback, useRef } from 'react';
import { Filter, Zap, Briefcase, Plus, BarChart3, TrendingUp, FileText, Loader2 } from 'lucide-react';
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
            <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-12 space-y-12 transition-all duration-300">

                {activeView === 'contacts' && <ContactsPage />}
                {activeView === 'documents' && <DocumentLibrary />}

                {activeView === 'dashboard' && (
                    <div className="space-y-10 animate-in fade-in duration-500">

                        {/* 1. HEADER SECTION */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="space-y-1">
                                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.user_metadata?.first_name || 'Champion'}</span> 👋
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Prêt à décrocher le job de tes rêves ?</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFocusMode(true)}
                                    className="px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold flex items-center gap-2 shadow-sm"
                                >
                                    🎯 <span className="hidden md:inline">Mode Focus</span>
                                </button>
                                <button
                                    onClick={handleAddApplication}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2 shadow-md"
                                >
                                    <Plus size={20} strokeWidth={3} />
                                    <span>Nouvelle Candidature</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. OVERVIEW SECTION (Stats & High Priority) */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-3">
                                <DashboardStats stats={stats} />
                            </div>
                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/20 h-full flex flex-col justify-center items-center text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                        <TrendingUp size={100} />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="font-bold text-indigo-100 mb-1">Taux de réponse</p>
                                        <div className="text-4xl font-black mb-2">{stats.conversion}%</div>
                                        <div className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm">Top Performance 🚀</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. ACTION CENTER (Relances & Analytics Toggle) */}
                        <div className="flex flex-col gap-6">
                            <RelancePanel
                                applications={applications}
                                onCreateRelance={(appId) => {
                                    const app = applications.find(a => a.id === appId);
                                    if (app) {
                                        showToast(`Relance prévue pour ${app.company}`, 'info');
                                        updateApplication(appId, {
                                            lastActivityAt: new Date().toISOString(),
                                            nextStep: 'Relancer le recruteur'
                                        });
                                    }
                                }}
                            />

                            {showAnalytics && (
                                <div className="animate-in slide-in-from-top-4 duration-300">
                                    <AnalyticsDashboard applications={applications} />
                                </div>
                            )}

                            {showAdvancedAnalytics && (
                                <AdvancedAnalytics
                                    applications={applications}
                                    onClose={() => setShowAdvancedAnalytics(false)}
                                />
                            )}
                        </div>

                        {/* 4. MAIN WORKSPACE (The "Desk") */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Briefcase className="text-blue-500" />
                                    Tableau de bord
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAnalytics(!showAnalytics)}
                                        className={`p-2 rounded-xl transition-colors ${showAnalytics ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500'}`}
                                        title="Voir les graphiques"
                                    >
                                        <BarChart3 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden backdrop-blur-xl">
                                {/* Toolbar */}
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-20">
                                    <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
                                        <Toolbar
                                            searchTerm={filters.searchTerm}
                                            onSearchChange={(term) => updateFilter('searchTerm', term)}
                                            onExport={handleExport}
                                            onAdd={handleAddApplication}
                                            showForm={showForm}
                                        />

                                        <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 px-1">
                                            <SortControl sortState={sortState} onSort={updateSort} />
                                            <button
                                                onClick={() => setShowFilterPanel(true)}
                                                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeFilterCount > 0
                                                    ? 'bg-blue-500 text-white shadow-lg'
                                                    : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <Filter size={16} />
                                                Filtres {activeFilterCount > 0 && <span className="bg-white/20 px-1.5 rounded-full text-xs">{activeFilterCount}</span>}
                                            </button>
                                            <button
                                                onClick={handleExportPDF}
                                                className="px-4 py-2 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-100 transition-all font-bold flex items-center gap-2 whitespace-nowrap"
                                                title="Exporter en PDF"
                                            >
                                                <FileText size={16} className="text-red-500" /> PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* List Content */}
                                <div className="p-0">
                                    {loading ? (
                                        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                                            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                                            <p>Chargement de vos succès...</p>
                                        </div>
                                    ) : applications.length === 0 && !showForm ? (
                                        <div className="text-center py-20 px-6">
                                            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Briefcase size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">Tout commence ici !</h3>
                                            <p className="text-slate-500 max-w-md mx-auto mb-8">Vous n'avez pas encore de candidature. Ajoutez votre première opportunité pour démarrer le suivi.</p>
                                            <button onClick={handleAddApplication} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                                Ajouter ma première candidature
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={`view-${viewMode} min-h-[400px]`}>
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
                                    )}
                                </div>

                                {/* Bulk Actions Bar (Floating) */}
                                <BulkActionsBar
                                    count={selectedIds.length}
                                    onClear={() => setSelectedIds([])}
                                    onStatusChange={handleBulkStatusChange}
                                    onDelete={handleBulkDelete}
                                />
                            </div>
                        </section>



                        {/* 5. WELLNESS STATION (Secondary Features) */}
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Zap size={16} /> Mon Développement
                                </span>
                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <DailyMotivation />
                                <MoodTracker />
                                <div className="lg:col-span-2">
                                    <GoalTracker applications={applications} />
                                </div>
                            </div>
                            <div className="mt-6">
                                <AchievementsPanel applications={applications} />
                            </div>
                        </section>

                        <div className="pt-10 pb-4 text-center">
                            <DataHealthPanel applications={applications} />
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

                    </div>
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

            <CommandPalette
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                commands={commands}
            />
        </div>
    );
};
