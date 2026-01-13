import { AppState } from './types';

export interface BrandPreset {
    id: string;
    name: string;
    icon: string;
    colors: {
        primary: string;
        secondary: string;
    };
    fonts: {
        price: string;
        productName: string;
    };
    texture: 'none' | 'kraft' | 'marble' | 'wood' | 'noise' | 'grid';
    layout?: {
        cardStyle: 'classic' | 'modern' | 'minimal' | 'glass';
        priceStyle: 'classic' | 'star' | 'badge' | 'outline' | 'minimal';
    };
}

export const BRAND_PRESETS: BrandPreset[] = [
    {
        id: 'premium-meat',
        name: 'Açougue Premium',
        icon: 'restaurant',
        colors: { primary: '#4a0404', secondary: '#d4af37' },
        fonts: { price: 'Anton', productName: 'Lilita One' },
        texture: 'wood',
        layout: { cardStyle: 'modern', priceStyle: 'star' }
    },
    {
        id: 'fresh-horti',
        name: 'Hortifruti',
        icon: 'eco',
        colors: { primary: '#2d5a27', secondary: '#f9f871' },
        fonts: { price: 'Lilita One', productName: 'Montserrat' },
        texture: 'grid',
        layout: { cardStyle: 'classic', priceStyle: 'badge' }
    },
    {
        id: 'clean-modern',
        name: 'Clean Modern',
        icon: 'auto_awesome',
        colors: { primary: '#1a1a1a', secondary: '#00d4ff' },
        fonts: { price: 'Roboto', productName: 'Roboto' },
        texture: 'none',
        layout: { cardStyle: 'glass', priceStyle: 'outline' }
    },
    {
        id: 'super-oferta',
        name: 'Super Oferta',
        icon: 'local_fire_department',
        colors: { primary: '#ff0000', secondary: '#ffff00' },
        fonts: { price: 'Anton', productName: 'Anton' },
        texture: 'noise',
        layout: { cardStyle: 'classic', priceStyle: 'star' }
    }
];
