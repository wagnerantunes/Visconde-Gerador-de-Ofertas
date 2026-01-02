import React from 'react';
import { Product, FontConfig, LayoutConfig } from '../types';
import { CategoryIcon } from './CategoryIcon';



interface ProductCardProps {
  product: Product;
  primaryColor: string;
  secondaryColor: string;
  className?: string;
  fonts: FontConfig;
  layout?: LayoutConfig;
  style?: React.CSSProperties;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  primaryColor,
  secondaryColor,
  className = '',
  fonts,
  layout,
  style
}) => {
  const height = layout?.cardHeight ? `${layout.cardHeight}px` : '18rem';
  const isCompact = layout?.cardStyle === 'compact';
  const isHighlight = product.isHighlight;

  if (isHighlight) {
    return (
      <div
        className={`bg-white rounded-2xl shadow-lg p-0 relative flex items-stretch border border-gray-100 overflow-hidden group ${className}`}
        style={{ height, ...style }}
      >
        {/* Imagem - 55% do espaço horizontal */}
        <div className="flex-shrink-0 w-[55%] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300"
            style={{
              transform: `scale(${product.imageScale || 1}) translateY(${product.imageOffsetY || 0}%) translateX(${product.imageOffsetX || 0}%)`
            }}
          />
        </div>

        {/* Informações - Restante do espaço com leve sobreposição */}
        <div className="flex-1 flex flex-col justify-center p-4 pr-6 relative z-10 -ml-8">
          <h3
            className="font-black text-gray-800 text-2xl leading-tight uppercase tracking-tight mb-2"
            style={{
              fontFamily: fonts.productName.family,
              fontSize: `${1.5 * fonts.productName.scale}rem`,
              color: fonts.productName.color || '#1f2937'
            }}
          >
            {product.name}
          </h3>
          {product.details && (
            <div className="mb-4 flex justify-center">
              <div
                className="font-medium text-gray-500 uppercase flex items-center justify-center"
                style={{
                  fontFamily: fonts.productDetails.family,
                  fontSize: `${0.75 * fonts.productDetails.scale}rem`,
                  color: fonts.productDetails.color || '#6b7280'
                }}
              >
                <CategoryIcon category={product.details} className="w-8 h-8 text-current" />
                {!['bovinos', 'bovino', 'suinos', 'suino', 'aves', 'ave', 'frango', 'linguica'].some(k => product.details.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(k)) && (
                  <span>{product.details}</span>
                )}
              </div>
            </div>
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
                style={{ color: fonts.price.color || secondaryColor, fontFamily: fonts.price.family }}
              >
                <span className="text-lg mr-0.5" style={{ fontSize: `${1.125 * fonts.price.scale}rem` }}>R$</span>
                <span className="text-6xl drop-shadow-sm" style={{ fontSize: `${3.75 * fonts.price.scale}rem` }}>{Math.floor(Number(product.price) || 0)}</span>
                <span className="text-3xl" style={{ fontSize: `${1.875 * fonts.price.scale}rem` }}>,{(Number(product.price) || 0).toFixed(2).split('.')[1]}</span>
              </div>
              <span
                className="text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold mt-1"
                style={{
                  backgroundColor: `${primaryColor}dd`,
                  fontFamily: fonts.unit.family,
                  fontSize: `${0.625 * fonts.unit.scale}rem`,
                  color: fonts.unit.color || 'white'
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
    <div
      className={`bg-white rounded-2xl shadow-md relative flex flex-col border border-gray-100 group ${className} hover:shadow-xl transition-shadow duration-300 overflow-hidden`}
      style={{ height, ...style }}
    >
      {/* Price Badge - Canto superior direito, fora da foto */}
      <div
        className="absolute top-2 right-2 px-3 py-1.5 rounded-xl shadow-lg z-20 group-hover:scale-105 transition-transform"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex flex-col items-center font-display leading-none">
          <div
            className="flex items-baseline"
            style={{ color: fonts.price.color || secondaryColor, fontFamily: fonts.price.family }}
          >
            <span className="text-sm mr-0.5" style={{ fontSize: `${0.875 * fonts.price.scale}rem` }}>R$</span>
            <span className="text-4xl font-bold" style={{ fontSize: `${2.25 * fonts.price.scale}rem` }}>{Math.floor(Number(product.price) || 0)}</span>
            <span className="text-xl" style={{ fontSize: `${1.25 * fonts.price.scale}rem` }}>,{(Number(product.price) || 0).toFixed(2).split('.')[1]}</span>
          </div>
          <span
            className="text-white text-[9px] font-bold uppercase mt-0.5"
            style={{
              fontFamily: fonts.unit.family,
              fontSize: `${0.5625 * fonts.unit.scale}rem`,
              color: fonts.unit.color || 'white'
            }}
          >
            {product.unit}
          </span>
        </div>
      </div>

      {/* Imagem do produto - Flex Grow para ocupar espaço disponível */}
      <div className="w-full flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4 min-h-0 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300"
          style={{
            transform: `scale(${product.imageScale || 1}) translateY(${product.imageOffsetY || 0}%)`
          }}
        />
        {/* Compact Mode Overlay Gradient */}
        {isCompact && (
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      {/* Informações - Auto Height */}
      <div className={`flex flex-col justify-center items-center bg-white shrink-0 z-10 ${isCompact ? 'px-2 pb-2' : 'px-3 py-2'}`}>
        <h3
          className="font-bold text-gray-800 text-center text-base leading-tight uppercase w-full line-clamp-2"
          style={{
            fontFamily: fonts.productName.family,
            fontSize: `${1 * fonts.productName.scale}rem`,
            color: fonts.productName.color || '#1f2937'
          }}
        >
          {product.name}
        </h3>
        {product.details && (
          <p
            className="text-[10px] text-gray-500 mt-1 text-center line-clamp-1"
            style={{
              fontFamily: fonts.productDetails.family,
              fontSize: `${0.625 * fonts.productDetails.scale}rem`,
              color: fonts.productDetails.color || '#6b7280'
            }}
          >
            {product.details}
          </p>
        )}
      </div>
    </div>
  );
};
