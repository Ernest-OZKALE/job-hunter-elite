import { Search, Download, Plus } from 'lucide-react';

interface ToolbarProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    onExport: () => void;
    onAdd: () => void;
    showForm: boolean;
}

export const Toolbar = ({ searchTerm, onSearchChange, onExport, onAdd, showForm }: ToolbarProps) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-transparent dark:border-slate-700/50">
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                    type="text" placeholder="Rechercher une entreprise..." value={searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-all font-medium shadow-sm"
                />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button onClick={onExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all">
                    <Download size={18} /> Exporter CSV
                </button>
                <button onClick={onAdd} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:-translate-y-0.5 transition-all">
                    <Plus size={20} strokeWidth={3} /> {showForm ? "Fermer" : "Nouvelle Candidature"}
                </button>
            </div>
        </div>
    );
};
