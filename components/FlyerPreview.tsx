import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AppState, Product } from '../types';
import { ProductCard } from './ProductCard';

interface FlyerPreviewProps {
  state: AppState;
  onAddPage: () => void;
  onRemovePage: (id: string) => void;
}

export const FlyerPreview: React.FC<FlyerPreviewProps> = ({ state, onAddPage, onRemovePage }) => {
  /* Dimensões em px (aproximadamente 150 DPI para visualização web/export) */
  const SIZES: Record<string, { w: number; h: number }> = {
    a4: { w: 1240, h: 1754 },
    a3: { w: 1754, h: 2480 },
    letter: { w: 1275, h: 1650 },
    story: { w: 1080, h: 1920 },
    feed: { w: 1080, h: 1440 },
  };

  const baseSize = SIZES[state.paperSize] || SIZES.a4;
  const isLandscape = state.orientation === 'landscape';

  // Se for landscape, invertemos (exceto se for feed/quadrado, tanto faz)
  const width = isLandscape ? baseSize.h : baseSize.w;
  const height = isLandscape ? baseSize.w : baseSize.h;

  const scale = (state.zoom / 100);

  const { seasonal, header, footer } = state;

  return (
    <div className="flex gap-10 items-start pb-20 pt-4 px-4">
      {state.pages.map((page, index) => {
        const pageProducts = state.products.filter(p => p.pageId === page.id || (!p.pageId && index === 0));

        return (
          <div key={page.id} className="relative group flex flex-col items-center">
            {/* Remove Page Button */}
            {state.pages.length > 1 && (
              <button
                onClick={() => onRemovePage(page.id)}
                className="absolute -top-4 -right-4 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-50 hover:bg-red-600 hover:scale-110"
                title="Remover Página"
              >
                <span className="material-icons-round text-sm">close</span>
              </button>
            )}

            {/* Page Label */}
            <div className="absolute -top-8 left-0 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 py-1 px-3 rounded-full">
              Página {index + 1}
            </div>

            <SortableContext
              id={page.id}
              items={pageProducts.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                id={`flyer-page-${page.id}`} // Unique ID for export
                className="relative bg-white shadow-2xl overflow-hidden flex flex-col origin-top-left transition-all duration-300 ease-in-out"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  transform: `scale(${scale})`,
                  marginBottom: `-${height * (1 - scale)}px`, // Compensate whitespace
                  marginRight: `-${width * (1 - scale)}px`, // Compensate whitespace
                  fontFamily: "'Roboto', sans-serif"
                }}
              >
                {/* Header Condicional */}
                {header.customImage ? (
                  <div className="w-full relative z-10 shadow-lg">
                    <img src={header.customImage} alt="Cabeçalho" className="w-full h-auto object-cover block" />
                  </div>
                ) : (
                  <header
                    className="relative h-48 w-full flex items-center justify-between px-10 z-10 shadow-lg"
                    style={{
                      background: `linear-gradient(to bottom, ${seasonal.primaryColor}, ${seasonal.primaryColor}dd)`,
                      clipPath: 'ellipse(130% 100% at 50% 0%)'
                    }}
                  >
                    <div className="flex flex-col items-start transform -rotate-2">
                      <h1
                        className="font-display text-6xl drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] leading-none uppercase tracking-wide"
                        style={{
                          color: state.fonts.headerTitle.color || seasonal.secondaryColor,
                          fontFamily: state.fonts.headerTitle.family,
                          fontSize: `${3.75 * state.fonts.headerTitle.scale}rem`
                        }}
                      >
                        {seasonal.title}
                      </h1>
                      <h2
                        className="font-display text-4xl text-white drop-shadow-md leading-none uppercase"
                        style={{
                          color: state.fonts.headerSubtitle.color || 'white',
                          fontFamily: state.fonts.headerSubtitle.family,
                          fontSize: `${2.25 * state.fonts.headerSubtitle.scale}rem`
                        }}
                      >
                        {seasonal.subtitle}
                      </h2>
                    </div>

                    {/* Logo or Icon */}
                    {header.showLogo && header.logoUrl ? (
                      <div className="bg-white rounded-full p-4 shadow-xl border-[6px] absolute left-1/2 transform -translate-x-1/2 top-8" style={{ borderColor: seasonal.secondaryColor }}>
                        <img src={header.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                      </div>
                    ) : (
                      <div
                        className="bg-white rounded-full p-4 shadow-xl border-[6px] absolute left-1/2 transform -translate-x-1/2 top-8"
                        style={{ borderColor: seasonal.secondaryColor }}
                      >
                        <span
                          className="material-icons-round text-7xl"
                          style={{ color: seasonal.primaryColor }}
                        >
                          {seasonal.icon}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col items-end text-white">
                      <span className="text-sm uppercase tracking-widest opacity-80 font-bold">{header.title}</span>
                      <span className="font-black text-4xl uppercase tracking-tighter">{header.subtitle}</span>
                      <span
                        className="text-sm font-bold px-3 py-1 rounded-full mt-1 uppercase"
                        style={{
                          backgroundColor: seasonal.secondaryColor,
                          color: state.fonts.storeName?.color || seasonal.primaryColor,
                          fontFamily: state.fonts.storeName?.family || 'Roboto',
                          fontSize: `${((state.fonts.storeName?.scale || 1) * 0.875).toFixed(3)}rem`
                        }}
                      >
                        {header.storeName}
                      </span>
                    </div>
                  </header>
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
                    <span className="material-icons-round">calendar_today</span> Ofertas válidas até {state.validUntil} ou enquanto durarem os estoques
                  </span>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 bg-cubes bg-fixed">
                  <div
                    className="grid gap-x-4 auto-rows-min"
                    style={{
                      gridTemplateColumns: `repeat(${state.columns}, minmax(0, 1fr))`,
                      rowGap: `${state.layout?.rowGap ?? 16}px`
                    }}
                  >
                    {pageProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        primaryColor={seasonal.primaryColor}
                        secondaryColor={seasonal.secondaryColor}
                        fonts={state.fonts}
                        layout={state.layout}
                        style={{ gridColumn: `span ${product.cols || (product.isHighlight ? 2 : 1)}` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Footer Condicional */}
                {footer.customImage ? (
                  <div className="w-full relative shadow-[0_-5px_15px_rgba(0,0,0,0.2)] z-10 mt-auto">
                    <img src={footer.customImage} alt="Rodapé" className="w-full h-auto object-cover block" />
                  </div>
                ) : (
                  <footer
                    className="text-white p-6 flex items-center justify-between z-10 relative shadow-[0_-5px_15px_rgba(0,0,0,0.2)]"
                    style={{ backgroundColor: seasonal.primaryColor }}
                  >
                    <div
                      className="absolute -top-4 left-0 w-full h-4"
                      style={{
                        backgroundColor: seasonal.primaryColor,
                        clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 100%)'
                      }}
                    />

                    <div className="flex flex-col space-y-1">
                      {footer.addresses.map((addr, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="material-icons-round text-base">{idx === 0 ? 'location_on' : 'store'}</span>
                          <span className="font-medium">{addr}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 text-lg font-bold mb-1">
                        <span
                          className="material-icons-round text-xl"
                          style={{ color: seasonal.secondaryColor }}
                        >
                          whatsapp
                        </span>
                        <span>{footer.phone}</span>
                      </div>
                      {footer.showSocial && (
                        <div className="flex gap-2 mt-1 opacity-80">
                          <span className="material-icons-round">facebook</span>
                          <span className="material-icons-round">camera_alt</span>
                        </div>
                      )}
                    </div>
                  </footer>
                )}
              </div>
            </SortableContext>
          </div>
        );
      })}

      {/* Add Page Button */}
      <div
        className="flex flex-col items-center justify-center pt-8" // Compensate top label
      >
        <button
          onClick={onAddPage}
          className="flex flex-col items-center justify-center bg-gray-50 hover:bg-white text-gray-400 hover:text-primary border-2 border-dashed border-gray-300 hover:border-primary rounded-xl transition-all shadow-sm hover:shadow-lg group origin-top-left"
          style={{
            width: `${width * scale}px`,
            height: `${height * scale}px`,
            // transform: `scale(${scale})`, don't need scale if we set size manually
          }}
          title="Adicionar Nova Página ao Catálogo"
        >
          <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <span className="material-icons-round text-4xl text-primary">add</span>
          </div>
          <span className="font-bold uppercase tracking-wider text-sm">Adicionar Página</span>
        </button>
      </div>
    </div>
  );
};
