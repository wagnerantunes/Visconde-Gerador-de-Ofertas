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
        <div className="fixed top-20 right-4 z-30 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2 flex flex-col gap-2">
            <button
                onClick={onToggleFullscreen}
                className={`p-2 rounded transition-colors ${isFullscreen
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                title="Tela Cheia"
            >
                <span className="material-icons-round">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
            </button>

            <button
                onClick={onToggleGrid}
                className={`p-2 rounded transition-colors ${showGrid
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                title="Grade de Referência"
            >
                <span className="material-icons-round">grid_on</span>
            </button>

            <button
                onClick={onToggleRulers}
                className={`p-2 rounded transition-colors ${showRulers
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                title="Réguas"
            >
                <span className="material-icons-round">straighten</span>
            </button>
        </div>
    );
};
