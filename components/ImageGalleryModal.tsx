import React, { useState, useMemo } from 'react';
import { PRODUCT_IMAGE_MAP } from '../utils';

interface ImageGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
    isOpen, onClose, onSelect
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Criar array de imagens com nomes para busca
    const images = useMemo(() => {
        const imageMap = new Map<string, string>();
        Object.entries(PRODUCT_IMAGE_MAP).forEach(([name, url]) => {
            if (!imageMap.has(url)) {
                imageMap.set(url, name);
            }
        });
        return Array.from(imageMap.entries()).map(([url, name]) => ({ url, name }));
    }, []);

    // Filtrar imagens baseado na busca
    const filteredImages = useMemo(() => {
        if (!searchTerm.trim()) return images;
        const term = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return images.filter(img =>
            img.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(term)
        );
    }, [images, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary">photo_library</span>
                            Galeria de Produtos
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar produto..."
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            autoFocus
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <span className="material-icons-round text-xl">close</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {filteredImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSelect(img.url)}
                                className="relative aspect-square bg-white dark:bg-gray-800 rounded-xl p-2 border-2 border-gray-100 dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all flex flex-col items-center justify-center group overflow-hidden"
                                title={img.name}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 -z-10" />
                                <img
                                    src={img.url}
                                    alt={img.name}
                                    loading="lazy"
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                                />
                            </button>
                        ))}
                    </div>

                    {filteredImages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <span className="material-icons-round text-4xl mb-2">search_off</span>
                            <p>Nenhuma imagem encontrada.</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-2 text-sm text-primary hover:underline"
                            >
                                Limpar busca
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {filteredImages.length} de {images.length} imagens • Clique para selecionar
                    </p>
                </div>
            </div>
        </div>
    );
};
