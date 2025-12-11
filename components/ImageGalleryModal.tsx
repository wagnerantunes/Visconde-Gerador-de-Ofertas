import React from 'react';
import { PRODUCT_IMAGE_MAP } from '../utils';

interface ImageGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
    isOpen, onClose, onSelect
}) => {
    if (!isOpen) return null;

    // Obter URLs únicas de imagens e criar um array de objetos { url, name } para melhor visualização se possível
    // Mas como PRODUCT_IMAGE_MAP é chave->url, vamos inverter para pegar um nome legível

    const uniqueImages = Array.from(new Set(Object.values(PRODUCT_IMAGE_MAP)));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
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

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {uniqueImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSelect(img)}
                                className="relative aspect-square bg-white dark:bg-gray-800 rounded-xl p-2 border-2 border-gray-100 dark:border-gray-700 hover:border-primary hover:shadow-lg transition-all flex items-center justify-center group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 -z-10" />
                                <img
                                    src={img}
                                    alt="Product"
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                                />
                            </button>
                        ))}
                    </div>

                    {uniqueImages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <span className="material-icons-round text-4xl mb-2">image_not_supported</span>
                            <p>Nenhuma imagem encontrada na galeria.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Selecione uma imagem para aplicar ao produto.
                    </p>
                </div>
            </div>
        </div>
    );
};
