import { AppState } from './types';
import { MOCK_IMAGES } from './constants';

const PRODUCT_IMAGE_MAP: Record<string, string> = {
    'picanha': '/produtos/Picanha.png',
    'chorizo': '/produtos/BifeChorizo.png',
    'bife de chorizo': '/produtos/BifeChorizo.png',
    'coxa': '/produtos/CoxaComSobrecoxa.png',
    'sobrecoxa': '/produtos/CoxaComSobrecoxa.png',
    'acem': '/produtos/AcemPicado.png',
    'acém': '/produtos/AcemPicado.png',
    'linguiça': '/produtos/LinguicaToscana.png',
    'linguica': '/produtos/LinguicaToscana.png',
    'toscana': '/produtos/LinguicaToscana.png'
};

export const findProductImage = (productName: string): string => {
    const normalizedName = productName.toLowerCase();

    for (const [key, path] of Object.entries(PRODUCT_IMAGE_MAP)) {
        if (normalizedName.includes(key)) {
            return path;
        }
    }

    // Fallback to random mock image
    return MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
};

const STORAGE_KEY = 'visconde-flyer-state';

export const saveToLocalStorage = (state: AppState): void => {
    // ...

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
    }
};

export const loadFromLocalStorage = (): Partial<AppState> | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        return null;
    }
};

export const clearLocalStorage = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
    }
};

export const exportToJSON = (state: AppState): void => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flyer-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<AppState> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const state = JSON.parse(e.target?.result as string);
                resolve(state);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

export const parseProductList = (text: string): Array<{ name: string; price: number; unit: string }> => {
    const lines = text.split('\n').filter(line => line.trim());
    const products: Array<{ name: string; price: number; unit: string }> = [];

    lines.forEach(line => {
        // Padrões suportados:
        // "Picanha - 69.90"
        // "Picanha R$ 69.90"
        // "Picanha 69,90"
        // "Picanha - R$ 69,90 KG"

        const patterns = [
            /^(.+?)\s*[-–]\s*R?\$?\s*([\d,\.]+)\s*(\w+)?$/i,
            /^(.+?)\s+R?\$?\s*([\d,\.]+)\s*(\w+)?$/i,
        ];

        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                const name = match[1].trim();
                const priceStr = match[2].replace(',', '.');
                const price = parseFloat(priceStr);
                const unit = match[3]?.trim().toUpperCase() || 'KG';

                if (name && !isNaN(price)) {
                    products.push({ name, price, unit });
                    break;
                }
            }
        }
    });

    return products;
};

export const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
