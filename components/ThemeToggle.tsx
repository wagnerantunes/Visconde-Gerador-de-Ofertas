import React from 'react';

interface ThemeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-90"
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
        >
            <span className="material-icons-round text-lg text-gray-700 dark:text-gray-300">
                {isDark ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    );
};
