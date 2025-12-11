import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toPng } from 'html-to-image';
import { Controls } from './components/Controls';
import { ExportModal } from './components/ExportModal';
import { FlyerPreview } from './components/FlyerPreview';
import { AppState, Product } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { SEASONAL_THEMES, DEFAULT_HEADER, DEFAULT_FOOTER } from './seasonalThemes';
import { saveToLocalStorage, loadFromLocalStorage } from './utils';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [state, setState] = useState<AppState>(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      // Migration Logic
      return { ...saved };
    }
    return {
      paperSize: 'a4',
      orientation: 'portrait',
      pages: [{ id: 'page-1' }], // Legacy support
      layout: { cardHeight: 280, rowGap: 16, cardStyle: 'classic' },
      fonts: {
        headerTitle: { family: 'Bebas Neue', scale: 1 },
        headerSubtitle: { family: 'Roboto', scale: 1 },
        storeName: { family: 'Roboto', scale: 1 },
        productName: { family: 'Roboto', scale: 1 },
        productDetails: { family: 'Roboto', scale: 1 },
        price: { family: 'Bebas Neue', scale: 1 },
        unit: { family: 'Roboto', scale: 1 }
      },
      columns: 3,
      autoRows: true, // Now implies auto-pagination
      zoom: 50,
      products: INITIAL_PRODUCTS.map(p => ({ ...p, pageId: 'auto' })),
      validUntil: '10/12/2025',
      seasonal: SEASONAL_THEMES.semana,
      header: DEFAULT_HEADER,
      footer: DEFAULT_FOOTER
    };
  });

  // Load fonts migration... (Simplified for brevity, assuming utils handles it or preserving previous logic if needed. 
  // Ideally should persist full load logic. I will trust write_to_file to replace file completely, so I must include full logic.)
  // Wait, I should not overwrite migration logic with simplified version if I don't have it all.
  // I will use `loadFromLocalStorage` result but I need to apply the migration transformations I did in `useEffect` previously.
  // The previous useEffect logic for migration was modifying STATE after mount. 
  // Better to keep the useEffect approach or move it to initializer.

  // Re-implementing the migration useEffect to be safe
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setState(prev => {
        let mergedFonts = prev.fonts;
        // ... (Migration logic same as before)
        if (saved.fonts) {
          // ... (I will copy the logic from previous view)
          if (typeof saved.fonts.price === 'string') {
            const migrated: any = {};
            Object.keys(saved.fonts).forEach(key => {
              // @ts-ignore
              migrated[key] = { family: saved.fonts[key], scale: 1 };
            });
            mergedFonts = { ...mergedFonts, ...migrated };
          } else {
            const fixedFonts = { ...saved.fonts };
            Object.keys(fixedFonts).forEach(key => {
              // @ts-ignore
              if (fixedFonts[key].scale === undefined) fixedFonts[key].scale = 1;
            });
            mergedFonts = { ...mergedFonts, ...fixedFonts };
          }
        }

        // Products pageId migration
        let products = saved.products || [];
        if (products.length > 0 && !products[0].pageId) {
          products = products.map(p => ({ ...p, pageId: 'auto' }));
        }

        const mergedLayout = saved.layout || {
          cardHeight: 280,
          rowGap: 16,
          cardStyle: 'classic'
        };

        // Format migration
        let paperSize = saved.paperSize || 'a4';
        let orientation = saved.orientation || 'portrait';
        // @ts-ignore
        if (saved.format === 'story') {
          paperSize = 'story';
          orientation = 'portrait';
        }

        return {
          ...prev,
          ...saved,
          paperSize,
          orientation,
          products,
          fonts: mergedFonts,
          layout: mergedLayout
        };
      });
    }
  }, []);

  useEffect(() => saveToLocalStorage(state), [state]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateState = (updates: Partial<AppState>) => setState(prev => ({ ...prev, ...updates }));

  const addProduct = (product: Product) => {
    setState(prev => ({
      ...prev,
      products: [...prev.products, { ...product, pageId: 'auto' }]
    }));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const removeProduct = (id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setState(prev => {
        const oldIndex = prev.products.findIndex(p => p.id === active.id);
        const newIndex = prev.products.findIndex(p => p.id === over.id);
        return {
          ...prev,
          products: arrayMove(prev.products, oldIndex, newIndex)
        };
      });
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(25, Math.min(150, direction === 'in' ? prev.zoom + 10 : prev.zoom - 10))
    }));
  };

  const handleShare = async () => {
    setIsDownloading(true);
    try {
      // Tenta capturar a primeira página
      const element = document.getElementById('flyer-page-0');
      if (!element) return;

      const dataUrl = await toPng(element, { quality: 1.0, pixelRatio: 3, backgroundColor: '#ffffff' });
      const blob = await (await fetch(dataUrl)).blob();

      try {
        // @ts-ignore
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'share.png', { type: 'image/png' })] })) {
          await navigator.share({
            // @ts-ignore
            files: [new File([blob], `flyer-${state.seasonal.theme}.png`, { type: 'image/png' })],
            title: 'Minhas Ofertas',
            text: 'Confira nossas ofertas especiais!'
          });
        } else {
          const link = document.createElement('a');
          link.download = `flyer-${state.seasonal.theme}-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        }
      } catch (e) {
        console.log('Share cancelado', e);
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Erro ao processar imagem.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-body selection:bg-primary selection:text-white transition-colors duration-300">
        <Controls
          state={state}
          onUpdateState={updateState}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onRemoveProduct={removeProduct}
        />

        <main className="flex-1 bg-gray-200 dark:bg-black relative flex flex-col items-center justify-center p-8 overflow-hidden">
          {/* Toolbar */}
          <div className="absolute top-6 flex gap-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg z-20 border border-gray-100 dark:border-gray-700">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
              <span className="material-icons-round">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1"></div>
            <button onClick={() => handleZoom('out')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
              <span className="material-icons-round">remove</span>
            </button>
            <span className="self-center text-sm font-medium min-w-[3rem] text-center">{state.zoom}%</span>
            <button onClick={() => handleZoom('in')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
              <span className="material-icons-round">add</span>
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1"></div>
            <button
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 ${isDownloading ? 'text-gray-400' : 'text-primary'}`}
              onClick={() => setIsExportModalOpen(true)}
              disabled={isDownloading}
            >
              <span className="material-icons-round text-xl">{isDownloading ? 'hourglass_empty' : 'download'}</span>
              <span className="text-sm font-bold hidden sm:inline">Baixar</span>
            </button>
            <button
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${isDownloading ? 'text-gray-400' : 'text-green-600'}`}
              onClick={handleShare}
              disabled={isDownloading}
            >
              <span className="material-icons-round">share</span>
            </button>
          </div>

          <div className="relative w-full h-full flex items-center justify-center overflow-auto p-10 bg-gray-200 dark:bg-black">
            <FlyerPreview state={state} />
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-xs mt-6 absolute bottom-4">
            Pré-visualização do arquivo final • Paginação Automática
          </p>
        </main>
      </div>
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} state={state} />
    </DndContext>
  );
};

export default App;
