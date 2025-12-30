import React from 'react';
import { AppState } from '../types';
import { ProductCard } from './ProductCard';

interface FlyerPreviewProps {
  state: AppState;
}

export const FlyerPreview: React.FC<FlyerPreviewProps> = ({ state }) => {
  const width = 1080;
  const height = state.format === 'portrait' ? 1440 : 1920;
  
  // Base scale calculation (to fit in view) adjusted by zoom
  const scale = (state.zoom / 100);

  return (
    <div 
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
        className="relative bg-gradient-to-b from-primary to-red-800 h-48 w-full flex items-center justify-between px-10 z-10 shadow-lg"
        style={{ clipPath: 'ellipse(130% 100% at 50% 0%)' }}
      >
        <div className="flex flex-col items-start transform -rotate-2">
          <h1 className="font-display text-6xl text-secondary drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] leading-none uppercase tracking-wide">
            Ofertas
          </h1>
          <h2 className="font-display text-4xl text-white drop-shadow-md leading-none uppercase">
            Da Semana
          </h2>
        </div>
        
        <div className="bg-white rounded-full p-4 shadow-xl border-[6px] border-secondary absolute left-1/2 transform -translate-x-1/2 top-8">
          <span className="material-icons-round text-7xl text-primary">restaurant</span>
        </div>

        <div className="flex flex-col items-end text-white">
          <span className="text-sm uppercase tracking-widest opacity-80 font-bold">Qualidade</span>
          <span className="font-black text-4xl uppercase tracking-tighter">Visconde</span>
          <span className="text-sm font-bold bg-secondary text-primary px-3 py-1 rounded-full mt-1 uppercase">Carnes</span>
        </div>
      </header>

      {/* Date Strip */}
      <div className="w-full bg-secondary h-12 flex items-center justify-center shadow-md relative z-0 mt-[-1px]">
        <span className="text-primary font-bold text-lg uppercase tracking-wider flex items-center gap-2">
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
              className={product.isHighlight ? 'col-span-2' : 'col-span-1'}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-white p-6 flex items-center justify-between z-10 relative shadow-[0_-5px_15px_rgba(0,0,0,0.2)]">
        <div className="absolute -top-4 left-0 w-full h-4 bg-primary" style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 100%)' }}></div>
        
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="material-icons-round text-base">location_on</span>
            <span className="font-medium">Rua Manoel José Pedro, 96 - Campinas</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="material-icons-round text-base">store</span>
            <span className="font-medium">Av. Benjamin Constant, 1015 - Campinas</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-lg font-bold mb-1">
            <span className="material-icons-round text-xl text-secondary">whatsapp</span>
            <span>(19) 99800-3041</span>
          </div>
           {/* Mock Social Media / Logo area */}
           <div className="flex gap-2 mt-1 opacity-80">
              <span className="material-icons-round">facebook</span>
              <span className="material-icons-round">camera_alt</span>
           </div>
        </div>
      </footer>
    </div>
  );
};
