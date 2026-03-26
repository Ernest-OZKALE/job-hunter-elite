import { TrendingUp, Users, FileText, Settings, Menu } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface MobileNavbarProps {
    activeView: 'dashboard' | 'contacts' | 'documents';
    onViewChange: (view: 'dashboard' | 'contacts' | 'documents') => void;
    onOpenPrefs: () => void;
    onOpenMenu?: () => void; // For a future drawer if needed
}

export const MobileNavbar = ({ activeView, onViewChange, onOpenPrefs, onOpenMenu }: MobileNavbarProps) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 z-50 lg:hidden safe-area-bottom pb-safe transition-all duration-300">
            <div className="flex items-center justify-around">
                <button
                    onClick={() => onViewChange('dashboard')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeView === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <TrendingUp size={24} strokeWidth={activeView === 'dashboard' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Dash</span>
                </button>

                <button
                    onClick={() => onViewChange('contacts')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeView === 'contacts' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <Users size={24} strokeWidth={activeView === 'contacts' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Réseau</span>
                </button>

                <button
                    onClick={() => onViewChange('documents')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeView === 'documents' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <FileText size={24} strokeWidth={activeView === 'documents' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Docs</span>
                </button>

                <button
                    onClick={onOpenPrefs}
                    className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                    <Settings size={24} />
                    <span className="text-[10px] font-bold">Prefs</span>
                </button>
            </div>
        </nav>
    );
};
