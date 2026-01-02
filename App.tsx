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
import { loadFromLocalStorage } from './utils';
import { saveLayout } from './services/layoutService';
import { useHistory } from './hooks/useHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDebounce } from './hooks/useDebounce';
import { useToast } from './contexts/ToastContext';
import { ShortcutBadge } from './components/ShortcutBadge';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { LoadLayoutModal } from './components/LoadLayoutModal';

const AppContent: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('visconde-dark-mode');
    return saved === 'true';
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [isLoadLayoutModalOpen, setIsLoadLayoutModalOpen] = useState(false);
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
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
      // NOTE: Auto-save currently only saves to local storage to avoid spamming the DB
      saveLayout(debouncedState); // layoutService saves to local by default
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
    setIsExportModalOpen(true);
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    { key: 'z', ctrl: true, handler: undo, description: 'Desfazer' },
    { key: 'y', ctrl: true, handler: redo, description: 'Refazer' },
    {
      key: 's', ctrl: true, handler: async () => {
        setIsSaving(true);
        const result = await saveLayout(state, user?.id);
        setIsSaving(false);
        setLastSaved(new Date());

        if (result.success) {
          showToast('success', user ? 'Salvo na nuvem!' : 'Salvo localmente!');
        } else {
          showToast('error', 'Erro ao salvar.');
        }
      }, description: 'Salvar'
    },
    {
      key: 'o', ctrl: true, handler: () => {
        if (!user) {
          showToast('info', 'Login necessário para abrir layouts.');
          setIsAuthModalOpen(true);
        } else {
          setIsLoadLayoutModalOpen(true);
        }
      }, description: 'Abrir Layout'
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
      <div className="min-h-screen font-body transition-colors duration-300 bg-background-light dark:bg-background-dark selection:bg-primary/20 selection:text-primary">
        {/* Noise overlay handled in index.css body */}

        {/* Top bar - Clean Minimal Toolbar */}
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-lg shadow-black/5 dark:shadow-black/30 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl">
          <HistoryControls
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />

          <button
            onClick={() => {
              if (!user) {
                showToast('info', 'Faça login para abrir layouts da nuvem.');
                setIsAuthModalOpen(true);
                return;
              }
              setIsLoadLayoutModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Meus Layouts"
          >
            <span className="material-icons-round text-[18px]">folder_open</span>
          </button>

          <button
            onClick={async () => {
              setIsSaving(true);
              const result = await saveLayout(state, user?.id);
              setIsSaving(false);
              setLastSaved(new Date());
              if (result.success) {
                showToast('success', user ? 'Salvo na nuvem!' : 'Salvo localmente!');
              } else {
                showToast('error', 'Erro ao salvar.');
              }
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={user ? "Salvar na Nuvem" : "Salvar Local"}
          >
            <span className="material-icons-round text-[18px]">{user ? "cloud_upload" : "save"}</span>
          </button>

          {/* Paper Size */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-[10px] font-bold uppercase transition-colors text-gray-600 dark:text-gray-300">
              {state.paperSize.toUpperCase()}
              <span className="material-icons-round text-[12px]">expand_more</span>
            </button>
            <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-1.5 grid gap-0.5">
                {['a4', 'a3', 'letter', 'story', 'feed'].map(size => (
                  <button
                    key={size}
                    onClick={() => setAppState({ ...state, paperSize: size as any })}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase flex justify-between items-center ${state.paperSize === size
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                  >
                    {size}
                    {state.paperSize === size && <span className="material-icons-round text-[12px]">check</span>}
                  </button>
                ))}
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-0.5" />
                <div className="flex gap-0.5">
                  <button
                    onClick={() => setAppState({ ...state, orientation: 'portrait' })}
                    className={`flex-1 flex items-center justify-center gap-0.5 py-1 rounded-md text-[9px] font-bold uppercase ${state.orientation === 'portrait' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
                  >
                    <span className="material-icons-round text-[12px]">crop_portrait</span>
                  </button>
                  <button
                    onClick={() => setAppState({ ...state, orientation: 'landscape' })}
                    className={`flex-1 flex items-center justify-center gap-0.5 py-1 rounded-md text-[9px] font-bold uppercase ${state.orientation === 'landscape' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
                  >
                    <span className="material-icons-round text-[12px]">crop_landscape</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Zoom - Compact */}
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg px-1">
            <button onClick={() => setAppState({ ...state, zoom: Math.max(25, state.zoom - 10) })} className="p-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <span className="material-icons-round text-[14px]">remove</span>
            </button>
            <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300 w-7 text-center">{state.zoom}%</span>
            <button onClick={() => setAppState({ ...state, zoom: Math.min(150, state.zoom + 10) })} className="p-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <span className="material-icons-round text-[14px]">add</span>
            </button>
          </div>

          <ThemeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />

          <button onClick={() => setIsCompactMode(!isCompactMode)} className={`p-1.5 rounded-lg transition-colors ${isCompactMode ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`} title="Modo Compacto">
            <span className="material-icons-round text-[16px]">{isCompactMode ? 'unfold_more' : 'unfold_less'}</span>
          </button>

          {/* Quick Actions */}
          <button onClick={() => setIsTemplateManagerOpen(true)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Templates">
            <span className="material-icons-round text-[16px]">bookmark</span>
          </button>
          <button onClick={() => setIsAIStudioOpen(true)} className="p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors" title="AI Studio">
            <span className="material-icons-round text-[16px]">auto_awesome</span>
          </button>

          {/* Export Button */}
          <button onClick={() => setIsExportModalOpen(true)} className="ml-1 flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all text-[10px] font-bold uppercase">
            <span className="material-icons-round text-[14px]">download</span>
            Exportar
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

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        <LoadLayoutModal
          isOpen={isLoadLayoutModalOpen}
          onClose={() => setIsLoadLayoutModalOpen(false)}
          onLoad={(newState) => setAppState(newState)}
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
