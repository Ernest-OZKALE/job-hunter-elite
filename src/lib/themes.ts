export type ThemeName = 'ocean' | 'forest' | 'sunset' | 'midnight' | 'monochrome' | 'luxury' | 'cyberpunk' | 'nord' | 'coffee';
export type ViewMode = 'compact' | 'comfort' | 'grid';

export interface Theme {
    name: ThemeName;
    label: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
    };
    gradient: string;
}

export const THEMES: Record<ThemeName, Theme> = {
    // --- CLASSIC ---
    ocean: {
        name: 'ocean',
        label: '🌊 Océan',
        colors: {
            primary: '#0ea5e9',
            secondary: '#06b6d4',
            accent: '#3b82f6',
            background: '#f0f9ff',
            surface: '#e0f2fe',
            text: '#0c4a6e',
        },
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    forest: {
        name: 'forest',
        label: '🌲 Forêt',
        colors: {
            primary: '#10b981',
            secondary: '#059669',
            accent: '#34d399',
            background: '#f0fdf4',
            surface: '#dcfce7',
            text: '#064e3b',
        },
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    },
    sunset: {
        name: 'sunset',
        label: '🌅 Sunset',
        colors: {
            primary: '#f97316',
            secondary: '#ea580c',
            accent: '#fb923c',
            background: '#fff7ed',
            surface: '#ffedd5',
            text: '#7c2d12',
        },
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },

    // --- PREMIUM ---
    luxury: {
        name: 'luxury',
        label: '👑 Luxury Gold',
        colors: {
            primary: '#d4af37', // Gold
            secondary: '#c5a028',
            accent: '#f3e5ab',
            background: '#1a1a1a', // Dark setup usually
            surface: '#2c2c2c',
            text: '#e5e7eb',
        },
        gradient: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)',
    },
    cyberpunk: {
        name: 'cyberpunk',
        label: '👾 Cyberpunk',
        colors: {
            primary: '#d946ef', // Neon Fuchsia
            secondary: '#8b5cf6', // Violet
            accent: '#06b6d4', // Cyan
            background: '#09090b',
            surface: '#18181b',
            text: '#e879f9',
        },
        gradient: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)',
    },
    nord: {
        name: 'nord',
        label: '❄️ Nord',
        colors: {
            primary: '#88c0d0',
            secondary: '#81a1c1',
            accent: '#5e81ac',
            background: '#eceff4',
            surface: '#e5e9f0',
            text: '#2e3440',
        },
        gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    },
    coffee: {
        name: 'coffee',
        label: '☕ Coffee',
        colors: {
            primary: '#8b5e34', // Brown
            secondary: '#6f4e37',
            accent: '#a67b5b',
            background: '#fdfbf7',
            surface: '#f3ece3',
            text: '#4a3b2a',
        },
        gradient: 'linear-gradient(135deg, #c79081 0%, #dfa579 100%)',
    },
    midnight: {
        name: 'midnight',
        label: '🌙 Midnight',
        colors: {
            primary: '#8b5cf6',
            secondary: '#7c3aed',
            accent: '#a78bfa',
            background: '#faf5ff',
            surface: '#f3e8ff',
            text: '#581c87',
        },
        gradient: 'linear-gradient(135deg, #2d3561 0%, #c05c7e 100%)',
    },
    monochrome: {
        name: 'monochrome',
        label: '⚫ Monochrome',
        colors: {
            primary: '#64748b',
            secondary: '#475569',
            accent: '#94a3b8',
            background: '#f8fafc',
            surface: '#f1f5f9',
            text: '#1e293b',
        },
        gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    },
};

export const getTheme = (name: ThemeName): Theme => {
    return THEMES[name] || THEMES.ocean;
};
