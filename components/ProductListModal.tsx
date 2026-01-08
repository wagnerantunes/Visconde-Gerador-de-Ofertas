import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImagePickerModal } from './ImagePickerModal';
import { generateAIContent } from '../services/aiService';
import { useToast } from '../contexts/ToastContext';

interface ProductListDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onUpdateProduct: (id: string, updates: Partial<Product>) => void;
    onRemoveProduct: (id: string) => void;
    onReorderProducts: (products: Product[]) => void;
    onClearAll: () => void;
    initialEditingId?: string | null;
}

interface SortableRowProps {
    product: Product;
    onUpdateProduct: (id: string, updates: Partial<Product>) => void;
    onRemoveProduct: (id: string) => void;
    editingId: string | null;
    setEditingId: (id: string | null) => void;
    isSelected: boolean;
    onSelectToggle: () => void;
    onOpenImagePicker: () => void;
}

const SortableProductRow: React.FC<SortableRowProps> = ({
    product,
    onUpdateProduct,
    onRemoveProduct,
    editingId,
    setEditingId,
    isSelected,
    onSelectToggle,
    onOpenImagePicker
}) => {
    const { showToast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateAI = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Crie uma descrição curta (máximo 15 palavras), vendedora e apetitosa para o produto "${product.name}". Foque na qualidade, frescor ou sabor. Retorne apenas o texto da descrição.`;
            const description = await generateAIContent(prompt);
            onUpdateProduct(product.id, { details: description.trim() });
            showToast('success', 'Descrição gerada!');
        } catch (error) {
            console.error(error);
            showToast('error', 'Falha ao gerar descrição.');
        } finally {
            setIsGenerating(false);
        }
    };
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
        zIndex: isDragging ? 40 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            id={`product-row-${product.id}`}
            ref={setNodeRef}
            style={style}
            className={`p-4 transition-all border-b border-gray-100 dark:border-gray-800 ${editingId === product.id ? 'bg-primary/5 shadow-inner' : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40'} ${isSelected ? 'bg-primary/5' : ''}`}
        >
            <div className="flex gap-3 items-start">
                {/* Multi-select check */}
                <button
                    onClick={onSelectToggle}
                    className={`mt-4 shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
                >
                    {isSelected && <span className="material-icons-round text-xs">check</span>}
                </button>

                {/* Drag Handle & Image */}
                <div className="relative group shrink-0 flex items-center gap-2">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                        <span className="material-icons-round text-lg">drag_indicator</span>
                    </div>
                    <div className="relative">
                        <div className={`w-14 h-14 rounded-xl border p-1 flex items-center justify-center overflow-hidden shadow-sm ${product.type === 'divider' ? 'bg-primary/10 border-primary/20' : 'bg-white border-gray-200'}`}>
                            {product.type === 'divider' ? (
                                <span className="material-icons-round text-primary text-2xl">title</span>
                            ) : (
                                <img
                                    src={product.image}
                                    className="max-w-full max-h-full object-contain"
                                    style={{
                                        transform: `scale(${product.imageScale || 1}) translate(${(product.imageOffsetX || 0)}px, ${(product.imageOffsetY || 0)}px)`
                                    }}
                                    alt=""
                                />
                            )}
                        </div>
                        <button
                            onClick={() => setEditingId(editingId === product.id ? null : product.id)}
                            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 transition-colors ${editingId === product.id ? 'bg-primary text-white' : 'bg-white dark:bg-gray-700 text-gray-500'
                                }`}
                        >
                            <span className="material-icons-round text-xs">{editingId === product.id ? 'expand_less' : 'tune'}</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                    {/* Header Row */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                            {product.type === 'divider' ? (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-6 gap-1 mb-2">
                                        {[
                                            { id: 'default', icon: 'label', label: 'Padrão' },
                                            { id: 'meat', icon: 'restaurant', label: 'Carnes' },
                                            { id: 'produce', icon: 'eco', label: 'H' },
                                            { id: 'bakery', icon: 'bakery_dining', label: 'P' },
                                            { id: 'beverages', icon: 'local_bar', label: 'B' },
                                            { id: 'clean', icon: 'layers', label: 'C' }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => onUpdateProduct(product.id, { dividerTheme: t.id as any })}
                                                className={`flex flex-col items-center gap-0.5 p-1 rounded-md border transition-all ${(product.dividerTheme || 'default') === t.id
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'
                                                    }`}
                                                title={t.label}
                                            >
                                                <span className="material-icons-round text-sm">{t.icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) => onUpdateProduct(product.id, { name: e.target.value })}
                                        className="w-full text-sm font-black text-primary bg-primary/5 outline-none px-2 py-1 rounded-lg border border-primary/20"
                                        placeholder="NOME DA SEÇÃO (EX: AÇOUGUE)"
                                    />
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={product.name}
                                    onChange={(e) => onUpdateProduct(product.id, { name: e.target.value })}
                                    className="w-full text-xs font-black text-gray-800 dark:text-gray-200 bg-transparent outline-none focus:bg-white dark:focus:bg-gray-800 px-2 py-1 rounded-lg border border-transparent focus:border-primary/20"
                                />
                            )}
                        </div>
                        <button
                            onClick={() => onRemoveProduct(product.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors shrink-0 p-1"
                        >
                            <span className="material-icons-round text-lg">delete_outline</span>
                        </button>
                    </div>

                    {product.type !== 'divider' && (
                        <>
                            {/* Description Row with AI Button */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onUpdateProduct(product.id, { visibleFields: { ...product.visibleFields, details: product.visibleFields?.details === false ? true : false } })}
                                    className={`shrink-0 w-8 h-[26px] flex items-center justify-center rounded-lg border transition-all ${product.visibleFields?.details === false ? 'bg-gray-50 border-gray-200 text-gray-300' : 'bg-primary/5 border-primary/20 text-primary'}`}
                                    title="Mostrar/Ocultar Detalhes"
                                >
                                    <span className="material-icons-round text-sm">{product.visibleFields?.details === false ? 'visibility_off' : 'visibility'}</span>
                                </button>
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={product.details}
                                        onChange={(e) => onUpdateProduct(product.id, { details: e.target.value })}
                                        placeholder="Detalhes/Descrição..."
                                        className="w-full text-[10px] font-medium text-gray-500 bg-gray-50 dark:bg-gray-800/50 outline-none px-2 py-1 rounded-lg border border-transparent focus:border-primary/10"
                                    />
                                    <button
                                        onClick={handleGenerateAI}
                                        disabled={isGenerating}
                                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${isGenerating ? 'bg-primary/10 text-primary animate-pulse' : 'text-gray-300 hover:text-primary hover:bg-primary/5'}`}
                                        title="Gerar com IA"
                                    >
                                        <span className="material-icons-round text-[14px]">{isGenerating ? 'sync' : 'auto_awesome'}</span>
                                    </button>
                                </div>
                                <button
                                    onClick={onOpenImagePicker}
                                    className="p-1 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-md transition-all shrink-0"
                                    title="Trocar Imagem"
                                >
                                    <span className="material-icons-round text-[14px]">image_search</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <button
                                        onClick={() => onUpdateProduct(product.id, { visibleFields: { ...product.visibleFields, originalPrice: product.visibleFields?.originalPrice === false ? true : false } })}
                                        className={`absolute left-2 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded flex items-center gap-1 z-10 transition-colors ${product.visibleFields?.originalPrice === false ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                                        title="Mostrar/Ocultar"
                                    >
                                        <span className="material-icons-round text-[10px]">{product.visibleFields?.originalPrice === false ? 'visibility_off' : 'visibility'}</span>
                                        <span className="text-[9px] font-black">DE</span>
                                    </button>
                                    <input
                                        type="number"
                                        value={product.originalPrice || ''}
                                        onChange={(e) => onUpdateProduct(product.id, { originalPrice: parseFloat(e.target.value) || undefined })}
                                        className="w-full pl-14 pr-1 py-1 text-[10px] font-bold bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-transparent outline-none focus:ring-1 focus:ring-primary/10 transition-all text-gray-400 line-through"
                                        placeholder="Preço Original..."
                                    />
                                </div>
                                {product.originalPrice && product.price < product.originalPrice && (
                                    <div className="text-[9px] font-black text-green-500 bg-green-50 px-1.5 py-0.5 rounded-md">
                                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <button
                                        onClick={() => onUpdateProduct(product.id, { visibleFields: { ...product.visibleFields, price: product.visibleFields?.price === false ? true : false } })}
                                        className={`absolute left-2 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded flex items-center gap-1 z-10 transition-colors ${product.visibleFields?.price === false ? 'text-gray-300' : 'text-primary hover:bg-primary/5'}`}
                                        title="Mostrar/Ocultar"
                                    >
                                        <span className="material-icons-round text-[10px]">{product.visibleFields?.price === false ? 'visibility_off' : 'visibility'}</span>
                                        <span className="text-[9px] font-black">R$</span>
                                    </button>
                                    <input
                                        type="number"
                                        value={product.price}
                                        onChange={(e) => onUpdateProduct(product.id, { price: parseFloat(e.target.value) })}
                                        className="w-full pl-14 pr-1 py-1.5 text-xs font-black bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-red-600 shadow-sm"
                                    />
                                </div>
                                <div className="relative w-16 shrink-0">
                                    <button
                                        onClick={() => onUpdateProduct(product.id, { visibleFields: { ...product.visibleFields, unit: product.visibleFields?.unit === false ? true : false } })}
                                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors z-10 ${product.visibleFields?.unit === false ? 'text-gray-300' : 'text-primary hover:bg-primary/5'}`}
                                        title="Mostrar/Ocultar"
                                    >
                                        <span className="material-icons-round text-[10px]">{product.visibleFields?.unit === false ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                    <input
                                        type="text"
                                        value={product.unit}
                                        onChange={(e) => onUpdateProduct(product.id, { unit: e.target.value })}
                                        placeholder="UN"
                                        className={`w-full px-1 pr-4 py-1.5 text-[10px] text-center font-black uppercase bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-colors ${product.visibleFields?.unit === false ? 'text-gray-300' : 'text-gray-500'}`}
                                    />
                                </div>
                                <button
                                    onClick={() => onUpdateProduct(product.id, { isHighlight: !product.isHighlight })}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${product.isHighlight
                                        ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/30'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200'
                                        }`}
                                    title="Destaque"
                                >
                                    <span className="material-icons-round text-lg">star</span>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Advanced Image & Layout Adjustments */}
                    {editingId === product.id && (
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 mt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Column Span Selector */}
                            <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block">Ocupar Colunas</label>
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => onUpdateProduct(product.id, { cols: num })}
                                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${(product.cols || 1) === num
                                                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                                : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Image Controls */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">Zoom da Imagem</label>
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 rounded">{Math.round((product.imageScale || 1) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.1"
                                    value={product.imageScale || 1}
                                    onChange={(e) => onUpdateProduct(product.id, { imageScale: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">H. Pos</label>
                                        <span className="text-[10px] font-bold text-primary">{product.imageOffsetX || 0}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-100"
                                        max="100"
                                        step="1"
                                        value={product.imageOffsetX || 0}
                                        onChange={(e) => onUpdateProduct(product.id, { imageOffsetX: parseInt(e.target.value) })}
                                        className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">V. Pos</label>
                                        <span className="text-[10px] font-bold text-primary">{product.imageOffsetY || 0}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-100"
                                        max="100"
                                        step="1"
                                        value={product.imageOffsetY || 0}
                                        onChange={(e) => onUpdateProduct(product.id, { imageOffsetY: parseInt(e.target.value) })}
                                        className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            </div>

                            {/* VIP Style Overrides */}
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3 block">Estilo VIP (Cores do Card)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <span className="text-[10px] font-bold text-gray-500">Fundo</span>
                                        <input
                                            type="color"
                                            value={product.backgroundColor || '#ffffff'}
                                            onChange={(e) => onUpdateProduct(product.id, { backgroundColor: e.target.value })}
                                            className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <span className="text-[10px] font-bold text-gray-500">Texto</span>
                                        <input
                                            type="color"
                                            value={product.textColor || '#1f2937'}
                                            onChange={(e) => onUpdateProduct(product.id, { textColor: e.target.value })}
                                            className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block">Visual do Card</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {[
                                            { id: 'classic', icon: 'rectangle', label: 'Clássico' },
                                            { id: 'modern', icon: 'view_quilt', label: 'Moderno' },
                                            { id: 'glass', icon: 'blur_on', label: 'Glass' },
                                            { id: 'bold', icon: 'auto_awesome', label: 'Bold' },
                                            { id: 'gradient', icon: 'gradient', label: 'Gradiente' }
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => onUpdateProduct(product.id, { stylePreset: p.id as any })}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all border ${(product.stylePreset || 'classic') === p.id
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="material-icons-round text-lg">{p.icon}</span>
                                                <span className="text-[8px] font-black uppercase tracking-tighter">{p.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block">Padrão de Layout (Flipped)</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'vertical', icon: 'vertical_align_bottom', label: 'Vertical' },
                                            { id: 'reversed', icon: 'vertical_align_top', label: 'Invertido V' },
                                            { id: 'horizontal', icon: 'align_horizontal_left', label: 'Horizontal' },
                                            { id: 'horizontal-reversed', icon: 'align_horizontal_right', label: 'Invertido H' }
                                        ].map((l) => (
                                            <button
                                                key={l.id}
                                                onClick={() => onUpdateProduct(product.id, { cardLayout: l.id as any })}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all border ${(product.cardLayout || 'vertical') === l.id
                                                    ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="material-icons-round text-lg">{l.icon}</span>
                                                <span className="text-[8px] font-black uppercase tracking-tighter">{l.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3 block">Estética do Preço (Splash)</label>

                                    <div className="flex items-center justify-between mb-3 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">Fundo do Preço</span>
                                        <button
                                            onClick={() => onUpdateProduct(product.id, { showPriceBadge: product.showPriceBadge === false })}
                                            className={`p-1 rounded-md transition-colors ${product.showPriceBadge !== false ? 'text-primary' : 'text-gray-300'}`}
                                        >
                                            <span className="material-icons-round">{product.showPriceBadge !== false ? 'visibility' : 'visibility_off'}</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'classic', icon: 'rounded_corner', label: 'Classic' },
                                            { id: 'minimal', icon: 'remove', label: 'Minimal' },
                                            { id: 'badge', icon: 'fiber_manual_record', label: 'Badge' },
                                            { id: 'star', icon: 'auto_awesome', label: 'Estrela' },
                                            { id: 'outline', icon: 'crop_free', label: 'Borda' }
                                        ].map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => onUpdateProduct(product.id, { priceStyle: s.id as any })}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all border ${(product.priceStyle || 'classic') === s.id
                                                    ? 'bg-yellow-50 border-yellow-200 text-yellow-600 shadow-sm'
                                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="material-icons-round text-lg">{s.icon}</span>
                                                <span className="text-[8px] font-black uppercase tracking-tighter">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3 block">Selo / Etiqueta (Sticker)</label>

                                    <input
                                        type="text"
                                        value={product.stickerText || ''}
                                        onChange={(e) => onUpdateProduct(product.id, { stickerText: e.target.value })}
                                        placeholder="EX: LANÇAMENTO, NOVO..."
                                        className="w-full p-2 mb-3 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-[10px] font-bold uppercase focus:ring-1 focus:ring-primary/20"
                                    />

                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'badge', icon: 'label', label: 'Badge' },
                                            { id: 'ribbon', icon: 'bookmark', label: 'Faixa' },
                                            { id: 'tag', icon: 'style', label: 'Tag' },
                                            { id: 'neon', icon: 'flash_on', label: 'Neon' }
                                        ].map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => onUpdateProduct(product.id, { stickerStyle: s.id as any })}
                                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${(product.stickerStyle || 'badge') === s.id
                                                    ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="material-icons-round text-lg">{s.icon}</span>
                                                <span className="text-[8px] font-black uppercase tracking-tighter">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(product.backgroundColor || product.textColor || product.stylePreset || product.cardLayout || product.showPriceBadge === false || product.priceStyle || product.stickerText || product.dividerTheme) && (
                                    <button
                                        onClick={() => onUpdateProduct(product.id, {
                                            backgroundColor: undefined,
                                            textColor: undefined,
                                            stylePreset: 'classic',
                                            cardLayout: 'vertical',
                                            showPriceBadge: true,
                                            priceStyle: 'classic',
                                            stickerText: undefined,
                                            stickerStyle: 'badge',
                                            dividerTheme: 'default'
                                        })}
                                        className="w-full mt-4 py-2 text-[9px] font-black text-red-400 uppercase hover:text-red-600 transition-colors bg-red-50 dark:bg-red-900/10 rounded-xl"
                                    >
                                        Restaurar Tudo para o Padrão
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ProductListModal: React.FC<ProductListDrawerProps> = ({
    isOpen,
    onClose,
    products,
    onUpdateProduct,
    onRemoveProduct,
    onReorderProducts,
    onClearAll,
    initialEditingId
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(initialEditingId || null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [imagePickerTarget, setImagePickerTarget] = useState<string | null>(null);
    const [showBatchImageControls, setShowBatchImageControls] = useState(false);
    const [batchImageScale, setBatchImageScale] = useState(1);
    const [batchImageOffsetX, setBatchImageOffsetX] = useState(0);
    const [batchImageOffsetY, setBatchImageOffsetY] = useState(0);
    const { showToast } = useToast();

    // Sync editing ID and scroll when opening
    useEffect(() => {
        if (isOpen && initialEditingId) {
            setEditingId(initialEditingId);
            setTimeout(() => {
                const el = document.getElementById(`product-row-${initialEditingId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, [isOpen, initialEditingId]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBatchDelete = () => {
        const count = selectedIds.length;
        if (count === 0) return;

        if (confirm(`Excluir ${count} ${count === 1 ? 'item selecionado' : 'itens selecionados'}?`)) {
            // Create a copy of selectedIds to avoid state mutation issues
            const idsToDelete = [...selectedIds];
            // Clear selection first
            setSelectedIds([]);
            // Then delete all items
            idsToDelete.forEach(id => onRemoveProduct(id));
        }
    };

    const handleBatchCols = (cols: number) => {
        selectedIds.forEach(id => onUpdateProduct(id, { cols }));
        setSelectedIds([]);
    };

    const handleBatchHighlight = (isHighlight: boolean) => {
        selectedIds.forEach(id => onUpdateProduct(id, { isHighlight }));
        setSelectedIds([]);
    };

    // Batch image adjustments
    const handleBatchImageScale = (scale: number) => {
        setBatchImageScale(scale);
        selectedIds.forEach(id => onUpdateProduct(id, { imageScale: scale }));
    };

    const handleBatchImageOffsetX = (offset: number) => {
        setBatchImageOffsetX(offset);
        selectedIds.forEach(id => onUpdateProduct(id, { imageOffsetX: offset }));
    };

    const handleBatchImageOffsetY = (offset: number) => {
        setBatchImageOffsetY(offset);
        selectedIds.forEach(id => onUpdateProduct(id, { imageOffsetY: offset }));
    };

    const resetBatchImageValues = () => {
        selectedIds.forEach(id => onUpdateProduct(id, {
            imageScale: 1,
            imageOffsetX: 0,
            imageOffsetY: 0
        }));
        setBatchImageScale(1);
        setBatchImageOffsetX(0);
        setBatchImageOffsetY(0);
    };

    // Check if selected products have same column configuration
    const selectedProducts = products.filter(p => selectedIds.includes(p.id) && p.type !== 'divider');
    const allSameCols = selectedProducts.length > 0 && selectedProducts.every(p => (p.cols || 1) === (selectedProducts[0].cols || 1));

    const [isOrganizing, setIsOrganizing] = useState(false);

    const handleAIOrganize = async () => {
        if (products.length === 0) return;

        const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            showToast('error', 'Chave de API do Gemini não configurada.');
            return;
        }

        setIsOrganizing(true);
        try {
            const productList = products.filter(p => p.type !== 'divider').map(p => ({
                id: p.id,
                name: p.name,
                price: p.price
            }));

            const prompt = `Organize esta lista de produtos de supermercado em categorias lógicas (Açougue, Padaria, Hortifruti, Bebidas, Limpeza, etc).
            Produtos: ${JSON.stringify(productList)}
            
            Retorne APENAS um JSON no formato:
            {
              "organized": [
                { "type": "divider", "name": "CATEGORIA", "theme": "meat|produce|bakery|beverages|clean|default" },
                { "type": "product", "id": "ID_DO_PRODUTO", "highlight": true|false }
              ]
            }
            Regras:
            1. Use highlight:true apenas para os 2 ou 3 melhores preços de cada categoria.
            2. Mantenha os IDs originais dos produtos.
            3. Use nomes de seções em MAIÚSCULO.
            4. Não invente produtos, use apenas os fornecidos.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'Erro na API do Gemini');
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error('Resposta vazia da IA');

            // Robust JSON extraction
            let cleanJson = text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanJson = jsonMatch[0];
            }

            let result;
            try {
                result = JSON.parse(cleanJson);
            } catch (e) {
                console.error('Falha no parse JSON:', text);
                throw new Error('A IA retornou um formato inválido. Tente novamente.');
            }

            if (!result.organized || !Array.isArray(result.organized)) {
                throw new Error('Formato JSON inesperado.');
            }

            const newProducts: Product[] = [];
            result.organized.forEach((item: any) => {
                if (item.type === 'divider') {
                    newProducts.push({
                        id: `divider-${Math.random().toString(36).substr(2, 9)}`,
                        name: item.name,
                        details: '',
                        price: 0,
                        unit: '',
                        image: '',
                        isHighlight: false,
                        type: 'divider',
                        dividerTheme: item.theme,
                        cols: 3
                    });
                } else {
                    const original = products.find(p => p.id === item.id);
                    if (original) {
                        newProducts.push({ ...original, isHighlight: item.highlight });
                    }
                }
            });

            // Fallback: Add remaining products that might have been missed by AI
            const processedIds = new Set(newProducts.filter(p => p.type !== 'divider').map(p => p.id));
            const missing = products.filter(p => p.type !== 'divider' && !processedIds.has(p.id));
            if (missing.length > 0) {
                if (newProducts.length === 0 || newProducts[newProducts.length - 1].type !== 'divider') {
                    // Add a generic divider if needed
                    newProducts.push({
                        id: `divider-rest-${Date.now()}`,
                        name: 'OUTROS',
                        type: 'divider',
                        price: 0,
                        unit: '',
                        image: '',
                        details: '',
                        isHighlight: false,
                        cols: 3
                    });
                }
                newProducts.push(...missing);
            }

            onReorderProducts(newProducts);
            showToast('success', 'Lista organizada com sucesso!');

        } catch (error) {
            console.error('Erro na AI Organization:', error);
            showToast('error', error instanceof Error ? error.message : 'Não foi possível organizar automaticamente.');
        } finally {
            setIsOrganizing(false);
        }
    };

    const handleAddDivider = () => {
        const id = `divider-${Date.now()}`;
        const newDivider: Product = {
            id,
            name: 'NOVA SEÇÃO',
            details: '',
            price: 0,
            unit: '',
            image: '',
            isHighlight: false,
            type: 'divider',
            cols: 3
        };
        onReorderProducts([newDivider, ...products]);
        setEditingId(id);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.price.toString().includes(searchTerm)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = products.findIndex(p => p.id === active.id);
            const newIndex = products.findIndex(p => p.id === over.id);
            onReorderProducts(arrayMove(products, oldIndex, newIndex));
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[25] bg-transparent"
                    onClick={onClose}
                />
            )}

            <div
                className={`fixed top-0 bottom-0 left-0 z-30 w-[420px] bg-white dark:bg-gray-900 shadow-[20px_0_50px_rgba(0,0,0,0.1)] border-r border-gray-200 dark:border-gray-800 transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-[450px]' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <span className="material-icons-round text-lg">format_list_bulleted</span>
                        </div>
                        <div>
                            <h3 className="font-black uppercase text-xs tracking-widest text-gray-800 dark:text-white">
                                Lista de Produtos
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{products.length} itens no flyer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 space-y-4 shrink-0 bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="relative">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-1">
                        <button
                            onClick={handleAIOrganize}
                            disabled={isOrganizing}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isOrganizing
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            <span className="material-icons-round text-sm">{isOrganizing ? 'sync' : 'auto_awesome'}</span>
                            {isOrganizing ? 'Organizando...' : 'AI Organizar'}
                        </button>

                        <button
                            onClick={handleAddDivider}
                            className="flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all font-black uppercase text-[9px]"
                            title="Adicionar Seção"
                        >
                            <span className="material-icons-round text-sm">add_circle</span>
                            Divisor
                        </button>
                    </div>

                    <div className="px-1 flex justify-between items-center">
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Arraste para Ordenar</span>
                        {products.filter(p => p.type !== 'divider').length > 0 && (
                            <button
                                onClick={() => {
                                    const selectableProducts = products.filter(p => p.type !== 'divider');
                                    if (selectedIds.length === selectableProducts.length) {
                                        // Desmarcar todos
                                        setSelectedIds([]);
                                    } else {
                                        // Selecionar todos (apenas produtos, não divisores)
                                        setSelectedIds(selectableProducts.map(p => p.id));
                                    }
                                }}
                                className="flex items-center gap-1 text-[9px] font-black text-primary uppercase hover:bg-primary/5 px-2 py-1 rounded transition-colors"
                                title={selectedIds.length === products.filter(p => p.type !== 'divider').length ? "Desmarcar Todos" : "Selecionar Todos"}
                            >
                                <span className="material-icons-round text-sm">
                                    {selectedIds.length === products.filter(p => p.type !== 'divider').length ? 'check_box' : 'check_box_outline_blank'}
                                </span>
                                {selectedIds.length === products.filter(p => p.type !== 'divider').length ? 'Desmarcar' : 'Selecionar'} Todos
                            </button>
                        )}
                    </div>
                    {products.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Tem certeza que deseja remover TODOS os produtos do flyer?')) {
                                    onClearAll();
                                }
                            }}
                            className="text-[9px] font-black text-red-500 uppercase hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                        >
                            Limpar Flyer
                        </button>
                    )}
                </div>
                {/* Batch Actions Toolbar */}
                {selectedIds.length > 0 && (
                    <div className="animate-in slide-in-from-top-4 duration-300">
                        <div className="px-5 py-3 bg-primary text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase">{selectedIds.length} selecionados</span>
                                <button onClick={() => setSelectedIds([])} className="p-1 hover:bg-white/10 rounded">
                                    <span className="material-icons-round text-sm">close</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBatchDelete();
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Excluir Selecionados"
                                >
                                    <span className="material-icons-round text-lg">delete</span>
                                </button>
                                <button onClick={() => handleBatchHighlight(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Destaque">
                                    <span className="material-icons-round text-lg">star</span>
                                </button>
                                <div className="w-px h-6 bg-white/20 mx-1" />
                                {[1, 2, 3].map(c => (
                                    <button key={c} onClick={() => handleBatchCols(c)} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg text-[10px] font-black border border-white/20">
                                        {c}c
                                    </button>
                                ))}
                                {allSameCols && selectedProducts.length > 0 && (
                                    <>
                                        <div className="w-px h-6 bg-white/20 mx-1" />
                                        <button
                                            onClick={() => setShowBatchImageControls(!showBatchImageControls)}
                                            className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${showBatchImageControls ? 'bg-white/20' : ''}`}
                                            title="Ajustar Imagens em Lote"
                                        >
                                            <span className="material-icons-round text-lg">photo_size_select_large</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Batch Image Controls Panel */}
                        {showBatchImageControls && allSameCols && selectedProducts.length > 0 && (
                            <div className="px-5 py-4 bg-primary/90 border-t border-white/10 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-white/80">Ajuste em Lote de Imagens</span>
                                    <button
                                        onClick={resetBatchImageValues}
                                        className="text-[8px] font-black uppercase text-white/60 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        Resetar
                                    </button>
                                </div>

                                {/* Zoom Control */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[9px] font-black uppercase text-white/80 tracking-wider">Zoom</label>
                                        <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded">{Math.round(batchImageScale * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3.0"
                                        step="0.1"
                                        value={batchImageScale}
                                        onChange={(e) => handleBatchImageScale(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                    />
                                </div>

                                {/* Position Controls */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[9px] font-black uppercase text-white/80 tracking-wider">Pos. H</label>
                                            <span className="text-[10px] font-bold text-white">{batchImageOffsetX}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-100"
                                            max="100"
                                            step="1"
                                            value={batchImageOffsetX}
                                            onChange={(e) => handleBatchImageOffsetX(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[9px] font-black uppercase text-white/80 tracking-wider">Pos. V</label>
                                            <span className="text-[10px] font-bold text-white">{batchImageOffsetY}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-100"
                                            max="100"
                                            step="1"
                                            value={batchImageOffsetY}
                                            onChange={(e) => handleBatchImageOffsetY(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/10">
                                    <p className="text-[8px] text-white/60 text-center">
                                        ✓ {selectedProducts.length} {selectedProducts.length === 1 ? 'produto' : 'produtos'} com {selectedProducts[0].cols || 1} {(selectedProducts[0].cols || 1) === 1 ? 'coluna' : 'colunas'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-40">
                            <span className="material-icons-round text-5xl mb-4">inventory_2</span>
                            <p className="text-[10px] uppercase font-black tracking-widest">A lista está vazia</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={filteredProducts.map(p => p.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="flex flex-col">
                                    {filteredProducts.map((product) => (
                                        <SortableProductRow
                                            key={product.id}
                                            product={product}
                                            onUpdateProduct={onUpdateProduct}
                                            onRemoveProduct={onRemoveProduct}
                                            editingId={editingId}
                                            setEditingId={setEditingId}
                                            isSelected={selectedIds.includes(product.id)}
                                            onSelectToggle={() => toggleSelect(product.id)}
                                            onOpenImagePicker={() => setImagePickerTarget(product.id)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {/* Footer Status */}
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                    <p className="text-[9px] text-gray-400 text-center font-black uppercase tracking-[0.3em] opacity-40">
                        Visconde Gerador de Ofertas
                    </p>
                </div>
            </div>

            <ImagePickerModal
                isOpen={!!imagePickerTarget}
                onClose={() => setImagePickerTarget(null)}
                onSelect={(imagePath) => {
                    if (imagePickerTarget) onUpdateProduct(imagePickerTarget, { image: imagePath });
                }}
            />
        </>
    );
};
