import React from 'react';

interface ThemeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
        >
            <span className="material-icons-round text-xl text-gray-700 dark:text-gray-300">
                {isDark ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    );
};
