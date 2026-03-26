import { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search, Plus, BarChart3, FileText, Mail, Settings,
    Target, Zap, Moon, Sun, Filter, ArrowUpDown, X
} from 'lucide-react';

interface CommandItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    action: () => void;
    category: string;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: CommandItem[];
}

export const CommandPalette = ({ isOpen, onClose, commands }: CommandPaletteProps) => {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredCommands = useMemo(() => {
        if (!search) return commands;
        const term = search.toLowerCase();
        return commands.filter(cmd =>
            cmd.label.toLowerCase().includes(term) ||
            cmd.category.toLowerCase().includes(term)
        );
    }, [commands, search]);

    // Group by category
    const groupedCommands = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {};
        filteredCommands.forEach(cmd => {
            if (!groups[cmd.category]) groups[cmd.category] = [];
            groups[cmd.category].push(cmd);
        });
        return groups;
    }, [filteredCommands]);

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
            e.preventDefault();
            filteredCommands[selectedIndex].action();
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
                    <Search className="text-slate-400" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tapez une commande ou recherchez..."
                        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-lg"
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Commands List */}
                <div className="max-h-80 overflow-y-auto p-2">
                    {Object.entries(groupedCommands).map(([category, items]) => (
                        <div key={category} className="mb-2">
                            <p className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {category}
                            </p>
                            {items.map((cmd, idx) => {
                                const globalIdx = filteredCommands.indexOf(cmd);
                                return (
                                    <button
                                        key={cmd.id}
                                        onClick={() => { cmd.action(); onClose(); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${globalIdx === selectedIndex
                                            ? 'bg-indigo-500 text-white'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <span className={globalIdx === selectedIndex ? 'text-white' : 'text-slate-500'}>
                                            {cmd.icon}
                                        </span>
                                        <span className="flex-1 text-left font-medium">{cmd.label}</span>
                                        {cmd.shortcut && (
                                            <kbd className={`text-xs px-1.5 py-0.5 rounded ${globalIdx === selectedIndex
                                                ? 'bg-indigo-400 text-white'
                                                : 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                                                }`}>
                                                {cmd.shortcut}
                                            </kbd>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}

                    {filteredCommands.length === 0 && (
                        <p className="text-center py-8 text-slate-400">
                            Aucune commande trouvée
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">â†‘â†“</kbd>
                            naviguer
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">â†µ</kbd>
                            sélectionner
                        </span>
                    </div>
                    <span>âŒ˜K pour ouvrir</span>
                </div>
            </div>
        </div>
    );
};

// Factory function to create commands
export const createCommands = (actions: {
    newApplication: () => void;
    openAnalytics: () => void;
    openFocusMode: () => void;
    exportPdf: () => void;
    openFilters: () => void;
    openPreferences: () => void;
    openEmailTemplates: () => void;

    toggleDarkMode: () => void;
    isDarkMode: boolean;
}): CommandItem[] => [
        { id: 'new', icon: <Plus size={18} />, label: 'Nouvelle candidature', shortcut: 'N', action: actions.newApplication, category: 'Actions' },
        { id: 'analytics', icon: <BarChart3 size={18} />, label: 'Analytics avancés', shortcut: 'A', action: actions.openAnalytics, category: 'Actions' },
        { id: 'focus', icon: <Target size={18} />, label: 'Mode Focus', shortcut: 'F', action: actions.openFocusMode, category: 'Actions' },
        { id: 'pdf', icon: <FileText size={18} />, label: 'Exporter en PDF', shortcut: 'âŒ˜P', action: actions.exportPdf, category: 'Export' },
        { id: 'filters', icon: <Filter size={18} />, label: 'Ouvrir les filtres', action: actions.openFilters, category: 'Navigation' },
        { id: 'templates', icon: <Mail size={18} />, label: 'Templates email', action: actions.openEmailTemplates, category: 'Outils' },
        { id: 'prefs', icon: <Settings size={18} />, label: 'Préférences', action: actions.openPreferences, category: 'Paramètres' },
        { id: 'theme', icon: actions.isDarkMode ? <Sun size={18} /> : <Moon size={18} />, label: actions.isDarkMode ? 'Mode clair' : 'Mode sombre', action: actions.toggleDarkMode, category: 'Paramètres' },
    ];
