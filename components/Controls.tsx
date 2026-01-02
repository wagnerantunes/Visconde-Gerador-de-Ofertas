import React, { useState, useRef } from 'react';
import { AppState, Product } from '../types';
import { MOCK_IMAGES } from '../constants';
import { SEASONAL_THEMES } from '../seasonalThemes';
import { parseProductList, imageToBase64, findProductImage } from '../utils';
import { ProductList } from './ProductList';
import { ImageGalleryModal } from './ImageGalleryModal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Select } from './ui/Select';

import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';

interface ControlsProps {
  state: AppState;
  onUpdateState: (updates: Partial<AppState>) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onRemoveProduct: (id: string) => void;
}

type TabType = 'tema' | 'design' | 'moldura' | 'produtos';

export const Controls: React.FC<ControlsProps> = ({
  state,
  onUpdateState,
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct
}) => {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tema');
  const [activeFontTarget, setActiveFontTarget] = useState<keyof typeof state.fonts>('price');
  const [productTab, setProductTab] = useState<'single' | 'batch' | 'list' | 'import'>('single');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMode, setSyncMode] = useState<'merge' | 'replace'>('merge');
  const [tempScriptUrl, setTempScriptUrl] = useState(state.googleScriptUrl || 'https://script.google.com/macros/s/AKfycbzy6IUgIPzIYtz8DmOGHqNm4kque5kxGNz4daboARq4qfznaKTC5r1Q2vzX_-CyLsKK/exec');
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    unit: 'KG',
    isHighlight: false,
    details: '',
    image: ''
  });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;

    onAddProduct({
      id: Date.now().toString(),
      name: newProduct.name,
      price: newProduct.price,
      unit: newProduct.unit || 'KG',
      isHighlight: !!newProduct.isHighlight,
      details: newProduct.details || '',
      image: newProduct.image || findProductImage(newProduct.name || '')
    });

    setNewProduct({
      name: '',
      price: 0,
      unit: 'KG',
      isHighlight: false,
      details: '',
      image: ''
    });
  };

  const handleBatchAdd = () => {
    const products = parseProductList(batchText);

    products.forEach(p => {
      onAddProduct({
        id: Date.now().toString() + Math.random(),
        name: p.name,
        price: p.price,
        unit: p.unit,
        isHighlight: false,
        details: '',
        image: findProductImage(p.name)
      });
    });

    setBatchText('');
    setProductTab('list');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await imageToBase64(file);
        setNewProduct({ ...newProduct, image: base64 });
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await imageToBase64(file);
        onUpdateState({
          header: { ...state.header, logoUrl: base64, showLogo: true }
        });
      } catch (error) {
        console.error('Erro ao carregar logo:', error);
      }
    }
  };

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await imageToBase64(file);
        onUpdateState({ header: { ...state.header, customImage: base64 } });
      } catch (error) { console.error('Erro header img', error); }
    }
  };

  const handleFooterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await imageToBase64(file);
        onUpdateState({ footer: { ...state.footer, customImage: base64 } });
      } catch (error) { console.error('Erro footer img', error); }
    }
  };

  const handleSyncGoogleSheets = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    // Save the URL to state if changed
    if (tempScriptUrl !== state.googleScriptUrl) {
      onUpdateState({ googleScriptUrl: tempScriptUrl });
    }

    try {
      const response = await fetch(tempScriptUrl);

      if (!response.ok) {
        throw new Error('Erro ao conectar com o Google Sheets. Verifique a URL do Script.');
      }

      const data = await response.json();

      if (!data.sucesso || !data.ofertas) {
        throw new Error('Formato de dados inválido ou planilha vazia');
      }

      // Mapear os dados do Google Sheets para o formato Product
      const incomingProducts: Product[] = data.ofertas.map((oferta: any) => ({
        id: Date.now().toString() + Math.random(),
        name: oferta.produto || '',
        price: oferta.preco || 0,
        unit: oferta.unidade || oferta.obs || 'KG',
        isHighlight: false,
        details: oferta.categoria || '',
        image: findProductImage(oferta.produto || ''),
        pageId: 'auto'
      }));

      // Adicionar os produtos conforme o modo
      const products = syncMode === 'replace'
        ? incomingProducts
        : [...state.products, ...incomingProducts];

      onUpdateState({ products });

      setSyncMessage({
        type: 'success',
        text: `${incomingProducts.length} produtos ${syncMode === 'replace' ? 'importados (lista substituída)' : 'adicionados'} com sucesso!`
      });

      setProductTab('list');
      setTimeout(() => setSyncMessage(null), 5000);

    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      setSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao sincronizar com Google Sheets'
      });
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const tabs = [
    { id: 'tema' as TabType, label: 'Tema', icon: 'palette' },
    { id: 'design' as TabType, label: 'Design', icon: 'brush' },
    { id: 'moldura' as TabType, label: 'Cabeçalho e Rodapé', icon: 'crop_free' },
    { id: 'produtos' as TabType, label: 'Ofertas', icon: 'inventory_2' }
  ];

  return (
    <aside className="w-full max-w-md flex flex-col border-r border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      {/* Modern Tabs (Segmented Control) - Flush to Top */}
      <div className="shrink-0 px-4 pt-3 pb-0">
        <div className="flex p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl overflow-x-auto hide-scrollbar border border-gray-200/50 dark:border-gray-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm scale-100 ring-1 ring-black/5 dark:ring-white/5'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 scale-95 opacity-70 hover:opacity-100'
                }`}
            >
              <span className={`material-icons-round text-lg mb-1 transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-gray-400'}`}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* TEMA TAB */}
        {
          activeTab === 'tema' && (
            <div className="animate-in fade-in duration-300 slide-in-from-bottom-2 space-y-4">
              {/* Tema Sazonal */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Tema Sazonal
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(SEASONAL_THEMES).map(theme => (
                    <button
                      key={theme.theme}
                      onClick={() => onUpdateState({ seasonal: theme })}
                      className={`group relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${state.seasonal.theme === theme.theme
                        ? 'border-primary ring-2 ring-primary/20 scale-110'
                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:scale-105'
                        }`}
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                      }}
                      title={theme.subtitle}
                    >
                      {state.seasonal.theme === theme.theme && (
                        <span className="material-icons-round text-white text-sm drop-shadow-md">check</span>
                      )}
                      <span className="sr-only">{theme.title}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Validade */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Validade das Ofertas
                </h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-round text-primary text-sm">event</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">De</span>
                    <input
                      type="date"
                      value={state.validFrom || ''}
                      onChange={(e) => onUpdateState({ validFrom: e.target.value })}
                      className="flex-1 px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-icons-round text-primary text-sm">event_available</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Até</span>
                    <input
                      type="date"
                      value={state.validUntil?.includes('/') ? '' : state.validUntil || ''}
                      onChange={(e) => onUpdateState({ validUntil: e.target.value })}
                      className="flex-1 px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Exibido no rodapé do flyer
                  </p>
                </div>
              </section>
            </div>
          )
        }

        {/* DESIGN TAB */}
        {
          activeTab === 'design' && (
            <div className="animate-in fade-in duration-300 slide-in-from-bottom-2 space-y-4">

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Grid & Colunas
                </h3>
                <div>
                  <label className="flex justify-between items-center text-xs font-medium mb-1.5">
                    <span>Colunas</span>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={state.columns}
                      onChange={(e) => onUpdateState({ columns: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) })}
                      className="w-10 text-center text-[10px] font-bold bg-primary/10 text-primary px-1 py-0.5 rounded border-0 focus:ring-1 focus:ring-primary"
                    />
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={state.columns}
                    onChange={(e) => onUpdateState({ columns: parseInt(e.target.value) })}
                    className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Layout do Flyer
                </h3>

                <div className="space-y-3">
                  {/* Card Height */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Altura do Produto</span>
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number"
                          min="150"
                          max="400"
                          step="1"
                          value={state.layout?.cardHeight || 280}
                          onChange={(e) => onUpdateState({
                            layout: { ...(state.layout || { rowGap: 16, cardStyle: 'classic' }), cardHeight: Math.min(400, Math.max(150, parseInt(e.target.value) || 280)) }
                          })}
                          className="w-12 text-center text-[10px] font-bold bg-primary/10 text-primary px-1 py-0.5 rounded border-0 focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-[10px] text-primary font-medium">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="400"
                      step="1"
                      value={state.layout?.cardHeight || 280}
                      onChange={(e) => onUpdateState({
                        layout: { ...(state.layout || { rowGap: 16, cardStyle: 'classic' }), cardHeight: parseInt(e.target.value) }
                      })}
                      className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Row Gap */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Espaçamento Vertical</span>
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={state.layout?.rowGap !== undefined ? state.layout.rowGap : 16}
                          onChange={(e) => onUpdateState({
                            layout: { ...(state.layout || { cardHeight: 280, cardStyle: 'classic' }), rowGap: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }
                          })}
                          className="w-12 text-center text-[10px] font-bold bg-primary/10 text-primary px-1 py-0.5 rounded border-0 focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-[10px] text-primary font-medium">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={state.layout?.rowGap !== undefined ? state.layout.rowGap : 16}
                      onChange={(e) => onUpdateState({
                        layout: { ...(state.layout || { cardHeight: 280, cardStyle: 'classic' }), rowGap: parseInt(e.target.value) }
                      })}
                      className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Personalizar Tipografia
                </h3>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    { id: 'storeName', label: 'Loja' },
                    { id: 'headerTitle', label: 'Título' },
                    { id: 'headerSubtitle', label: 'Subtítulo' },
                    { id: 'productName', label: 'Produto' },
                    { id: 'price', label: 'Preço' },
                    { id: 'unit', label: 'Unidade' },
                    { id: 'productDetails', label: 'Detalhes' },
                  ].map(target => (
                    <button
                      key={target.id}
                      onClick={() => setActiveFontTarget(target.id as keyof typeof state.fonts)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${activeFontTarget === target.id
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Tamanho da Fonte</span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300 font-mono">
                      {Math.round(state.fonts[activeFontTarget].scale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={state.fonts[activeFontTarget].scale}
                    onChange={(e) => onUpdateState({
                      fonts: {
                        ...state.fonts,
                        [activeFontTarget]: {
                          ...state.fonts[activeFontTarget],
                          scale: parseFloat(e.target.value)
                        }
                      }
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-gray-700"
                  />
                </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Cor Personalizada</span>
                    <input
                      type="color"
                      value={state.fonts[activeFontTarget].color || '#000000'}
                      onChange={(e) => onUpdateState({
                        fonts: {
                          ...state.fonts,
                          [activeFontTarget]: {
                            ...state.fonts[activeFontTarget],
                            color: e.target.value
                          }
                        }
                      })}
                      className="h-8 w-14 block bg-white border border-gray-300 rounded-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-900 dark:border-gray-700"
                    />
                  </div>
                  {state.fonts[activeFontTarget].color && (
                    <button
                      onClick={() => {
                        const updatedFont = { ...state.fonts[activeFontTarget] };
                        delete updatedFont.color;
                        onUpdateState({
                          fonts: { ...state.fonts, [activeFontTarget]: updatedFont }
                        });
                      }}
                      className="text-xs text-red-500 hover:text-red-700 text-right underline"
                    >
                      Restaurar Cor do Tema
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Lilita One',
                    'Roboto',
                    'Montserrat',
                    'Oswald',
                    'Anton',
                    'Bangers',
                    'Lobster',
                    'Fjalla One'
                  ].map(font => (
                    <button
                      key={font}
                      onClick={() => onUpdateState({
                        fonts: {
                          ...state.fonts,
                          [activeFontTarget]: {
                            ...state.fonts[activeFontTarget],
                            family: font
                          }
                        }
                      })}
                      className={`p-3 border-2 rounded-xl transition-all ${state.fonts[activeFontTarget].family === font
                        ? 'border-primary bg-red-50 dark:bg-red-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary'
                        }`}
                      style={{ fontFamily: font }}
                    >
                      <span className="text-lg">{font}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )
        }

        {/* CABEÇALHO E RODAPÉ TAB */}
        {
          activeTab === 'moldura' && (
            <div className="animate-in fade-in duration-300 slide-in-from-bottom-2 space-y-5">
              {/* === CABEÇALHO === */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-1.5">
                  <span className="material-icons-round text-sm">vertical_align_top</span>
                  Cabeçalho
                </h2>

                {/* Logo Toggle + Upload */}
                <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-3">
                  <span className="text-xs font-medium">Mostrar Logo</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.header.showLogo}
                      onChange={(e) => onUpdateState({ header: { ...state.header, showLogo: e.target.checked } })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {state.header.logoUrl && (
                  <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3">
                    <img src={state.header.logoUrl} alt="Logo" className="max-h-16 object-contain" />
                  </div>
                )}

                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="material-icons-round text-sm">cloud_upload</span>
                  Upload Logo
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />

                {/* Textos do Cabeçalho */}
                <div className="mt-4 space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Nome da Loja</label>
                    <input
                      type="text"
                      value={state.header.storeName}
                      onChange={(e) => onUpdateState({ header: { ...state.header, storeName: e.target.value } })}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="Ex: Visconde Carnes"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Título Superior</label>
                    <input
                      type="text"
                      value={state.header.title}
                      onChange={(e) => onUpdateState({ header: { ...state.header, title: e.target.value } })}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="Ex: Qualidade"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Subtítulo</label>
                    <input
                      type="text"
                      value={state.header.subtitle}
                      onChange={(e) => onUpdateState({ header: { ...state.header, subtitle: e.target.value } })}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="Ex: Desde 1990"
                    />
                  </div>
                </div>

                {/* Arte Pronta */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1.5">Arte Pronta (Opcional)</p>
                  {state.header.customImage ? (
                    <div className="relative group">
                      <img src={state.header.customImage} className="w-full h-16 object-cover rounded-lg border border-gray-200" />
                      <button
                        onClick={() => onUpdateState({ header: { ...state.header, customImage: undefined } })}
                        className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-icons-round text-xs">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full py-2 text-xs font-medium border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors">
                      <span className="material-icons-round text-sm mr-1">image</span>
                      Upload Imagem
                      <input type="file" accept="image/*" className="hidden" onChange={handleHeaderImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* === DIVIDER === */}
              <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />

              {/* === RODAPÉ === */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-1.5">
                  <span className="material-icons-round text-sm">vertical_align_bottom</span>
                  Rodapé
                </h2>

                {/* Contato */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Telefone/WhatsApp</label>
                    <input
                      type="text"
                      value={state.footer.phone}
                      onChange={(e) => onUpdateState({ footer: { ...state.footer, phone: e.target.value } })}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  {/* Endereços */}
                  {state.footer.addresses.map((addr, idx) => (
                    <div key={idx}>
                      <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Endereço {idx + 1}</label>
                      <input
                        type="text"
                        value={addr}
                        onChange={(e) => {
                          const newAddresses = [...state.footer.addresses];
                          newAddresses[idx] = e.target.value;
                          onUpdateState({ footer: { ...state.footer, addresses: newAddresses } });
                        }}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        placeholder="Rua, Número - Cidade"
                      />
                    </div>
                  ))}
                </div>

                {/* Arte Pronta Rodapé */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1.5">Arte Pronta (Opcional)</p>
                  {state.footer.customImage ? (
                    <div className="relative group">
                      <img src={state.footer.customImage} className="w-full h-12 object-cover rounded-lg border border-gray-200" />
                      <button
                        onClick={() => onUpdateState({ footer: { ...state.footer, customImage: undefined } })}
                        className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-icons-round text-xs">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full py-2 text-xs font-medium border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors">
                      <span className="material-icons-round text-sm mr-1">image</span>
                      Upload Imagem
                      <input type="file" accept="image/*" className="hidden" onChange={handleFooterImageUpload} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* PRODUTOS TAB */}
        {
          activeTab === 'produtos' && (
            <div className="flex flex-col h-full animate-in fade-in duration-300 slide-in-from-bottom-2">
              <div className="flex w-full mb-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <button
                  onClick={() => setProductTab('single')}
                  className={`flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-wide border-b-2 transition-all flex items-center justify-center gap-1 ${productTab === 'single' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <span className="material-icons-round text-base">add_circle</span> Adicionar
                </button>
                <button
                  onClick={() => setProductTab('batch')}
                  className={`flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-wide border-b-2 transition-all flex items-center justify-center gap-1 ${productTab === 'batch' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <span className="material-icons-round text-base">list_alt</span> Colar Lista
                </button>
                <button
                  onClick={() => setProductTab('import')}
                  className={`flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-wide border-b-2 transition-all flex items-center justify-center gap-1 ${productTab === 'import' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <span className="material-icons-round text-base">cloud_sync</span> Importar
                </button>
                <button
                  onClick={() => setProductTab('list')}
                  className={`flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-wide border-b-2 transition-all flex items-center justify-center gap-1 ${productTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <span className="material-icons-round text-base">format_list_bulleted</span> Lista ({state.products.length})
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {productTab === 'single' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-[auto_1fr] gap-4">
                      <div className="relative group w-24 h-24">
                        {newProduct.image ? (
                          <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200">
                            <img src={newProduct.image} className="w-full h-full object-cover" />
                            <button
                              onClick={() => setNewProduct({ ...newProduct, image: '' })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="material-icons-round text-sm">close</span>
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                            <span className="material-icons-round text-gray-400 text-2xl">image</span>
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50">
                          <span className="material-icons-round text-gray-600 text-sm">edit</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        <button
                          onClick={() => setIsGalleryOpen(true)}
                          className="absolute bottom-0 left-0 bg-white rounded-full p-1.5 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50"
                          title="Galeria"
                        >
                          <span className="material-icons-round text-gray-600 text-sm">collections</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Nome do Produto"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-primary focus:border-primary transition-all p-2.5 font-bold"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Preço</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              value={newProduct.price || ''}
                              onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                              className="w-full rounded-lg border-gray-200 bg-white focus:ring-primary focus:border-primary p-2 text-lg font-bold text-red-600"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Unidade</label>
                            <select
                              value={newProduct.unit}
                              onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                              className="w-full rounded-lg border-gray-200 bg-white text-sm focus:ring-primary focus:border-primary p-2.5 h-[46px]"
                            >
                              <option>KG</option>
                              <option>UN</option>
                              <option>100G</option>
                              <option>KG Pacote</option>
                              <option>BDJ</option>
                              <option>CX</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                          checked={newProduct.isHighlight}
                          onChange={(e) => setNewProduct({ ...newProduct, isHighlight: e.target.checked })}
                        />
                        <span className="text-sm font-medium text-gray-700">Destaque (2x)</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Detalhes (marca, tipo, etc)"
                        value={newProduct.details}
                        onChange={(e) => setNewProduct({ ...newProduct, details: e.target.value })}
                        className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-primary focus:border-primary p-2.5"
                      />
                    </div>

                    <button
                      onClick={handleAddProduct}
                      disabled={!newProduct.name || !newProduct.price}
                      className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      <span className="material-icons-round group-hover:scale-110 transition-transform">add_circle</span>
                      ADICIONAR PRODUTO
                    </button>
                  </div>
                )}

                {productTab === 'batch' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">🔥 Dica Rápida:</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                        Cole sua lista no formato: <br />
                        <span className="font-mono bg-white dark:bg-black/20 px-1 rounded">Produto - R$ 00,00</span>
                      </p>
                    </div>
                    <textarea
                      className="w-full h-64 p-4 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-primary focus:border-primary transition-all font-mono text-sm"
                      placeholder="Picanha - 69.90&#10;Alcatra - 39.90&#10;Cerveja - 4.99"
                      value={batchText}
                      onChange={(e) => setBatchText(e.target.value)}
                    />
                    <button
                      onClick={handleBatchAdd}
                      disabled={!batchText.trim()}
                      className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      PROCESSAR LISTA
                    </button>
                  </div>
                )}

                {productTab === 'import' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-1">
                        <span className="material-icons-round text-base align-middle mr-1">table_chart</span>
                        Google Sheets Sync
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 leading-relaxed mt-1">
                        Conecte sua planilha para importar ofertas automaticamente. Use o script Google Apps Script fornecido.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase text-gray-500">URL do Script (Web App)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 material-icons-round text-gray-400 text-sm">link</span>
                        <input
                          type="text"
                          value={tempScriptUrl}
                          onChange={(e) => setTempScriptUrl(e.target.value)}
                          placeholder="https://script.google.com/..."
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase text-gray-500">Modo de Importação</label>
                      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                          onClick={() => setSyncMode('merge')}
                          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${syncMode === 'merge'
                            ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                          Mesclar (Manter Atuais)
                        </button>
                        <button
                          onClick={() => setSyncMode('replace')}
                          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${syncMode === 'replace'
                            ? 'bg-white dark:bg-gray-700 text-red-500 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                          Substituir Tudo
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleSyncGoogleSheets}
                      disabled={isSyncing || !tempScriptUrl}
                      className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/30 hover:shadow-green-600/50 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSyncing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          SINCRONIZANDO...
                        </>
                      ) : (
                        <>
                          <span className="material-icons-round">sync</span>
                          SINCRONIZAR AGORA
                        </>
                      )}
                    </button>

                    {syncMessage && (
                      <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${syncMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                        <span className="material-icons-round text-sm">
                          {syncMessage.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        {syncMessage.text}
                      </div>
                    )}
                  </div>
                )}

                {productTab === 'list' && (
                  <div className="space-y-2">
                    <ProductList
                      products={state.products}
                      onUpdate={(id, updates) => onUpdateProduct(id, updates)}
                      onRemove={onRemoveProduct}
                      onReorder={(reorderedProducts) => onUpdateState({ products: reorderedProducts })}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        }
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-black/20 backdrop-blur-sm">
        {user ? (
          <div className="flex items-center gap-3">
            <img
              src={user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-gray-900 dark:text-gray-100">{user.email}</p>
              <button onClick={signOut} className="text-[10px] text-red-500 hover:text-red-600 font-medium flex items-center gap-1 mt-0.5">
                <span className="material-icons-round text-[10px]">logout</span> Sair
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAuthModalOpen(true)} className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm">
            <span className="material-icons-round text-base">login</span>
            Fazer Login
          </button>
        )}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>

      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={(image) => {
          setNewProduct({ ...newProduct, image });
          setIsGalleryOpen(false);
        }}
        searchQuery={newProduct.name || ''}
      />
    </aside >
  );
};
