import React, { useState, useRef } from 'react';
import { AppState, Product } from '../types';
import { MOCK_IMAGES } from '../constants';
import { SEASONAL_THEMES } from '../seasonalThemes';
import { parseProductList, imageToBase64, findProductImage } from '../utils';
import { ProductList } from './ProductList';
import { ImageGalleryModal } from './ImageGalleryModal';
import { AccordionSection } from './AccordionSection';

interface ControlsProps {
  state: AppState;
  onUpdateState: (updates: Partial<AppState>) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onRemoveProduct: (id: string) => void;
}

type TabType = 'tema' | 'design' | 'cabecalho' | 'rodape' | 'produtos';

export const Controls: React.FC<ControlsProps> = ({
  state,
  onUpdateState,
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct
}) => {
  const [activeFontTarget, setActiveFontTarget] = useState<keyof typeof state.fonts>('price');
  const [productTab, setProductTab] = useState<'single' | 'batch' | 'list' | 'import'>('single');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
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

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzy6IUgIPzIYtz8DmOGHqNm4kque5kxGNz4daboARq4qfznaKTC5r1Q2vzX_-CyLsKK/exec');

      if (!response.ok) {
        throw new Error('Erro ao conectar com o Google Sheets');
      }

      const data = await response.json();

      if (!data.sucesso || !data.ofertas) {
        throw new Error('Formato de dados inválido');
      }

      // Mapear os dados do Google Sheets para o formato Product
      const newProducts: Product[] = data.ofertas.map((oferta: any) => {
        // Garantir que o preço seja um número para evitar crash no fixed(2)
        let price = 0;
        if (typeof oferta.preco === 'number') {
          price = oferta.preco;
        } else if (typeof oferta.preco === 'string') {
          price = parseFloat(oferta.preco.replace(',', '.')) || 0;
        }

        return {
          id: Date.now().toString() + Math.random(),
          name: oferta.produto || '',
          price: price,
          unit: oferta.unidade || oferta.obs || 'KG',
          isHighlight: false,
          details: oferta.categoria || '',
          image: findProductImage(oferta.produto || ''),
          pageId: 'auto'
        };
      });

      // Adicionar os produtos
      onUpdateState({ products: [...state.products, ...newProducts] });

      setSyncMessage({
        type: 'success',
        text: `${newProducts.length} produtos importados com sucesso!`
      });

      // Mudar para a aba de lista após sincronizar
      setProductTab('list');

      // Limpar mensagem após 5 segundos
      setTimeout(() => setSyncMessage(null), 5000);

    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      setSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao sincronizar com Google Sheets'
      });

      // Limpar mensagem de erro após 5 segundos
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const tabs = [
    { id: 'tema' as TabType, label: 'Tema', icon: 'palette' },
    { id: 'design' as TabType, label: 'Design', icon: 'brush' },
    { id: 'cabecalho' as TabType, label: 'Cabeçalho', icon: 'vertical_align_top' },
    { id: 'rodape' as TabType, label: 'Rodapé', icon: 'vertical_align_bottom' },
    { id: 'produtos' as TabType, label: 'Produtos', icon: 'inventory_2' }
  ];

  return (
    <aside className="w-full max-w-md flex flex-col premium-border bg-paper-light dark:bg-paper-dark h-full shadow-2xl z-20 overflow-hidden">
      {/* Header - Modernized */}
      <div className="p-6 pb-4 border-b border-black/[0.03] dark:border-white/[0.03] bg-black/[0.02] dark:bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2.5 rounded-2xl shadow-lg shadow-primary/20">
            <span className="material-icons-round text-2xl">grid_view</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Gerador de Ofertas</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Visconde Carnes • Premium Tool</p>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0">
        {/* TEMA SAZONAL SECTION */}
        <AccordionSection
          id="tema-sazonal"
          title="Tema Sazonal"
          icon="palette"
          defaultOpen={true}
        >
          <>
            <section className="bg-black/[0.02] dark:bg-white/[0.01] p-5 rounded-3xl premium-border">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5 flex items-center justify-between">
                <span>Tema Sazonal</span>
                <span className="material-icons-round text-lg opacity-30">palette</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(SEASONAL_THEMES).map(theme => (
                  <button
                    key={theme.theme}
                    onClick={() => onUpdateState({ seasonal: theme })}
                    className={`flex flex-col items-center p-4 rounded-2xl transition-all border group relative overflow-hidden ${state.seasonal.theme === theme.theme
                      ? 'border-primary bg-primary/5 shadow-inner shadow-primary/5'
                      : 'border-black/[0.05] dark:border-white/[0.05] hover:border-black/20 dark:hover:border-white/20'
                      }`}
                  >
                    <span
                      className={`material-icons-round mb-2.5 text-3xl transition-transform group-hover:scale-110`}
                      style={{ color: theme.primaryColor }}
                    >
                      {theme.icon}
                    </span>
                    <span className={`text-[10px] font-black text-center uppercase tracking-tight ${state.seasonal.theme === theme.theme ? 'text-primary' : 'text-gray-500'}`}>
                      {theme.subtitle}
                    </span>
                    {state.seasonal.theme === theme.theme && (
                      <div className="absolute top-1 right-1">
                        <span className="material-icons-round text-sm text-primary">check_circle</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-black/[0.02] dark:bg-white/[0.01] p-5 rounded-3xl premium-border">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5 flex items-center justify-between">
                <span>Formato do Papel</span>
                <span className="material-icons-round text-lg opacity-30">aspect_ratio</span>
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {['a4', 'a3', 'letter', 'story', 'feed'].map(size => (
                    <button
                      key={size}
                      onClick={() => onUpdateState({ paperSize: size as any })}
                      className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase border transition-all ${state.paperSize === size
                        ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                        : 'border-black/[0.05] dark:border-white/[0.05] text-gray-500 dark:text-gray-400 hover:border-black/20 dark:hover:border-white/20'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex bg-black/[0.05] dark:bg-white/[0.05] p-1 rounded-xl border border-black/[0.05] dark:border-white/[0.05]">
                <button
                  onClick={() => onUpdateState({ orientation: 'portrait' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${state.orientation === 'portrait'
                    ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    }`}
                >
                  <span className="material-icons-round text-base">crop_portrait</span> Retrato
                </button>
                <button
                  onClick={() => onUpdateState({ orientation: 'landscape' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${state.orientation === 'landscape'
                    ? 'bg-white dark:bg-gray-800 text-primary shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    }`}
                >
                  <span className="material-icons-round text-base">crop_landscape</span> Paisagem
                </button>
              </div>
            </section>



            <section className="bg-black/[0.02] dark:bg-white/[0.01] p-5 rounded-3xl premium-border">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5 flex items-center justify-between">
                <span>Grid & Colunas</span>
                <span className="material-icons-round text-lg opacity-30">view_module</span>
              </h3>
              <div>
                <label className="flex justify-between text-[10px] font-black uppercase tracking-tight text-gray-500 mb-3">
                  <span>Número de Colunas</span>
                  <span className="text-primary">{state.columns}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={state.columns}
                  onChange={(e) => onUpdateState({ columns: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-black/[0.05] dark:bg-white/[0.05] rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </section>

            <section className="bg-black/[0.02] dark:bg-white/[0.01] p-5 rounded-3xl premium-border">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5 flex items-center justify-between">
                <span>Válido até</span>
                <span className="material-icons-round text-lg opacity-30">calendar_today</span>
              </h3>
              <input
                type="text"
                value={state.validUntil}
                onChange={(e) => onUpdateState({ validUntil: e.target.value })}
                className="w-full rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-paper-dark text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary p-3 transition-all"
                placeholder="Ex: 31/12/2024"
              />
            </section>
          </>
        )}

          {/* DESIGN TAB */}
          {activeTab === 'design' && (
            <>
              <section className="bg-black/[0.02] dark:bg-white/[0.01] p-5 rounded-3xl premium-border">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5 flex items-center justify-between">
                  <span>Layout do Flyer</span>
                  <span className="material-icons-round text-lg opacity-30">brush</span>
                </h3>

                <div className="space-y-6">
                  {/* Card Height */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Altura do Produto</span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">{state.layout?.cardHeight || 280}px</span>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="400"
                      step="10"
                      value={state.layout?.cardHeight || 280}
                      onChange={(e) => onUpdateState({
                        layout: { ...(state.layout || { rowGap: 16, cardStyle: 'classic' }), cardHeight: parseInt(e.target.value) }
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-gray-700"
                    />
                  </div>

                  {/* Row Gap */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Espaçamento Vertical</span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">{state.layout?.rowGap || 16}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="4"
                      value={state.layout?.rowGap !== undefined ? state.layout.rowGap : 16}
                      onChange={(e) => onUpdateState({
                        layout: { ...(state.layout || { cardHeight: 280, cardStyle: 'classic' }), rowGap: parseInt(e.target.value) }
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-gray-700"
                    />
                  </div>

                  {/* Card Style Select */}
                  <div>
                    <label className="text-sm font-medium block mb-2 text-gray-700 dark:text-gray-300">Estilo do Cartão</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdateState({ layout: { ...state.layout, cardStyle: 'classic' } })}
                        className={`flex-1 py-2 rounded-lg text-sm border-2 transition-all ${(state.layout?.cardStyle || 'classic') === 'classic'
                          ? 'border-primary bg-primary/5 text-primary font-bold'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                      >
                        Clássico
                      </button>
                      <button
                        onClick={() => onUpdateState({ layout: { ...state.layout, cardStyle: 'compact' } })}
                        className={`flex-1 py-2 rounded-lg text-sm border-2 transition-all ${state.layout?.cardStyle === 'compact'
                          ? 'border-primary bg-primary/5 text-primary font-bold'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                      >
                        Compacto
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  Personalizar Tipografia
                </h3>

                <div className="flex flex-wrap gap-2 mb-6">
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
            </>
          )}

          {/* CABEÇALHO TAB */}
          {activeTab === 'cabecalho' && (
            <>
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  Logotipo
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">Mostrar Logo</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.header.showLogo}
                        onChange={(e) => onUpdateState({
                          header: { ...state.header, showLogo: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {state.header.logoUrl && (
                    <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <img src={state.header.logoUrl} alt="Logo" className="max-h-20 object-contain" />
                    </div>
                  )}

                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary transition-colors"
                  >
                    <span className="material-icons-round text-gray-400">cloud_upload</span>
                    <span className="text-sm font-medium">Upload Logo</span>
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  Textos do Cabeçalho
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Nome da Loja</label>
                    <input
                      type="text"
                      value={state.header.storeName}
                      onChange={(e) => onUpdateState({
                        header: { ...state.header, storeName: e.target.value }
                      })}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Título Superior</label>
                    <input
                      type="text"
                      value={state.header.title}
                      onChange={(e) => onUpdateState({
                        header: { ...state.header, title: e.target.value }
                      })}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Subtítulo</label>
                    <input
                      type="text"
                      value={state.header.subtitle}
                      onChange={(e) => onUpdateState({
                        header: { ...state.header, subtitle: e.target.value }
                      })}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
                    />
                  </div>
                </div>
              </section>

              <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Arte Pronta (Opcional)
                </h3>
                <p className="text-xs text-gray-400 mb-2">Substitui todo o texto acima por uma imagem.</p>

                {state.header.customImage ? (
                  <div className="relative group">
                    <img src={state.header.customImage} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => onUpdateState({ header: { ...state.header, customImage: undefined } })}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-icons-round text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-xs text-gray-500 font-medium">Upload Cabeçalho Completo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleHeaderImageUpload} />
                  </label>
                )}
              </section>
            </>
          )}

          {/* RODAPÉ TAB */}
          {activeTab === 'rodape' && (
            <>
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  Contato
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Telefone/WhatsApp</label>
                    <input
                      type="text"
                      value={state.footer.phone}
                      onChange={(e) => onUpdateState({
                        footer: { ...state.footer, phone: e.target.value }
                      })}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                  Endereços
                </h3>
                <div className="space-y-3">
                  {state.footer.addresses.map((addr, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-medium mb-1">Endereço {idx + 1}</label>
                      <input
                        type="text"
                        value={addr}
                        onChange={(e) => {
                          const newAddresses = [...state.footer.addresses];
                          newAddresses[idx] = e.target.value;
                          onUpdateState({
                            footer: { ...state.footer, addresses: newAddresses }
                          });
                        }}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Arte Pronta (Rodapé)
                </h3>
                {state.footer.customImage ? (
                  <div className="relative group">
                    <img src={state.footer.customImage} className="w-full h-16 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => onUpdateState({ footer: { ...state.footer, customImage: undefined } })}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-icons-round text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-xs text-gray-500 font-medium">Upload Rodapé Completo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFooterImageUpload} />
                  </label>
                )}
              </section>
            </>
          )}

          {/* PRODUTOS TAB */}
          {activeTab === 'produtos' && (
            <>
              <div className="flex w-full mb-4 border-b border-gray-200 dark:border-gray-700">
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

              {/* Google Sheets Sync Button */}
              <button
                onClick={handleSyncGoogleSheets}
                disabled={isSyncing}
                className="w-full mb-4 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <span className="material-icons-round animate-spin">sync</span>
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <span className="material-icons-round">cloud_sync</span>
                    Sincronizar com Google Sheets
                  </>
                )}
              </button>

              {/* Sync Feedback Message */}
              {syncMessage && (
                <div className={`mb-4 p-3 rounded-lg border ${syncMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                  : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                  }`}>
                  <p className="text-xs font-bold flex items-center gap-2">
                    <span className="material-icons-round text-sm">
                      {syncMessage.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {syncMessage.text}
                  </p>
                </div>
              )}

              {state.products.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja apagar todos os produtos?')) {
                      onUpdateState({ products: [] });
                    }
                  }}
                  className="w-full mb-4 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round text-sm">delete_sweep</span>
                  Apagar Todos os Produtos ({state.products.length})
                </button>
              )}

              {productTab === 'single' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                      {newProduct.image ? (
                        <img src={newProduct.image} alt="Preview" className="h-28 object-contain" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <span className="material-icons-round text-gray-400 text-3xl mb-1">cloud_upload</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-semibold">Clique para enviar</span> a foto</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="flex justify-center -mt-3 mb-3">
                    <button
                      onClick={() => setIsGalleryOpen(true)}
                      className="text-xs font-bold text-primary hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-full transition-colors border border-red-100"
                    >
                      <span className="material-icons-round text-sm">photo_library</span>
                      Escolher da Galeria
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Nome do Produto</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
                      placeholder="Ex: Picanha Nacional"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.price || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Unidade</label>
                      <select
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
                      >
                        <option>KG</option>
                        <option>Unid.</option>
                        <option>Pct</option>
                        <option>100g</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="highlight"
                      type="checkbox"
                      checked={newProduct.isHighlight}
                      onChange={(e) => setNewProduct({ ...newProduct, isHighlight: e.target.checked })}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="highlight" className="text-sm font-medium">Produto em Destaque (x2 Colunas)</label>
                  </div>

                  <button
                    onClick={handleAddProduct}
                    disabled={!newProduct.name || !newProduct.price}
                    className="w-full bg-primary hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round">add</span> Adicionar à Lista
                  </button>
                </div>
              )}

              {productTab === 'batch' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-bold flex items-center gap-1 mb-1">
                      <span className="material-icons-round text-sm">info</span> Instruções:
                    </p>
                    Cole sua lista abaixo. Cada linha um produto. Formatos aceitos:<br />
                    • Picanha - 69.90<br />
                    • Picanha R$ 69.90<br />
                    • Picanha 69,90 KG
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Lista de Produtos</label>
                    <textarea
                      value={batchText}
                      onChange={(e) => setBatchText(e.target.value)}
                      className="w-full h-40 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs focus:ring-primary focus:border-primary font-mono leading-relaxed p-2"
                      placeholder="Picanha Bovina - 69.90&#10;Contra Filé - 45.00&#10;Linguiça Toscana - 18.90"
                    />
                  </div>
                  <button
                    onClick={handleBatchAdd}
                    disabled={!batchText.trim()}
                    className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round">playlist_add</span> Processar Lista
                  </button>
                </div>
              )}

              {productTab === 'import' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="material-icons-round text-blue-600 dark:text-blue-400 text-2xl">cloud</span>
                      <div>
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                          Importar do Google Sheets
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          Sincronize produtos diretamente da sua planilha do Google Sheets.
                          Os produtos serão adicionados à lista existente.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mt-3 border border-blue-100 dark:border-blue-900">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        📋 Estrutura esperada da planilha:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                        <li>• <strong>produto</strong>: Nome do produto</li>
                        <li>• <strong>preco</strong>: Preço (número)</li>
                        <li>• <strong>unidade/obs</strong>: KG, Unid., etc.</li>
                        <li>• <strong>categoria</strong>: Categoria (opcional)</li>
                      </ul>
                    </div>
                  </div>

                  {/* Sync Feedback Message */}
                  {syncMessage && (
                    <div className={`p-3 rounded-lg border ${syncMessage.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                      : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                      }`}>
                      <p className="text-xs font-bold flex items-center gap-2">
                        <span className="material-icons-round text-sm">
                          {syncMessage.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        {syncMessage.text}
                      </p>
                    </div>
                  )}

                  {/* Google Sheets Sync Button */}
                  <button
                    onClick={handleSyncGoogleSheets}
                    disabled={isSyncing}
                    className="w-full py-4 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <span className="material-icons-round animate-spin">sync</span>
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round">cloud_download</span>
                        Importar Produtos da Planilha
                      </>
                    )}
                  </button>

                  {state.products.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                        Você já tem {state.products.length} produto(s) na lista
                      </p>
                    </div>
                  )}
                </div>
              )}

              {productTab === 'list' && (
                <ProductList
                  products={state.products}
                  onUpdate={onUpdateProduct}
                  onRemove={onRemoveProduct}
                />
              )}
            </>
          )}
      </div>

      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={(img) => {
          setNewProduct({ ...newProduct, image: img });
          setIsGalleryOpen(false);
        }}
      />
    </aside>
  );
};
