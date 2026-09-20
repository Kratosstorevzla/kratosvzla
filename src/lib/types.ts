import { CurrencyCode } from './currency';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  images: string[];
  inStock: boolean;
  featured: boolean;
  discount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  status: 'draft' | 'published';
}

export interface PaymentInfo {
  id?: string;
  bank: string;
  phone: string;
  cedula: string;
  holderName: string;
  updatedAt?: Date | string;
}

export interface SiteContent {
  id?: string;
  /**
   * Moneda en la que se muestran todos los precios del sitio.
   * Opcional: el contenido guardado antes de existir este ajuste no la trae,
   * y en ese caso se usa la moneda por defecto (ver `resolveCurrency`).
   */
  currency?: CurrencyCode;
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
  };
  announcementBar: {
    messages: string[];
    isVisible: boolean;
  };
  delivery: {
    title: string;
    subtitle: string;
    features: { icon: string; title: string; description: string }[];
  };
  categories: string[];
  updatedAt?: Date | string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}
