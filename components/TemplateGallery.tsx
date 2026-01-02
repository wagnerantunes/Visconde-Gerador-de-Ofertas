import React, { useState } from 'react';
import { AppState } from '../types';
import { TEMPLATE_PRESETS, TEMPLATE_CATEGORIES, TemplatePreset } from '../templatePresets';

interface TemplateGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyTemplate: (state: Partial<AppState>) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose, onApplyTemplate }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('todos');
    const [previewTemplate, setPreviewTemplate] = useState<TemplatePreset | null>(null);

    const filteredTemplates = selectedCategory === 'todos'
        ? TEMPLATE_PRESETS
        : TEMPLATE_PRESETS.filter(t => t.category === selectedCategory);

    const handleApply = (template: TemplatePreset) => {
        onApplyTemplate(template.state);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-paper-dark rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden premium-border">
                {/* Header */}
                <div className="p-6 border-b border-black/[0.03] dark:border-white/[0.03] bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="material-icons-round text-primary text-3xl">auto_awesome</span>
                                Galeria de Templates
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Escolha um layout pronto e comece rapidamente
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                        >
                            <span className="material-icons-round text-gray-500">close</span>
                        </button>
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {TEMPLATE_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all whitespace-nowrap ${selectedCategory === cat.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'
                                    }`}
                            >
                                <span className="material-icons-round text-sm">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <span className="material-icons-round text-6xl mb-4 opacity-30">search_off</span>
                            <p className="text-lg font-medium">Nenhum template encontrado</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="group premium-border rounded-2xl p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover-lift cursor-pointer"
                                    onClick={() => setPreviewTemplate(template)}
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl mb-3 flex items-center justify-center text-6xl">
                                        {template.thumbnail}
                                    </div>

                                    {/* Info */}
                                    <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1">
                                        {template.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3">
                                        {template.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-3 text-[9px] text-gray-400 mb-3">
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons-round text-xs">view_column</span>
                                            {template.state.columns} cols
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons-round text-xs">inventory_2</span>
                                            {template.state.products?.length || 0} produtos
                                        </span>
                                    </div>

                                    {/* Apply Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApply(template);
                                        }}
                                        className="w-full py-2 bg-primary text-white rounded-xl hover:brightness-110 transition-all font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary/20"
                                    >
                                        <span className="material-icons-round text-sm">download</span>
                                        Usar Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-black/[0.02] dark:bg-white/[0.01] border-t border-black/[0.03] dark:border-white/[0.03] text-center">
                    <p className="text-xs text-gray-500">
                        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} disponíve{filteredTemplates.length !== 1 ? 'is' : 'l'}
                    </p>
                </div>
            </div>

            {/* Preview Modal */}
            {previewTemplate && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                    onClick={() => setPreviewTemplate(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-4">
                            <div className="text-6xl mb-3">{previewTemplate.thumbnail}</div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                                {previewTemplate.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {previewTemplate.description}
                            </p>
                        </div>

                        <div className="space-y-2 mb-4 text-xs">
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-gray-500">Colunas:</span>
                                <span className="font-bold">{previewTemplate.state.columns}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-gray-500">Produtos:</span>
                                <span className="font-bold">{previewTemplate.state.products?.length || 0}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-gray-500">Formato:</span>
                                <span className="font-bold uppercase">{previewTemplate.state.paperSize}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold text-sm"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => {
                                    handleApply(previewTemplate);
                                    setPreviewTemplate(null);
                                }}
                                className="flex-1 py-2 bg-primary text-white rounded-xl hover:brightness-110 transition-all font-bold text-sm"
                            >
                                Usar Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
