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
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={editData.isHighlight}
                            onChange={(e) => setEditData({ ...editData, isHighlight: e.target.checked })}
                            className="w-4 h-4 text-primary rounded"
                        />
                        <label className="text-xs">Destaque</label>
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
