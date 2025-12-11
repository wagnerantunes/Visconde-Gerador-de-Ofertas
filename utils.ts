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

    // Fallback to random mock image
    return MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
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
    footerCustom: boolean
): number => {
    const baseSize = SIZES[paperSize] || SIZES.a4;
    const isLandscape = orientation === 'landscape';
    const height = isLandscape ? baseSize.w : baseSize.h;

    // Estimativas de altura (Sincronizar com FlyerPreview e ExportModal)
    const headerHeight = headerCustom ? 300 : 240;
    const footerHeight = footerCustom ? 300 : 200;
    const verticalPadding = 48;
    const safeMargin = 20;

    return height - headerHeight - footerHeight - verticalPadding - safeMargin;
};

export const paginateProducts = (
    products: Product[],
    availableHeight: number,
    itemHeight: number,
    columns: number
): Product[][] => {
    const rowsPerPage = Math.max(1, Math.floor(availableHeight / itemHeight));
    const slotsPerPage = rowsPerPage * columns;

    const pages: Product[][] = [];
    let currentPage: Product[] = [];
    let currentSlotsUsed = 0;

    products.forEach((product) => {
        // Destaque ocupa 2 cols (ou config), Normal ocupa 1.
        const productSlots = product.cols || (product.isHighlight ? 2 : 1);

        if (currentSlotsUsed + productSlots > slotsPerPage) {
            pages.push(currentPage);
            currentPage = [];
            currentSlotsUsed = 0;
        }

        currentPage.push(product);
        currentSlotsUsed += productSlots;
    });

    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    if (pages.length === 0) pages.push([]);

    return pages;
};
