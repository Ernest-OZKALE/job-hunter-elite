import { Briefcase, Settings, LogOut, Moon, Sun, TrendingUp, Users, FileText } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
    user: User | null;
    activeView: 'dashboard' | 'contacts' | 'documents';
    onLogout: () => void;
    onOpenPrefs: () => void;
    onViewChange: (view: 'dashboard' | 'contacts' | 'documents') => void;
}

export const Sidebar = ({ user, activeView, onLogout, onOpenPrefs, onViewChange }: SidebarProps) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-20 lg:w-64 bg-slate-900 dark:bg-slate-950 text-white flex-col justify-between z-40 transition-all duration-300 shadow-2xl">

            {/* Logo */}
            <div className="p-6 flex items-center justify-center lg:justify-start gap-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                    style={{
                        background: 'linear-gradient(to tr, var(--theme-primary), var(--theme-accent))',
                        boxShadow: '0 8px 16px -4px color-mix(in srgb, var(--theme-primary) 40%, transparent)'
                    }}
                >
                    <Briefcase className="text-white" size={20} />
                </div>
                <div className="hidden lg:block">
                    <h1 className="font-black text-xl tracking-tight text-white">JOB HUNTER</h1>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Elite Edition</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2">
                <p className="hidden lg:block text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Outils</p>

                <button
                    onClick={() => onViewChange('dashboard')}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${activeView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                    <TrendingUp size={22} />
                    <span className="hidden lg:block font-bold">Dashboard</span>
                </button>

                <button
                    onClick={() => onViewChange('contacts')}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${activeView === 'contacts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                    <Users size={22} />
                    <span className="hidden lg:block font-bold">Réseau</span>
                </button>

                <button
                    onClick={() => onViewChange('documents')}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${activeView === 'documents' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                    <FileText size={22} />
                    <span className="hidden lg:block font-bold">Documents</span>
                </button>

                <div className="pt-4 mt-4 border-t border-white/5">
                    <button
                        onClick={onOpenPrefs}
                        className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
                    >
                        <Settings size={22} />
                        <span className="hidden lg:block font-bold">Préférences</span>
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
                    >
                        {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                        <span className="hidden lg:block font-bold">Mode {theme === 'dark' ? 'Clair' : 'Sombre'}</span>
                    </button>
                </div>
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-white/5 bg-slate-950/30">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:block overflow-hidden">
                        <div className="font-bold text-sm text-white truncate">{user?.user_metadata?.full_name || 'Utilisateur'}</div>
                        <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                    </div>
                    <button onClick={onLogout} className="ml-auto text-slate-500 group-hover:text-red-400 transition-colors p-1">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
