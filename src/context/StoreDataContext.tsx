import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  COLLECTION_BANNERS,
  FEATURED_CATEGORIES,
  HERO_SLIDES,
  NAV_ITEMS,
  PRODUCTS,
  TESTIMONIALS,
} from '../data/catalog';
import { IMAGES } from '../data/images';
import {
  CollectionBannerItem,
  FeaturedCategory,
  HeroSlide,
  NavItem,
  OrderStatus,
  PlacedOrder,
  Product,
  StoreDataState,
  StoreSettings,
  TestimonialItem,
} from '../types/store';

export const STORE_STORAGE_KEY = 'aaroha_store_v1';

// Deterministic hash of default admin password (never stored in plain text)
export const DEFAULT_ADMIN_PASSWORD_HASH = '0ee691053e75c889';

export function hashSecret(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (
    (h2 >>> 0).toString(16).padStart(8, '0') +
    (h1 >>> 0).toString(16).padStart(8, '0')
  );
}

export async function compressUploadedImage(
  file: File,
  maxWidth = 1000,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        reject(new Error('Empty image data.'));
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 1000;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function getDefaultStoreSettings(): StoreSettings {
  return {
    storeName: 'AAROHA',
    whatsappNumber: '919820041290',
    email: 'care@aarohaatelier.com',
    phone: '+91 98200 41290 (Mon–Sat, 10 AM – 7 PM IST)',
    address: '14 Johari Courtyard, C-Scheme, Jaipur 302001',
    instagramUrl: 'https://instagram.com',
    facebookUrl: 'https://facebook.com',
    discountTiers: [
      { minQty: 2, discountPercent: 5 },
      { minQty: 3, discountPercent: 10 },
    ],
    footerText:
      'Modern Indian ethnic wear shaped by regional handlooms, natural fibers, and thoughtful made-to-order tailoring from our Jaipur atelier.',
    copyrightText: `© ${new Date().getFullYear()} AAROHA ATELIER. ALL RIGHTS RESERVED.`,
    editorialMadeToOrderImage: IMAGES.editorialSplits.madeToOrder,
    editorialCustomSizingImage: IMAGES.editorialSplits.customSizing,
    adminPasswordHash: DEFAULT_ADMIN_PASSWORD_HASH,
  };
}

export function getSeedStoreState(): StoreDataState {
  return {
    products: PRODUCTS.map((p) => ({
      ...p,
      collectionTags: [...p.collectionTags],
      sizes: [...p.sizes],
      visible: p.visible ?? true,
    })),
    heroSlides: HERO_SLIDES.map((s) => ({ ...s })),
    categories: FEATURED_CATEGORIES.map((c) => ({ ...c })),
    collectionBanners: COLLECTION_BANNERS.map((b) => ({ ...b })),
    testimonials: TESTIMONIALS.map((t) => ({
      ...t,
      rating: t.rating ?? 5,
    })),
    navItems: NAV_ITEMS.map((item) => ({
      ...item,
      columns: item.columns?.map((col) => ({
        ...col,
        links: col.links.map((l) => ({ ...l })),
      })),
    })),
    orders: [],
    settings: getDefaultStoreSettings(),
  };
}

function loadStoreState(): StoreDataState {
  const seed = getSeedStoreState();
  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<StoreDataState>;
    if (!parsed || typeof parsed !== 'object') return seed;

    const products = Array.isArray(parsed.products)
      ? parsed.products.map((p) => ({
          ...p,
          visible: p.visible !== false,
          onSale: Boolean(p.salePrice < p.price),
        }))
      : seed.products;

    const heroSlides = Array.isArray(parsed.heroSlides)
      ? parsed.heroSlides
      : seed.heroSlides;

    const categories = Array.isArray(parsed.categories)
      ? parsed.categories
      : seed.categories;

    const collectionBanners = Array.isArray(parsed.collectionBanners)
      ? parsed.collectionBanners
      : seed.collectionBanners;

    const testimonials = Array.isArray(parsed.testimonials)
      ? parsed.testimonials.map((t) => ({
          ...t,
          rating:
            typeof t.rating === 'number' && t.rating >= 1 && t.rating <= 5
              ? t.rating
              : 5,
        }))
      : seed.testimonials;

    const navItems = Array.isArray(parsed.navItems)
      ? parsed.navItems
      : seed.navItems;

    const orders = Array.isArray(parsed.orders)
      ? parsed.orders.map((o) => ({
          ...o,
          status: o.status ?? 'Placed',
        }))
      : seed.orders;

    const settings: StoreSettings = {
      ...seed.settings,
      ...(parsed.settings && typeof parsed.settings === 'object'
        ? parsed.settings
        : {}),
      discountTiers: Array.isArray(parsed.settings?.discountTiers)
        ? parsed.settings.discountTiers
        : seed.settings.discountTiers,
      adminPasswordHash:
        typeof parsed.settings?.adminPasswordHash === 'string' &&
        parsed.settings.adminPasswordHash.trim()
          ? parsed.settings.adminPasswordHash
          : seed.settings.adminPasswordHash,
    };

    return {
      products,
      heroSlides,
      categories,
      collectionBanners,
      testimonials,
      navItems,
      orders,
      settings,
    };
  } catch {
    return seed;
  }
}

interface StoreDataContextValue extends StoreDataState {
  visibleProducts: Product[];
  getDiscountRateForQty: (totalQty: number) => number;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setHeroSlides: React.Dispatch<React.SetStateAction<HeroSlide[]>>;
  setCategories: React.Dispatch<React.SetStateAction<FeaturedCategory[]>>;
  setCollectionBanners: React.Dispatch<
    React.SetStateAction<CollectionBannerItem[]>
  >;
  setTestimonials: React.Dispatch<React.SetStateAction<TestimonialItem[]>>;
  setNavItems: React.Dispatch<React.SetStateAction<NavItem[]>>;
  setOrders: React.Dispatch<React.SetStateAction<PlacedOrder[]>>;
  addOrder: (order: PlacedOrder) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateSettings: (partial: Partial<StoreSettings>) => void;
  importBackupData: (backup: Partial<StoreDataState>) => boolean;
  resetToDefault: () => void;
}

const StoreDataContext = createContext<StoreDataContextValue | null>(null);

export const StoreDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<StoreDataState>(() => loadStoreState());

  useEffect(() => {
    try {
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota or private mode errors
    }
  }, [state]);

  // Listen for cross-tab storage updates
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORE_STORAGE_KEY) {
        setState(loadStoreState());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const visibleProducts = useMemo(
    () => state.products.filter((p) => p.visible !== false),
    [state.products]
  );

  const getDiscountRateForQty = useCallback(
    (totalQty: number): number => {
      if (totalQty <= 0) return 0;
      const sorted = [...state.settings.discountTiers]
        .filter((t) => t.minQty > 0 && t.discountPercent > 0)
        .sort((a, b) => b.minQty - a.minQty);
      for (const tier of sorted) {
        if (totalQty >= tier.minQty) {
          return Math.min(90, Math.max(0, tier.discountPercent)) / 100;
        }
      }
      return 0;
    },
    [state.settings.discountTiers]
  );

  const setProducts: React.Dispatch<React.SetStateAction<Product[]>> =
    useCallback((updater) => {
      setState((prev) => ({
        ...prev,
        products:
          typeof updater === 'function' ? updater(prev.products) : updater,
      }));
    }, []);

  const setHeroSlides: React.Dispatch<React.SetStateAction<HeroSlide[]>> =
    useCallback((updater) => {
      setState((prev) => ({
        ...prev,
        heroSlides:
          typeof updater === 'function' ? updater(prev.heroSlides) : updater,
      }));
    }, []);

  const setCategories: React.Dispatch<
    React.SetStateAction<FeaturedCategory[]>
  > = useCallback((updater) => {
    setState((prev) => ({
      ...prev,
      categories:
        typeof updater === 'function' ? updater(prev.categories) : updater,
    }));
  }, []);

  const setCollectionBanners: React.Dispatch<
    React.SetStateAction<CollectionBannerItem[]>
  > = useCallback((updater) => {
    setState((prev) => ({
      ...prev,
      collectionBanners:
        typeof updater === 'function'
          ? updater(prev.collectionBanners)
          : updater,
    }));
  }, []);

  const setTestimonials: React.Dispatch<
    React.SetStateAction<TestimonialItem[]>
  > = useCallback((updater) => {
    setState((prev) => ({
      ...prev,
      testimonials:
        typeof updater === 'function' ? updater(prev.testimonials) : updater,
    }));
  }, []);

  const setNavItems: React.Dispatch<React.SetStateAction<NavItem[]>> =
    useCallback((updater) => {
      setState((prev) => ({
        ...prev,
        navItems:
          typeof updater === 'function' ? updater(prev.navItems) : updater,
      }));
    }, []);

  const setOrders: React.Dispatch<React.SetStateAction<PlacedOrder[]>> =
    useCallback((updater) => {
      setState((prev) => ({
        ...prev,
        orders: typeof updater === 'function' ? updater(prev.orders) : updater,
      }));
    }, []);

  const addOrder = useCallback((order: PlacedOrder) => {
    setState((prev) => ({
      ...prev,
      orders: [
        { ...order, status: order.status ?? 'Placed' },
        ...prev.orders.filter((o) => o.orderId !== order.orderId),
      ],
    }));
  }, []);

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.orderId === orderId ? { ...o, status } : o
        ),
      }));
    },
    []
  );

  const updateSettings = useCallback((partial: Partial<StoreSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...partial,
      },
    }));
  }, []);

  const importBackupData = useCallback(
    (backup: Partial<StoreDataState>): boolean => {
      if (!backup || typeof backup !== 'object') return false;
      const seed = getSeedStoreState();
      setState((prev) => ({
        products: Array.isArray(backup.products)
          ? backup.products.map((p) => ({
              ...p,
              visible: p.visible !== false,
              onSale: Boolean(p.salePrice < p.price),
            }))
          : prev.products,
        heroSlides: Array.isArray(backup.heroSlides)
          ? backup.heroSlides
          : prev.heroSlides,
        categories: Array.isArray(backup.categories)
          ? backup.categories
          : prev.categories,
        collectionBanners: Array.isArray(backup.collectionBanners)
          ? backup.collectionBanners
          : prev.collectionBanners,
        testimonials: Array.isArray(backup.testimonials)
          ? backup.testimonials.map((t) => ({
              ...t,
              rating:
                typeof t.rating === 'number' && t.rating >= 1 && t.rating <= 5
                  ? t.rating
                  : 5,
            }))
          : prev.testimonials,
        navItems: Array.isArray(backup.navItems)
          ? backup.navItems
          : prev.navItems,
        orders: Array.isArray(backup.orders)
          ? backup.orders.map((o) => ({
              ...o,
              status: o.status ?? 'Placed',
            }))
          : prev.orders,
        settings: {
          ...seed.settings,
          ...prev.settings,
          ...(backup.settings && typeof backup.settings === 'object'
            ? backup.settings
            : {}),
        },
      }));
      return true;
    },
    []
  );

  const resetToDefault = useCallback(() => {
    const seed = getSeedStoreState();
    setState(seed);
  }, []);

  const value = useMemo<StoreDataContextValue>(
    () => ({
      ...state,
      visibleProducts,
      getDiscountRateForQty,
      setProducts,
      setHeroSlides,
      setCategories,
      setCollectionBanners,
      setTestimonials,
      setNavItems,
      setOrders,
      addOrder,
      updateOrderStatus,
      updateSettings,
      importBackupData,
      resetToDefault,
    }),
    [
      state,
      visibleProducts,
      getDiscountRateForQty,
      setProducts,
      setHeroSlides,
      setCategories,
      setCollectionBanners,
      setTestimonials,
      setNavItems,
      setOrders,
      addOrder,
      updateOrderStatus,
      updateSettings,
      importBackupData,
      resetToDefault,
    ]
  );

  return (
    <StoreDataContext.Provider value={value}>
      {children}
    </StoreDataContext.Provider>
  );
};

export function useStoreData(): StoreDataContextValue {
  const ctx = useContext(StoreDataContext);
  if (!ctx) {
    throw new Error('useStoreData must be used within a StoreDataProvider');
  }
  return ctx;
}
