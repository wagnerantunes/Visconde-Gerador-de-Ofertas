import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { saveTemplate, loadTemplates, deleteTemplate, Template } from '../templateStorage';
import toast from 'react-hot-toast';

interface TemplateManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadTemplate: (state: AppState) => void;
    currentState: AppState;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
    isOpen,
    onClose,
    onLoadTemplate,
    currentState,
}) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTemplates(loadTemplates());
        }
    }, [isOpen]);

    const handleSaveTemplate = () => {
        if (!newTemplateName.trim()) {
            toast.error('Digite um nome para o template');
            return;
        }
        saveTemplate(newTemplateName, currentState);
        setTemplates(loadTemplates());
        setNewTemplateName('');
        toast.success(`Template "${newTemplateName}" salvo!`);
    };

    const handleLoadTemplate = (template: Template) => {
        onLoadTemplate(template.state);
        toast.success(`Template "${template.name}" carregado!`);
        onClose();
    };

    const handleDeleteTemplate = (id: string, name: string) => {
        if (confirm(`Deletar template "${name}"?`)) {
            deleteTemplate(id);
            setTemplates(loadTemplates());
            toast.success('Template deletado');
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary">bookmark</span>
                            Templates Salvos
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <span className="material-icons-round text-gray-500">close</span>
                        </button>
                    </div>

                    {/* Save New Template */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveTemplate()}
                            placeholder="Nome do novo template..."
                            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                            onClick={handleSaveTemplate}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors font-bold flex items-center gap-2"
                        >
                            <span className="material-icons-round text-xl">save</span>
                            Salvar Atual
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mt-4">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar templates..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {/* Templates List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <span className="material-icons-round text-6xl mb-4">bookmark_border</span>
                            <p className="text-lg font-medium">
                                {searchTerm ? 'Nenhum template encontrado' : 'Nenhum template salvo ainda'}
                            </p>
                            <p className="text-sm mt-2">
                                {!searchTerm && 'Salve seu layout atual para reutilizar depois'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">
                                                {template.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {new Date(template.createdAt).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTemplate(template.id, template.name)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Deletar"
                                        >
                                            <span className="material-icons-round text-xl">delete</span>
                                        </button>
                                    </div>

                                    {/* Template Info */}
                                    <div className="flex gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons-round text-sm">shopping_bag</span>
                                            {template.state.products.length} produtos
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons-round text-sm">palette</span>
                                            {template.state.seasonal.theme}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleLoadTemplate(template)}
                                        className="w-full py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors font-bold flex items-center justify-center gap-2"
                                    >
                                        <span className="material-icons-round text-xl">download</span>
                                        Carregar Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 text-center">
                    <p className="text-xs text-gray-500">
                        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} •
                        Carregar um template substituirá o layout atual
                    </p>
                </div>
            </div>
        </div>
    );
};
