import React, { useState } from 'react';
import { PRODUCT_FILENAMES } from '../productImages';

interface ImagePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imagePath: string) => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [activeTab, setActiveTab] = useState<'local' | 'unsplash'>('local');
    const [searchTerm, setSearchTerm] = useState('');
    const [unsplashImages, setUnsplashImages] = useState<Array<{ id: string, urls: { regular: string, small: string }, alt_description: string }>>([]);
    const [isLoadingUnsplash, setIsLoadingUnsplash] = useState(false);

    if (!isOpen) return null;

    const filteredImages = PRODUCT_FILENAMES.filter(name =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const searchUnsplash = async () => {
        if (!searchTerm) return;

        const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
        if (!accessKey) {
            alert('Erro: Chave de API do Unsplash não configurada (VITE_UNSPLASH_ACCESS_KEY).');
            return;
        }

        setIsLoadingUnsplash(true);
        try {
            const response = await fetch(`https://api.unsplash.com/search/photos?page=1&per_page=20&query=${encodeURIComponent(searchTerm)}&client_id=${accessKey}`);
            const data = await response.json();
            if (data.results) {
                setUnsplashImages(data.results);
            }
        } catch (error) {
            console.error('Erro ao buscar no Unsplash:', error);
            alert('Erro ao buscar imagens. Verifique o console.');
        } finally {
            setIsLoadingUnsplash(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && activeTab === 'unsplash') {
            searchUnsplash();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Biblioteca de Imagens</h2>
                        <p className="text-xs text-gray-400 font-medium">Selecione uma imagem para o produto</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 pt-4 gap-4 border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('local')}
                        className={`pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-all ${activeTab === 'local' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Galeria Local
                    </button>
                    <button
                        onClick={() => setActiveTab('unsplash')}
                        className={`pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-all flex items-center gap-2 ${activeTab === 'unsplash' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <span>Unsplash</span>
                        <span className="bg-black text-white text-[9px] px-1.5 py-0.5 rounded font-black">PRO</span>
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative flex gap-2">
                        <div className="relative flex-1">
                            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder={activeTab === 'local' ? "Buscar arquivos locais..." : "Buscar no Unsplash (Enter para buscar)..."}
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                        {activeTab === 'unsplash' && (
                            <button
                                onClick={searchUnsplash}
                                disabled={isLoadingUnsplash}
                                className="bg-primary hover:brightness-110 text-white px-6 rounded-2xl font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-50"
                            >
                                {isLoadingUnsplash ? 'Buscando...' : 'Buscar'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-gray-50/30 dark:bg-black/20">
                    {activeTab === 'local' ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {filteredImages.map((name) => (
                                <button
                                    key={name}
                                    onClick={() => {
                                        onSelect(`/produtos/${name}`);
                                        onClose();
                                    }}
                                    className="group flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all outline-none focus:ring-2 focus:ring-primary/20 border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                >
                                    <div className="aspect-square w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden p-2">
                                        <img
                                            src={`/produtos/${name}`}
                                            alt={name}
                                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Indispon%C3%ADvel';
                                            }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase truncate w-full text-center group-hover:text-primary">
                                        {name.replace('.png', '').replace('.jpg', '')}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        // Unsplash Results
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {unsplashImages.length === 0 && !isLoadingUnsplash && (
                                <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400 opacity-50">
                                    <span className="material-icons-round text-6xl mb-4">image_search</span>
                                    <p className="text-sm font-medium uppercase">Digite algo para buscar</p>
                                </div>
                            )}

                            {unsplashImages.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => {
                                        onSelect(img.urls.regular); // Use URL directly
                                        onClose();
                                    }}
                                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all ring-1 ring-black/5 dark:ring-white/5"
                                >
                                    <img
                                        src={img.urls.small}
                                        alt={img.alt_description}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                        <span className="text-white text-[10px] uppercase font-bold truncate w-full text-left">
                                            {img.alt_description || 'Sem descrição'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
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
