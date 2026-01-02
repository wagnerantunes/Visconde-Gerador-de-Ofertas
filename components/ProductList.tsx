import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product } from '../types';
import { ImageGalleryModal } from './ImageGalleryModal';
import { imageToBase64 } from '../utils';

interface ProductListProps {
    products: Product[];
    onUpdate: (id: string, updates: Partial<Product>) => void;
    onRemove: (id: string) => void;
}

interface SortableProductItemProps {
    product: Product;
    onUpdate: (id: string, updates: Partial<Product>) => void;
    onRemove: (id: string) => void;
}

const SortableProductItem: React.FC<SortableProductItemProps> = ({ product, onUpdate, onRemove }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(product);
    const [originalData, setOriginalData] = useState<Product | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleStartEdit = () => {
        setOriginalData(product);
        setEditData(product);
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
        setOriginalData(null);
    };

    const handleCancel = () => {
        if (originalData) {
            onUpdate(product.id, originalData);
            setEditData(originalData);
        }
        setIsEditing(false);
        setOriginalData(null);
    };

    const handleChange = (updates: Partial<Product>) => {
        const newData = { ...editData, ...updates };
        setEditData(newData);
        onUpdate(product.id, newData); // Atualiza em tempo real
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await imageToBase64(file);
                handleChange({ image: base64 });
            } catch (error) {
                console.error('Erro ao carregar imagem:', error);
            }
        }
    };

    if (isEditing) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 border-2 border-primary shadow-md"
            >
                <div className="space-y-2">
                    <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => handleChange({ name: e.target.value })}
                        className="w-full text-sm rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
                        placeholder="Nome"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            step="0.01"
                            value={editData.price}
                            onChange={(e) => handleChange({ price: parseFloat(e.target.value) })}
                            className="w-full text-sm rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
                            placeholder="Preço"
                        />
                        <select
                            value={editData.unit}
                            onChange={(e) => handleChange({ unit: e.target.value })}
                            className="w-full text-sm rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
                        >
                            <option>KG</option>
                            <option>Unid.</option>
                            <option>Pct</option>
                            <option>100g</option>
                        </select>
                    </div>

                    {/* Trocar Imagem */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 block">Trocar Imagem</label>
                        <div className="flex items-center gap-3">
                            <img
                                src={editData.image}
                                alt="Preview"
                                className="w-20 h-20 object-contain rounded border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                            />
                            <div className="flex-1 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGalleryOpen(true)}
                                    className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold rounded transition-colors flex items-center justify-center gap-1"
                                >
                                    <span className="material-icons-round text-sm">photo_library</span>
                                    Escolher da Galeria
                                </button>
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="w-full py-2 px-3 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-xs font-bold rounded transition-colors flex items-center justify-center gap-1"
                                >
                                    <span className="material-icons-round text-sm">upload</span>
                                    Upload Nova Imagem
                                </button>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Controles Avançados do Produto */}
                    <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                        {/* Tamanho e Destaque */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Layout</label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editData.isHighlight}
                                        onChange={(e) => handleChange({ isHighlight: e.target.checked })}
                                        className="w-3 h-3 text-primary rounded"
                                    />
                                    <span className="text-[10px] text-primary font-bold">Cor Destaque</span>
                                </label>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(cols => (
                                    <button
                                        key={cols}
                                        onClick={() => handleChange({ cols })}
                                        className={`flex-1 py-1 text-[10px] font-bold border rounded transition-colors ${(editData.cols || (editData.isHighlight ? 2 : 1)) === cols
                                            ? 'bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-900'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        {cols}x Largura
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Ajustes de Imagem */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Ajuste da Imagem</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-500 mb-0.5">Zoom ({editData.imageScale || 1}x)</span>
                                    <input
                                        type="range"
                                        min="0.5" max="2" step="0.1"
                                        value={editData.imageScale || 1}
                                        onChange={(e) => handleChange({ imageScale: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-500 mb-0.5">Posição ({editData.imageOffsetY || 0}%)</span>
                                    <input
                                        type="range"
                                        min="-50" max="50" step="5"
                                        value={editData.imageOffsetY || 0}
                                        onChange={(e) => handleChange({ imageOffsetY: parseInt(e.target.value) })}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded hover:bg-red-800 transition-colors"
                        >
                            Salvar
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white text-xs font-bold py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>

                {/* Image Gallery Modal */}
                <ImageGalleryModal
                    isOpen={isGalleryOpen}
                    onClose={() => setIsGalleryOpen(false)}
                    onSelect={(img) => {
                        handleChange({ image: img });
                        setIsGalleryOpen(false);
                    }}
                />
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`premium-border rounded-2xl p-4 bg-white dark:bg-paper-dark transition-all duration-300 ${isDragging
                    ? 'shadow-2xl scale-105 rotate-2'
                    : 'hover-lift shadow-sm'
                }`}
        >
            <div className="flex items-center gap-3">
                {/* Drag Handle - Modern */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-primary dark:text-gray-600 dark:hover:text-primary transition-colors p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <span className="material-icons-round text-xl">drag_indicator</span>
                </button>

                {/* Product Image - Enhanced */}
                <div className="relative group">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 object-contain rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-1.5 border border-black/5 dark:border-white/5"
                    />
                    {product.isHighlight && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-lg">
                            <span className="material-icons-round text-white text-[10px]">star</span>
                        </div>
                    )}
                </div>

                {/* Product Info - Refined Typography */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm truncate text-gray-800 dark:text-white tracking-tight">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] font-bold text-primary">
                            R$ {product.price.toFixed(2)}
                        </p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">•</span>
                        <p className="text-[10px] font-bold uppercase tracking-tight text-gray-500 dark:text-gray-400">
                            {product.unit}
                        </p>
                    </div>
                </div>

                {/* Actions - Modern Icon Buttons */}
                <div className="flex gap-1">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90"
                        title="Editar"
                    >
                        <span className="material-icons-round text-lg">edit</span>
                    </button>
                    <button
                        onClick={() => onRemove(product.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                        title="Remover"
                    >
                        <span className="material-icons-round text-lg">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ProductList: React.FC<ProductListProps> = ({ products, onUpdate, onRemove }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <span className="material-icons-round text-6xl mb-3 opacity-30">inventory_2</span>
                <p className="text-sm">Nenhum produto adicionado ainda</p>
                <p className="text-xs mt-1">Use as abas acima para adicionar produtos</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="material-icons-round text-sm align-middle mr-1">info</span>
                    Arraste para reordenar
                </p>
                <span className="text-xs font-bold text-primary">{products.length} produtos</span>
            </div>

            {products.map((product) => (
                <SortableProductItem
                    key={product.id}
                    product={product}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
};
