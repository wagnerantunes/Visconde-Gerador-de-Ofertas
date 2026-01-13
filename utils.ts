import { AppState, Product } from './types';
import { MOCK_IMAGES } from './constants';
import { PRODUCT_FILENAMES } from './productImages';

export const PRODUCT_IMAGE_MAP: Record<string, string> = {};

PRODUCT_FILENAMES.forEach(filename => {
    // Chave sem extensão e sem acentos para facilitar busca
    const key = filename.replace(/\.png$/i, '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    PRODUCT_IMAGE_MAP[key] = `/produtos/${filename}`;
});

export const findProductImage = (productName: string): string => {
    const normalizedName = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    // Busca parcial priorizando matches mais específicos (strings mais longas)
    const keys = Object.keys(PRODUCT_IMAGE_MAP).sort((a, b) => b.length - a.length);

    for (const key of keys) {
        if (normalizedName.includes(key)) {
            return PRODUCT_IMAGE_MAP[key];
        }
    }

    // Placeholder SVG quando imagem não é encontrada
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNDUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjxzdmcgeD0iNzUiIHk9IjYwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzljYTNhZiI+PHBhdGggZD0iTTIxIDMuMDFINGMtMS4xIDAtMiAuOS0yIDJWMTljMCAxLjEuOSAyIDIgMmgxN2MxLjEgMCAyLS45IDItMlY1LjAxYzAtMS4xLS45LTItMi0yem0wIDE1Ljk5SDRWNy4wMWgxN3YxMS45OXpNOSAxMC41YzAtLjgzLjY3LTEuNSAxLjUtMS41czEuNS42NyAxLjUgMS41LS42NyAxLjUtMS41IDEuNS0xLjUtLjY3LTEuNS0xLjV6TTUgMTZsMyAzLjk5IDMtMy45OSA0IDUuMDFINXoiLz48L3N2Zz48L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2VtIG7Do28gZW5jb250cmFkYTwvdGV4dD48L3N2Zz4=';
};

const STORAGE_KEY = 'visconde-flyer-state';

export const saveToLocalStorage = (state: AppState): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
    }
};

export const loadFromLocalStorage = (): AppState | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        return null;
    }
};

export const clearSessionStorage = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
    }
};

// --- Pagination Logic ---

const SIZES: Record<string, { w: number; h: number }> = {
    a4: { w: 1240, h: 1754 },
    a3: { w: 1754, h: 2480 },
    letter: { w: 1275, h: 1650 },
    story: { w: 1080, h: 1920 },
    feed: { w: 1080, h: 1440 },
};

export const getAvailablePageHeight = (
    paperSize: string,
    orientation: string,
    headerCustom: boolean,
    footerCustom: boolean,
    showFooter: boolean = true,
    showHeader: boolean = true
): number => {
    const baseSize = SIZES[paperSize] || SIZES.a4;
    const isLandscape = orientation === 'landscape';
    const height = isLandscape ? baseSize.w : baseSize.h;

    // Calibração baseada nos componentes FlyerPreview (h-48 + h-12 = 240px)
    const headerHeight = showHeader ? (headerCustom ? 240 : 240) : 0;
    const footerHeight = showFooter ? (footerCustom ? 140 : 120) : 0;
    const verticalPadding = 20; // Padding interno reduzido (py-2 cima/baixo aprox)
    const safeMargin = 0;

    return height - headerHeight - footerHeight - verticalPadding - safeMargin;
};

export const paginateProducts = (
    products: Product[],
    availableHeight: number,
    itemHeight: number,
    columns: number
): Product[][] => {
    // Dividers ocupam menos espaço (~90px vs 280px+), então usamos um fator fixo
    const dividerHeight = 90;

    const pages: Product[][] = [];
    let currentPage: Product[] = [];
    let currentRowSlotsTaken = 0;
    let currentHeightUsed = 0; // Mudamos de rows para altura em pixels

    products.forEach((product) => {
        // Determine column span
        let span = product.type === 'divider' ? columns : (product.cols || 1);
        if (span > columns) span = columns;

        // Calcula altura que este produto vai ocupar
        const productHeight = product.type === 'divider'
            ? dividerHeight
            : itemHeight * (product.rows || 1);

        // Check if we need to wrap to new row
        const needsNewRow = currentRowSlotsTaken + span > columns || product.type === 'divider';

        if (needsNewRow && currentRowSlotsTaken > 0) {
            // Adiciona a altura da linha atual antes de começar nova linha
            currentHeightUsed += itemHeight;
            currentRowSlotsTaken = 0;
        }

        // Check if it fits on the current page (com a altura do produto atual)
        if (currentHeightUsed + productHeight > availableHeight) {
            pages.push(currentPage);
            currentPage = [];
            currentHeightUsed = 0;
            currentRowSlotsTaken = 0;
        }

        currentPage.push(product);
        currentRowSlotsTaken += span;

        // If divider or exactly filled the row, add height and reset slots
        if (product.type === 'divider' || currentRowSlotsTaken === columns) {
            currentHeightUsed += productHeight;
            currentRowSlotsTaken = 0;
        }
    });

    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    if (pages.length === 0) pages.push([]);

    return pages;
};

// --- Helper Functions Restored ---

export const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const parseProductList = (text: string): any[] => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    return lines.map(line => {
        // Tenta achar preço formato 00,00 ou 00.00
        // Regex pega o último valor numérico da linha que pareça preço
        const priceMatch = line.match(/(\d+[.,]\d{2})(?!.*\d)/);
        let price = 0;
        let name = line;

        if (priceMatch) {
            const priceStr = priceMatch[0];
            price = parseFloat(priceStr.replace(',', '.'));
            name = line.replace(priceStr, '').replace('R$', '').trim();

            // Limpeza extra de caracteres comuns em listas coladas
            name = name.replace(/[-:]$/, '').trim();
            if (name.endsWith('-')) name = name.slice(0, -1).trim();
        }

        return {
            name,
            price,
            unit: 'un', // Default
            details: '',
            isHighlight: false
        };
    }).filter(p => p.name.length > 0); // Filtra linhas vazias ou invalidas
};
