import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import html2canvas from 'html2canvas';
import { Controls } from './components/Controls';
import { FlyerPreview } from './components/FlyerPreview';
import { AppState, Product } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { SEASONAL_THEMES, DEFAULT_HEADER, DEFAULT_FOOTER } from './seasonalThemes';
import { saveToLocalStorage, loadFromLocalStorage } from './utils';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    format: 'portrait',
    columns: 3,
    autoRows: true,
    zoom: 50,
    products: INITIAL_PRODUCTS,
    validUntil: '10/12/2025',
    seasonal: SEASONAL_THEMES.semana,
    header: DEFAULT_HEADER,
    footer: DEFAULT_FOOTER
  });

  const [isDownloading, setIsDownloading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setState(prev => ({ ...prev, ...saved }));
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
    setState(prev => ({
      ...prev,
      products: [...prev.products, product]
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

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('flyer-preview');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `flyer-${state.seasonal.theme}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao gerar imagem. Tente novamente.');
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
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ${isDownloading ? 'text-gray-400' : 'text-primary'}`}
              title="Download Image"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <span className="material-icons-round">{isDownloading ? 'hourglass_empty' : 'download'}</span>
            </button>
          </div>

          {/* Canvas Container */}
          <div className="relative w-full h-full flex items-center justify-center overflow-auto p-10">
            <SortableContext
              items={state.products.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <FlyerPreview state={state} />
            </SortableContext>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-xs mt-6 absolute bottom-4">
            Pré-visualização do arquivo final
          </p>
        </main>
      </div>
    </DndContext>
  );
};

export default App;
