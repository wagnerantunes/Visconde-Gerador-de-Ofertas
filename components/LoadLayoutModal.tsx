
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadLayouts, deleteLayout, renameLayout } from '../services/layoutService';
import { AppState } from '../types';
import { useToast } from '../contexts/ToastContext';

interface LoadLayoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (state: AppState) => void;
}

export const LoadLayoutModal: React.FC<LoadLayoutModalProps> = ({ isOpen, onClose, onLoad }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [layouts, setLayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            fetchLayouts();
        }
    }, [isOpen, user]);

    const fetchLayouts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await loadLayouts(user.id);
            setLayouts(data || []);
        } catch (error) {
            console.error(error);
            showToast('error', 'Erro ao carregar layouts.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (layout: any) => {
        if (confirm(`Deseja carregar o layout "${layout.name}"? As alterações não salvas serão perdidas.`)) {
            onLoad(layout.state);
            onClose();
            showToast('success', 'Layout carregado com sucesso!');
        }
    };

    const handleDelete = async (layoutId: string) => {
        if (confirm('Tem certeza que deseja excluir este layout?')) {
            try {
                await deleteLayout(layoutId);
                setLayouts(layouts.filter(l => l.id !== layoutId));
                showToast('success', 'Layout excluído.');
            } catch (error) {
                console.error(error);
                showToast('error', 'Erro ao excluir layout.');
            }
        }
    };

    const handleRename = async (layoutId: string, newName: string) => {
        if (!newName.trim()) {
            setEditingId(null);
            return;
        }
        try {
            await renameLayout(layoutId, newName);
            setLayouts(layouts.map(l => l.id === layoutId ? { ...l, name: newName } : l));
            setEditingId(null);
            showToast('success', 'Layout renomeado.');
        } catch (error) {
            console.error(error);
            showToast('error', 'Erro ao renomear layout.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-primary to-primary-dark text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <span className="material-icons-round text-xl">folder_open</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Meus Layouts</h2>
                            <p className="text-white/80 text-xs">Histórico salvo na nuvem</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                        </div>
                    ) : layouts.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <span className="material-icons-round text-6xl text-gray-300">folder_off</span>
                            <p className="mt-2 text-gray-500 font-medium">Nenhum layout salvo encontrado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {layouts.map((layout) => (
                                <div
                                    key={layout.id}
                                    className="relative flex flex-col text-left bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group"
                                >
                                    <div className="flex justify-between items-start w-full mb-2">
                                        <div className="flex-1 mr-2">
                                            {editingId === layout.id ? (
                                                <input
                                                    type="text"
                                                    defaultValue={layout.name}
                                                    autoFocus
                                                    className="w-full text-sm font-bold bg-gray-50 dark:bg-gray-700 border border-primary rounded px-2 py-1 outline-none"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleRename(layout.id, e.currentTarget.value);
                                                        if (e.key === 'Escape') setEditingId(null);
                                                    }}
                                                    onBlur={(e) => handleRename(layout.id, e.currentTarget.value)}
                                                />
                                            ) : (
                                                <button onClick={() => handleSelect(layout)} className="font-bold text-gray-800 dark:text-gray-100 hover:text-primary hover:underline text-left">
                                                    {layout.name}
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingId(layout.id)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-blue-500"
                                                title="Renomear"
                                            >
                                                <span className="material-icons-round text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(layout.id)}
                                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500"
                                                title="Excluir"
                                            >
                                                <span className="material-icons-round text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end mt-auto">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {layout.state?.products?.length || 0} produtos • Tema {layout.state?.seasonal?.title || 'Personalizado'}
                                        </div>
                                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-500">
                                            {new Date(layout.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                </div>

            </div>
        </div>
    );
};
