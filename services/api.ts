import { Product } from '../types';

// Google Apps Script API endpoint
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzDqXBPM5TIRQd0B7QcVANwRI3LZ7nQwhJiuWeKMMoNRgtWFWjwocVreZkgIbsfRI8m7w/exec';

// Placeholder images by category
const PLACEHOLDER_IMAGES: Record<string, string> = {
    'Bovinos': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&h=400&fit=crop',
    'Suínos': 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=400&fit=crop',
    'Aves': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop',
    'default': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop'
};

/**
 * Get image path for a product
 * Uses local PNG file from /produtos folder based on product name
 * Falls back to placeholder if image doesn't exist
 */
function getProductImage(productName: string, category: string): string {
    // Try local PNG file first (product name.png)
    const localImagePath = `/produtos/${productName}.png`;
    return localImagePath;
}

/**
 * Get placeholder image for category
 */
export function getPlaceholderImage(category: string): string {
    return PLACEHOLDER_IMAGES[category] || PLACEHOLDER_IMAGES.default;
}

interface SheetProduct {
    produto: string;
    categoria: string;
    preco: number;
    obs: string;
    unidade: string;
    destaque?: string;
}

interface SheetResponse {
    sucesso: boolean;
    ofertas: SheetProduct[];
}

/**
 * Fetch products from Google Sheets via Apps Script
 */
export async function fetchProductsFromSheet(): Promise<Product[]> {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SheetResponse = await response.json();

        if (!data.sucesso || !data.ofertas) {
            throw new Error('Formato de resposta inválido');
        }

        // Transform the data to match our app's format
        const products: Product[] = data.ofertas.map((item, index) => ({
            id: String(index + 1),
            name: item.produto,
            details: '',
            price: parseFloat(String(item.preco)),
            unit: (item.unidade || item.obs || 'kg').toUpperCase(),
            image: getProductImage(item.produto, item.categoria),
            isHighlight: item.destaque === 'X' || item.destaque === 'x' || false
        }));

        return products;

    } catch (error) {
        console.error('Erro ao buscar produtos da planilha:', error);
        throw error;
    }
}

/**
 * Check if the API is accessible
 */
export async function checkAPIConnection(): Promise<boolean> {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        return response.ok;
    } catch (error) {
        console.error('Erro ao verificar conexão com API:', error);
        return false;
    }
}
