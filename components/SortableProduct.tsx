import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProductCard } from './ProductCard';
import { Product, FontConfig, LayoutConfig } from '../types';

interface SortableProductProps {
    product: Product;
    primaryColor: string;
    secondaryColor: string;
    fonts: FontConfig;
    layout: LayoutConfig;
    columns: number;
    onAddToCart?: (id: string) => void;
    onEdit?: (id: string) => void;
    isViewerMode?: boolean;
    sortableId?: string;
    disabled?: boolean;
}

export const SortableProduct = React.memo<SortableProductProps>(({
    product,
    primaryColor,
    secondaryColor,
    fonts,
    layout,
    columns,
    onAddToCart,
    onEdit,
    isViewerMode,
    sortableId,
    disabled
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: sortableId || product.id,
        disabled
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        gridColumn: `span ${product.type === 'divider' ? columns : (product.cols || 1)}`,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // Ensure touch devices can drag successfully
    };

    return (
        <div ref={setNodeRef} style={style} {...(!isViewerMode ? attributes : {})} {...(!isViewerMode ? listeners : {})} className={!isViewerMode ? "touch-none" : ""}>
            {/* Touch-none prevents scroll interference on mobile/touch devices while dragging */}
            <ProductCard
                product={product}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                fonts={fonts}
                layout={layout}
                onAddToCart={onAddToCart}
                onEdit={onEdit}
                isViewerMode={isViewerMode}
            />
        </div>
    );
});
SortableProduct.displayName = 'SortableProduct';
