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
}

export const SortableProduct: React.FC<SortableProductProps> = ({
    product,
    primaryColor,
    secondaryColor,
    fonts,
    layout
}) => {
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
        gridColumn: `span ${product.cols || (product.isHighlight ? 2 : 1)}`,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // Ensure touch devices can drag successfully
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
            {/* Touch-none prevents scroll interference on mobile/touch devices while dragging */}
            <ProductCard
                product={product}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                fonts={fonts}
                layout={layout}
            />
        </div>
    );
};
