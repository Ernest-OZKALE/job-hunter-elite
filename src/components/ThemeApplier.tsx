import { useEffect } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { getTheme } from '../lib/themes';

export const ThemeApplier = () => {
    const { colorTheme } = usePreferences();

    useEffect(() => {
        const theme = getTheme(colorTheme);
        const root = document.documentElement;

        // Apply CSS variables
        root.style.setProperty('--theme-primary', theme.colors.primary);
        root.style.setProperty('--theme-secondary', theme.colors.secondary);
        root.style.setProperty('--theme-accent', theme.colors.accent);
        root.style.setProperty('--theme-background', theme.colors.background);
        root.style.setProperty('--theme-surface', theme.colors.surface);
        root.style.setProperty('--theme-text', theme.colors.text);
        root.style.setProperty('--theme-gradient', theme.gradient);

        // Apply to body background
        document.body.style.background = theme.colors.background;
        // Also clear background image to ensure color is visible, 
        // OR keep it but let radial-gradients use theme variables (preferred in index.css)
        document.body.style.backgroundImage = 'none';

        // Store in localStorage for persistence
        localStorage.setItem('colorTheme', colorTheme);
    }, [colorTheme]);

    return null;
};
