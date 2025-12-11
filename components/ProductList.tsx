import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product } from '../types';

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

    const handleSave = () => {
        onUpdate(product.id, editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData(product);
        setIsEditing(false);
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
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full text-sm rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
                        placeholder="Nome"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            step="0.01"
                            value={editData.price}
                            onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                            className="w-full text-sm rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
                            placeholder="Preço"
                        />
                        <select
                            value={editData.unit}
                            onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
                            className="w-full text-sm rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2"
                        >
                            <option>KG</option>
                            <option>Unid.</option>
                            <option>Pct</option>
                            <option>100g</option>
                        </select>
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
                                        onChange={(e) => setEditData({ ...editData, isHighlight: e.target.checked })}
                                        className="w-3 h-3 text-primary rounded"
                                    />
                                    <span className="text-[10px] text-primary font-bold">Cor Destaque</span>
                                </label>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(cols => (
                                    <button
                                        key={cols}
                                        onClick={() => setEditData({ ...editData, cols })}
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
                                        onChange={(e) => setEditData({ ...editData, imageScale: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-500 mb-0.5">Posição ({editData.imageOffsetY || 0}%)</span>
                                    <input
                                        type="range"
                                        min="-50" max="50" step="5"
                                        value={editData.imageOffsetY || 0}
                                        onChange={(e) => setEditData({ ...editData, imageOffsetY: parseInt(e.target.value) })}
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
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <span className="material-icons-round">drag_indicator</span>
                </button>

                {/* Product Image */}
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-contain rounded"
                />

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        R$ {product.price.toFixed(2)} / {product.unit}
                        {product.isHighlight && (
                            <span className="ml-2 text-primary font-bold">★ Destaque</span>
                        )}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Editar"
                    >
                        <span className="material-icons-round text-lg">edit</span>
                    </button>
                    <button
                        onClick={() => onRemove(product.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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
