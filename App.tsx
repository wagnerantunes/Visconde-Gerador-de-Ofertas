import React, { useState } from 'react';
import html2canvas from 'html2canvas';
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
    storeName: 'Visconde',
    validUntil: '2025-12-17'
  });

  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('flyer-canvas');
      if (!element) {
        alert('Erro: Elemento não encontrado');
        return;
      }

      // Temporarily reset zoom to 100% for export
      const originalTransform = element.style.transform;
      element.style.transform = 'scale(1)';

      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Restore original zoom
      element.style.transform = originalTransform;

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const fileName = `ofertas-${state.storeName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.jpg`;
          link.href = url;
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);

    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao gerar imagem. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
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
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download Image"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <span className="material-icons-round animate-spin">sync</span>
            ) : (
              <span className="material-icons-round">download</span>
            )}
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
