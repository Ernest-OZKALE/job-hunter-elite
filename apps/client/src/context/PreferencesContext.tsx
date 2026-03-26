import React, { createContext, useContext, useState, useEffect } from 'react';
import { type ThemeName, type ViewMode, THEMES } from '../lib/themes';

interface PreferencesContextType {
    colorTheme: ThemeName;
    setColorTheme: (theme: ThemeName) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    showAnimations: boolean;
    setShowAnimations: (show: boolean) => void;
    userProfile: string;
    setUserProfile: (profile: string) => void;
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

    const [userProfile, setUserProfileState] = useState(() => {
        return localStorage.getItem('userProfile') || "Développeur Fullstack Passionné (Profil par défaut)";
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

    const setUserProfile = (profile: string) => {
        setUserProfileState(profile);
        localStorage.setItem('userProfile', profile);
    };

    // --- RUNTIME THEME APPLIER ---
    // This effect listens to colorTheme changes and injects a <style> tag
    // to override standard Tailwind classes with the selected theme colors.
    useEffect(() => {
        const theme = THEMES[colorTheme] || THEMES.ocean;
        const root = document.documentElement;

        // 1. Set CSS Variables (used by some background gradients)
        root.style.setProperty('--theme-primary', theme.colors.primary);
        root.style.setProperty('--theme-secondary', theme.colors.secondary);
        root.style.setProperty('--theme-accent', theme.colors.accent);
        root.style.setProperty('--theme-background', theme.colors.background);
        root.style.setProperty('--theme-surface', theme.colors.surface);
        root.style.setProperty('--theme-text', theme.colors.text);

        // 2. Inject Dynamic Styles to Override Tailwind Classes
        const styleId = 'theme-overrides';
        let styleTag = document.getElementById(styleId);
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }

        // We use !important to force the override over standard Tailwind utility classes
        styleTag.innerHTML = `
            :root {
                --theme-primary: ${theme.colors.primary};
                --theme-secondary: ${theme.colors.secondary};
            }
            
            /* Text Overrides */
            .text-blue-600, .text-blue-500, .group:hover .group-hover\\:text-blue-600 { color: ${theme.colors.primary} !important; }
            .text-indigo-600, .text-indigo-500 { color: ${theme.colors.secondary} !important; }
            .text-emerald-500 { color: ${theme.colors.accent} !important; }
            
            /* Background Overrides */
            .bg-blue-600, .bg-blue-500, .hover\\:bg-blue-600:hover, .hover\\:bg-blue-700:hover { background-color: ${theme.colors.primary} !important; }
            .bg-indigo-600, .bg-indigo-500, .bg-purple-600 { background-color: ${theme.colors.secondary} !important; }
            
            /* Light Backgrounds (Tint) */
            .bg-blue-50, .bg-blue-100, .hover\\:bg-blue-50:hover, .hover\\:bg-blue-100:hover { background-color: ${theme.colors.surface} !important; }
            .bg-indigo-50, .bg-purple-50 { background-color: ${theme.colors.background} !important; }
            
            /* Border Overrides */
            .border-blue-100, .border-blue-200, .border-blue-500, .focus\\:ring-blue-100:focus, .ring-blue-500 { border-color: ${theme.colors.primary} !important; }
            .focus\\:ring-blue-100:focus { --tw-ring-color: ${theme.colors.primary} !important; }
            
            /* Custom Scrollbar override if needed */
            ::-webkit-scrollbar-thumb { background-color: ${theme.colors.secondary} !important; }
        `;

        // Special Case for Dark Themes (Cyberpunk, Luxury)
        if (['luxury', 'cyberpunk', 'midnight'].includes(colorTheme)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

    }, [colorTheme]);

    return (
        <PreferencesContext.Provider value={{
            colorTheme,
            setColorTheme,
            viewMode,
            setViewMode,
            showAnimations,
            setShowAnimations,
            userProfile,
            setUserProfile
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
