import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeName, ViewMode } from '../lib/themes';

interface PreferencesContextType {
    colorTheme: ThemeName;
    setColorTheme: (theme: ThemeName) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    showAnimations: boolean;
    setShowAnimations: (show: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    const [colorTheme, setColorThemeState] = useState<ThemeName>(() => {
        const saved = localStorage.getItem('colorTheme');
        return (saved as ThemeName) || 'ocean';
    });

    const [viewMode, setViewModeState] = useState<ViewMode>(() => {
        const saved = localStorage.getItem('viewMode');
        return (saved as ViewMode) || 'comfort';
    });

    const [showAnimations, setShowAnimationsState] = useState(() => {
        const saved = localStorage.getItem('showAnimations');
        return saved !== 'false';
    });

    const setColorTheme = (theme: ThemeName) => {
        setColorThemeState(theme);
        localStorage.setItem('colorTheme', theme);
    };

    const setViewMode = (mode: ViewMode) => {
        setViewModeState(mode);
        localStorage.setItem('viewMode', mode);
    };

    const setShowAnimations = (show: boolean) => {
        setShowAnimationsState(show);
        localStorage.setItem('showAnimations', String(show));
    };

    return (
        <PreferencesContext.Provider value={{
            colorTheme,
            setColorTheme,
            viewMode,
            setViewMode,
            showAnimations,
            setShowAnimations,
        }}>
            {children}
        </PreferencesContext.Provider>
    );
}

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};
