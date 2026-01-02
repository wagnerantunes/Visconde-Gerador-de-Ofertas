import { AppState } from './types';
import { SEASONAL_THEMES, DEFAULT_HEADER, DEFAULT_FOOTER } from './seasonalThemes';
import { MOCK_IMAGES } from './constants';

export interface TemplatePreset {
    id: string;
    name: string;
    category: 'natal' | 'pascoa' | 'generico' | 'promocao';
    description: string;
    thumbnail: string;
    state: Partial<AppState>;
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
    {
        id: 'natal-classico',
        name: 'Natal Clássico',
        category: 'natal',
        description: 'Layout tradicional de Natal com 3 colunas',
        thumbnail: '🎄',
        state: {
            seasonal: SEASONAL_THEMES.natal,
            columns: 3,
            paperSize: 'a4',
            orientation: 'portrait',
            layout: { cardHeight: 280, rowGap: 16, cardStyle: 'classic' },
            validUntil: '25/12/2024',
            products: [
                { id: '1', name: 'Peru Natalino', price: 89.90, unit: 'KG', isHighlight: true, details: 'Especial para o Natal', image: MOCK_IMAGES[0], pageId: 'auto' },
                { id: '2', name: 'Chester', price: 45.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[1], pageId: 'auto' },
                { id: '3', name: 'Tender', price: 52.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[2], pageId: 'auto' },
            ]
        }
    },
    {
        id: 'pascoa-premium',
        name: 'Páscoa Premium',
        category: 'pascoa',
        description: 'Layout elegante para Páscoa com destaque',
        thumbnail: '🐰',
        state: {
            seasonal: SEASONAL_THEMES.pascoa,
            columns: 2,
            paperSize: 'a4',
            orientation: 'portrait',
            layout: { cardHeight: 320, rowGap: 20, cardStyle: 'classic' },
            validUntil: '31/03/2024',
            products: [
                { id: '1', name: 'Cordeiro', price: 79.90, unit: 'KG', isHighlight: true, details: 'Especial Páscoa', image: MOCK_IMAGES[3], pageId: 'auto' },
                { id: '2', name: 'Bacalhau', price: 129.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[4], pageId: 'auto' },
            ]
        }
    },
    {
        id: 'semana-compacto',
        name: 'Semanal Compacto',
        category: 'generico',
        description: 'Layout compacto para ofertas semanais',
        thumbnail: '📅',
        state: {
            seasonal: SEASONAL_THEMES.semana,
            columns: 4,
            paperSize: 'a4',
            orientation: 'portrait',
            layout: { cardHeight: 240, rowGap: 12, cardStyle: 'classic' },
            validUntil: '07/01/2024',
            products: [
                { id: '1', name: 'Picanha', price: 59.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[0], pageId: 'auto' },
                { id: '2', name: 'Alcatra', price: 39.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[1], pageId: 'auto' },
                { id: '3', name: 'Fraldinha', price: 42.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[2], pageId: 'auto' },
                { id: '4', name: 'Costela', price: 35.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[3], pageId: 'auto' },
            ]
        }
    },
    {
        id: 'black-friday',
        name: 'Black Friday',
        category: 'promocao',
        description: 'Layout impactante para promoções especiais',
        thumbnail: '🔥',
        state: {
            seasonal: SEASONAL_THEMES.blackfriday,
            columns: 3,
            paperSize: 'a4',
            orientation: 'portrait',
            layout: { cardHeight: 300, rowGap: 18, cardStyle: 'classic' },
            validUntil: '30/11/2024',
            products: [
                { id: '1', name: 'Picanha', price: 49.90, unit: 'KG', isHighlight: true, details: 'Super Oferta!', image: MOCK_IMAGES[0], pageId: 'auto' },
                { id: '2', name: 'Alcatra', price: 29.90, unit: 'KG', isHighlight: true, details: 'Imperdível!', image: MOCK_IMAGES[1], pageId: 'auto' },
                { id: '3', name: 'Fraldinha', price: 32.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[2], pageId: 'auto' },
            ]
        }
    },
    {
        id: 'churrasco',
        name: 'Especial Churrasco',
        category: 'generico',
        description: 'Layout focado em carnes para churrasco',
        thumbnail: '🥩',
        state: {
            seasonal: SEASONAL_THEMES.semana,
            columns: 3,
            paperSize: 'a3',
            orientation: 'landscape',
            layout: { cardHeight: 280, rowGap: 16, cardStyle: 'classic' },
            validUntil: '15/01/2024',
            products: [
                { id: '1', name: 'Picanha', price: 59.90, unit: 'KG', isHighlight: true, details: 'Premium', image: MOCK_IMAGES[0], pageId: 'auto' },
                { id: '2', name: 'Costela', price: 35.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[3], pageId: 'auto' },
                { id: '3', name: 'Linguiça', price: 24.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[4], pageId: 'auto' },
                { id: '4', name: 'Frango', price: 18.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[5], pageId: 'auto' },
            ]
        }
    },
    {
        id: 'minimalista',
        name: 'Minimalista',
        category: 'generico',
        description: 'Layout limpo e moderno com 2 colunas',
        thumbnail: '✨',
        state: {
            seasonal: SEASONAL_THEMES.semana,
            columns: 2,
            paperSize: 'a4',
            orientation: 'portrait',
            layout: { cardHeight: 350, rowGap: 24, cardStyle: 'classic' },
            validUntil: '31/12/2024',
            products: [
                { id: '1', name: 'Picanha', price: 59.90, unit: 'KG', isHighlight: true, details: 'Selecionada', image: MOCK_IMAGES[0], pageId: 'auto' },
                { id: '2', name: 'Alcatra', price: 39.90, unit: 'KG', isHighlight: false, details: '', image: MOCK_IMAGES[1], pageId: 'auto' },
            ]
        }
    },
];

export const TEMPLATE_CATEGORIES = [
    { id: 'todos', label: 'Todos', icon: 'apps' },
    { id: 'natal', label: 'Natal', icon: 'celebration' },
    { id: 'pascoa', label: 'Páscoa', icon: 'egg' },
    { id: 'promocao', label: 'Promoções', icon: 'local_offer' },
    { id: 'generico', label: 'Genérico', icon: 'inventory_2' },
] as const;
