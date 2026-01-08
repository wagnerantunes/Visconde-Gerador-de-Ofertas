import React, { useState } from 'react';
import { PRODUCT_FILENAMES } from '../productImages';

interface ImagePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imagePath: string) => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredImages = PRODUCT_FILENAMES.filter(name =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Biblioteca de Imagens</h2>
                        <p className="text-xs text-gray-400 font-medium">Selecione uma imagem da sua pasta de produtos</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nome do arquivo (ex: picanha, cerveja...)"
                            autoFocus
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {filteredImages.map((name) => (
                            <button
                                key={name}
                                onClick={() => {
                                    onSelect(`/produtos/${name}`);
                                    onClose();
                                }}
                                className="group flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-primary/5 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <div className="aspect-square w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow p-2">
                                    <img
                                        src={`/produtos/${name}`}
                                        alt={name}
                                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Indispon%C3%ADvel';
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase truncate w-full text-center">
                                    {name.replace('.png', '').replace('.jpg', '')}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
