export interface Product {
  id: string;
  name: string;
  details: string;
  price: number;
  unit: string;
  image: string;
  isHighlight: boolean;
}

export type FormatType = 'portrait' | 'story';

export type SeasonalTheme = 'semana' | 'fds' | 'carnaval' | 'pascoa' | 'junino' | 'natal' | 'ano-novo' | 'black-friday';

export interface SeasonalConfig {
  theme: SeasonalTheme;
  title: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  icon: string;
  backgroundPattern?: string;
}

export interface HeaderConfig {
  storeName: string;
  showLogo: boolean;
  logoUrl: string;
  title: string;
  subtitle: string;
}

export interface FooterConfig {
  addresses: string[];
  phone: string;
  showSocial: boolean;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
}

export interface AppState {
  format: FormatType;
  columns: number;
  autoRows: boolean;
  zoom: number;
  products: Product[];
  validUntil: string;
  seasonal: SeasonalConfig;
  header: HeaderConfig;
  footer: FooterConfig;
}
