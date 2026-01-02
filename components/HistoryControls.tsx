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
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-xl p-1 border border-black/5 dark:border-white/5">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-2 rounded-lg transition-all active:scale-90 ${canUndo
                    ? 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
                    }`}
                title="Desfazer (Ctrl+Z)"
            >
                <span className="material-icons-round text-lg">undo</span>
            </button>

            <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-2 rounded-lg transition-all active:scale-90 ${canRedo
                    ? 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
                    }`}
                title="Refazer (Ctrl+Y)"
            >
                <span className="material-icons-round text-lg">redo</span>
            </button>
        </div>
    );
};
