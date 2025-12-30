import React from 'react';

interface ShortcutsHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

const shortcuts = [
    {
        category: 'Geral',
        items: [
            { keys: ['Ctrl', 'S'], description: 'Salvar manualmente' },
            { keys: ['Ctrl', 'E'], description: 'Abrir exportação' },
            { keys: ['Ctrl', '?'], description: 'Mostrar atalhos' },
            { keys: ['Esc'], description: 'Fechar modais' },
        ],
    },
    {
        category: 'Edição',
        items: [
            { keys: ['Ctrl', 'Z'], description: 'Desfazer' },
            { keys: ['Ctrl', 'Y'], description: 'Refazer' },
        ],
    },
    {
        category: 'Navegação',
        items: [
            { keys: ['Tab'], description: 'Próximo campo' },
            { keys: ['Shift', 'Tab'], description: 'Campo anterior' },
        ],
    },
];

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary">keyboard</span>
                            Atalhos de Teclado
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <span className="material-icons-round text-gray-500">close</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {shortcuts.map((section, idx) => (
                        <div key={idx} className="mb-6 last:mb-0">
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                {section.category}
                            </h3>
                            <div className="space-y-2">
                                {section.items.map((shortcut, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {shortcut.description}
                                        </span>
                                        <div className="flex gap-1">
                                            {shortcut.keys.map((key, j) => (
                                                <React.Fragment key={j}>
                                                    <kbd className="px-3 py-1 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                                                        {key}
                                                    </kbd>
                                                    {j < shortcut.keys.length - 1 && (
                                                        <span className="text-gray-400 mx-1">+</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 text-center">
                    <p className="text-xs text-gray-500">
                        Pressione <kbd className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-xs font-bold">Ctrl</kbd> + <kbd className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-xs font-bold">?</kbd> para abrir este painel
                    </p>
                </div>
            </div>
        </div>
    );
};
