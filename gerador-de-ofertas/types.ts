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

export interface AppState {
  format: FormatType;
  columns: number;
  autoRows: boolean;
  zoom: number;
  products: Product[];
  storeName: string;
  validUntil: string;
}
