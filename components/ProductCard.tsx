import React from 'react';
import { Product, FontConfig } from '../types';

interface ProductCardProps {
  product: Product;
  primaryColor: string;
  secondaryColor: string;
  className?: string;
  fonts: FontConfig;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  primaryColor,
  secondaryColor,
  className = '',
  fonts
}) => {
  const isHighlight = product.isHighlight;

  if (isHighlight) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-0 relative flex items-stretch border border-gray-100 overflow-hidden group ${className} h-72`}>
        {/* Imagem - 70% do espaço horizontal */}
        <div className="flex-shrink-0 w-[70%] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Informações - 30% do espaço horizontal */}
        <div className="flex-1 flex flex-col justify-center p-4 pr-6 relative">
          <h3
            className="font-black text-gray-800 text-2xl leading-tight uppercase tracking-tight mb-2"
            style={{
              fontFamily: fonts.productName.family,
              fontSize: `${1.5 * fonts.productName.scale}rem`
            }}
          >
            {product.name}
          </h3>
          {product.details && (
            <p
              className="text-xs font-medium text-gray-500 uppercase mb-4"
              style={{
                fontFamily: fonts.productDetails.family,
                fontSize: `${0.75 * fonts.productDetails.scale}rem`
              }}
            >
              {product.details}
            </p>
          )}

          {/* Price Badge - Integrado no layout */}
          <div
            className="px-4 py-2 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex flex-col items-start">
              <span className="text-white text-[10px] font-bold uppercase mb-1">Apenas</span>
              <div
                className="flex items-baseline font-display leading-none"
                style={{ color: secondaryColor, fontFamily: fonts.price.family }}
              >
                <span className="text-lg mr-0.5" style={{ fontSize: `${1.125 * fonts.price.scale}rem` }}>R$</span>
                <span className="text-6xl drop-shadow-sm" style={{ fontSize: `${3.75 * fonts.price.scale}rem` }}>{Math.floor(product.price)}</span>
                <span className="text-3xl" style={{ fontSize: `${1.875 * fonts.price.scale}rem` }}>,{product.price.toFixed(2).split('.')[1]}</span>
              </div>
              <span
                className="text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold mt-1"
                style={{
                  backgroundColor: `${primaryColor}dd`,
                  fontFamily: fonts.unit.family,
                  fontSize: `${0.625 * fonts.unit.scale}rem`
                }}
              >
                {product.unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-md relative flex flex-col border border-gray-100 group ${className} hover:shadow-xl transition-shadow duration-300 overflow-hidden h-72`}>
      {/* Price Badge - Canto superior direito, fora da foto */}
      <div
        className="absolute top-2 right-2 px-3 py-1.5 rounded-xl shadow-lg z-20 group-hover:scale-105 transition-transform"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex flex-col items-center font-display leading-none">
          <div
            className="flex items-baseline"
            style={{ color: secondaryColor, fontFamily: fonts.price.family }}
          >
            <span className="text-sm mr-0.5" style={{ fontSize: `${0.875 * fonts.price.scale}rem` }}>R$</span>
            <span className="text-4xl font-bold" style={{ fontSize: `${2.25 * fonts.price.scale}rem` }}>{Math.floor(product.price)}</span>
            <span className="text-xl" style={{ fontSize: `${1.25 * fonts.price.scale}rem` }}>,{product.price.toFixed(2).split('.')[1]}</span>
          </div>
          <span
            className="text-white text-[9px] font-bold uppercase mt-0.5"
            style={{
              fontFamily: fonts.unit.family,
              fontSize: `${0.5625 * fonts.unit.scale}rem`
            }}
          >
            {product.unit}
          </span>
        </div>
      </div>

      {/* Imagem do produto - 70% do espaço vertical */}
      <div className="w-full h-[70%] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Informações - 30% do espaço vertical */}
      <div className="h-[30%] flex flex-col justify-center items-center px-3 py-2 bg-white">
        <h3
          className="font-bold text-gray-800 text-center text-base leading-tight uppercase w-full line-clamp-2"
          style={{
            fontFamily: fonts.productName.family,
            fontSize: `${1 * fonts.productName.scale}rem`
          }}
        >
          {product.name}
        </h3>
        {product.details && (
          <p
            className="text-[10px] text-gray-500 mt-1 text-center line-clamp-1"
            style={{
              fontFamily: fonts.productDetails.family,
              fontSize: `${0.625 * fonts.productDetails.scale}rem`
            }}
          >
            {product.details}
          </p>
        )}
      </div>
    </div>
  );
};
