export interface Page {
  id: string;
}

export interface Product {
  id: string;
  pageId?: string;
  name: string;
  details: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  isHighlight: boolean;
  cols?: number;
  rows?: number;
  imageScale?: number;
  imageOffsetY?: number;
  imageOffsetX?: number;
  type?: 'product' | 'divider';
  backgroundColor?: string;
  textColor?: string;
  stylePreset?: 'classic' | 'modern' | 'glass' | 'bold' | 'gradient';
  cardLayout?: 'vertical' | 'horizontal' | 'reversed' | 'horizontal-reversed';
  showPriceBadge?: boolean;
  priceStyle?: 'classic' | 'minimal' | 'badge' | 'star' | 'outline';
  stickerText?: string;
  stickerStyle?: 'ribbon' | 'badge' | 'tag' | 'neon';
  dividerTheme?: 'default' | 'meat' | 'produce' | 'bakery' | 'beverages' | 'clean';
  secondarySettings?: {
    layout: Layout;
    columns: number;
    fonts: Record<string, { family: string; scale: number; color?: string }>;
  };
}

export type PaperSize = 'story' | 'feed' | 'feed-story' | 'a4' | 'a3' | 'letter';
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
  showFooter?: boolean;
  addresses: string[];
  phone: string;
  showSocial: boolean;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
  customImage?: string;
  showQrCode?: boolean;
  qrCodeText?: string;
}

export interface TextStyle {
  family: string;
  scale: number;
  color?: string;
}

export interface FontConfig {
  storeName: TextStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  productName: TextStyle;
  productDetails: TextStyle;
  price: TextStyle;
  unit: TextStyle;
  sticker: TextStyle;
}

export interface LayoutConfig {
  cardHeight: number;
  rowGap: number;
  cardStyle: 'classic' | 'compact';
  priceStyle?: 'classic' | 'minimal' | 'badge' | 'star' | 'outline';
  stickerStyle?: 'ribbon' | 'badge' | 'tag' | 'neon';
  stickerScale?: number;
  borderRadius?: number;
  stickerScale?: number;
  borderRadius?: number;
  shadowIntensity?: number;
  imagePadding?: number;
  contentPadding?: number;
  visibleFields?: {
    price?: boolean;
    unit?: boolean;
    details?: boolean;
    originalPrice?: boolean;
  };
}

export interface AppState {
  paperSize: PaperSize;
  orientation: Orientation;
  pages: Page[];
  columns: number;
  autoRows: boolean;
  zoom: number;
  products: Product[];
  validUntil: string;
  validFrom?: string;
  seasonal: SeasonalConfig;
  header: HeaderConfig;
  footer: FooterConfig;
  fonts: FontConfig;
  layout: LayoutConfig;
  backgroundTexture?: 'none' | 'kraft' | 'marble' | 'wood' | 'noise' | 'grid';
  googleScriptUrl?: string;
}
