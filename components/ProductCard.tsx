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
  onAddToCart?: (id: string) => void;
  onEdit?: (id: string) => void;
  isViewerMode?: boolean;
}

// Wrapped in React.memo for performance
export const ProductCard = React.memo<ProductCardProps>(({
  product,
  primaryColor,
  secondaryColor,
  className = '',
  fonts,
  layout,
  style,
  onAddToCart,
  onEdit,
  isViewerMode
}) => {
  const height = layout?.cardHeight ? `${layout.cardHeight}px` : '18rem';
  const isCompact = layout?.cardStyle === 'compact';
  const isHighlight = product.isHighlight || (product.cols || 1) >= 2;
  const borderRadius = layout?.borderRadius !== undefined ? `${layout.borderRadius}px` : '1.25rem'; // Ligeiramente maior para ar moderno
  const shadowIntensity = layout?.shadowIntensity !== undefined ? layout.shadowIntensity : 0.1;
  const globalShadow = `0 10px 25px -5px rgba(0,0,0,${shadowIntensity * 1.5}), 0 4px 10px -5px rgba(0,0,0,${shadowIntensity})`;

  const renderEditButton = () => {
    if (isViewerMode || product.type === 'divider') return null;
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit?.(product.id);
        }}
        className="absolute top-2 left-2 z-50 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:text-primary hover:scale-110 transition-all"
        title="Editar Produto"
      >
        <span className="material-icons-round text-lg">edit</span>
      </button>
    );
  };

  if (product.type === 'divider') {
    const getDividerTheme = (theme?: string) => {
      switch (theme) {
        case 'meat':
          return {
            bg: 'linear-gradient(135deg, #422020 0%, #632c2c 100%)',
            icon: 'restaurant',
            color: '#fff',
            pattern: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 10px)'
          };
        case 'produce':
          return {
            bg: 'linear-gradient(135deg, #134e4a 0%, #065f46 100%)',
            icon: 'eco',
            color: '#fff',
            pattern: 'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.05) 2px, transparent 0)'
          };
        case 'bakery':
          return {
            bg: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
            icon: 'bakery_dining',
            color: '#fff',
            pattern: 'linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.03) 50%, rgba(0,0,0,0.03) 75%, transparent 75%, transparent)'
          };
        case 'beverages':
          return {
            bg: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            icon: 'local_bar',
            color: '#fff',
            pattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)'
          };
        case 'clean':
          return {
            bg: '#f8fafc',
            icon: 'layers',
            color: primaryColor,
            pattern: 'none'
          };
        default:
          return {
            bg: 'white',
            icon: 'label',
            color: primaryColor,
            pattern: 'none'
          };
      }
    };

    const theme = getDividerTheme(product.dividerTheme);

    return (
      <div
        className={`w-full flex items-center justify-center relative overflow-hidden border border-gray-100 dark:border-gray-800 group/divider ${className}`}
        style={{ height: 'auto', minHeight: '90px', background: theme.bg, borderRadius, boxShadow: globalShadow, ...style }}
      >
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: theme.pattern, backgroundSize: '40px 40px' }} />
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: theme.color === '#fff' ? 'rgba(255,255,255,0.3)' : primaryColor }} />
        <div className="flex gap-8 items-center px-12 py-8 relative z-10 w-full overflow-hidden">
          <div className="h-[2px] flex-1 bg-current opacity-20 rounded-full" style={{ color: theme.color }} />
          <div className="flex items-center gap-5 transform transition-transform group-hover/divider:scale-105 duration-500">
            <span className="material-icons-round text-4xl opacity-90 drop-shadow-lg" style={{ color: theme.color }}>{theme.icon}</span>
            <h2
              className="font-black text-4xl uppercase tracking-[0.15em] whitespace-nowrap drop-shadow-2xl italic select-none"
              style={{
                fontFamily: fonts.headerTitle.family,
                color: theme.color,
                fontSize: `${2.4 * fonts.headerTitle.scale}rem`
              }}
            >
              {product.name}
            </h2>
          </div>
          <div className="h-[2px] flex-1 bg-current opacity-20 rounded-full" style={{ color: theme.color }} />
        </div>
      </div>
    );
  }

  // Helper para renderizar Stickers (Etiquetas)
  const renderSticker = () => {
    if (!product.stickerText) return null;

    const style = product.stickerStyle || layout?.stickerStyle || 'badge';
    const stickerScale = (layout?.stickerScale || 1.0) * (fonts.sticker.scale || 1.0);

    let stickerClass = "absolute z-40 font-black uppercase tracking-tighter shadow-xl px-3 py-1";
    let stickerStyle: React.CSSProperties = {
      backgroundColor: secondaryColor,
      color: 'white',
      fontFamily: fonts.sticker.family,
      fontSize: `${10 * stickerScale}px`,
      transformOrigin: 'center'
    };

    switch (style) {
      case 'ribbon':
        stickerClass += " top-0 left-0 -rotate-45 -translate-x-6 translate-y-2 w-32 text-center";
        // No ribbon, a escala precisa ser aplicada com cuidado para não quebrar a posição fixa
        stickerStyle.transform = `scale(${stickerScale})`;
        break;
      case 'tag':
        stickerClass += " bottom-4 left-4 rounded-r-full pl-6 pr-4";
        stickerStyle.clipPath = "polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%)";
        stickerStyle.transform = `scale(${stickerScale})`;
        break;
      case 'neon':
        stickerClass += " top-4 left-4 rounded-lg px-4 py-2 border-2 border-white animate-pulse";
        stickerStyle.boxShadow = `0 0 15px ${secondaryColor}`;
        stickerStyle.transform = `scale(${stickerScale})`;
        break;
      default: // badge
        stickerClass += " top-4 left-4 rounded-full px-4 transform transition-transform";
        stickerStyle.transform = `scale(${stickerScale}) rotate(-12deg)`;
        break;
    }

    return (
      <div className={stickerClass} style={stickerStyle}>
        <span className="relative z-10">{product.stickerText}</span>
        {style === 'neon' && <div className="absolute inset-0 bg-current opacity-20 blur-md animate-pulse" />}
      </div>
    );
  };

  const renderCartButton = () => {
    if (!isViewerMode) return null;
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddToCart?.(product.id);
        }}
        className="absolute bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center text-primary group-hover:scale-110 active:scale-95 transition-all border-4 border-primary"
        title="Adicionar ao Carrinho"
      >
        <span className="material-icons-round text-2xl">add_shopping_cart</span>
      </button>
    );
  };

  const getPresetStyles = (preset?: string) => {
    switch (preset) {
      case 'modern':
        return {
          cardClass: 'border-primary/30 hover:border-primary/60',
          innerClass: 'bg-white',
          extra: <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: primaryColor }} />
        };
      case 'glass':
        return {
          cardClass: 'bg-white/40 backdrop-blur-md border-white/40',
          innerClass: 'bg-transparent',
          extra: <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        };
      case 'bold':
        return {
          cardClass: 'border-2 scale-[1.02]',
          cardStyle: { borderColor: primaryColor },
          innerClass: 'bg-white'
        };
      case 'gradient':
        return {
          cardClass: 'border-gray-100',
          innerClass: 'bg-gradient-to-br from-white via-white to-primary/5'
        };
      default:
        return {
          cardClass: 'border-gray-100',
          innerClass: 'bg-white'
        };
    }
  };

  const preset = getPresetStyles(product.stylePreset);
  const bgColor = product.backgroundColor || (product.stylePreset === 'glass' ? 'transparent' : 'white');
  const isCustomBg = !!product.backgroundColor;
  const txtColor = product.textColor || '#1f2937';

  const isPriceVisible = product.visibleFields?.price ?? layout?.visibleFields?.price ?? true;
  const isUnitVisible = product.visibleFields?.unit ?? layout?.visibleFields?.unit ?? true;
  const isDetailsVisible = product.visibleFields?.details ?? layout?.visibleFields?.details ?? true;
  const isOriginalPriceVisible = product.visibleFields?.originalPrice ?? layout?.visibleFields?.originalPrice ?? true;

  // Advanced Layout Settings (Defaults matched to recent optimization)
  const imgPad = layout?.imagePadding !== undefined ? layout.imagePadding : 1.5;
  const contentPad = layout?.contentPadding !== undefined ? layout.contentPadding : 2;

  // Helper para renderizar o preço com diferentes estilos (Splash)
  const renderPriceTag = (isLarge = false) => {
    if (!isPriceVisible) return null;

    const showBox = product.showPriceBadge !== false; // Padrão é true
    const priceStyle = product.priceStyle || layout?.priceStyle || 'classic';

    // Classes base para o container do preço
    let tagClass = "relative transition-transform duration-300 group-hover:scale-105";
    let tagStyle: React.CSSProperties = { color: 'white' };

    if (showBox) {
      tagStyle.backgroundColor = primaryColor;
      tagStyle.boxShadow = globalShadow;
      switch (priceStyle) {
        case 'minimal':
          tagClass += " bg-transparent !shadow-none";
          tagStyle.backgroundColor = 'transparent';
          tagStyle.color = primaryColor;
          tagStyle.boxShadow = 'none';
          break;
        case 'badge':
          tagClass += " rounded-full aspect-square flex flex-col items-center justify-center p-6";
          tagStyle.minWidth = "100px";
          tagStyle.minHeight = "100px";
          break;
        case 'star':
          tagClass += " flex flex-col items-center justify-center p-10 text-center";
          // Estrela de 32 pontas (starburst) - Polígono de 64 pontos calculados
          tagStyle.clipPath = "polygon(50% 0%, 54% 11%, 63% 5%, 65% 16%, 75% 12%, 74% 23%, 84% 24%, 81% 34%, 89% 37%, 83% 46%, 90% 52%, 82% 58%, 87% 66%, 77% 70%, 79% 79%, 69% 80%, 69% 89%, 60% 87%, 57% 95%, 48% 91%, 43% 97%, 37% 90%, 30% 95%, 26% 86%, 18% 88%, 16% 78%, 9% 78%, 9% 68%, 4% 66%, 5% 56%, 2% 51%, 6% 43%, 5% 33%, 12% 28%, 13% 18%, 21% 17%, 24% 8%, 32% 9%, 38% 3%, 43% 8%)";
          tagStyle.minWidth = "130px";
          tagStyle.minHeight = "130px";
          break;
        case 'outline':
          tagClass += " rounded-xl border-2 bg-white/80 backdrop-blur-sm p-4";
          tagStyle.borderColor = primaryColor;
          tagStyle.color = primaryColor;
          tagStyle.backgroundColor = isCustomBg ? 'rgba(255,255,255,0.8)' : 'white';
          tagStyle.boxShadow = 'none';
          break;
        default: // classic
          tagClass += " rounded-xl p-3";
          break;
      }
    } else {
      tagClass += " bg-transparent !shadow-none";
      tagStyle.color = primaryColor;
      tagStyle.boxShadow = 'none';
    }

    const priceValue = Number(product.price) || 0;
    const originalPriceValue = Number(product.originalPrice) || 0;
    const hasDiscount = originalPriceValue > priceValue && isOriginalPriceVisible;

    const integerPart = Math.floor(priceValue);
    const decimalPart = priceValue.toFixed(2).split('.')[1];

    return (
      <div className={tagClass} style={tagStyle}>
        {!isLarge && (
          <div className="flex flex-col items-center font-display leading-none">
            {hasDiscount && (
              <div className="text-[8px] font-bold opacity-70 line-through mb-0.5 flex items-baseline gap-0.5" style={{ color: (showBox && priceStyle !== 'outline' && priceStyle !== 'minimal') ? 'white' : primaryColor }}>
                <span className="text-[6px]">DE R$</span>
                <span>{originalPriceValue.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <div className="flex items-baseline font-display leading-none" style={{ fontFamily: fonts.price.family, color: (showBox && priceStyle !== 'outline' && priceStyle !== 'minimal') ? 'white' : primaryColor }}>
              <span className="text-xl mr-0.5" style={{ fontSize: `${1.1 * fonts.price.scale}rem` }}>R$</span>
              <span className="text-7xl drop-shadow-sm" style={{ fontSize: `${4 * fonts.price.scale}rem` }}>{integerPart}</span>
              <span className="text-3xl" style={{ fontSize: `${2 * fonts.price.scale}rem` }}>,{decimalPart}</span>
              {isUnitVisible && (
                <span className="ml-1.5 font-black lowercase opacity-90 transform translate-y-[-20%]" style={{ fontSize: `${1.2 * fonts.price.scale}rem`, fontFamily: fonts.unit.family }}>{product.unit}</span>
              )}
            </div>
          </div>
        )}

        {isLarge && (
          <div className={`flex flex-col ${product.cardLayout?.includes('reversed') ? 'items-end' : 'items-start'}`}>
            {hasDiscount && (
              <div className="flex items-center gap-1.5 mb-1 group-hover:scale-110 transition-transform origin-left">
                <span className="text-[10px] font-black uppercase opacity-60">De</span>
                <span className="text-lg font-bold line-through opacity-70" style={{ color: (showBox && priceStyle !== 'outline' && priceStyle !== 'minimal') ? 'white' : primaryColor }}>
                  R$ {originalPriceValue.toFixed(2).replace('.', ',')}
                </span>
                <span className="bg-white text-primary text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                  -{Math.round((1 - priceValue / originalPriceValue) * 100)}%
                </span>
              </div>
            )}
            <span className="text-[10px] font-black uppercase mb-1 opacity-80">
              {hasDiscount ? 'Por apenas' : 'Apenas'}
            </span>
            <div className="flex items-baseline font-display leading-none" style={{ fontFamily: fonts.price.family, color: (showBox && priceStyle !== 'outline' && priceStyle !== 'minimal') ? 'white' : primaryColor }}>
              <span className="text-xl mr-0.5" style={{ fontSize: `${1.1 * fonts.price.scale}rem` }}>R$</span>
              <span className="text-7xl drop-shadow-sm" style={{ fontSize: `${4 * fonts.price.scale}rem` }}>{integerPart}</span>
              <span className="text-3xl" style={{ fontSize: `${2 * fonts.price.scale}rem` }}>,{decimalPart}</span>
            </div>
            {isUnitVisible && (
              <span className="text-[11px] px-2 py-0.5 rounded-full lowercase font-black mt-2 shadow-sm" style={{ backgroundColor: (showBox && priceStyle !== 'outline' && priceStyle !== 'minimal') ? 'rgba(0,0,0,0.2)' : `${primaryColor}22`, color: (showBox && priceStyle !== 'outline' && priceStyle !== 'minimal') ? 'white' : primaryColor, border: (showBox && priceStyle !== 'outline' && priceStyle !== 'minimal') ? 'none' : `1px solid ${primaryColor}` }}>
                {product.unit}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isHighlight) {
    const isReversed = product.cardLayout === 'reversed' || product.cardLayout === 'horizontal-reversed';

    return (
      <div
        className={`p-0 relative flex items-stretch border overflow-hidden group ${className} ${preset.cardClass} ${isReversed ? 'flex-row-reverse' : 'flex-row'}`}
        style={{ height, backgroundColor: bgColor, borderRadius, boxShadow: globalShadow, ...preset.cardStyle, ...style }}
      >
        {preset.extra}
        {renderEditButton()}
        {/* Imagem - Ocupa o fundo se houver sobreposição excessiva, mas aqui está em um flex-col robusto */}
        <div className={`flex-shrink-0 w-[55%] flex items-center justify-center p-4 relative z-0 ${preset.innerClass} ${isCustomBg ? '' : (product.stylePreset === 'gradient' ? '' : 'bg-gradient-to-br from-gray-50 to-white')}`}>
          {renderSticker()}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            style={{
              transform: `scale(${product.imageScale || 1}) translateY(${product.imageOffsetY || 0}%) translateX(${product.imageOffsetX || 0}%)`
            }}
          />
        </div>

        {/* Informações - Ocupa o topo no z-index para nunca ser sobreposta pela imagem escalada */}
        <div className={`flex-1 flex flex-col justify-between px-6 py-8 relative z-10 ${isReversed ? 'mr-0 items-end text-right' : 'items-start'}`}
          style={{ backgroundColor: isCustomBg ? bgColor : 'white', margin: isReversed ? '0 -2rem 0 0' : '0 0 0 -2rem', paddingLeft: isReversed ? '2rem' : '4rem' }}>
          <div className={`w-full flex flex-col ${isReversed ? 'items-end' : 'items-start'}`}>
            <h3
              className={`font-black tracking-tight leading-[0.9] mb-2 drop-shadow-sm group-hover:text-primary transition-colors ${isReversed ? 'text-right' : 'text-left'}`}
              style={{
                fontFamily: fonts.productName.family,
                color: txtColor,
                fontSize: `${1.8 * fonts.productName.scale}rem`
              }}
            >
              {product.name}
            </h3>
            {product.details && isDetailsVisible && (
              <p
                className={`opacity-60 font-extrabold uppercase tracking-widest leading-tight mb-4 ${isReversed ? 'text-right' : 'text-left'}`}
                style={{
                  fontFamily: fonts.productDetails.family,
                  fontSize: `${0.85 * fonts.productDetails.scale}rem`,
                  color: txtColor
                }}
              >
                {product.details}
              </p>
            )}
          </div>

          <div className="transform transition-transform duration-500 group-hover:translate-x-2 group-hover:scale-105 flex flex-col justify-end h-full">
            {renderPriceTag(true)}
          </div>
        </div>
        {renderCartButton()}
      </div>
    );
  }

  const layoutType = product.cardLayout || 'vertical';
  const isHorizontal = layoutType === 'horizontal' || layoutType === 'horizontal-reversed';
  const isReversed = layoutType === 'reversed' || layoutType === 'horizontal-reversed';

  return (
    <div
      className={`relative flex border group ${className} transition-all duration-300 overflow-hidden ${preset.cardClass} ${isHorizontal ? 'flex-row' : 'flex-col'} ${isReversed ? (isHorizontal ? 'flex-row-reverse' : 'flex-col-reverse') : ''}`}
      style={{ height, backgroundColor: bgColor, borderRadius, boxShadow: globalShadow, ...preset.cardStyle, ...style }}
    >
      {preset.extra}
      {renderEditButton()}

      {/* Price Badge - Flutuante e Inteligente */}
      <div className={`absolute z-30 ${isHorizontal ? (isReversed ? 'bottom-2 left-2' : 'bottom-2 right-2') : (isReversed ? 'bottom-20 right-2' : 'top-2 right-4')}`}>
        {renderPriceTag(false)}
      </div>

      {/* Imagem do produto - Container Flexível */}
      <div
        className={`flex items-center justify-center min-h-0 relative z-0 ${isHorizontal ? 'w-1/2 h-full' : 'w-full flex-1'} ${preset.innerClass} ${isCustomBg ? '' : (product.stylePreset === 'gradient' ? '' : 'bg-gradient-to-br from-gray-50 to-white')}`}
        style={{ padding: `${imgPad * 0.25}rem` }}
      >
        {renderSticker()}
        <img
          src={product.image}
          alt={product.name}
          className="max-w-[90%] max-h-[90%] object-contain transition-transform duration-500 group-hover:scale-110"
          style={{
            transform: `scale(${product.imageScale || 1}) translateY(${product.imageOffsetY || 0}%) translateX(${product.imageOffsetX || 0}%)`
          }}
        />
        {/* Compact Mode Overlay */}
        {!isHorizontal && isCompact && !isCustomBg && (
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      {/* Informações do Produto - Mais proeminente para evitar sobreposição */}
      <div className={`flex flex-col justify-center relative z-10 shrink-0 ${isHorizontal ? 'w-1/2 p-4' : 'w-full p-4 pb-5'} ${isCustomBg ? '' : 'bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.03)]'}`}
        style={{ backgroundColor: isCustomBg ? bgColor : 'white', minHeight: isHorizontal ? 'auto' : '90px' }}>
        <h3
          className={`font-black leading-[1.1] tracking-tight group-hover:text-primary transition-colors line-clamp-2 ${isHorizontal ? 'text-sm mb-1' : 'text-base mb-1'}`}
          style={{
            fontFamily: fonts.productName.family,
            color: txtColor,
            fontSize: `${(isHorizontal ? 1.1 : 1.25) * fonts.productName.scale}rem`
          }}
        >
          {product.name}
        </h3>
        {product.details && isDetailsVisible && (
          <p
            className={`opacity-50 font-extrabold uppercase tracking-tighter leading-none overflow-hidden text-ellipsis whitespace-nowrap ${isHorizontal ? 'text-[9px] mt-0.5' : 'text-[10px] mt-1'}`}
            style={{
              fontFamily: fonts.productDetails.family,
              fontSize: `${(isHorizontal ? 0.75 : 0.85) * fonts.productDetails.scale}rem`,
              color: txtColor
            }}
          >
            {product.details}
          </p>
        )}
      </div>
      {renderCartButton()}
    </div>
  );
});
ProductCard.displayName = 'ProductCard';
