import { Briefcase, Settings, LogOut, HelpCircle } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
    user: User | null;
    onLogout: () => void;
    onOpenHelp: () => void;
    onOpenPrefs: () => void;
}

export const Navbar = ({ user, onLogout, onOpenHelp, onOpenPrefs }: NavbarProps) => {
    if (!user) return null;

    return (
        <header className="bg-gradient-to-r from-blue-50 to-white/80 backdrop-blur-md border-b border-transparent sticky top-0 z-30 shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-blue-500 to-blue-600 p-3 rounded-2xl shadow-md flex items-center justify-center">
                        <Briefcase className="text-white" size={22} />
                    </div>
                    <div className="leading-none">
                        <div className="font-extrabold text-2xl tracking-tight text-slate-900">JOB HUNTER <span className="text-xs align-top text-red-500 font-mono">v3</span></div>
                        <div className="text-xs text-slate-400">Centre de contrôle des candidatures</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                        <div title={user.email || ''} className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                            {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="hidden md:block text-sm font-medium text-slate-600">
                            <div className="font-bold">{user.user_metadata?.full_name || user.email}</div>
                            <div className="text-xs text-slate-400">Connecté</div>
                        </div>
                    </div>
                    <button onClick={onOpenHelp} title="Aide" className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                        <HelpCircle size={20} />
                    </button>
                    <button onClick={onOpenPrefs} title="Préférences" className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-sm text-slate-700 border border-slate-200">
                        <Settings size={16} /> Préférences
                    </button>
                    <button onClick={onLogout} title="Déconnexion" className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </div >
        </header >
    );
};
