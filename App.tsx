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
  const [state, setState] = useState<AppState>({
    paperSize: 'a4',
    orientation: 'portrait',
    columns: 3,
    autoRows: true,
    zoom: 50,
    pages: [{ id: 'page-1' }],
    products: INITIAL_PRODUCTS.map(p => ({ ...p, pageId: 'page-1' })),
    validUntil: '10/12/2025',
    seasonal: SEASONAL_THEMES.semana,
    header: DEFAULT_HEADER,
    footer: DEFAULT_FOOTER,
    fonts: {
      storeName: { family: 'Lilita One', scale: 1 },
      headerTitle: { family: 'Lilita One', scale: 1 },
      headerSubtitle: { family: 'Lilita One', scale: 1 },
      productName: { family: 'Roboto', scale: 1 },
      productDetails: { family: 'Roboto', scale: 1 },
      price: { family: 'Lilita One', scale: 1 },
      unit: { family: 'Roboto', scale: 1 }
    },
    layout: {
      cardHeight: 280,
      rowGap: 16,
      cardStyle: 'classic'
    }
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check system preference initially
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setState(prev => {
        let mergedFonts = prev.fonts;

        if (saved.fonts) {
          // Migration: Handle legacy string format
          if (typeof saved.fonts.price === 'string') {
            const migrated: any = {};
            Object.keys(saved.fonts).forEach(key => {
              // @ts-ignore
              migrated[key] = { family: saved.fonts[key], scale: 1 };
            });
            mergedFonts = { ...mergedFonts, ...migrated };
          } else {
            // Handle potentially missing scales in object format
            const fixedFonts = { ...saved.fonts };
            Object.keys(fixedFonts).forEach(key => {
              // @ts-ignore
              if (fixedFonts[key].scale === undefined) fixedFonts[key].scale = 1;
            });
            mergedFonts = { ...mergedFonts, ...fixedFonts };
          }
        }

        let pages = saved.pages || [{ id: 'page-1' }];
        let products = saved.products || [];
        // Migration: Ensure all products have a pageId
        if (products.length > 0 && !products[0].pageId) {
          products = products.map(p => ({ ...p, pageId: pages[0].id }));
        }

        const mergedLayout = saved.layout || {
          cardHeight: 280,
          rowGap: 16,
          cardStyle: 'classic'
        };

        // Migration: Handle legacy format
        let paperSize = saved.paperSize || 'a4';
        let orientation = saved.orientation || 'portrait';
        // @ts-ignore
        if (saved.format) {
          // @ts-ignore
          if (saved.format === 'story') {
            paperSize = 'story';
            orientation = 'portrait';
          }
        }

        return {
          ...prev,
          ...saved,
          paperSize,
          orientation,
          pages,
          products,
          fonts: mergedFonts,
          layout: mergedLayout
        };
      });
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addProduct = (product: Product) => {
    // Add to last page by default
    const lastPageId = state.pages[state.pages.length - 1]?.id || 'page-1';
    setState(prev => ({
      ...prev,
      products: [...prev.products, { ...product, pageId: lastPageId }]
    }));
  };

  const addPage = () => {
    setState(prev => ({
      ...prev,
      pages: [...prev.pages, { id: `page-${Date.now()}` }]
    }));
  };

  const removePage = (id: string) => {
    if (state.pages.length <= 1) return;
    setState(prev => {
      // Move products from deleted page to first page (safety)
      const productsToKeep = prev.products.map(p => p.pageId === id ? { ...p, pageId: prev.pages[0].id } : p);
      return {
        ...prev,
        products: productsToKeep,
        pages: prev.pages.filter(p => p.id !== id)
      };
    });
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
      const element = document.getElementById('flyer-preview');
      if (!element) return;

      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#ffffff'
      });

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
          alert("Imagem baixada! Compartilhe manualmente no WhatsApp.");
        }
      } catch (e) {
        console.log('Share cancelado ou erro:', e);
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Erro ao processar imagem.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 font-body selection:bg-primary selection:text-white transition-colors duration-300">
        <Controls
          state={state}
          onUpdateState={updateState}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onRemoveProduct={removeProduct}
        />

        <main className="flex-1 bg-gray-200 dark:bg-black relative flex flex-col items-center justify-center p-8 overflow-hidden">
          {/* Floating Toolbar */}
          <div className="absolute top-6 flex gap-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg z-20 border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
              title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
            >
              <span className="material-icons-round">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1"></div>
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
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 ${isDownloading ? 'text-gray-400' : 'text-primary'}`}
              title="Baixar Flyer (PDF/PNG)"
              onClick={() => setIsExportModalOpen(true)}
              disabled={isDownloading}
            >
              <span className="material-icons-round text-xl">{isDownloading ? 'hourglass_empty' : 'download'}</span>
              <span className="text-sm font-bold hidden sm:inline">Baixar</span>
            </button>
            <button
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${isDownloading ? 'text-gray-400' : 'text-green-600'}`}
              title="Compartilhar"
              onClick={handleShare}
              disabled={isDownloading}
            >
              <span className="material-icons-round">share</span>
            </button>
          </div>

          {/* Canvas Container */}
          <div className="relative w-full h-full flex items-center justify-center overflow-auto p-10 bg-gray-200 dark:bg-black">
            <FlyerPreview
              state={state}
              onAddPage={addPage}
              onRemovePage={removePage}
            />
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-xs mt-6 absolute bottom-4">
            Pré-visualização do arquivo final
          </p>
        </main>
      </div>
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} state={state} />
    </DndContext>
  );
};

export default App;
