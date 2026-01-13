import React from 'react';

interface HistoryBarProps {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onReset?: () => void;
}

export const HistoryBar: React.FC<HistoryBarProps> = ({ canUndo, canRedo, onUndo, onRedo, onReset }) => {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40">
            <div className="glass px-2 py-2 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-1">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="p-2.5 rounded-xl transition-all disabled:opacity-30 disabled:grayscale hover:bg-white/10 group"
                    title="Desfazer (Ctrl+Z)"
                >
                    <span className="material-icons-round text-gray-700 dark:text-gray-200 group-active:scale-95">undo</span>
                </button>

                <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="p-2.5 rounded-xl transition-all disabled:opacity-30 disabled:grayscale hover:bg-white/10 group"
                    title="Refazer (Ctrl+Y)"
                >
                    <span className="material-icons-round text-gray-700 dark:text-gray-200 group-active:scale-95">redo</span>
                </button>

                {onReset && (
                    <>
                        <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                        <button
                            onClick={onReset}
                            className="p-2.5 rounded-xl transition-all hover:bg-red-500/10 group"
                            title="Limpar Tudo"
                        >
                            <span className="material-icons-round text-red-500 group-active:scale-95">delete_sweep</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
