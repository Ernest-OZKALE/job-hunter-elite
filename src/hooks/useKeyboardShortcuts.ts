import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[], enabled = true) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in inputs
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            // Allow Escape in inputs
            if (event.key !== 'Escape') return;
        }

        for (const shortcut of shortcuts) {
            const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
            const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
            const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
            const altMatches = shortcut.alt ? event.altKey : !event.altKey;

            if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
                event.preventDefault();
                shortcut.action();
                break;
            }
        }
    }, [shortcuts, enabled]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return shortcuts;
};

// Preset shortcut configurations
export const createDashboardShortcuts = (actions: {
    newApplication: () => void;
    focusSearch: () => void;
    openCommandPalette: () => void;
    toggleAnalytics: () => void;
    toggleFocusMode: () => void;
    exportPdf: () => void;
}): ShortcutConfig[] => [
        { key: 'n', action: actions.newApplication, description: 'Nouvelle candidature' },
        { key: '/', action: actions.focusSearch, description: 'Rechercher' },
        { key: 'k', ctrl: true, action: actions.openCommandPalette, description: 'Command Palette' },
        { key: 'a', action: actions.toggleAnalytics, description: 'Analytics' },
        { key: 'f', action: actions.toggleFocusMode, description: 'Mode Focus' },
        { key: 'p', ctrl: true, action: actions.exportPdf, description: 'Exporter PDF' },
        { key: 'Escape', action: () => { }, description: 'Fermer modal' }
    ];
