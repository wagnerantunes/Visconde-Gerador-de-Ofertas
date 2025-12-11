import React from 'react';
import { AppState } from '../types';
import { ProductCard } from './ProductCard';

interface FlyerPreviewProps {
  state: AppState;
}

export const FlyerPreview: React.FC<FlyerPreviewProps> = ({ state }) => {
  const width = 1080;
  const height = state.format === 'portrait' ? 1440 : 1920;

  const scale = (state.zoom / 100);

  const { seasonal, header, footer } = state;

  return (
    <div
      id="flyer-preview"
      className="relative bg-white shadow-2xl overflow-hidden flex flex-col origin-center transition-all duration-300 ease-in-out"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `scale(${scale})`,
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      {/* Header */}
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
            style={{ color: seasonal.secondaryColor }}
          >
            {seasonal.title}
          </h1>
          <h2 className="font-display text-4xl text-white drop-shadow-md leading-none uppercase">
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
              color: seasonal.primaryColor
            }}
          >
            {header.storeName}
          </span>
        </div>
      </header>

      {/* Date Strip */}
      <div
        className="w-full h-12 flex items-center justify-center shadow-md relative z-0 mt-[-1px]"
        style={{ backgroundColor: seasonal.secondaryColor }}
      >
        <span
          className="font-bold text-lg uppercase tracking-wider flex items-center gap-2"
          style={{ color: seasonal.primaryColor }}
        >
          <span className="material-icons-round">calendar_today</span> Válido até {state.validUntil}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-cubes bg-fixed">
        <div
          className="grid gap-4 auto-rows-min"
          style={{
            gridTemplateColumns: `repeat(${state.columns}, minmax(0, 1fr))`
          }}
        >
          {state.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              primaryColor={seasonal.primaryColor}
              secondaryColor={seasonal.secondaryColor}
              className={product.isHighlight ? 'col-span-2' : 'col-span-1'}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
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
    </div>
  );
};
