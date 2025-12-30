import React, { useState } from 'react';
import { Controls } from './components/Controls';
import { FlyerPreview } from './components/FlyerPreview';
import { AppState, Product } from './types';
import { INITIAL_PRODUCTS } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    format: 'portrait',
    columns: 3,
    autoRows: true,
    zoom: 50, // Default zoom to fit nicely
    products: INITIAL_PRODUCTS,
    storeName: 'Visconde Carnes',
    validUntil: '10/12/2025'
  });

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addProduct = (product: Product) => {
    setState(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(25, Math.min(150, direction === 'in' ? prev.zoom + 10 : prev.zoom - 10))
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-body selection:bg-primary selection:text-white transition-colors duration-300">
      <Controls 
        state={state} 
        onUpdateState={updateState} 
        onAddProduct={addProduct}
      />
      
      <main className="flex-1 bg-gray-200 dark:bg-black relative flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* Floating Toolbar */}
        <div className="absolute top-6 flex gap-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg z-20 border border-gray-100 dark:border-gray-700">
          <button 
            onClick={() => handleZoom('out')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors" 
            title="Zoom Out"
          >
            <span className="material-icons-round">remove</span>
          </button>
          <span className="self-center text-sm font-medium min-w-[3rem] text-center">{state.zoom}%</span>
          <button 
            onClick={() => handleZoom('in')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors" 
            title="Zoom In"
          >
            <span className="material-icons-round">add</span>
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1"></div>
          <button 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-primary transition-colors" 
            title="Download Image"
            onClick={() => alert("Função de download seria implementada aqui (ex: html2canvas)")}
          >
            <span className="material-icons-round">download</span>
          </button>
        </div>

        {/* Canvas Container */}
        <div className="relative w-full h-full flex items-center justify-center overflow-auto p-10">
           <FlyerPreview state={state} />
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-xs mt-6 absolute bottom-4">
          Pré-visualização do arquivo final
        </p>
      </main>
    </div>
  );
};

export default App;
