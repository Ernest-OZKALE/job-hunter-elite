import { X, Layout, Sparkles, Bell, User } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { usePreferences } from '../context/PreferencesContext';
import type { ViewMode } from '../lib/themes';

interface PreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PreferencesModal = ({ isOpen, onClose }: PreferencesModalProps) => {
    const { viewMode, setViewMode, showAnimations, setShowAnimations, colorTheme, setColorTheme, userProfile, setUserProfile } = usePreferences();
    const { permission, requestPermission } = useNotifications();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-card w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Préférences</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Personnalise ton expérience</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* User Profile for AI */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <User size={20} className="text-slate-600 dark:text-slate-300" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profil Professionnel (pour l'IA)</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                            Décrivez vos compétences, votre expérience et ce que vous recherchez. L'IA utilisera ces infos pour personnaliser vos lettres de motivation.
                        </p>
                        <textarea
                            value={userProfile}
                            onChange={(e) => setUserProfile(e.target.value)}
                            className="w-full h-32 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 dark:text-slate-200 resize-none"
                            placeholder="Ex: Développeur Fullstack React/Node.js avec 3 ans d'expérience. Expert en Tailwind..."
                        />
                    </div>
                </div>

                {/* View Mode */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Layout size={20} className="text-slate-600 dark:text-slate-300" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mode d'Affichage</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: 'compact' as ViewMode, label: 'Compact', icon: '📋', desc: 'Vue dense' },
                            { value: 'comfort' as ViewMode, label: 'Confort', icon: '📱', desc: 'Vue équilibrée' },
                            { value: 'grid' as ViewMode, label: 'Grille', icon: '🎯', desc: 'Mosaïque' },
                        ].map((mode) => (
                            <button
                                key={mode.value}
                                onClick={() => setViewMode(mode.value)}
                                className={`p-4 rounded-2xl border-2 transition-all ${viewMode === mode.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{mode.icon}</div>
                                <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">{mode.label}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{mode.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color Themes */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={20} className="text-slate-600 dark:text-slate-300" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thèmes de Couleurs</h3>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {(['ocean', 'forest', 'sunset', 'midnight', 'monochrome'] as const).map((themeName) => {
                            const config = {
                                ocean: { icon: '🌊', color: 'bg-blue-500' },
                                forest: { icon: '🌲', color: 'bg-emerald-500' },
                                sunset: { icon: '🌅', color: 'bg-orange-500' },
                                midnight: { icon: '🌙', color: 'bg-purple-500' },
                                monochrome: { icon: '⚫', color: 'bg-slate-700' },
                            }[themeName];

                            return (
                                <button
                                    key={themeName}
                                    onClick={() => setColorTheme(themeName)}
                                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${colorTheme === themeName
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-sm mb-1 shadow-sm`}>
                                        {config.icon}
                                    </div>
                                    <div className="font-bold text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{themeName}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Animations */}
                <div className="mb-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Animations</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Activer les animations fluides</p>
                        </div>
                        <button
                            onClick={() => setShowAnimations(!showAnimations)}
                            className={`relative w-14 h-8 rounded-full transition-colors ${showAnimations ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${showAnimations ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="mb-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Bell size={18} className="text-slate-600 dark:text-slate-300" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {permission === 'granted'
                                    ? '✅ Notifications activées pour les relances'
                                    : '⚠️ Activez pour ne pas rater de relance'}
                            </p>
                        </div>
                        <button
                            onClick={requestPermission}
                            disabled={permission === 'granted'}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${permission === 'granted'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default'
                                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md transform hover:-translate-y-0.5'
                                }`}
                        >
                            {permission === 'granted' ? 'Activé' : 'Activer'}
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
                    <p className="text-sm text-blue-900 dark:text-blue-200 text-center">
                        🎨 <strong>Personnalisation :</strong> Choisis un thème pour changer les couleurs principales de l'app.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};
