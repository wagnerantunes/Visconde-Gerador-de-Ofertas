import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  primaryColor: string;
  secondaryColor: string;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  primaryColor,
  secondaryColor,
  className = ''
}) => {
  const isHighlight = product.isHighlight;

  if (isHighlight) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-3 relative flex items-center border border-gray-100 overflow-visible group ${className} h-40`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-48 h-36 object-contain ml-2 transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="flex-1 pl-6 pr-24 z-10">
          <h3 className="font-black text-gray-800 text-3xl leading-tight uppercase tracking-tight">{product.name}</h3>
          {product.details && <p className="text-sm font-medium text-gray-500 mt-1 uppercase">{product.details}</p>}
        </div>

        {/* Highlight Price Tag */}
        <div
          className="absolute -right-4 -bottom-4 w-32 h-32 price-tag flex flex-col items-center justify-center transform rotate-6 border-4 border-white shadow-xl z-20"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="text-white text-xs font-bold uppercase -mb-1 mt-2">Apenas</span>
          <div className="flex items-start font-display leading-none" style={{ color: secondaryColor }}>
            <span className="text-sm mt-2 mr-1">R$</span>
            <span className="text-6xl drop-shadow-sm">{Math.floor(product.price)}</span>
            <div className="flex flex-col mt-2">
              <span className="text-2xl">,{product.price.toFixed(2).split('.')[1]}</span>
            </div>
          </div>
          <span
            className="text-white text-[10px] px-3 py-0.5 rounded-full mt-1 uppercase font-bold"
            style={{ backgroundColor: `${primaryColor}dd` }}
          >
            {product.unit}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-md p-2 pt-10 relative flex flex-col items-center border border-gray-100 group ${className} hover:shadow-xl transition-shadow duration-300`}>
      {/* Standard Price Tag */}
      <div
        className="absolute -top-5 w-24 h-24 price-tag flex flex-col items-center justify-center transform -rotate-3 border-4 border-white shadow-lg z-10 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-start font-display leading-none mt-1" style={{ color: secondaryColor }}>
          <span className="text-xs mt-1 mr-0.5">R$</span>
          <span className="text-4xl">{Math.floor(product.price)}</span>
          <span className="text-lg mt-1">,{product.price.toFixed(2).split('.')[1]}</span>
        </div>
        <span className="text-white text-[10px] font-bold uppercase mt-1">{product.unit}</span>
      </div>

      <img
        src={product.image}
        alt={product.name}
        className="w-full h-32 object-contain mb-3 transform group-hover:scale-105 transition-transform duration-300"
      />
      <h3 className="font-bold text-gray-800 text-center text-lg leading-tight px-1 uppercase w-full line-clamp-2">{product.name}</h3>
      {product.details && <p className="text-xs text-gray-500 mt-1 text-center">{product.details}</p>}
    </div>
  );
};
