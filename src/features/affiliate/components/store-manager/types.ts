/**
 * أنواع بيانات مدير المتجر
 * Types for Store Manager
 */

export interface Store {
  id: string;
  store_name: string;
  bio: string;
  store_slug: string;
  logo_url?: string;
  theme: string;
  total_sales: number;
  total_orders: number;
}

export interface HeroSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_cta_text: string;
  hero_cta_color: string;
  hero_image_url: string;
}

export interface EditData {
  store_name: string;
  bio: string;
  theme: string;
}

export type TabValue =
  | 'general'
  | 'appearance'
  | 'hero'
  | 'banners'
  | 'categories'
  | 'products'
  | 'coupons'
  | 'reviews'
  | 'chat'
  | 'sharing'
  | 'analytics';

export interface Theme {
  value: string;
  label: string;
  colors: string;
}

export interface AffiliateStoreManagerProps {
  store: Store;
  onUpdateStore?: (storeData: any) => void;
  onGenerateQR?: () => void;
}

export type CurrentSection = 'main' | 'products' | 'orders';
