import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CartItem, PlacedOrder, Product, SizeOption, SortOption } from './types/store';
import { StoreDataProvider, useStoreData } from './context/StoreDataContext';
import { Header } from './components/Header';
import { HeroSlideshow } from './components/HeroSlideshow';
import { FeaturedCollections } from './components/FeaturedCollections';
import { RecommendedProducts } from './components/RecommendedProducts';
import { CollectionBanners } from './components/CollectionBanners';
import { BrandStory } from './components/BrandStory';
import { EditorialSplits } from './components/EditorialSplits';
import { Testimonials } from './components/Testimonials';
import { IconFeatures } from './components/IconFeatures';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { AccountModal } from './components/AccountModal';
import { AtelierGuideModal } from './components/AtelierGuideModal';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderSuccessPage } from './components/OrderSuccessPage';
import { AdminPanel } from './components/AdminPanel';

const ORDER_STORAGE_KEY = 'aaroha_last_order';
const CART_STORAGE_KEY = 'aaroha_cart_v1';

type OverlayType = 'cart' | 'menu' | 'search' | 'account' | 'guide' | 'zoom';
type ScrollMode = 'top' | 'restore' | 'catalog';

type GlobalToast =
  | { kind: 'added'; productTitle: string }
  | { kind: 'undo'; item: CartItem; index: number };

function getProductIdFromHash(hash: string): string | null {
  const match = hash.match(/^#\/product\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function normalizeRouteHash(rawHash: string, availableProducts: Product[]): string {
  if (!rawHash || rawHash === '#' || rawHash === '#/' || rawHash === '#top') {
    return '#/';
  }
  if (
    rawHash === '#/checkout' ||
    rawHash === '#/order-success' ||
    rawHash === '#/admin'
  ) {
    return rawHash;
  }
  const prodId = getProductIdFromHash(rawHash);
  if (prodId && availableProducts.some((p) => p.id === prodId)) {
    return `#/product/${encodeURIComponent(prodId)}`;
  }
  // Fallback any invalid route cleanly to Home
  return '#/';
}

function loadStoredOrder(): PlacedOrder | null {
  try {
    const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlacedOrder) : null;
  } catch {
    return null;
  }
}

function loadStoredCart(availableProducts: Product[]): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: CartItem[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue;
      const prodId = entry.product?.id;
      const matched = availableProducts.find((p) => p.id === prodId);
      if (!matched) continue;
      const qty = Number(entry.quantity);
      if (!Number.isFinite(qty) || qty < 1) continue;
      const size =
        typeof entry.size === 'string'
          ? (entry.size as SizeOption)
          : matched.sizes[0];
      const customNote =
        typeof entry.customNote === 'string' && entry.customNote.trim()
          ? entry.customNote.trim()
          : undefined;
      const key = `${matched.id}__${size}__${customNote ?? ''}`;
      valid.push({
        key,
        product: matched,
        size,
        quantity: Math.min(20, Math.floor(qty)),
        customNote,
      });
    }
    return valid;
  } catch {
    return [];
  }
}

function AppContent() {
  const { products, visibleProducts, addOrder } = useStoreData();
  const productsRef = useRef<Product[]>(products);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const initialHash = useMemo(
    () => normalizeRouteHash(window.location.hash, products),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [routeHash, setRouteHash] = useState<string>(initialHash);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    loadStoredCart(products)
  );
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(() =>
    loadStoredOrder()
  );
  const [toast, setToast] = useState<GlobalToast | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Unified overlay state (history-synced)
  const [activeOverlay, setActiveOverlay] = useState<OverlayType | null>(null);
  const [guideTopic, setGuideTopic] = useState<
    'Made to Order' | 'Custom Sizing' | null
  >(null);

  // Checkout dirty confirmation dialog
  const [checkoutConfirmOpen, setCheckoutConfirmOpen] = useState(false);

  // Refs for scroll restoration, history depth, and guards
  const routeHashRef = useRef<string>(initialHash);
  const activeOverlayRef = useRef<OverlayType | null>(null);
  const internalDepthRef = useRef<number>(0);
  const homeScrollYRef = useRef<number>(0);
  const pendingScrollModeRef = useRef<ScrollMode>('top');
  const checkoutDirtyRef = useRef<boolean>(false);
  const allowLeaveCheckoutRef = useRef<boolean>(false);
  const ignoreNextPopRef = useRef<boolean>(false);

  useEffect(() => {
    routeHashRef.current = routeHash;
  }, [routeHash]);

  useEffect(() => {
    activeOverlayRef.current = activeOverlay;
  }, [activeOverlay]);

  // Keep cart item product snapshots synchronized when Admin updates/deletes products
  useEffect(() => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          const fresh = products.find((p) => p.id === item.product.id);
          return fresh ? { ...item, product: fresh } : null;
        })
        .filter((item): item is CartItem => item !== null)
    );
  }, [products]);

  // Persist cart items to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore storage quota/privacy mode errors
    }
  }, [cartItems]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showTimedToast = (nextToast: GlobalToast, durationMs: number) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(nextToast);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, durationMs);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  };

  // Seed safe initial history stack on mount so direct links (#/product/id or #/admin) never exit app on Back
  useEffect(() => {
    if (window.location.hash !== initialHash) {
      window.history.replaceState(
        { __aaroha: true, hash: initialHash, depth: 0 },
        '',
        initialHash
      );
    }

    if (
      initialHash.startsWith('#/product/') ||
      initialHash === '#/checkout' ||
      initialHash === '#/admin'
    ) {
      window.history.replaceState(
        { __aaroha: true, hash: '#/', depth: 0 },
        '',
        '#/'
      );
      window.history.pushState(
        { __aaroha: true, hash: initialHash, depth: 1 },
        '',
        initialHash
      );
      internalDepthRef.current = 1;
    } else {
      window.history.replaceState(
        { __aaroha: true, hash: initialHash, depth: 0 },
        '',
        initialHash
      );
      internalDepthRef.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track Home scrollY continuously while on Home so Back always restores exact scroll
  useEffect(() => {
    if (routeHash !== '#/') return;
    const onScroll = () => {
      if (routeHashRef.current === '#/' && !activeOverlayRef.current) {
        homeScrollYRef.current = window.scrollY;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [routeHash]);

  // Scroll restoration / top-reset after route changes
  useLayoutEffect(() => {
    const mode = pendingScrollModeRef.current;
    if (routeHash === '#/' && mode === 'restore') {
      const targetY = homeScrollYRef.current;
      window.scrollTo({ top: targetY, behavior: 'instant' });
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: 'instant' });
      });
    } else if (routeHash === '#/' && mode === 'catalog') {
      window.setTimeout(() => {
        const section = document.getElementById('recommended-products');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [routeHash]);

  // Listen to both popstate and hashchange for Android back button, gestures, and desktop mode
  useEffect(() => {
    const handleHistoryNavigation = (e?: PopStateEvent) => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
        return;
      }

      const rawHash = window.location.hash || '#/';
      const stateObj = (e?.state ?? window.history.state) as
        | { __aaroha?: boolean; __aarohaOverlay?: OverlayType; hash?: string; depth?: number }
        | null;

      // 1. If an overlay is open and history stepped back to a non-overlay state -> close overlay only
      if (activeOverlayRef.current && !stateObj?.__aarohaOverlay) {
        setActiveOverlay(null);
        setGuideTopic(null);
        if (typeof stateObj?.depth === 'number') {
          internalDepthRef.current = stateObj.depth;
        } else {
          internalDepthRef.current = Math.max(0, internalDepthRef.current - 1);
        }
        return;
      }

      // If switching to a different overlay in history
      if (stateObj?.__aarohaOverlay) {
        setActiveOverlay(stateObj.__aarohaOverlay);
        return;
      }

      const prevRoute = routeHashRef.current;
      const nextRoute = normalizeRouteHash(rawHash, productsRef.current);

      // Normalize invalid route back to #/
      if (rawHash !== nextRoute && !(rawHash === '' && nextRoute === '#/')) {
        window.history.replaceState(
          { __aaroha: true, hash: nextRoute, depth: 0 },
          '',
          nextRoute
        );
      }

      // 2. From Order Success -> Back ALWAYS goes to Home (#/), never back to Checkout
      if (prevRoute === '#/order-success' && nextRoute !== '#/') {
        window.history.replaceState(
          { __aaroha: true, hash: '#/', depth: 0 },
          '',
          '#/'
        );
        internalDepthRef.current = 0;
        pendingScrollModeRef.current = 'top';
        setActiveOverlay(null);
        setGuideTopic(null);
        setRouteHash('#/');
        return;
      }

      // 3. From Checkout with unsaved form data -> ask confirmation before leaving
      if (
        prevRoute === '#/checkout' &&
        nextRoute !== '#/checkout' &&
        nextRoute !== '#/order-success' &&
        checkoutDirtyRef.current &&
        !allowLeaveCheckoutRef.current
      ) {
        window.history.pushState(
          { __aaroha: true, hash: '#/checkout', depth: internalDepthRef.current },
          '',
          '#/checkout'
        );
        setCheckoutConfirmOpen(true);
        return;
      }

      allowLeaveCheckoutRef.current = false;
      setCheckoutConfirmOpen(false);
      setActiveOverlay(null);
      setGuideTopic(null);

      if (typeof stateObj?.depth === 'number') {
        internalDepthRef.current = stateObj.depth;
      }

      // Restore Home scroll position when returning to Home from another route
      if (nextRoute === '#/' && prevRoute !== '#/') {
        pendingScrollModeRef.current =
          prevRoute === '#/order-success' ? 'top' : 'restore';
      } else {
        pendingScrollModeRef.current = 'top';
      }

      setRouteHash(nextRoute);
    };

    const onPopState = (e: PopStateEvent) => handleHistoryNavigation(e);
    const onHashChange = () => handleHistoryNavigation();

    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const isCheckoutRoute = routeHash === '#/checkout';
  const isOrderSuccessRoute = routeHash === '#/order-success';
  const isAdminRoute = routeHash === '#/admin';

  const activeProductId = useMemo(
    () => getProductIdFromHash(routeHash),
    [routeHash]
  );

  const activeProduct = useMemo(
    () =>
      activeProductId
        ? products.find((p) => p.id === activeProductId && p.visible !== false) ?? null
        : null,
    [activeProductId, products]
  );

  const anyOverlayOpen = Boolean(activeOverlay) || checkoutConfirmOpen;

  // Lock background page scroll while drawers, menus, or modals are open
  useEffect(() => {
    if (!anyOverlayOpen) {
      document.body.style.overflow = '';
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [anyOverlayOpen]);

  // Overlay helpers synced with browser history
  const openOverlay = (
    type: OverlayType,
    topic?: 'Made to Order' | 'Custom Sizing'
  ) => {
    if (activeOverlayRef.current === type) return;

    const currentHash = routeHashRef.current || '#/';
    const nextDepth = internalDepthRef.current + 1;
    internalDepthRef.current = nextDepth;

    if (type === 'guide' && topic) {
      setGuideTopic(topic);
    }

    // If replacing an existing overlay, update instead of stacking double overlays
    if (activeOverlayRef.current) {
      window.history.replaceState(
        { __aarohaOverlay: type, hash: currentHash, depth: internalDepthRef.current - 1 },
        '',
        currentHash
      );
      internalDepthRef.current -= 1;
    } else {
      window.history.pushState(
        { __aarohaOverlay: type, hash: currentHash, depth: nextDepth },
        '',
        currentHash
      );
    }
    setActiveOverlay(type);
  };

  const closeOverlay = () => {
    if (!activeOverlayRef.current) return;
    if (window.history.state?.__aarohaOverlay) {
      window.history.back();
    } else {
      setActiveOverlay(null);
      setGuideTopic(null);
    }
  };

  // Close top overlay with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (checkoutConfirmOpen) {
          setCheckoutConfirmOpen(false);
        } else if (activeOverlayRef.current) {
          closeOverlay();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [checkoutConfirmOpen]);

  const filteredProducts = useMemo(() => {
    const base =
      activeFilter === 'ALL'
        ? visibleProducts
        : activeFilter === 'SALE'
        ? visibleProducts.filter((p) => p.onSale)
        : visibleProducts.filter(
            (p) =>
              p.category.toLowerCase() === activeFilter.toLowerCase() ||
              p.subCategory.toLowerCase() === activeFilter.toLowerCase() ||
              p.collectionTags.some(
                (tag) => tag.toLowerCase() === activeFilter.toLowerCase()
              )
          );

    const sorted = [...base];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.salePrice - a.salePrice);
    } else if (sortBy === 'title-asc') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [activeFilter, sortBy, visibleProducts]);

  const pushRoute = (
    targetHash: string,
    options?: { replace?: boolean; scrollMode?: ScrollMode }
  ) => {
    if (routeHashRef.current === '#/') {
      homeScrollYRef.current = window.scrollY;
    }

    pendingScrollModeRef.current = options?.scrollMode ?? 'top';

    const replacingOverlay = Boolean(activeOverlayRef.current);
    setActiveOverlay(null);
    setGuideTopic(null);

    if (options?.replace || replacingOverlay) {
      const depth = replacingOverlay
        ? internalDepthRef.current
        : options?.replace && targetHash === '#/'
        ? 0
        : internalDepthRef.current;
      window.history.replaceState(
        { __aaroha: true, hash: targetHash, depth },
        '',
        targetHash
      );
      internalDepthRef.current = depth;
    } else {
      if (routeHashRef.current === targetHash) {
        return;
      }
      const nextDepth = internalDepthRef.current + 1;
      internalDepthRef.current = nextDepth;
      window.history.pushState(
        { __aaroha: true, hash: targetHash, depth: nextDepth },
        '',
        targetHash
      );
    }

    setRouteHash(targetHash);
  };

  const navigateToProduct = (product: Product) => {
    pushRoute(`#/product/${encodeURIComponent(product.id)}`, {
      scrollMode: 'top',
    });
  };

  const navigateToHome = (filterKey?: string, scrollToCatalog = false) => {
    if (filterKey) {
      setActiveFilter(filterKey);
    }
    pushRoute('#/', {
      replace: routeHashRef.current === '#/order-success',
      scrollMode: scrollToCatalog ? 'catalog' : 'top',
    });
  };

  const navigateToCheckout = () => {
    pushRoute('#/checkout', { scrollMode: 'top' });
  };

  // Unified safe Back handler for in-app back arrows
  const handleAppBack = () => {
    if (activeOverlayRef.current) {
      closeOverlay();
      return;
    }
    if (internalDepthRef.current > 0 && window.history.length > 1) {
      window.history.back();
    } else {
      pendingScrollModeRef.current = 'top';
      window.history.replaceState(
        { __aaroha: true, hash: '#/', depth: 0 },
        '',
        '#/'
      );
      internalDepthRef.current = 0;
      setRouteHash('#/');
    }
  };

  const handleRequestCheckoutBack = (isDirty: boolean) => {
    if (isDirty) {
      setCheckoutConfirmOpen(true);
      return;
    }
    handleAppBack();
  };

  const handleConfirmLeaveCheckout = () => {
    allowLeaveCheckoutRef.current = true;
    checkoutDirtyRef.current = false;
    setCheckoutConfirmOpen(false);
    handleAppBack();
  };

  const handleOrderPlaced = (order: PlacedOrder) => {
    const savedOrder: PlacedOrder = {
      ...order,
      status: order.status ?? 'Placed',
    };
    addOrder(savedOrder);
    setLastOrder(savedOrder);
    try {
      sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(savedOrder));
    } catch {
      // ignore storage errors
    }
    dismissToast();
    checkoutDirtyRef.current = false;
    setCartItems([]);
    // Replace Checkout entry in history so Back from Order Success skips Checkout
    pushRoute('#/order-success', { replace: true, scrollMode: 'top' });
  };

  const handleSelectFilter = (filterKey: string, scroll = true) => {
    if (activeProduct || isCheckoutRoute || isOrderSuccessRoute || isAdminRoute) {
      navigateToHome(filterKey, scroll);
      return;
    }
    setActiveFilter(filterKey);
    if (activeOverlayRef.current === 'menu' || activeOverlayRef.current === 'search') {
      // Close drawer smoothly then scroll
      closeOverlay();
      if (scroll) {
        window.setTimeout(() => {
          document
            .getElementById('recommended-products')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
      return;
    }
    if (scroll) {
      const section = document.getElementById('recommended-products');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleAddToCart = (
    product: Product,
    size: SizeOption,
    quantity: number,
    customNote?: string,
    openCheckout = false
  ) => {
    const cleanNote = customNote?.trim() || undefined;
    const key = `${product.id}__${size}__${cleanNote ?? ''}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { key, product, size, quantity, customNote: cleanNote }];
    });
    if (openCheckout) {
      dismissToast();
      navigateToCheckout();
    } else {
      showTimedToast({ kind: 'added', productTitle: product.title }, 2000);
    }
  };

  const handleRemoveItem = (key: string) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.key === key);
      if (idx === -1) return prev;
      const removedItem = prev[idx];
      showTimedToast({ kind: 'undo', item: removedItem, index: idx }, 5000);
      return prev.filter((item) => item.key !== key);
    });
  };

  const handleUpdateQuantity = (key: string, delta: number) => {
    const target = cartItems.find((item) => item.key === key);
    if (!target) return;
    if (target.quantity + delta <= 0) {
      handleRemoveItem(key);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
    );
  };

  const handleUndoRemove = () => {
    if (!toast || toast.kind !== 'undo') return;
    const { item, index } = toast;
    dismissToast();
    setCartItems((prev) => {
      const existing = prev.find((i) => i.key === item.key);
      if (existing) {
        return prev.map((i) =>
          i.key === item.key
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      const next = [...prev];
      const insertAt = Math.min(Math.max(0, index), next.length);
      next.splice(insertAt, 0, item);
      return next;
    });
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Full-page Admin Panel Route (hides customer header, WhatsApp button, cart, and footer)
  if (isAdminRoute) {
    return (
      <div key="admin-page" className="aaroha-page-enter">
        <AdminPanel onExitAdmin={handleAppBack} />
      </div>
    );
  }

  const GlobalToastBanner = toast ? (
    toast.kind === 'added' ? (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-[90px] left-1/2 -translate-x-1/2 z-[45] max-w-[220px] px-4 py-2 bg-[#321004] text-white border border-[#c8a078] shadow-md text-[14px] font-medium leading-tight whitespace-nowrap text-center pointer-events-none"
      >
        Added to bag
      </div>
    ) : (
      <div
        role="status"
        aria-live="polite"
        className={`fixed z-[60] ${
          activeOverlay === 'cart'
            ? cartItems.length > 0
              ? 'bottom-[178px] left-4 right-4 sm:left-auto sm:right-6 sm:w-[372px]'
              : 'bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-[372px]'
            : isCheckoutRoute
            ? 'bottom-[86px] left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] max-w-[380px]'
            : activeProduct
            ? 'bottom-[90px] left-4 right-[76px] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto sm:max-w-[360px]'
            : 'bottom-4 left-4 right-[76px] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto sm:max-w-[360px]'
        } bg-[#321004] text-white border border-[#c8a078] shadow-xl px-4 py-2.5 flex items-center justify-between gap-3`}
      >
        <span className="text-[12px] font-medium tracking-[0.4px] leading-snug min-w-0">
          Item hata diya
        </span>

        <button
          type="button"
          onClick={handleUndoRemove}
          className="min-h-[36px] px-3 bg-[#dcb48c] hover:bg-white text-[#321004] text-[11px] font-semibold uppercase tracking-[1px] cursor-pointer whitespace-nowrap shrink-0"
        >
          UNDO
        </button>
      </div>
    )
  ) : null;

  // Full-page Checkout Route
  if (isCheckoutRoute) {
    return (
      <div key="checkout-page" className="aaroha-page-enter">
        <CheckoutPage
          items={cartItems}
          confirmLeaveOpen={checkoutConfirmOpen}
          onDirtyChange={(dirty) => {
            checkoutDirtyRef.current = dirty;
          }}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onRequestBack={handleRequestCheckoutBack}
          onStay={() => setCheckoutConfirmOpen(false)}
          onConfirmGoBack={handleConfirmLeaveCheckout}
          onGoHome={() => {
            allowLeaveCheckoutRef.current = true;
            checkoutDirtyRef.current = false;
            navigateToHome('ALL', false);
          }}
          onOrderPlaced={handleOrderPlaced}
        />
        {GlobalToastBanner}
      </div>
    );
  }

  // Full-page Order Success Route
  if (isOrderSuccessRoute) {
    return (
      <div key="order-success-page" className="aaroha-page-enter">
        <OrderSuccessPage
          order={lastOrder}
          onContinueShopping={() => navigateToHome('ALL', false)}
        />
      </div>
    );
  }

  return (
    <div
      id="top"
      className={`min-h-screen flex flex-col bg-white text-[#000000] ${
        activeProduct ? 'pb-[72px]' : ''
      }`}
    >
      {/* Home renders main Store Header; Product page renders its own compact sticky topbar */}
      {!activeProduct && (
        <Header
          cartCount={cartCount}
          activeFilter={activeFilter}
          mobileDrawerOpen={activeOverlay === 'menu'}
          onMobileDrawerOpenChange={(open) =>
            open ? openOverlay('menu') : closeOverlay()
          }
          onSelectFilter={(key) => handleSelectFilter(key, true)}
          onGoHome={() => navigateToHome('ALL', false)}
          onOpenCart={() => openOverlay('cart')}
          onOpenSearch={() => openOverlay('search')}
          onOpenAccount={() => openOverlay('account')}
        />
      )}

      <main className="flex-1">
        {activeProduct ? (
          <div key={`pdp-${activeProduct.id}`} className="aaroha-page-enter">
            <ProductDetailPage
              product={activeProduct}
              cartItems={cartItems}
              cartCount={cartCount}
              zoomOpen={activeOverlay === 'zoom'}
              onBack={handleAppBack}
              onBackHome={(filterKey) =>
                navigateToHome(filterKey, Boolean(filterKey))
              }
              onOpenCart={() => openOverlay('cart')}
              onOpenZoom={() => openOverlay('zoom')}
              onCloseZoom={closeOverlay}
              onSelectProduct={navigateToProduct}
              onAddToCart={handleAddToCart}
              onOpenSizeGuide={() => openOverlay('guide', 'Custom Sizing')}
            />
          </div>
        ) : (
          <div key="home-page" className="aaroha-page-enter">
            {/* Full-Width Slideshow */}
            <HeroSlideshow
              onExploreFilter={(key) => handleSelectFilter(key, true)}
            />

            {/* Featured Collections */}
            <FeaturedCollections
              onSelectCategory={(key) => handleSelectFilter(key, true)}
            />

            {/* Recommended For You Product Slider / Mobile 2-Col Grid + Filter/Sort */}
            <RecommendedProducts
              products={filteredProducts}
              activeFilter={activeFilter}
              sortBy={sortBy}
              onSelectFilter={(key) => handleSelectFilter(key, false)}
              onChangeSort={setSortBy}
              onOpenProduct={navigateToProduct}
            />

            {/* Collection Banner Section (Festive & Work Wear) */}
            <CollectionBanners
              onSelectCollection={(key) => handleSelectFilter(key, true)}
            />

            {/* Rich Text Brand Story Section */}
            <BrandStory />

            {/* Image + Content Split Blocks */}
            <EditorialSplits
              onOpenCustomGuide={(topic) => openOverlay('guide', topic)}
            />

            {/* Customer Testimonials */}
            <Testimonials />

            {/* Icon Features Strip */}
            <IconFeatures />
          </div>
        )}
      </main>

      {/* Dark Brown Footer */}
      <Footer
        onSelectFilter={(key) => handleSelectFilter(key, true)}
        onOpenCustomGuide={(topic) => openOverlay('guide', topic)}
        onOpenAccount={() => openOverlay('account')}
        onSecretAdminOpen={() => pushRoute('#/admin', { scrollMode: 'top' })}
      />

      {/* Interactive Overlays, Drawers & WhatsApp Floating Button */}
      <WhatsAppButton
        hidden={anyOverlayOpen}
        aboveStickyBar={Boolean(activeProduct)}
      />

      <CartDrawer
        open={activeOverlay === 'cart'}
        items={cartItems}
        onClose={closeOverlay}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={navigateToCheckout}
        onSelectProduct={navigateToProduct}
      />

      <SearchOverlay
        open={activeOverlay === 'search'}
        onClose={closeOverlay}
        onSelectProduct={navigateToProduct}
        onSelectFilter={(key) => handleSelectFilter(key, true)}
      />

      <AccountModal
        open={activeOverlay === 'account'}
        onClose={closeOverlay}
      />

      <AtelierGuideModal
        topic={activeOverlay === 'guide' ? guideTopic : null}
        onClose={closeOverlay}
      />

      {GlobalToastBanner}
    </div>
  );
}

export default function App() {
  return (
    <StoreDataProvider>
      <AppContent />
    </StoreDataProvider>
  );
}
