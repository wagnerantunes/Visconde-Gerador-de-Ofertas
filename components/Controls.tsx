import React, { useState } from 'react';
import { AppState, Product } from '../types';
import { MOCK_IMAGES } from '../constants';
import { fetchProductsFromSheet } from '../services/api';

interface ControlsProps {
  state: AppState;
  onUpdateState: (updates: Partial<AppState>) => void;
  onAddProduct: (product: Product) => void;
}

export const Controls: React.FC<ControlsProps> = ({ state, onUpdateState, onAddProduct }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'sheet'>('sheet');
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<string>('');
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    unit: 'KG',
    isHighlight: false,
    details: ''
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;

    onAddProduct({
      id: Date.now().toString(),
      name: newProduct.name,
      price: newProduct.price,
      unit: newProduct.unit || 'KG',
      isHighlight: !!newProduct.isHighlight,
      details: newProduct.details || '',
      // Random mock image for demo purposes since we can't actually upload
      image: MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)]
    });

    setNewProduct({
      name: '',
      price: 0,
      unit: 'KG',
      isHighlight: false,
      details: ''
    });
  };

  const handleLoadFromSheet = async () => {
    setIsLoadingSheet(true);
    setSheetStatus('Carregando produtos...');

    try {
      const products = await fetchProductsFromSheet();
      onUpdateState({ products });
      setSheetStatus(`✅ ${products.length} produtos carregados com sucesso!`);

      setTimeout(() => setSheetStatus(''), 3000);
    } catch (error) {
      setSheetStatus(`❌ Erro ao carregar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoadingSheet(false);
    }
  };

  return (
    <aside className="w-full max-w-md flex flex-col border-r border-gray-200 dark:border-gray-700 bg-paper-light dark:bg-paper-dark h-full shadow-xl z-20 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary text-white p-2 rounded-lg">
            <span className="material-icons-round text-2xl">grid_view</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Gerador de Ofertas</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure o layout e adicione produtos.</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {/* Format Selection */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <span className="material-icons-round text-lg">aspect_ratio</span> Formato do Feed
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

        {/* Grid & Columns */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <span className="material-icons-round text-lg">view_column</span> Grid & Colunas
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
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>5</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-sm font-medium">Linhas Automáticas</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.autoRows}
                onChange={(e) => onUpdateState({ autoRows: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </section>

        {/* Store Information */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <span className="material-icons-round text-lg">store</span> Informações da Loja
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Loja</label>
              <input
                type="text"
                value={state.storeName}
                onChange={(e) => onUpdateState({ storeName: e.target.value })}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
                placeholder="Ex: Visconde"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Válido Até</label>
              <input
                type="date"
                value={state.validUntil}
                onChange={(e) => onUpdateState({ validUntil: e.target.value })}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary p-2.5"
              />
            </div>
          </div>
        </section>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* Product Manager */}
        <section className="flex flex-wrap gap-y-4">
          <h3 className="w-full text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2 mb-2">
            <span className="material-icons-round text-lg">inventory_2</span> Gerenciar Produtos
          </h3>

          <div className="flex w-full mb-2">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`w-1/3 text-center py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer border-b-2 transition-all flex items-center justify-center gap-1 ${activeTab === 'sheet' ? 'border-primary text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              <span className="material-icons-round text-base">cloud_download</span> Planilha
            </button>
            <button
              onClick={() => setActiveTab('single')}
              className={`w-1/3 text-center py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer border-b-2 transition-all flex items-center justify-center gap-1 ${activeTab === 'single' ? 'border-primary text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              <span className="material-icons-round text-base">add_circle</span> Adicionar
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`w-1/3 text-center py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer border-b-2 transition-all flex items-center justify-center gap-1 ${activeTab === 'batch' ? 'border-primary text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              <span className="material-icons-round text-base">list_alt</span> Colar Lista
            </button>
          </div>

          {activeTab === 'single' && (
            <div className="w-full space-y-4 animate-fadeIn">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="material-icons-round text-gray-400 text-3xl mb-1">cloud_upload</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-semibold">Clique para enviar</span> a foto</p>
                  </div>
                  <input type="file" className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Preço (R$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <input
                      type="number"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                      className="pl-9 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary font-bold text-gray-900 dark:text-white p-2.5"
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Unidade</label>
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
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="highlight" className="text-sm font-medium text-gray-900 dark:text-gray-300">Produto em Destaque (x2 Colunas)</label>
              </div>

              <button
                onClick={handleAddProduct}
                className="w-full bg-primary hover:bg-red-800 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-icons-round">add</span> Adicionar à Lista
              </button>
            </div>
          )}

          {activeTab === 'batch' && (
            <div className="w-full space-y-4 animate-fadeIn">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <span className="material-icons-round text-sm">info</span> Instruções:
                </p>
                Cole sua lista abaixo. Cada linha um produto. O sistema tentará identificar nome e preço automaticamente.
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Lista de Produtos</label>
                <textarea
                  className="w-full h-40 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs focus:ring-primary focus:border-primary font-mono leading-relaxed p-2"
                  placeholder={`Picanha Bovina - 69.90\nContra Filé - 45.00\nLinguiça Toscana - 18.90`}
                ></textarea>
              </div>
              <button className="w-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
                <span className="material-icons-round">playlist_add</span> Processar Lista
              </button>
            </div>
          )}

          {activeTab === 'sheet' && (
            <div className="w-full space-y-4 animate-fadeIn">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <span className="material-icons-round text-sm">info</span> Google Sheets:
                </p>
                Carregue os produtos diretamente da planilha do Google Sheets. Os produtos marcados com "X" na coluna "Oferta" serão importados.
              </div>

              <button
                onClick={handleLoadFromSheet}
                disabled={isLoadingSheet}
                className="w-full bg-primary hover:bg-red-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoadingSheet ? (
                  <>
                    <span className="material-icons-round animate-spin">sync</span> Carregando...
                  </>
                ) : (
                  <>
                    <span className="material-icons-round">cloud_download</span> Carregar da Planilha
                  </>
                )}
              </button>

              {sheetStatus && (
                <div className={`p-3 rounded-lg text-sm ${sheetStatus.startsWith('✅')
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                  }`}>
                  {sheetStatus}
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p><strong>Produtos atuais:</strong> {state.products.length}</p>
                <p className="text-[10px] opacity-70">As imagens devem estar em /public/produtos/[Nome do Produto].png</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};
