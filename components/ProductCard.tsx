import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const isHighlight = product.isHighlight;

  if (isHighlight) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg overflow-hidden relative flex flex-col border-2 border-orange-400 ${className} h-48`}>
        {/* Featured Badge */}
        <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase z-20 shadow-lg flex items-center gap-1">
          <span className="text-sm">⭐</span> Destaque
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-4 pt-10">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 pt-8">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <h3 className="font-black text-white text-xl leading-tight uppercase tracking-tight">{product.name}</h3>
              {product.details && <p className="text-xs font-medium text-orange-300 mt-1 uppercase">{product.details}</p>}
            </div>

            {/* Price Tag */}
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl px-4 py-2 shadow-xl ml-4 flex-shrink-0">
              <div className="flex items-start text-white font-display leading-none">
                <span className="text-xs mt-1 mr-0.5">R$</span>
                <span className="text-3xl font-bold">{Math.floor(product.price)}</span>
                <div className="flex flex-col">
                  <span className="text-lg">,{product.price.toFixed(2).split('.')[1]}</span>
                </div>
              </div>
              <span className="text-white text-[10px] font-bold uppercase block text-center mt-0.5">/{product.unit}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-md overflow-hidden relative flex flex-col border border-gray-100 group ${className} hover:shadow-xl transition-all duration-300`}>
      {/* Compact Price Badge - Top Right */}
      <div className="absolute top-2 right-2 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl px-3 py-2 shadow-lg z-10 group-hover:scale-105 transition-transform">
        <div className="flex items-start leading-none">
          <span className="text-[10px] mt-0.5 mr-0.5 opacity-90">R$</span>
          <span className="text-2xl font-bold">{Math.floor(product.price)}</span>
          <span className="text-sm mt-0.5">,{product.price.toFixed(2).split('.')[1]}</span>
        </div>
        <div className="text-[9px] font-bold uppercase text-center mt-0.5 opacity-90">/{product.unit}</div>
      </div>

      {/* Image - Takes most of the space */}
      <div className="flex-1 flex items-center justify-center p-4 pt-6 min-h-[140px]">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Name - Bottom */}
      <div className="bg-gray-50 p-3 border-t border-gray-100">
        <h3 className="font-bold text-gray-800 text-center text-sm leading-tight uppercase line-clamp-2">{product.name}</h3>
        {product.details && <p className="text-xs text-gray-500 mt-1 text-center line-clamp-1">{product.details}</p>}
      </div>
    </div>
  );
};
