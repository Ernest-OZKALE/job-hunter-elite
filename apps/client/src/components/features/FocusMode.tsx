import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Target, Calendar, MapPin, DollarSign, ExternalLink, FileText } from 'lucide-react';
import type { JobApplication } from '../../types';
import { StatusSelector } from '../ui/StatusSelector';
import { getRelanceInfo } from '../../lib/relance';

interface FocusModeProps {
    applications: JobApplication[];
    onClose: () => void;
    onUpdate: (id: string, data: Partial<JobApplication>) => Promise<void>;
}

export const FocusMode = ({ applications, onClose, onUpdate }: FocusModeProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isNoteFocused, setIsNoteFocused] = useState(false);

    // Ensure we have applications
    if (!applications || applications.length === 0) return null;

    const currentApp = applications[currentIndex];
    const relance = getRelanceInfo(currentApp.date, currentApp.status);

    const handleNext = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % applications.length);
    }, [applications.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + applications.length) % applications.length);
    }, [applications.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isNoteFocused) return; // Don't navigate if typing in notes

            switch (e.key) {
                case 'ArrowRight':
                    handleNext();
                    break;
                case 'ArrowLeft':
                    handlePrev();
                    break;
                case 'Escape':
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, onClose, isNoteFocused]);

    const handleNoteChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Optimistic update could be handled here or by specific logic, 
        // but simple onBlur save is safer for DB
    };

    const saveNote = async (value: string) => {
        if (value !== currentApp.notes) {
            await onUpdate(currentApp.id, { notes: value });
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">

            {/* Background elements for ambiance */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Header / Controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-white z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                        <Target className="text-blue-400" />
                    </div>
                    <div>
                        <h2 className="font-black text-xl tracking-tight">MODE FOCUS</h2>
                        <p className="text-white/60 text-xs font-medium">Candidature {currentIndex + 1} sur {applications.length}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-3 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white"
                >
                    <X size={24} />
                    <span className="sr-only">Fermer</span>
                </button>
            </div>

            {/* Main Navigation - Layers */}
            <button
                onClick={handlePrev}
                className="absolute left-4 lg:left-10 p-4 hover:bg-white/5 rounded-full text-white/30 hover:text-white transition-all z-10 hidden md:block"
            >
                <ChevronLeft size={48} />
            </button>

            <button
                onClick={handleNext}
                className="absolute right-4 lg:right-10 p-4 hover:bg-white/5 rounded-full text-white/30 hover:text-white transition-all z-10 hidden md:block"
            >
                <ChevronRight size={48} />
            </button>

            {/* Main Card */}
            <div className="w-full max-w-2xl px-6 relative z-0">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300">

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${((currentIndex + 1) / applications.length) * 100}%` }}
                        />
                    </div>

                    <div className="p-8">
                        {/* Title Section */}
                        <div className="mb-8 text-center">
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                {currentApp.company}
                            </h1>
                            <p className="text-xl text-blue-600 dark:text-blue-400 font-bold">
                                {currentApp.position}
                            </p>
                        </div>

                        {/* Status & Alerts */}
                        <div className="flex justify-center mb-8">
                            <div className="scale-110">
                                <StatusSelector
                                    value={currentApp.status}
                                    onChange={(s) => onUpdate(currentApp.id, { status: s as any })}
                                />
                            </div>
                        </div>

                        {relance.shouldRelance && (
                            <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 justify-center text-sm font-bold ${relance.isUrgent
                                    ? 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                    : 'bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                                }`}>
                                âš ï¸ {relance.message}
                            </div>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex items-center gap-3">
                                <MapPin className="text-slate-400" size={20} />
                                <span className="font-medium text-slate-700 dark:text-slate-300">{currentApp.location}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex items-center gap-3">
                                <DollarSign className="text-slate-400" size={20} />
                                <span className="font-medium text-slate-700 dark:text-slate-300">{currentApp.salary || 'Non spécifié'}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex items-center gap-3">
                                <Calendar className="text-slate-400" size={20} />
                                <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(currentApp.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            {currentApp.link && (
                                <a
                                    href={currentApp.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group cursor-pointer"
                                >
                                    <ExternalLink className="text-blue-500 group-hover:text-blue-600" size={20} />
                                    <span className="font-bold text-blue-600 dark:text-blue-400">Voir l'offre</span>
                                </a>
                            )}
                        </div>

                        {/* Quick Notes Area */}
                        <div className="relative">
                            <div className="absolute top-3 left-3 text-slate-400">
                                <FileText size={18} />
                            </div>
                            <textarea
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-300 text-sm transition-all"
                                placeholder="Note rapide..."
                                defaultValue={currentApp.notes}
                                onFocus={() => setIsNoteFocused(true)}
                                onBlur={(e) => {
                                    setIsNoteFocused(false);
                                    saveNote(e.target.value);
                                }}
                            />
                        </div>

                        <div className="mt-6 text-center text-xs text-slate-400 font-medium">
                            Utilisez les flèches â¬…ï¸ âž¡ï¸ pour naviguer â€¢ Echap pour quitter
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
