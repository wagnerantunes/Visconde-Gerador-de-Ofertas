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
import { AIStudio } from './components/AIStudio';
import { TemplateGallery } from './components/TemplateGallery';
import { AppState, Product } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { SEASONAL_THEMES, DEFAULT_HEADER, DEFAULT_FOOTER } from './seasonalThemes';
import { saveToLocalStorage, loadFromLocalStorage } from './utils';
import { useHistory } from './hooks/useHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDebounce } from './hooks/useDebounce';
import { useToast } from './contexts/ToastContext';
import { ShortcutBadge } from './components/ShortcutBadge';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('visconde-dark-mode');
    return saved === 'true';
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(() => {
    const saved = localStorage.getItem('visconde-compact-mode');
    return saved === 'true';
  });
  const { showToast } = useToast();

  /* State Initialization with safe defaults */
  const defaultState: AppState = useMemo(() => ({
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
  }), []);

  const initialAppState: AppState = useMemo(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      return {
        ...defaultState,
        ...saved,
        // Ensure critical nested objects are merged, not just replaced
        layout: { ...defaultState.layout, ...(saved.layout || {}) },
        fonts: { ...defaultState.fonts, ...(saved.fonts || {}) },
        header: { ...defaultState.header, ...(saved.header || {}) },
        footer: { ...defaultState.footer, ...(saved.footer || {}) },
      };
    }
    return defaultState;
  }, [defaultState]);

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

  // Compact mode effect
  useEffect(() => {
    if (isCompactMode) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
    localStorage.setItem('visconde-compact-mode', isCompactMode.toString());
  }, [isCompactMode]);

  // Quick Export Function
  const handleQuickExport = async () => {
    showToast('info', 'Abrindo exportação...');
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
        showToast('success', 'Alterações salvas!');
      }, description: 'Salvar'
    },
    { key: 'e', ctrl: true, handler: () => setIsExportModalOpen(true), description: 'Exportar' },
    { key: 'e', ctrl: true, shift: true, handler: handleQuickExport, description: 'Exportação Rápida' },
    { key: 't', ctrl: true, handler: () => setIsTemplateManagerOpen(true), description: 'Templates' },
    { key: 'g', ctrl: true, handler: () => setIsTemplateGalleryOpen(true), description: 'Galeria de Templates' },
    { key: 'a', ctrl: true, handler: () => setIsAIStudioOpen(true), description: 'AI Studio' },
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
    showToast('success', 'Produto adicionado!');
  };

  const removeProduct = (id: string) => {
    setAppState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
    showToast('error', 'Produto removido');
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-500">
        Carregando estado...
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-body transition-colors duration-300">
        {/* Top bar with tools - Modern GLASS design */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 glass px-4 py-2 rounded-2xl">
          <HistoryControls
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />
          <div className="w-px h-6 bg-black/5 dark:bg-white/5 mx-1" />
          <ThemeToggle
            isDark={isDarkMode}
            onToggle={() => setIsDarkMode(!isDarkMode)}
          />
          <button
            onClick={() => setIsCompactMode(!isCompactMode)}
            className={`p-2 rounded-xl border transition-all active:scale-90 ${isCompactMode
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
              : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            title={isCompactMode ? 'Modo Normal' : 'Modo Compacto'}
          >
            <span className="material-icons-round text-lg">
              {isCompactMode ? 'unfold_more' : 'unfold_less'}
            </span>
          </button>
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-xl p-1 px-2 border border-black/5 dark:border-white/5">
            <button
              onClick={() => setAppState({ ...state, zoom: Math.max(25, state.zoom - 10) })}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-gray-500 transition-colors"
            >
              <span className="material-icons-round text-lg">remove</span>
            </button>
            <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 w-10 text-center tracking-tighter">{state.zoom}%</span>
            <button
              onClick={() => setAppState({ ...state, zoom: Math.min(150, state.zoom + 10) })}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-gray-500 transition-colors"
            >
              <span className="material-icons-round text-lg">add</span>
            </button>
          </div>
          <div className="w-px h-6 bg-black/5 dark:bg-white/5 mx-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTemplateManagerOpen(true)}
              className="group relative p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-gray-600 dark:text-gray-400 transition-all active:scale-95"
              title="Templates (Ctrl+T)"
            >
              <span className="material-icons-round text-xl">bookmark</span>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ShortcutBadge keys={['Ctrl', 'T']} />
              </div>
            </button>
            <button
              onClick={() => setIsTemplateGalleryOpen(true)}
              className="group relative p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-gray-600 dark:text-gray-400 transition-all active:scale-95"
              title="Galeria de Templates (Ctrl+G)"
            >
              <span className="material-icons-round text-xl">auto_awesome</span>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ShortcutBadge keys={['Ctrl', 'G']} />
              </div>
            </button>
            <button
              onClick={() => setIsShortcutsHelpOpen(true)}
              className="group relative p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-gray-600 dark:text-gray-400 transition-all active:scale-95"
              title="Atalhos (Ctrl+?)"
            >
              <span className="material-icons-round text-xl">keyboard</span>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ShortcutBadge keys={['Ctrl', '?']} />
              </div>
            </button>
            <button
              onClick={() => setIsAIStudioOpen(true)}
              className="group relative p-2 bg-primary/10 hover:bg-primary/20 rounded-xl text-primary transition-all active:scale-95"
              title="AI Studio (Ctrl+A)"
            >
              <span className="material-icons-round text-xl">auto_awesome</span>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ShortcutBadge keys={['Ctrl', 'A']} />
              </div>
            </button>
          </div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="group relative ml-2 flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all text-[11px] font-black uppercase tracking-wider"
          >
            <span className="material-icons-round text-sm">download</span>
            Exportar
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <ShortcutBadge keys={['Ctrl', 'E']} />
            </div>
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

        <TemplateGallery
          isOpen={isTemplateGalleryOpen}
          onClose={() => setIsTemplateGalleryOpen(false)}
          onApplyTemplate={(templateState) => {
            setAppState({ ...state, ...templateState });
            showToast('success', 'Template aplicado com sucesso!');
          }}
        />

        <ShortcutsHelp
          isOpen={isShortcutsHelpOpen}
          onClose={() => setIsShortcutsHelpOpen(false)}
        />

        <AIStudio
          isOpen={isAIStudioOpen}
          onClose={() => setIsAIStudioOpen(false)}
          state={state}
          onUpdateState={(updates) => setAppState(prev => ({ ...prev, ...updates }))}
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
