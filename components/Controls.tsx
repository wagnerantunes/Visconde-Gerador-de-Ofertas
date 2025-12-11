import React, { useState, useRef } from 'react';
import { AppState, Product } from '../types';
import { MOCK_IMAGES } from '../constants';
import { SEASONAL_THEMES } from '../seasonalThemes';
import { parseProductList, imageToBase64, findProductImage } from '../utils';
import { ProductList } from './ProductList';
import { ImageGalleryModal } from './ImageGalleryModal';

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
  const [activeTab, setActiveTab] = useState<TabType>('tema');
  const [activeFontTarget, setActiveFontTarget] = useState<keyof typeof state.fonts>('price');
  const [productTab, setProductTab] = useState<'single' | 'batch' | 'list'>('single');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
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

  const tabs = [
    { id: 'tema' as TabType, label: 'Tema', icon: 'palette' },
    { id: 'design' as TabType, label: 'Design', icon: 'brush' },
    { id: 'cabecalho' as TabType, label: 'Cabeçalho', icon: 'vertical_align_top' },
    { id: 'rodape' as TabType, label: 'Rodapé', icon: 'vertical_align_bottom' },
    { id: 'produtos' as TabType, label: 'Produtos', icon: 'inventory_2' }
  ];

  return (
    <aside className="w-full max-w-md flex flex-col border-r border-gray-200 dark:border-gray-700 bg-paper-light dark:bg-paper-dark h-full shadow-xl z-20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary text-white p-2 rounded-lg">
            <span className="material-icons-round text-2xl">grid_view</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Gerador de Ofertas</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure o layout e adicione produtos.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold uppercase tracking-wide transition-all border-b-2 ${activeTab === tab.id
              ? 'border-primary text-primary bg-red-50 dark:bg-red-900/20'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
          >
            <span className="material-icons-round text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TEMA TAB */}
        {activeTab === 'tema' && (
          <>
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Tema Sazonal
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(SEASONAL_THEMES).map(theme => (
                  <button
                    key={theme.theme}
                    onClick={() => onUpdateState({ seasonal: theme })}
                    className={`flex flex-col items-center p-3 border-2 rounded-xl transition-all ${state.seasonal.theme === theme.theme
                      ? 'border-primary bg-red-50 dark:bg-red-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary'
                      }`}
                  >
                    <span
                      className="material-icons-round mb-2 text-3xl"
                      style={{ color: theme.primaryColor }}
                    >
                      {theme.icon}
                    </span>
                    <span className="font-bold text-xs text-center capitalize">{theme.subtitle}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                <span className="material-icons-round text-lg">aspect_ratio</span> Formato
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onUpdateState({ format: 'portrait' })}
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all ${state.format === 'portrait'
                    ? 'border-primary bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary'
                    }`}
                >
                  <span className={`material-icons-round mb-1 ${state.format === 'portrait' ? 'text-primary' : 'text-gray-400'}`}>crop_portrait</span>
                  <span className={`font-bold text-sm ${state.format === 'portrait' ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>Portrait</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">1080x1440</span>
                </button>
                <button
                  onClick={() => onUpdateState({ format: 'story' })}
                  className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all ${state.format === 'story'
                    ? 'border-primary bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary'
                    }`}
                >
                  <span className={`material-icons-round mb-1 ${state.format === 'story' ? 'text-primary' : 'text-gray-400'}`}>smartphone</span>
                  <span className={`font-bold text-sm ${state.format === 'story' ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>Story</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">1080x1920</span>
                </button>
              </div>
            </section>



            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Grid & Colunas
              </h3>
              <div className="mb-5">
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span>Colunas</span>
                  <span className="text-primary font-bold">{state.columns}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={state.columns}
                  onChange={(e) => onUpdateState({ columns: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-gray-700"
                />
              </div>
            </section>

            <section>
              <label className="block text-sm font-medium mb-2">Válido até</label>
              <input
                type="text"
                value={state.validUntil}
                onChange={(e) => onUpdateState({ validUntil: e.target.value })}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
                placeholder="DD/MM/YYYY"
              />
            </section>
          </>
        )}

        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <>
            <section className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Layout do Flyer
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
                onClick={() => setProductTab('list')}
                className={`flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-wide border-b-2 transition-all flex items-center justify-center gap-1 ${productTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                <span className="material-icons-round text-base">format_list_bulleted</span> Lista ({state.products.length})
              </button>
            </div>

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
