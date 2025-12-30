import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Controls } from './components/Controls';
import { ExportModal } from './components/ExportModal';
import { FlyerPreview } from './components/FlyerPreview';
import { HistoryControls } from './components/HistoryControls';
import { ThemeToggle } from './components/ThemeToggle';
import { NotificationProvider } from './components/NotificationProvider';
import { TemplateManager } from './components/TemplateManager';
import { ShortcutsHelp } from './components/ShortcutsHelp';
import { StatusBar } from './components/StatusBar';
import { PreviewControls } from './components/PreviewControls';
import { AppState, Product } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { SEASONAL_THEMES, DEFAULT_HEADER, DEFAULT_FOOTER } from './seasonalThemes';
import { saveToLocalStorage, loadFromLocalStorage } from './utils';
import { useHistory } from './hooks/useHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDebounce } from './hooks/useDebounce';
import toast from 'react-hot-toast';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('visconde-dark-mode');
    return saved === 'true';
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);

  const initialAppState: AppState = useMemo(() => {
    const saved = loadFromLocalStorage();
    if (saved) return { ...saved };
    return {
      paperSize: 'a4',
      orientation: 'portrait',
      pages: [{ id: 'page-1' }],
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
      autoRows: true,
      zoom: 50,
      products: INITIAL_PRODUCTS.map(p => ({ ...p, pageId: 'auto' })),
      validUntil: '10/12/2025',
      seasonal: SEASONAL_THEMES.semana,
      header: DEFAULT_HEADER,
      footer: DEFAULT_FOOTER
    };
  }, []);

  const {
    state,
    setState: pushAppState,
    replaceState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory<AppState>(initialAppState);

  const historyDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const setAppState = useCallback((update: AppState | ((prev: AppState) => AppState)) => {
    // Immediate UI update without pushing to history
    replaceState(update);

    // Debounce pushing to history
    if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
    historyDebounceRef.current = setTimeout(() => {
      pushAppState(update);
    }, 500); // 500ms delay before creating a new history point
  }, [replaceState, pushAppState]);

  // Auto-save with debounce
  const debouncedState = useDebounce(state, 1000);
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      saveToLocalStorage(debouncedState);
      setIsSaving(false);
      setLastSaved(new Date());
    }, 100);
    return () => clearTimeout(timer);
  }, [debouncedState]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('visconde-dark-mode', isDarkMode.toString());
  }, [isDarkMode]);

  // Quick Export Function
  const handleQuickExport = async () => {
    toast.loading('Exportando...');
    // Trigger export with last used format (default PNG)
    setIsExportModalOpen(true);
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    { key: 'z', ctrl: true, handler: undo, description: 'Desfazer' },
    { key: 'y', ctrl: true, handler: redo, description: 'Refazer' },
    {
      key: 's', ctrl: true, handler: () => {
        saveToLocalStorage(state);
        toast.success('Alterações salvas!');
      }, description: 'Salvar'
    },
    { key: 'e', ctrl: true, handler: () => setIsExportModalOpen(true), description: 'Exportar' },
    { key: 'e', ctrl: true, shift: true, handler: handleQuickExport, description: 'Exportação Rápida' },
    { key: 't', ctrl: true, handler: () => setIsTemplateManagerOpen(true), description: 'Templates' },
    { key: '/', ctrl: true, handler: () => setIsShortcutsHelpOpen(true), description: 'Ajuda' },
    { key: 'f', ctrl: true, handler: () => setIsFullscreen(!isFullscreen), description: 'Tela Cheia' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setAppState(prev => {
        const oldIndex = prev.products.findIndex(p => p.id === active.id);
        const newIndex = prev.products.findIndex(p => p.id === over?.id);
        const newProducts = arrayMove(prev.products, oldIndex, newIndex);
        return { ...prev, products: newProducts };
      });
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setAppState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const addProduct = (product: Product) => {
    setAppState(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));
    toast.success('Produto adicionado!');
  };

  const removeProduct = (id: string) => {
    setAppState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
    toast.error('Produto removido');
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-body transition-colors duration-300">
        {/* Top bar with tools */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
          <HistoryControls
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />
          <ThemeToggle
            isDark={isDarkMode}
            onToggle={() => setIsDarkMode(!isDarkMode)}
          />
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-md px-3 py-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setAppState({ ...state, zoom: Math.max(25, state.zoom - 10) })}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
            >
              <span className="material-icons-round">remove</span>
            </button>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-10 text-center">{state.zoom}%</span>
            <button
              onClick={() => setAppState({ ...state, zoom: Math.min(150, state.zoom + 10) })}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
            >
              <span className="material-icons-round">add</span>
            </button>
          </div>
          <button
            onClick={() => setIsTemplateManagerOpen(true)}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Templates (Ctrl+T)"
          >
            <span className="material-icons-round text-gray-700 dark:text-gray-300">bookmark</span>
          </button>
          <button
            onClick={() => setIsShortcutsHelpOpen(true)}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Atalhos (Ctrl+?)"
          >
            <span className="material-icons-round text-gray-700 dark:text-gray-300">keyboard</span>
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors font-bold text-sm"
          >
            <span className="material-icons-round">download</span>
            EXPORTAR
          </button>
        </div>

        <div className="flex h-screen overflow-hidden pt-20">
          {/* Controls - Fixed Left */}
          <div className="w-[450px] min-w-[450px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto shadow-xl z-20">
            <Controls
              state={state}
              onUpdateState={(updates) => setAppState(prev => ({ ...prev, ...updates }))}
              onUpdateProduct={updateProduct}
              onAddProduct={addProduct}
              onRemoveProduct={removeProduct}
            />
          </div>

          {/* Preview Area */}
          <div className={`flex-1 bg-gray-100 dark:bg-gray-950 overflow-auto flex flex-col items-center p-8 scroll-smooth relative ${isFullscreen ? 'fixed inset-0 z-50' : ''
            }`}>
            <PreviewControls
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              onToggleGrid={() => setShowGrid(!showGrid)}
              onToggleRulers={() => setShowRulers(!showRulers)}
              isFullscreen={isFullscreen}
              showGrid={showGrid}
              showRulers={showRulers}
            />

            {/* Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <FlyerPreview state={state} />
            </DndContext>
          </div>
        </div>

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          state={state}
        />

        <TemplateManager
          isOpen={isTemplateManagerOpen}
          onClose={() => setIsTemplateManagerOpen(false)}
          onLoadTemplate={(newState) => setAppState(newState)}
          currentState={state}
        />

        <ShortcutsHelp
          isOpen={isShortcutsHelpOpen}
          onClose={() => setIsShortcutsHelpOpen(false)}
        />

        <StatusBar
          productCount={state.products.length}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />
      </div>
    </NotificationProvider>
  );
};

export default App;
