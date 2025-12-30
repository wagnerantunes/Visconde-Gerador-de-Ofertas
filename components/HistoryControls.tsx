import React from 'react';

interface HistoryControlsProps {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

export const HistoryControls: React.FC<HistoryControlsProps> = ({
    canUndo,
    canRedo,
    onUndo,
    onRedo,
}) => {
    return (
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 border border-gray-200 dark:border-gray-700">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-2 rounded transition-colors ${canUndo
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                title="Desfazer (Ctrl+Z)"
            >
                <span className="material-icons-round text-xl">undo</span>
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-2 rounded transition-colors ${canRedo
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                title="Refazer (Ctrl+Y)"
            >
                <span className="material-icons-round text-xl">redo</span>
            </button>
        </div>
    );
};
