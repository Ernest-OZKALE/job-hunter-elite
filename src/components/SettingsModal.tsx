import React from 'react';
import { X, User, Moon, Shield, LogOut, Sun } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useTheme } from '../context/ThemeContext';

interface SettingsModalProps {
    user: SupabaseUser;
    onClose: () => void;
    onLogout: () => void;
}

export default function SettingsModal({ user, onClose, onLogout }: SettingsModalProps) {
    const { theme, toggleTheme } = useTheme();
    const [isSecurityOpen, setIsSecurityOpen] = React.useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">

                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 p-6 flex justify-between items-center transition-colors">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <User className="text-blue-600" /> Mon Profil
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* User Card */}
                    <div className="flex items-center gap-4 bg-blue-50 dark:bg-slate-800 p-4 rounded-xl border border-blue-100 dark:border-slate-700 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white">{user.user_metadata?.full_name || 'Chasseur de Jobs'}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                        </div>
                    </div>

                    {/* Preferences List */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">PrÃ©fÃ©rences</h3>

                        <div onClick={toggleTheme} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-200">Mode Sombre</span>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded transition-colors ${theme === 'dark' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                {theme === 'dark' ? 'ActivÃ©' : 'DÃ©sactivÃ©'}
                            </span>
                        </div>

                        <div
                            className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                            <div
                                onClick={() => setIsSecurityOpen(!isSecurityOpen)}
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                                        <Shield size={18} />
                                    </div>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">SÃ©curitÃ© & DonnÃ©es</span>
                                </div>
                                <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                    {isSecurityOpen ? 'Masquer' : 'GÃ©rer'}
                                </span>
                            </div>

                            {isSecurityOpen && (
                                <div className="p-4 pt-0 space-y-3 animate-in slide-in-from-top-2">
                                    <hr className="border-slate-100 dark:border-slate-700 my-2" />
                                    <div className="text-sm">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">Email du compte</p>
                                        <p className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{user.email}</p>
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">ID Utilisateur (pour n8n)</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-300 truncate flex-1" title={user.id}>
                                                {user.id}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(user.id);
                                                    alert('ID copiÃ© !');
                                                }}
                                                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Copier l'ID"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const { supabase } = await import('../lib/supabase');
                                            await supabase.auth.resetPasswordForEmail(user.email!);
                                            alert('Email de rÃ©initialisation envoyÃ© !');
                                        }}
                                        className="w-full py-2 px-3 bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        RÃ©initialiser le mot de passe
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-100">
                        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors">
                            <LogOut size={18} /> DÃ©connexion
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
