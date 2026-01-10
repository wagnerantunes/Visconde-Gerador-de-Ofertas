import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragDefaults,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { ProductCard } from './components/ProductCard';
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
import { ProductListModal } from './components/ProductListModal';

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

  const [isManageListOpen, setIsManageListOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* State Initialization with safe defaults */
  const defaultState: AppState = useMemo(() => ({
    paperSize: 'feed',
    orientation: 'portrait',
    pages: [{ id: 'page-1' }],
    layout: {
      cardHeight: 280,
      rowGap: 16,
      cardStyle: 'classic',
      priceStyle: 'star',
      stickerStyle: 'ribbon',
      borderRadius: 12,
      shadowIntensity: 0.1
    },
    fonts: {
      headerTitle: { family: 'Bebas Neue', scale: 1 },
      headerSubtitle: { family: 'Roboto', scale: 1 },
      storeName: { family: 'Roboto', scale: 1 },
      productName: { family: 'Roboto', scale: 1 },
      productDetails: { family: 'Roboto', scale: 1 },
      price: { family: 'Bebas Neue', scale: 1 },
      unit: { family: 'Roboto', scale: 1 },
      sticker: { family: 'Lilita One', scale: 1.1 }
    },
    columns: 3,
    autoRows: true,
    zoom: 50,
    products: INITIAL_PRODUCTS.map(p => ({ ...p, pageId: 'auto' })),
    validUntil: '10/12/2025',
    seasonal: SEASONAL_THEMES.semana,
    header: DEFAULT_HEADER,
    footer: DEFAULT_FOOTER,
    secondarySettings: {
      layout: {
        cardHeight: 280,
        rowGap: 16,
        cardStyle: 'classic',
        priceStyle: 'star',
        stickerStyle: 'ribbon',
        borderRadius: 12,
        shadowIntensity: 0.1
      },
      columns: 1,
      fonts: {
        headerTitle: { family: 'Bebas Neue', scale: 1 },
        headerSubtitle: { family: 'Roboto', scale: 1 },
        storeName: { family: 'Roboto', scale: 1 },
        productName: { family: 'Roboto', scale: 1 },
        productDetails: { family: 'Roboto', scale: 1 },
        price: { family: 'Bebas Neue', scale: 1 },
        unit: { family: 'Roboto', scale: 1 },
        sticker: { family: 'Lilita One', scale: 1.1 }
      }
    }
  }), []);

  const initialAppState: AppState = useMemo(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      return {
        ...defaultState,
        ...saved,
        // Ensure critical nested objects are merged, not just replaced
        layout: {
          cardHeight: 280,
          rowGap: 16,
          cardStyle: 'classic',
          priceStyle: 'star',
          stickerStyle: 'ribbon',
          stickerScale: 1.0,
          borderRadius: 12,
          shadowIntensity: 0.1,
          ...(saved.layout || {})
        },
        fonts: { ...defaultState.fonts, ...(saved.fonts || {}) },
        header: { ...defaultState.header, ...(saved.header || {}) },
        footer: { ...defaultState.footer, ...(saved.footer || {}) },
      };
    }
    return defaultState;
  }, [defaultState]);

  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);
  const [activeEditContext, setActiveEditContext] = useState<'feed' | 'story'>('feed');

  // Reset context when paperSize changes away from feed-story


  const [isViewerMode, setIsViewerMode] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart State for Web Flyer
  const [cart, setCart] = useState<{ id: string; quantity: number }[]>([]);

  const handleAddToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: productId, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const clearCart = () => setCart([]);

  // Check for View Mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get('view');

    if (viewId) {
      import('./services/layoutService').then(({ getLayoutById }) => {
        getLayoutById(viewId).then(layout => {
          if (layout && layout.state) {
            pushAppState(layout.state);
            setCurrentLayoutId(viewId);
            setIsViewerMode(true);
          }
          setIsInitialLoading(false);
        }).catch(() => setIsInitialLoading(false));
      });
    } else {
      setIsInitialLoading(false);
    }
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

  const handleShare = () => {
    if (!currentLayoutId) return;
    const url = `${window.location.origin}${window.location.pathname}?view=${currentLayoutId}`;
    navigator.clipboard.writeText(url);
    showToast('Link do panfleto interativo copiado!', 'success');
  };

  const historyDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const setAppState = useCallback((update: AppState | ((prev: AppState) => AppState)) => {
    // 1. Calculate newState once (using the value from the last render or functional update)
    // To be strictly safe with rapid updates, we use the value but we must be careful.
    // However, in this app's context, calculating it once is key to avoiding duplication.
    const newState = typeof update === 'function' ? update(state) : update;

    // 2. Immediate UI update
    replaceState(newState);

    // 3. Debounce pushing to history
    if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
    historyDebounceRef.current = setTimeout(() => {
      pushAppState(newState);
    }, 500);
  }, [state, replaceState, pushAppState]);

  // Auto-save with debounce
  const debouncedState = useDebounce(state, 1000);

  // Reset context when paperSize changes away from feed-story
  useEffect(() => {
    if (state.paperSize !== 'feed-story') setActiveEditContext('feed');
  }, [state.paperSize]);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

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
          if (result.id) setCurrentLayoutId(result.id);
          showToast('success', user ? 'Salvo na nuvem!' : 'Salvo localmente!');
        } else {
          showToast('error', `Erro ao salvar: ${result.error?.message || 'Erro desconhecido'}`);
          console.error('Save error details:', result.error);
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    // Normalize IDs (remove -story suffix if present)
    const activeId = String(active.id).replace('-story', '');
    const overId = String(over.id).replace('-story', '');

    if (activeId !== overId) {
      setAppState(prev => {
        const oldIndex = prev.products.findIndex(p => p.id === activeId);
        const newIndex = prev.products.findIndex(p => p.id === overId);

        // Guard against not found (-1)
        if (oldIndex === -1 || newIndex === -1) return prev;

        const newProducts = arrayMove(prev.products, oldIndex, newIndex);
        return { ...prev, products: newProducts };
      });
    }
  };

  // Improved Fullscreen Handler
  const toggleFullscreen = () => {
    if (isFullscreen) {
      setIsFullscreen(false);
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { }
    } else {
      setIsFullscreen(true);
      // Optional: try native fullscreen
      try {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
      } catch (e) { }
    }
  };

  // Sync state with native fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Carregando Ofertas...</p>
      </div>
    );
  }

  if (isViewerMode) {
    const cartItemsData = cart.map(item => {
      const product = state.products.find(p => p.id === item.id);
      return { ...product, quantity: item.quantity };
    }).filter(p => p.name);

    const cartTotal = cartItemsData.reduce((acc, item) => acc + ((Number(item.price) || 0) * item.quantity), 0);

    const handleCheckout = () => {
      const dateStr = new Date().toLocaleDateString('pt-BR');
      let message = `*📦 NOVO PEDIDO - ${dateStr}*\n`;
      message += `--------------------------\n`;

      cartItemsData.forEach(item => {
        message += `*${item.quantity}x* ${item.name} - R$ ${((Number(item.price) || 0) * item.quantity).toFixed(2)}\n`;
      });

      message += `--------------------------\n`;
      message += `*TOTAL: R$ ${cartTotal.toFixed(2)}*\n`;
      message += `--------------------------\n`;
      message += `_Vi essas ofertas no seu panfleto digital!_`;

      const phone = state.footer.socialLinks.whatsapp || state.footer.phone || '';
      const cleanPhone = phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 overflow-auto selection:bg-primary/20">
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('view');
              window.history.replaceState({}, '', url.toString());
              setIsViewerMode(false);
            }}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200 hover:bg-white transition-all text-xs font-black text-gray-700 uppercase"
          >
            <span className="material-icons-round text-primary">edit</span>
            Editar Panfleto
          </button>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 ${cart.length > 0 ? 'bg-primary text-white' : 'bg-gray-400 text-white opacity-50 pointer-events-none'}`}
        >
          <div className="relative">
            <span className="material-icons-round text-2xl">shopping_basket</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {cart.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            )}
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-black uppercase opacity-80">Seu Pedido</span>
            <span className="text-lg font-black">R$ {cartTotal.toFixed(2)}</span>
          </div>
        </button>

        {/* Cart Drawer Overlay */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
                <div className="flex items-center gap-3">
                  <span className="material-icons-round">shopping_cart</span>
                  <h2 className="font-black uppercase tracking-widest leading-none">Minha Cesta</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform">
                  <span className="material-icons-round">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-4">
                {cartItemsData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <span className="material-icons-round text-6xl mb-4">add_shopping_cart</span>
                    <p className="font-black uppercase text-sm">Sua cesta está vazia</p>
                    <p className="text-xs font-bold">Adicione produtos do panfleto</p>
                  </div>
                ) : (
                  cartItemsData.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 group">
                      <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black uppercase text-[11px] leading-tight line-clamp-2">{item.name}</h4>
                        <p className="text-primary font-black text-xs">R$ {item.price}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl shadow-sm border border-gray-100">
                        <button onClick={() => handleRemoveFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <span className="material-icons-round text-sm">remove</span>
                        </button>
                        <span className="font-black text-xs w-6 text-center">{item.quantity}</span>
                        <button onClick={() => handleAddToCart(item.id!)} className="text-gray-400 hover:text-primary transition-colors">
                          <span className="material-icons-round text-sm">add</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItemsData.length > 0 && (
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Total Estimado</span>
                    <span className="text-3xl font-black text-primary">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#25D366]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <span className="material-icons-round">message</span>
                    Pedir via WhatsApp
                  </button>
                  <button onClick={clearCart} className="w-full py-2 text-[9px] font-black text-gray-400 uppercase hover:text-red-500 transition-colors">
                    Limpar Cesta
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <FlyerPreview state={state} onAddToCart={handleAddToCart} isViewerMode={isViewerMode} />
        <div className="mt-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
          Gerado por Visconde • {new Date().getFullYear()}
        </div>
      </div>
    );
  }

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
              try {
                // Generate thumbnail for cloud preview
                let previewUrl = '';
                const flyerElement = document.getElementById('flyer-page-0');
                if (flyerElement) {
                  previewUrl = await toJpeg(flyerElement, {
                    quality: 0.6,
                    pixelRatio: 0.5, // Low res thumbnail
                    backgroundColor: '#ffffff'
                  });
                }

                const result = await saveLayout(state, user?.id, 'Layout Atual', previewUrl);
                setLastSaved(new Date());
                if (result.success) {
                  showToast('success', user ? 'Salvo na nuvem!' : 'Salvo localmente!');
                } else {
                  throw result.error;
                }
              } catch (err: any) {
                showToast('error', `Erro ao salvar: ${err?.message || 'Erro desconhecido'}`);
                console.error('Save error details:', err);
              } finally {
                setIsSaving(false);
              }
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={user ? "Salvar na Nuvem" : "Salvar Local"}
          >
            <span className="material-icons-round text-[18px]">{user ? "cloud_upload" : "save"}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('⚠️ Tem certeza que deseja limpar tudo?\n\nTodos os produtos e configurações atuais serão perdidos e não poderão ser recuperados.')) {
                const { clearSessionStorage } = require('./utils');
                clearSessionStorage();
                showToast('success', 'Sessão limpa! Recarregando...');
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Limpar tudo e começar nova sessão"
          >
            <span className="material-icons-round text-[18px]">restart_alt</span>
          </button>

          {/* Paper Size */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-[10px] font-bold uppercase transition-colors text-gray-600 dark:text-gray-300">
              {state.paperSize === 'feed-story' ? 'FEED + STORY' : state.paperSize.toUpperCase()}
              <span className="material-icons-round text-[12px]">expand_more</span>
            </button>
            {/* Fix: Added invisible bridge (pb-2) and removed margin to prevent closing on hover */}
            <div className="absolute top-full right-0 pt-2 w-40 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-1.5 grid gap-0.5">
                  {[
                    { id: 'feed', label: 'Feed (Post)' },
                    { id: 'story', label: 'Story (Tela Cheia)' },
                    { id: 'feed-story', label: 'Feed + Story (Misto)' },
                    { id: 'tabloid', label: 'Tablóide (11x17")' },
                    { id: 'a4', label: 'Papel A4' },
                    { id: 'a3', label: 'Papel A3' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setAppState({ ...state, paperSize: opt.id as any })}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase flex justify-between items-center ${state.paperSize === opt.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                      {opt.label}
                      {state.paperSize === opt.id && <span className="material-icons-round text-[12px]">check</span>}
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
          </div>

          {/* Feed/Story Context Switcher */}
          {state.paperSize === 'feed-story' && (
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 ml-2 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveEditContext('feed')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${activeEditContext === 'feed'
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <span className="material-icons-round text-[12px]">view_agenda</span>
                Feed
              </button>
              <button
                onClick={() => setActiveEditContext('story')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${activeEditContext === 'story'
                  ? 'bg-white dark:bg-gray-700 text-purple-500 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <span className="material-icons-round text-[12px]">amp_stories</span>
                Story
              </button>
            </div>
          )}

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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-3 left-3 z-50 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 md:hidden"
        >
          <span className="material-icons-round text-gray-700 dark:text-white">menu</span>
        </button>

        <div className="flex h-screen overflow-hidden pt-20">
          {/* Controls - Responsive Wrapper */}
          <div className="md:w-[450px] md:min-w-[450px] h-full z-20 transition-all duration-300">
            <Controls
              state={state.paperSize === 'feed-story' && activeEditContext === 'story' ? {
                ...state,
                layout: state.secondarySettings?.layout || state.layout,
                columns: state.secondarySettings?.columns || state.columns,
                fonts: state.secondarySettings?.fonts || state.fonts,
              } : state}
              onUpdateState={(updates) => {
                if (state.paperSize === 'feed-story' && activeEditContext === 'story') {
                  setAppState(prev => {
                    // Ensure secondarySettings object exists
                    const currentSecondary = prev.secondarySettings || {
                      layout: prev.layout,
                      columns: prev.columns,
                      fonts: prev.fonts
                    };

                    return {
                      ...prev,
                      secondarySettings: {
                        ...currentSecondary,
                        layout: updates.layout ? { ...currentSecondary.layout, ...updates.layout } : currentSecondary.layout,
                        columns: updates.columns ?? currentSecondary.columns,
                        fonts: updates.fonts ? { ...currentSecondary.fonts, ...updates.fonts } : currentSecondary.fonts,
                      }
                    };
                  });
                } else {
                  setAppState(prev => ({ ...prev, ...updates }));
                }
              }}
              onUpdateProduct={updateProduct}
              onAddProduct={addProduct}
              onRemoveProduct={removeProduct}
              onRemoveProduct={removeProduct}
              onOpenManageList={() => setIsManageListOpen(true)}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Preview Area */}
          <div className={`flex-1 bg-gray-100 dark:bg-gray-950 overflow-auto flex flex-col items-center p-8 scroll-smooth relative ${isFullscreen ? 'fixed inset-0 z-[100] !p-0 !bg-gray-950' : ''
            }`}>
            {/* User Profile / Login - Top Right */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-1.5 pr-3 rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 group transition-all hover:pr-4">
                  <img
                    src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
                    className="w-8 h-8 rounded-full border border-primary/20 shadow-sm"
                    alt="Perfil"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-900 dark:text-gray-100 truncate max-w-[100px] leading-tight">
                      {user.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={signOut}
                      className="text-[8px] text-red-500 hover:text-red-600 font-bold uppercase tracking-tighter text-left leading-none"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all animate-slideInRight"
                >
                  <span className="material-icons-round text-lg">account_circle</span>
                  <span className="text-[11px] font-black uppercase tracking-wider">Entrar</span>
                </button>
              )}
            </div>

            {/* Rulers Overlay */}
            {showRulers && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {/* Horizontal Ruler */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-white/10 border-b border-primary/20 flex items-end">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className={`shrink-0 border-l border-primary/20 ${i % 10 === 0 ? 'h-full' : (i % 5 === 0 ? 'h-2/3' : 'h-1/3')}`} style={{ width: '20px' }} />
                  ))}
                </div>
                {/* Vertical Ruler */}
                <div className="absolute top-0 left-0 bottom-0 w-4 bg-white/10 border-r border-primary/20 flex flex-col items-end">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className={`shrink-0 border-t border-primary/20 ${i % 10 === 0 ? 'w-full' : (i % 5 === 0 ? 'w-2/3' : 'w-1/3')}`} style={{ height: '20px' }} />
                  ))}
                </div>
              </div>
            )}
            <PreviewControls
              onToggleFullscreen={toggleFullscreen}
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
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <FlyerPreview
                state={state}
                onAddToCart={handleAddToCart}
                onEditProduct={(id) => {
                  setEditingProductId(id);
                  setIsManageListOpen(true);
                }}
                isViewerMode={isViewerMode}
              />
              <DragOverlay>
                {activeDragId ? (
                  <div style={{ transform: 'scale(0.9)', opacity: 0.9 }}>
                    <ProductCard
                      product={state.products.find(p => p.id === activeDragId!.replace('-story', ''))!}
                      primaryColor={state.seasonal.primaryColor}
                      secondaryColor={state.seasonal.secondaryColor}
                      fonts={state.fonts}
                      layout={state.layout} // Use current layout context? Or default? Using default for drag preview is safer/easier
                      style={{ width: '100%', height: '100%' }}
                      isViewerMode={true} // cleaner look for drag
                    />
                  </div>
                ) : null}
              </DragOverlay>
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
          onLoad={(newState, id) => {
            setAppState(newState);
            if (id) setCurrentLayoutId(id);
          }}
        />

        <ProductListModal
          isOpen={isManageListOpen}
          initialEditingId={editingProductId}
          onClose={() => {
            setIsManageListOpen(false);
            setEditingProductId(null);
          }}
          products={state.products}
          onUpdateProduct={updateProduct}
          onRemoveProduct={removeProduct}
          onReorderProducts={(newProducts) => setAppState(prev => ({ ...prev, products: newProducts }))}
          onClearAll={() => setAppState(prev => ({ ...prev, products: [] }))}
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
          onShare={handleShare}
          hasLayoutId={!!currentLayoutId}
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
