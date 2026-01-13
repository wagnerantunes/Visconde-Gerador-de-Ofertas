import React, { useMemo } from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { QRCodeCanvas } from 'qrcode.react';
import { AppState } from '../types';
import { SortableProduct } from './SortableProduct';
import { getAvailablePageHeight, paginateProducts } from '../utils';
import { ProductCard } from './ProductCard'; // Added this import, as ProductCard is used later

interface FlyerPreviewProps {
  state: AppState;
  onAddToCart?: (id: string) => void;
  onEditProduct?: (id: string) => void;
  isViewerMode?: boolean;
}

// Helper to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr; // Already formatted
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const FlyerPreview: React.FC<FlyerPreviewProps> = ({ state, onAddToCart, onEditProduct, isViewerMode }) => {
  if (!state || !state.paperSize || !state.zoom) {
    return <div className="text-center p-10 text-gray-500">Carregando preview...</div>;
  }
  /* Dimensões em px */
  const SIZES: Record<string, { w: number; h: number }> = {
    a4: { w: 1240, h: 1754 },
    a3: { w: 1754, h: 2480 },
    tabloid: { w: 1100, h: 1700 },
    letter: { w: 1275, h: 1650 },
    story: { w: 1080, h: 1920 },
    'story-side': { w: 2160, h: 1920 },
    feed: { w: 1080, h: 1440 },
    'feed-side': { w: 2160, h: 1440 },
  };

  const baseSize = SIZES[state.paperSize] || SIZES.a4;
  const isLandscape = state.orientation === 'landscape';

  const width = isLandscape ? baseSize.h : baseSize.w;
  const height = isLandscape ? baseSize.w : baseSize.h;
  const scale = (state.zoom / 100);

  const { seasonal, header, footer, layout, backgroundTexture } = state;

  const getBackgroundStyle = (texture?: string): React.CSSProperties => {
    switch (texture) {
      case 'kraft':
        return {
          backgroundColor: '#e3c4a8',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/cardboard-flat.png")`,
          backgroundBlendMode: 'multiply'
        };
      case 'marble':
        return {
          backgroundColor: '#f5f5f5',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/white-diamond.png")`,
          backgroundBlendMode: 'soft-light'
        };
      case 'wood':
        return {
          backgroundColor: '#d2b48c',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")`,
          backgroundBlendMode: 'multiply'
        };
      case 'noise':
        return {
          backgroundColor: '#ffffff',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
          backgroundBlendMode: 'multiply'
        };
      case 'grid':
        return {
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        };
      default:
        return { backgroundColor: '#ffffff' };
    }
  };

  const bgStyle = getBackgroundStyle(backgroundTexture);

  // Lógica de Paginação Avançada (Suporte a Feed + Story)
  const pages = useMemo(() => {
    const isMixed = state.paperSize === 'feed-story';

    if (isMixed) {
      // 1. Feed Generation
      const feedH = getAvailablePageHeight('feed', state.orientation, !!header.customImage, !!footer.customImage, footer.showFooter !== false);
      const feedProducts = paginateProducts(state.products, feedH, (state.layout?.cardHeight || 280) + (state.layout?.rowGap || 16), state.columns);

      // 2. Story Generation (Secondary Settings)
      const sec = state.secondarySettings || { layout: state.layout, columns: 1, fonts: state.fonts };
      const storyH = getAvailablePageHeight('story', state.orientation, !!header.customImage, !!footer.customImage, footer.showFooter !== false);
      const storyProducts = paginateProducts(state.products, storyH, (sec.layout?.cardHeight || 280) + 16, sec.columns || 1);

      const feedSize = SIZES['feed'];
      const storySize = SIZES['story'];

      return [
        ...feedProducts.map((p, i) => ({
          products: p,
          width: feedSize.w,
          height: feedSize.h,
          settings: state,
          label: `Feed - Pág ${i + 1}`,
          ctxId: `feed-${i}`,
          isStory: false
        })),
        ...storyProducts.map((p, i) => ({
          products: p,
          width: storySize.w,
          height: storySize.h,
          settings: { ...state, ...sec, layout: sec.layout, columns: sec.columns, fonts: sec.fonts },
          label: `Story - Pág ${i + 1}`,
          ctxId: `story-${i}`,
          idSuffix: '-story',
          disabled: true,
          isStory: true
        }))
      ];
    }

    // Normal Pagination
    const availableHeight = getAvailablePageHeight(
      state.paperSize,
      state.orientation,
      !!header.customImage,
      !!footer.customImage,
      footer.showFooter !== false
    );
    const itemHeight = (layout?.cardHeight || 280) + (layout?.rowGap || 16);
    const pgs = paginateProducts(state.products, availableHeight, itemHeight, state.columns);

    return pgs.map((p, i) => ({
      products: p,
      width, // calculated from baseSize outside
      height,
      settings: state,
      label: `Página ${i + 1}`,
      ctxId: `page-${i}`,
      isStory: false
    }));
  }, [state.products, state.paperSize, state.orientation, height, width, layout, state.columns, state.secondarySettings, header.customImage, footer.customImage, seasonal, state.fonts]);


  return (
    <div className="flex gap-10 items-start pb-20 pt-4 px-4 overflow-x-auto">
      {pages.map((page, pageIndex) => (
        <div key={pageIndex} className="relative group flex flex-col items-center flex-shrink-0">
          {/* Page Label */}
          <div className={`absolute -top-8 left-0 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full ${page.isStory ? 'bg-purple-100 text-purple-600' : 'text-gray-400 bg-gray-100'
            }`}>
            {page.label}
          </div>

          <SortableContext
            id={page.ctxId}
            items={page.products.map(p => (page.idSuffix ? p.id + page.idSuffix : p.id))}
            strategy={rectSortingStrategy}
            disabled={page.disabled}
          >
            <div
              id={`flyer-page-${pageIndex}`}
              className="relative shadow-2xl overflow-hidden flex flex-col origin-top-left transition-all duration-300 ease-in-out bg-white"
              style={{
                width: `${page.width}px`,
                height: `${page.height}px`,
                transform: `scale(${scale})`,
                marginBottom: `-${page.height * (1 - scale)}px`,
                marginRight: `-${page.width * (1 - scale)}px`,
                fontFamily: "'Roboto', sans-serif",
                // Background handling for mixed mode? Assuming same texture for now, or could split if needed.
                ...getBackgroundStyle(backgroundTexture)
              }}
            >
              {/* Header Rendering */}
              {header.customImage ? (
                <div className="w-full relative z-10 shadow-lg">
                  <img src={header.customImage} alt="Cabeçalho" className="w-full h-auto object-cover block" />
                </div>
              ) : (
                <div
                  className="w-full h-48 flex flex-col items-center justify-center border-b-2 border-dashed border-gray-300 z-10 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${seasonal.primaryColor}20, ${seasonal.secondaryColor}20)` }}
                >
                  <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white flex flex-col items-center text-center max-w-[80%]">
                    <span className="material-icons-round text-6xl mb-3 text-primary opacity-80" style={{ color: seasonal.primaryColor }}>add_photo_alternate</span>
                    <h3 className="text-2xl font-black uppercase tracking-widest text-gray-800 leading-tight mb-2">
                      Suba seu Cabeçalho Personalizado
                    </h3>
                    <p className="text-sm font-bold text-gray-500 mb-4">Vá em 'Cabeçalho e Rodapé' {'>'} Upload Imagem</p>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1">Medida Sugerida</p>
                      <p className="text-lg font-black text-primary" style={{ color: seasonal.primaryColor }}>
                        {page.width} x 200 PX
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Date Strip */}
              <div
                className="w-full h-12 flex items-center justify-center shadow-md relative z-0 mt-[-1px]"
                style={{ backgroundColor: seasonal.secondaryColor }}
              >
                <span
                  className="font-bold text-lg uppercase tracking-wider flex items-center gap-2"
                  style={{ color: seasonal.primaryColor }}
                >
                  <span className="material-icons-round">calendar_today</span>
                  {state.validFrom
                    ? `Ofertas válidas de ${formatDate(state.validFrom)} até ${formatDate(state.validUntil)}`
                    : `Ofertas válidas até ${formatDate(state.validUntil)}`
                  } ou enquanto durarem os estoques
                </span>

                {/* Expiry Badges */}
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const expiry = new Date(state.validUntil + 'T23:59:59');
                  const diffTime = expiry.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  if (diffTime < 0) {
                    return (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-black animate-pulse flex items-center gap-1 border border-white/20">
                        <span className="material-icons-round text-sm">event_busy</span>
                        OFERTA ENCERRADA
                      </div>
                    );
                  } else if (diffDays <= 1) {
                    return (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black animate-bounce flex items-center gap-1 shadow-lg">
                        <span className="material-icons-round text-sm">priority_high</span>
                        ÚLTIMO DIA!
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Content Area */}
              <div className="flex-1 px-6 py-2 bg-cubes bg-fixed">
                <div
                  className="grid gap-x-4 auto-rows-min"
                  style={{
                    gridTemplateColumns: `repeat(${page.settings.columns}, minmax(0, 1fr))`,
                    rowGap: `${page.settings.layout?.rowGap ?? 16}px`
                  }}
                >
                  {page.products.map((product) => (
                    <SortableProduct
                      key={product.id + (page.idSuffix || '')}
                      product={product}
                      primaryColor={seasonal.primaryColor}
                      secondaryColor={seasonal.secondaryColor}
                      fonts={page.settings.fonts}
                      layout={page.settings.layout || { cardHeight: 280, rowGap: 16, cardStyle: 'classic' }}
                      columns={page.settings.columns}
                      onAddToCart={onAddToCart}
                      onEdit={onEditProduct}
                      isViewerMode={isViewerMode}
                      sortableId={page.idSuffix ? product.id + page.idSuffix : product.id}
                      disabled={page.disabled}
                    />
                  ))}
                </div>
              </div>

              {/* Footer Rendering */}
              {footer.showFooter !== false && (
                <>
                  {footer.customImage ? (
                    <div className="w-full relative shadow-[0_-5px_15px_rgba(0,0,0,0.2)] z-10 mt-auto">
                      <img src={footer.customImage} alt="Rodapé" className="w-full h-auto object-cover block" />
                    </div>
                  ) : (
                    <footer
                      className="w-full min-h-[160px] flex items-center justify-between px-10 z-10 relative border-t-2 border-dashed border-gray-300 mt-auto overflow-hidden"
                      style={{ background: `linear-gradient(to top, ${seasonal.primaryColor}20, ${seasonal.secondaryColor}20)` }}
                    >
                      <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white flex items-center gap-6 my-4">
                        <span className="material-icons-round text-5xl text-primary opacity-80" style={{ color: seasonal.primaryColor }}>add_photo_alternate</span>
                        <div className="text-left">
                          <h3 className="text-xl font-black uppercase tracking-widest text-gray-800 leading-tight mb-1">
                            Adicione seu Rodapé personalizado
                          </h3>
                          <p className="text-xs font-bold text-gray-500 mb-3">Vá em 'Cabeçalho e Rodapé' {'>'} Upload Imagem</p>
                          <div className="inline-block bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter mr-2">Medida Sugerida:</span>
                            <span className="text-sm font-black text-primary" style={{ color: seasonal.primaryColor }}>{page.width} x 140 PX</span>
                          </div>
                        </div>
                      </div>

                      {footer.showQrCode && (
                        <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
                          <QRCodeCanvas
                            value={`https://wa.me/${footer.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(footer.qrCodeText || 'Olá! Vi o encarte e gostaria de fazer um pedido.')}`}
                            size={70}
                            level="H"
                            includeMargin={false}
                          />
                          <div className="flex flex-col pr-2">
                            <span className="text-xs font-black leading-tight text-gray-800">PEÇA PELO</span>
                            <span className="text-sm font-black leading-tight text-green-600">WHATSAPP</span>
                            <span className="text-[10px] font-bold text-gray-400 mt-0.5">Aponte a câmera</span>
                          </div>
                        </div>
                      )}
                    </footer>
                  )}
                </>
              )}
            </div>
          </SortableContext>
        </div>
      ))}

      {/* Mini-Map / Navigator */}
      <div className="fixed bottom-24 right-4 z-40 group/map">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/20 scale-90 origin-bottom-right transition-all group-hover/map:scale-100 group-hover/map:p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Navegador</p>
          <div className="flex gap-2 max-w-[200px] overflow-x-auto pb-1 custom-scrollbar-thin">
            {pages.map((p, idx) => (
              <div
                key={idx}
                className="relative flex-shrink-0 w-12 aspect-[1/1.4] bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  const el = document.getElementById(`flyer-page-${idx}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }}
              >
                <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: state.seasonal.primaryColor }} />
                <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ backgroundColor: state.seasonal.primaryColor }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Pagination Info */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-xs font-medium pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Paginação Automática Ativa • {pages.length} Páginas
      </div>
    </div>
  );
};
