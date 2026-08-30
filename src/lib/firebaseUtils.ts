import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { BRAND_NAME } from './brand';
import { Product, PaymentInfo, SiteContent } from './types';

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export async function getProducts(category?: string): Promise<Product[]> {
  try {
    let q;
    if (category && category !== 'all') {
      q = query(
        collection(db, 'products'),
        where('status', '==', 'published'),
        where('category', '==', category)
      );
    } else {
      q = query(collection(db, 'products'), where('status', '==', 'published'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch {
    return [];
  }
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  } catch {
    return [];
  }
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

// ─── PAYMENT INFO ─────────────────────────────────────────────────────────────

export async function getPaymentInfo(): Promise<PaymentInfo | null> {
  try {
    const docRef = doc(db, 'settings', 'payment');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as PaymentInfo;
    }
    return null;
  } catch {
    return null;
  }
}

export async function updatePaymentInfo(data: PaymentInfo): Promise<void> {
  await setDoc(doc(db, 'settings', 'payment'), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ─── SITE CONTENT ─────────────────────────────────────────────────────────────

export const defaultSiteContent: SiteContent = {
  hero: {
    title: BRAND_NAME,
    subtitle: 'Accesorios premium para el caballero moderno',
    backgroundImage: '',
    ctaText: 'Ver Colección',
  },
  announcementBar: {
    messages: [
      '🚚 Delivery a todo el país',
      '💎 Calidad garantizada',
      '📦 Envíos express disponibles',
      '🔥 Nuevos productos cada semana',
    ],
    isVisible: true,
  },
  delivery: {
    title: 'Envíos Rápidos y Seguros',
    subtitle: 'Tu pedido llega a donde estés',
    features: [
      { icon: '🚚', title: 'Delivery Nacional', description: 'Enviamos a todo el país' },
      { icon: '⚡', title: 'Envío Rápido', description: 'Entrega en 24-72 horas' },
      { icon: '📦', title: 'Empaque Seguro', description: 'Productos protegidos' },
      { icon: '✅', title: 'Garantía', description: 'Satisfacción garantizada' },
    ],
  },
  categories: ['Relojes', 'Billeteras', 'Cinturones', 'Lentes', 'Cadenas', 'Pulseras', 'Anillos'],
};

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const docRef = doc(db, 'settings', 'siteContent');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SiteContent;
    }
    return defaultSiteContent;
  } catch {
    return defaultSiteContent;
  }
}

export async function updateSiteContent(data: Partial<SiteContent>): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'siteContent'),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
