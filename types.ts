export interface Product {
  id: string;
  name: string;
  details: string;
  price: number;
  unit: string;
  image: string;
  isHighlight: boolean;
  cols?: number;
  imageScale?: number;
  imageOffsetY?: number;
}

export type PaperSize = 'story' | 'feed' | 'a4' | 'a3' | 'letter';
export type Orientation = 'portrait' | 'landscape';

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
  customImage?: string;
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
  customImage?: string;
}

export interface TextStyle {
  family: string;
  scale: number;
}

export interface FontConfig {
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  productName: TextStyle;
  productDetails: TextStyle;
  price: TextStyle;
  unit: TextStyle;
}

export interface LayoutConfig {
  cardHeight: number;
  rowGap: number;
  cardStyle: 'classic' | 'compact';
}

export interface AppState {
  paperSize: PaperSize;
  orientation: Orientation;
  columns: number;
  autoRows: boolean;
  zoom: number;
  products: Product[];
  validUntil: string;
  seasonal: SeasonalConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  fonts: FontConfig;
  layout: LayoutConfig;
}
