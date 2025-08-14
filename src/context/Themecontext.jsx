import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const getInitialTheme = () => {
    return localStorage.getItem('theme') || 'blue';
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    const baseVariables = {
        '--color-bg-secondary-20': 'rgba(255, 255, 255, 0.2)',
        '--color-bg-secondary-30': 'rgba(255, 255, 255, 0.3)',
        '--color-bg-gray-light': '#e5e7eb',
        '--color-bg-card': '#ffffff',
        '--color-border-error': '#ef4444',
        '--color-border-divider': '#e5e7eb',
        '--color-blue-darker': '#1d4ed8',
        '--color-blue-darkest': '#1e40af',
        '--color-text-muted': '#9ca3af',
        '--color-text-white': '#ffffff',
        '--color-text-white-90': '#e6e6e6',
        '--color-text-error': '#dc2626',
        '--color-text-success': '#047857',
        '--color-success-light': '#d1fae5',
        '--color-success-lighter': '#a7f3d0',
        '--color-success': '#10b981',
        '--color-success-medium': '#059669',
        '--color-success-dark': '#047857',
        '--color-warning-light': '#fef3c7',
        '--color-warning-lighter': '#fde68a',
        '--color-warning': '#f59e0b',
        '--color-warning-dark': '#d97706',
        '--color-error-light': '#fee2e2',
        '--color-error-lighter': '#fecaca',
        '--color-error': '#ef4444',
        '--color-error-dark': '#dc2626',
        '--color-yellow-light': '#fde68a',
        '--color-yellow': '#facc15',
        '--color-yellow-dark': '#eab308',
        '--color-shadow-light': 'rgba(0, 0, 0, 0.05)',
        '--color-shadow-medium': 'rgba(0, 0, 0, 0.1)',
        '--color-shadow-dark': 'rgba(0, 0, 0, 0.15)',
    };

    const themes = {
        blue: {
            name: 'Light Mode',
            colors: {
                '--color-bg-primary': '#eff2f5',
                '--color-bg-secondary': '#ffffff',
                '--color-bg-gradient-start': '#f1f5f9',
                '--color-bg-gradient-end': '#e0f2fe',
                '--color-bg-hover': '#f1f5f9',
                '--color-bg-sidebar': '#f8fafc',
                '--color-bg-sidebar-to': '#ffffff',
                '--color-border-primary': '#E2E8F0',
                '--color-border-secondary': '#d1d5db',
                '--color-border-focus': '#3b82f6',
                '--color-blue': '#3b82f6',
                '--color-blue-dark': '#2563eb',
                '--color-blue-light': '#93c5fd',
                '--color-blue-lighter': '#dbeafe',
                '--color-blue-lightest': '#eff6ff',
                '--color-text-primary': '#1f2937',
                '--color-text-secondary': '#656c7a',
                '--color-text-blue': '#2563eb',
                '--color-scrollbar-track': '#f1f5f9',
                '--color-scrollbar-thumb': 'linear-gradient(45deg, #3b82f6, #6366f1)',
                '--color-scrollbar-thumb-hover': 'linear-gradient(45deg, #2563eb, #4f46e5)',
            }
        },
        dark: {
            name: 'Dark Mode',
            colors: {
                '--color-bg-primary': '#18181b',
                '--color-bg-secondary': '#23232a',
                '--color-bg-gradient-start': '#23232a',
                '--color-bg-gradient-end': '#18181b',
                '--color-bg-hover': '#27272a',
                '--color-bg-sidebar': '#18181b',
                '--color-bg-sidebar-to': '#23232a',
                '--color-border-primary': '#27272a',
                '--color-border-secondary': '#3f3f46',
                '--color-border-focus': '#818cf8',
                '--color-blue': '#60a5fa',
                '--color-blue-dark': '#3b82f6',
                '--color-blue-light': '#64748b',
                '--color-blue-lighter': '#334155',
                '--color-blue-lightest': '#1e293b',
                '--color-blue-darker': '#2563eb',
                '--color-blue-darkest': '#1d4ed8',
                '--color-text-primary': '#f4f4f5',
                '--color-text-secondary': '#a1a1aa',
                '--color-text-blue': '#60a5fa',
                '--color-scrollbar-track': '#23232a',
                '--color-scrollbar-thumb': 'linear-gradient(45deg, #60a5fa, #334155)',
                '--color-scrollbar-thumb-hover': 'linear-gradient(45deg, #3b82f6, #1e293b)',
            }
        },
        // Extend other themes (purple, green, dark) similarly...
    };

    const changeTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        const root = document.documentElement;
        const themeColors = themes[newTheme].colors;

        // Apply all base variables first
        Object.entries(baseVariables).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Then override with selected theme
        Object.entries(themeColors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Add or remove dark-theme class on body
        if (newTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    };

    useEffect(() => {
        changeTheme(theme); // Set theme on mount and when theme changes
        // eslint-disable-next-line
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, themes, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
