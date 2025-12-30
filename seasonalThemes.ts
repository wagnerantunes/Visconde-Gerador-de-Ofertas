import { SeasonalConfig } from './types';

export const SEASONAL_THEMES: Record<string, SeasonalConfig> = {
    semana: {
        theme: 'semana',
        title: 'Ofertas',
        subtitle: 'Da Semana',
        primaryColor: '#c62828',
        secondaryColor: '#ffca28',
        icon: 'restaurant',
        backgroundPattern: 'cubes'
    },
    fds: {
        theme: 'fds',
        title: 'Ofertas',
        subtitle: 'Do Final de Semana',
        primaryColor: '#1976d2',
        secondaryColor: '#ffd54f',
        icon: 'weekend',
        backgroundPattern: 'cubes'
    },
    carnaval: {
        theme: 'carnaval',
        title: 'Ofertas',
        subtitle: 'De Carnaval',
        primaryColor: '#7b1fa2',
        secondaryColor: '#ffeb3b',
        icon: 'celebration',
        backgroundPattern: 'confetti'
    },
    pascoa: {
        theme: 'pascoa',
        title: 'Ofertas',
        subtitle: 'De Páscoa',
        primaryColor: '#8d6e63',
        secondaryColor: '#ffccbc',
        icon: 'egg',
        backgroundPattern: 'dots'
    },
    junino: {
        theme: 'junino',
        title: 'Ofertas',
        subtitle: 'Juninas',
        primaryColor: '#f57c00',
        secondaryColor: '#fff176',
        icon: 'local_fire_department',
        backgroundPattern: 'squares'
    },
    natal: {
        theme: 'natal',
        title: 'Ofertas',
        subtitle: 'De Natal',
        primaryColor: '#c62828',
        secondaryColor: '#4caf50',
        icon: 'card_giftcard',
        backgroundPattern: 'snowflakes'
    },
    'ano-novo': {
        theme: 'ano-novo',
        title: 'Ofertas',
        subtitle: 'De Ano Novo',
        primaryColor: '#ffd700',
        secondaryColor: '#ffffff',
        icon: 'celebration',
        backgroundPattern: 'stars'
    },
    'black-friday': {
        theme: 'black-friday',
        title: 'Black',
        subtitle: 'Friday',
        primaryColor: '#000000',
        secondaryColor: '#ff6f00',
        icon: 'local_offer',
        backgroundPattern: 'diagonal-stripes'
    }
};

export const DEFAULT_HEADER = {
    storeName: 'Visconde Carnes',
    showLogo: false,
    logoUrl: '',
    title: 'Qualidade',
    subtitle: 'Visconde'
};

export const DEFAULT_FOOTER = {
    addresses: [
        'Rua Manoel José Pedro, 96 - Campinas',
        'Av. Benjamin Constant, 1015 - Campinas'
    ],
    phone: '(19) 99800-3041',
    showSocial: true,
    socialLinks: {
        facebook: '',
        instagram: '',
        whatsapp: '5519998003041'
    }
};
