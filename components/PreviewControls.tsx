import React, { useState } from 'react';

interface PreviewControlsProps {
    onToggleFullscreen: () => void;
    onToggleGrid: () => void;
    onToggleRulers: () => void;
    isFullscreen: boolean;
    showGrid: boolean;
    showRulers: boolean;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
    onToggleFullscreen,
    onToggleGrid,
    onToggleRulers,
    isFullscreen,
    showGrid,
    showRulers,
}) => {
    return (
        <div className="fixed top-20 right-4 z-30 glass rounded-2xl p-2 flex flex-col gap-1 animate-slideInRight">
            <button
                onClick={onToggleFullscreen}
                className={`group relative p-3 rounded-xl transition-all ${isFullscreen
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                    }`}
                title="Tela Cheia"
            >
                <span className="material-icons-round text-lg">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
                {/* Tooltip */}
                <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {isFullscreen ? 'Sair Tela Cheia' : 'Tela Cheia'}
                </span>
            </button>

            <button
                onClick={onToggleGrid}
                className={`group relative p-3 rounded-xl transition-all ${showGrid
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                    }`}
                title="Grade de Referência"
            >
                <span className="material-icons-round text-lg">grid_on</span>
                <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Grade
                </span>
            </button>

            <button
                onClick={onToggleRulers}
                className={`group relative p-3 rounded-xl transition-all ${showRulers
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                    }`}
                title="Réguas"
            >
                <span className="material-icons-round text-lg">straighten</span>
                <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Réguas
                </span>
            </button>
        </div>
    );
};
