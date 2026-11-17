import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Copy,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FolderKanban,
  Image as ImageIcon,
  LayoutDashboard,
  ListTree,
  Lock,
  LogOut,
  Megaphone,
  MessageSquareQuote,
  Package,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  compressUploadedImage,
  hashSecret,
  useStoreData,
} from '../context/StoreDataContext';
import {
  CollectionBannerItem,
  DiscountTier,
  FeaturedCategory,
  HeroSlide,
  NavItem,
  OrderStatus,
  PlacedOrder,
  Product,
  SizeOption,
  StoreDataState,
  TestimonialItem,
} from '../types/store';
import { formatINR } from '../utils/currency';
import { SmartImage } from './SmartImage';

const ADMIN_SESSION_KEY = 'aaroha_admin_session_v1';
const ADMIN_LOCK_KEY = 'aaroha_admin_lock_until_v1';

const ALL_SIZES: SizeOption[] = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'Custom',
];

const PRODUCT_CATEGORIES: Product['category'][] = [
  'Suit Sets',
  'Kurtas',
  'Co-ord Sets',
  'Kids',
];

const ORDER_STATUSES: OrderStatus[] = [
  'Placed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

type AdminSectionId =
  | 'dashboard'
  | 'products'
  | 'hero'
  | 'categories'
  | 'banners'
  | 'testimonials'
  | 'menu'
  | 'orders'
  | 'settings';

interface AdminToast {
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
}

interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

function makeSlugId(prefix: string, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 22);
  const rand = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${slug || 'item'}-${rand}`;
}

function extractHexFromFallback(tone: string): string {
  const match = tone.match(/#[0-9a-fA-F]{6}/);
  return match ? match[0] : '#f2f2f2';
}

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  fallbackBg?: string;
  aspectClass?: string;
}

const ImageField: React.FC<ImageFieldProps> = ({
  label,
  value,
  onChange,
  fallbackBg = 'linear-gradient(135deg, #f2f2f2, #e8e8e8)',
  aspectClass = 'aspect-[3/4] w-24',
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr(null);
    try {
      const base64 = await compressUploadedImage(file, 1000, 0.8);
      onChange(base64);
    } catch {
      setUploadErr('Photo process nahi ho saki. Doosri image chunein.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434]">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={value.startsWith('data:image/') ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            value.startsWith('data:image/')
              ? 'Uploaded photo attached (paste URL to replace)'
              : 'Paste image URL (https://...)'
          }
          className="flex-1 min-w-0 h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
        />

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="min-h-[44px] px-3.5 bg-[#f2f2f2] hover:bg-[#321004] text-[#000000] hover:text-white border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[1px] inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span>{uploading ? 'Compressing...' : 'Upload Photo'}</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Clear image"
              className="min-h-[44px] min-w-[44px] px-2.5 border border-[#e8e8e8] text-[#777777] hover:text-[#d74a5d] hover:border-[#d74a5d] inline-flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {uploadErr && <p className="text-[12px] text-[#d74a5d]">{uploadErr}</p>}

      <div className="flex items-center gap-3 pt-1">
        <div
          className={`${aspectClass} shrink-0 border border-[#e8e8e8] bg-[#f2f2f2] overflow-hidden`}
        >
          <SmartImage
            src={value}
            alt={label}
            width={200}
            height={260}
            className="w-full h-full object-cover"
            fallbackBg={fallbackBg}
          />
        </div>
        <div className="text-[11px] text-[#777777] leading-relaxed min-w-0">
          {value ? (
            <span className="text-[#15803d] font-medium">
              ✓ Live preview active (auto-compressed for fast loading)
            </span>
          ) : (
            <span>
              Empty URL · Site par clean color block dikhega (no broken image)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface AdminPanelProps {
  onExitAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitAdmin }) => {
  const {
    products,
    heroSlides,
    categories,
    collectionBanners,
    testimonials,
    navItems,
    orders,
    settings,
    setProducts,
    setHeroSlides,
    setCategories,
    setCollectionBanners,
    setTestimonials,
    setNavItems,
    setOrders,
    updateOrderStatus,
    updateSettings,
    importBackupData,
    resetToDefault,
  } = useStoreData();

  // Auth & Lockout state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number>(() => {
    try {
      const raw = sessionStorage.getItem(ADMIN_LOCK_KEY);
      return raw ? Number(raw) : 0;
    } catch {
      return 0;
    }
  });
  const [lockRemainingSec, setLockRemainingSec] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Section
  const [activeSection, setActiveSection] =
    useState<AdminSectionId>('dashboard');

  // Keyboard open detector (hides mobile bottom tab bar when virtual keyboard opens)
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const focusOutTimerRef = useRef<number | null>(null);

  // Toast & Undo state
  const [toast, setToast] = useState<AdminToast | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] =
    useState<ConfirmDialogState | null>(null);

  // 30-second lockout countdown ticker
  useEffect(() => {
    const updateTicker = () => {
      const diff = Math.ceil((lockUntil - Date.now()) / 1000);
      if (diff > 0) {
        setLockRemainingSec(diff);
      } else {
        setLockRemainingSec(0);
      }
    };
    updateTicker();
    const id = window.setInterval(updateTicker, 500);
    return () => window.clearInterval(id);
  }, [lockUntil]);

  // Keyboard listener so bottom tab bar hides when typing on mobile
  useEffect(() => {
    const isInputEl = (el: EventTarget | null): el is HTMLElement => {
      if (!el || !(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === 'INPUT') {
        const type = (el as HTMLInputElement).type;
        return (
          type !== 'checkbox' &&
          type !== 'radio' &&
          type !== 'button' &&
          type !== 'submit' &&
          type !== 'file' &&
          type !== 'color'
        );
      }
      return tag === 'TEXTAREA' || tag === 'SELECT';
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!isInputEl(e.target)) return;
      if (focusOutTimerRef.current) {
        window.clearTimeout(focusOutTimerRef.current);
      }
      setKeyboardOpen(true);
    };

    const onFocusOut = (e: FocusEvent) => {
      if (!isInputEl(e.target)) return;
      if (focusOutTimerRef.current) {
        window.clearTimeout(focusOutTimerRef.current);
      }
      focusOutTimerRef.current = window.setTimeout(() => {
        if (!isInputEl(document.activeElement)) {
          setKeyboardOpen(false);
        }
      }, 150);
    };

    const vv = window.visualViewport;
    const onResize = () => {
      if (!vv) return;
      if (vv.height < window.innerHeight * 0.75) {
        setKeyboardOpen(true);
      } else if (!isInputEl(document.activeElement)) {
        setKeyboardOpen(false);
      }
    };

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    vv?.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      vv?.removeEventListener('resize', onResize);
      if (focusOutTimerRef.current) {
        window.clearTimeout(focusOutTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (
    message: string,
    onUndo?: () => void,
    durationMs = onUndo ? 5000 : 2400
  ) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({
      message,
      undoLabel: onUndo ? 'UNDO' : undefined,
      onUndo,
    });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, durationMs);
  };

  // ---------------- LOGIN HANDLER ----------------
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockRemainingSec > 0) return;

    const enteredHash = hashSecret(passwordInput);
    if (enteredHash === settings.adminPasswordHash) {
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
        sessionStorage.removeItem(ADMIN_LOCK_KEY);
      } catch {
        // ignore storage errors
      }
      setIsAuthenticated(true);
      setPasswordInput('');
      setFailedAttempts(0);
      setLoginError(null);
      return;
    }

    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    setPasswordInput('');

    if (nextAttempts >= 5) {
      const until = Date.now() + 30_000;
      setLockUntil(until);
      setFailedAttempts(0);
      try {
        sessionStorage.setItem(ADMIN_LOCK_KEY, String(until));
      } catch {
        // ignore
      }
      setLoginError('5 galat koshishein. Kripya 30 second intezaar karein.');
    } else {
      setLoginError(
        `Galat password (${nextAttempts}/5 attempts). Phir se koshish karein.`
      );
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // ---------------- B) PRODUCTS STATE & HANDLERS ----------------
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<string>('ALL');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productTagInput, setProductTagInput] = useState('');
  const [productErrors, setProductErrors] = useState<Record<string, string>>(
    {}
  );

  const openAddProduct = () => {
    const draft: Product = {
      id: '',
      title: '',
      category: 'Suit Sets',
      subCategory: 'Straight',
      collectionTags: ['Festive'],
      price: 4999,
      salePrice: 3999,
      onSale: true,
      primaryImage: '',
      secondaryImage: '',
      fallbackTone: '#f2f2f2',
      fabric: 'Pure Chanderi Silk · Cotton Mulmul Lining',
      description: '',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom'],
      dispatchDays: 'Made to order in 7–10 business days',
      visible: true,
    };
    setEditingProduct(draft);
    setProductTagInput(draft.collectionTags.join(', '));
    setIsCreatingProduct(true);
    setProductErrors({});
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct({
      ...prod,
      collectionTags: [...prod.collectionTags],
      sizes: [...prod.sizes],
      visible: prod.visible !== false,
    });
    setProductTagInput(prod.collectionTags.join(', '));
    setIsCreatingProduct(false);
    setProductErrors({});
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const errs: Record<string, string> = {};
    if (!editingProduct.title.trim()) {
      errs.title = 'Product title zaroori hai.';
    }
    const priceNum = Number(editingProduct.price);
    const saleNum = Number(editingProduct.salePrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      errs.price = 'Valid MRP price daalein.';
    }
    if (!Number.isFinite(saleNum) || saleNum <= 0) {
      errs.salePrice = 'Valid Sale price daalein.';
    } else if (Number.isFinite(priceNum) && saleNum > priceNum) {
      errs.salePrice = 'Sale price MRP se zyada nahi ho sakti.';
    }
    if (editingProduct.sizes.length === 0) {
      errs.sizes = 'Kam se kam ek size chunein.';
    }

    if (Object.keys(errs).length > 0) {
      setProductErrors(errs);
      return;
    }

    const tags = productTagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const finalProduct: Product = {
      ...editingProduct,
      id:
        isCreatingProduct || !editingProduct.id
          ? makeSlugId('aar', editingProduct.title)
          : editingProduct.id,
      title: editingProduct.title.trim(),
      subCategory: editingProduct.subCategory.trim() || editingProduct.category,
      collectionTags: tags.length > 0 ? tags : [editingProduct.category],
      price: Math.round(priceNum),
      salePrice: Math.round(saleNum),
      onSale: Math.round(saleNum) < Math.round(priceNum),
      fabric: editingProduct.fabric.trim() || 'Handcrafted Indian Textile',
      description:
        editingProduct.description.trim() ||
        `${editingProduct.title.trim()} handcrafted in our Jaipur atelier.`,
      dispatchDays:
        editingProduct.dispatchDays.trim() ||
        'Made to order in 7–10 business days',
      visible: editingProduct.visible !== false,
    };

    if (isCreatingProduct) {
      setProducts((prev) => [finalProduct, ...prev]);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === finalProduct.id ? finalProduct : p))
      );
    }

    setEditingProduct(null);
    setIsCreatingProduct(false);
    showToast('Saved');
  };

  const handleDuplicateProduct = (prod: Product) => {
    const copy: Product = {
      ...prod,
      id: makeSlugId('aar', `${prod.title}-copy`),
      title: `${prod.title} (Copy)`,
      collectionTags: [...prod.collectionTags],
      sizes: [...prod.sizes],
      visible: prod.visible !== false,
    };
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === prod.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    showToast('Saved');
  };

  const handleDeleteProduct = (prod: Product) => {
    setConfirmDialog({
      title: 'Delete Product?',
      message: `"${prod.title}" ko catalog se hatana chahte hain?`,
      confirmLabel: 'DELETE',
      onConfirm: () => {
        const index = products.findIndex((p) => p.id === prod.id);
        setProducts((prev) => prev.filter((p) => p.id !== prod.id));
        setConfirmDialog(null);
        showToast('Deleted', () => {
          setProducts((prev) => {
            if (prev.some((p) => p.id === prod.id)) return prev;
            const next = [...prev];
            next.splice(Math.min(Math.max(0, index), next.length), 0, prod);
            return next;
          });
        });
      },
    });
  };

  const handleToggleProductVisible = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, visible: p.visible === false } : p
      )
    );
    showToast('Saved');
  };

  const filteredAdminProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat =
        productCatFilter === 'ALL' || p.category === productCatFilter;
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, productSearch, productCatFilter]);

  // ---------------- C) HERO SLIDES STATE & HANDLERS ----------------
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isCreatingSlide, setIsCreatingSlide] = useState(false);
  const [slideError, setSlideError] = useState<string | null>(null);

  const openAddSlide = () => {
    setEditingSlide({
      id: '',
      eyebrow: 'NEW SEASON EDIT',
      title: '',
      subtitle: '',
      ctaLabel: 'SHOP NOW',
      filterKey: 'Suit Sets',
      desktopImage: '',
      mobileImage: '',
      fallbackBg: 'linear-gradient(135deg, #321004, #5a2a14)',
    });
    setIsCreatingSlide(true);
    setSlideError(null);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    if (!editingSlide.title.trim()) {
      setSlideError('Heading zaroori hai.');
      return;
    }
    const cleanSlide: HeroSlide = {
      ...editingSlide,
      id:
        isCreatingSlide || !editingSlide.id
          ? makeSlugId('slide', editingSlide.title)
          : editingSlide.id,
      eyebrow: editingSlide.eyebrow.trim() || 'AAROHA EDIT',
      title: editingSlide.title.trim(),
      subtitle: editingSlide.subtitle.trim(),
      ctaLabel: editingSlide.ctaLabel.trim() || 'SHOP NOW',
      filterKey: editingSlide.filterKey.trim() || 'ALL',
      mobileImage: editingSlide.mobileImage || editingSlide.desktopImage,
    };

    if (isCreatingSlide) {
      setHeroSlides((prev) => [...prev, cleanSlide]);
    } else {
      setHeroSlides((prev) =>
        prev.map((s) => (s.id === cleanSlide.id ? cleanSlide : s))
      );
    }
    setEditingSlide(null);
    setIsCreatingSlide(false);
    showToast('Saved');
  };

  const moveHeroSlide = (index: number, dir: -1 | 1) => {
    setHeroSlides((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    showToast('Saved');
  };

  const handleDeleteSlide = (slide: HeroSlide) => {
    const idx = heroSlides.findIndex((s) => s.id === slide.id);
    setHeroSlides((prev) => prev.filter((s) => s.id !== slide.id));
    showToast('Deleted', () => {
      setHeroSlides((prev) => {
        if (prev.some((s) => s.id === slide.id)) return prev;
        const next = [...prev];
        next.splice(Math.min(Math.max(0, idx), next.length), 0, slide);
        return next;
      });
    });
  };

  // ---------------- D) CATEGORIES STATE & HANDLERS ----------------
  const [editingCategory, setEditingCategory] =
    useState<FeaturedCategory | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const openAddCategory = () => {
    setEditingCategory({
      id: '',
      name: '',
      filterKey: 'Suit Sets',
      image: '',
      fallbackTone: 'linear-gradient(135deg, #f2f2f2, #e8e8e8)',
    });
    setIsCreatingCategory(true);
    setCategoryError(null);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.name.trim()) {
      setCategoryError('Category naam zaroori hai.');
      return;
    }
    const cleanCat: FeaturedCategory = {
      ...editingCategory,
      id:
        isCreatingCategory || !editingCategory.id
          ? makeSlugId('cat', editingCategory.name)
          : editingCategory.id,
      name: editingCategory.name.trim(),
      filterKey:
        editingCategory.filterKey.trim() || editingCategory.name.trim(),
    };
    if (isCreatingCategory) {
      setCategories((prev) => [...prev, cleanCat]);
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === cleanCat.id ? cleanCat : c))
      );
    }
    setEditingCategory(null);
    setIsCreatingCategory(false);
    showToast('Saved');
  };

  const moveCategory = (index: number, dir: -1 | 1) => {
    setCategories((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    showToast('Saved');
  };

  const handleDeleteCategory = (cat: FeaturedCategory) => {
    const idx = categories.findIndex((c) => c.id === cat.id);
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    showToast('Deleted', () => {
      setCategories((prev) => {
        if (prev.some((c) => c.id === cat.id)) return prev;
        const next = [...prev];
        next.splice(Math.min(Math.max(0, idx), next.length), 0, cat);
        return next;
      });
    });
  };

  // ---------------- E) COLLECTION BANNERS STATE & HANDLERS ----------------
  const [editingBanner, setEditingBanner] =
    useState<CollectionBannerItem | null>(null);
  const [isCreatingBanner, setIsCreatingBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const openAddBanner = () => {
    setEditingBanner({
      id: '',
      eyebrow: 'CURATED EDIT',
      title: '',
      subtitle: '',
      ctaLabel: 'SHOP NOW',
      filterKey: 'Festive',
      image: '',
      fallbackBg: 'linear-gradient(135deg, #321004, #5a2a14)',
    });
    setIsCreatingBanner(true);
    setBannerError(null);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    if (!editingBanner.title.trim()) {
      setBannerError('Banner heading zaroori hai.');
      return;
    }
    const cleanBanner: CollectionBannerItem = {
      ...editingBanner,
      id:
        isCreatingBanner || !editingBanner.id
          ? makeSlugId('banner', editingBanner.title)
          : editingBanner.id,
      eyebrow: editingBanner.eyebrow?.trim() || 'ATELIER EDIT',
      title: editingBanner.title.trim(),
      subtitle: editingBanner.subtitle.trim(),
      ctaLabel: editingBanner.ctaLabel.trim() || 'SHOP NOW',
      filterKey:
        editingBanner.filterKey.trim() || editingBanner.title.trim(),
    };
    if (isCreatingBanner) {
      setCollectionBanners((prev) => [...prev, cleanBanner]);
    } else {
      setCollectionBanners((prev) =>
        prev.map((b) => (b.id === cleanBanner.id ? cleanBanner : b))
      );
    }
    setEditingBanner(null);
    setIsCreatingBanner(false);
    showToast('Saved');
  };

  const moveBanner = (index: number, dir: -1 | 1) => {
    setCollectionBanners((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    showToast('Saved');
  };

  const handleDeleteBanner = (banner: CollectionBannerItem) => {
    const idx = collectionBanners.findIndex((b) => b.id === banner.id);
    setCollectionBanners((prev) => prev.filter((b) => b.id !== banner.id));
    showToast('Deleted', () => {
      setCollectionBanners((prev) => {
        if (prev.some((b) => b.id === banner.id)) return prev;
        const next = [...prev];
        next.splice(Math.min(Math.max(0, idx), next.length), 0, banner);
        return next;
      });
    });
  };

  // ---------------- F) TESTIMONIALS STATE & HANDLERS ----------------
  const [editingTestimonial, setEditingTestimonial] =
    useState<TestimonialItem | null>(null);
  const [isCreatingTestimonial, setIsCreatingTestimonial] = useState(false);
  const [testimonialError, setTestimonialError] = useState<string | null>(null);

  const openAddTestimonial = () => {
    setEditingTestimonial({
      id: '',
      name: '',
      city: '',
      rating: 5,
      review: '',
      outfitBought: 'Handcrafted Suit Set',
      avatar: '',
    });
    setIsCreatingTestimonial(true);
    setTestimonialError(null);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    if (
      !editingTestimonial.name.trim() ||
      !editingTestimonial.review.trim()
    ) {
      setTestimonialError('Customer naam aur review text zaroori hai.');
      return;
    }
    const cleanRev: TestimonialItem = {
      ...editingTestimonial,
      id:
        isCreatingTestimonial || !editingTestimonial.id
          ? makeSlugId('rev', editingTestimonial.name)
          : editingTestimonial.id,
      name: editingTestimonial.name.trim(),
      city: editingTestimonial.city.trim() || 'India',
      rating: Math.min(5, Math.max(1, Number(editingTestimonial.rating) || 5)),
      review: editingTestimonial.review.trim(),
      outfitBought: editingTestimonial.outfitBought.trim(),
    };
    if (isCreatingTestimonial) {
      setTestimonials((prev) => [cleanRev, ...prev]);
    } else {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === cleanRev.id ? cleanRev : t))
      );
    }
    setEditingTestimonial(null);
    setIsCreatingTestimonial(false);
    showToast('Saved');
  };

  const handleDeleteTestimonial = (item: TestimonialItem) => {
    const idx = testimonials.findIndex((t) => t.id === item.id);
    setTestimonials((prev) => prev.filter((t) => t.id !== item.id));
    showToast('Deleted', () => {
      setTestimonials((prev) => {
        if (prev.some((t) => t.id === item.id)) return prev;
        const next = [...prev];
        next.splice(Math.min(Math.max(0, idx), next.length), 0, item);
        return next;
      });
    });
  };

  // ---------------- G) MENU (NAV_ITEMS) STATE & HANDLERS ----------------
  const [editingNavIndex, setEditingNavIndex] = useState<number | null>(null);
  const [editingNavItem, setEditingNavItem] = useState<NavItem | null>(null);
  const [navHeadingInput, setNavHeadingInput] = useState('Subcategories');
  const [navSubLinks, setNavSubLinks] = useState<
    { label: string; filterKey: string }[]
  >([]);
  const [navError, setNavError] = useState<string | null>(null);

  const openAddNavItem = () => {
    setEditingNavIndex(-1);
    setEditingNavItem({
      label: '',
      filterKey: 'ALL',
      isSale: false,
      megaImage: '',
    });
    setNavHeadingInput('Featured Edits');
    setNavSubLinks([]);
    setNavError(null);
  };

  const openEditNavItem = (item: NavItem, idx: number) => {
    setEditingNavIndex(idx);
    setEditingNavItem({ ...item });
    const firstCol = item.columns?.[0];
    setNavHeadingInput(firstCol?.heading || 'Subcategories');
    setNavSubLinks(
      firstCol?.links ? firstCol.links.map((l) => ({ ...l })) : []
    );
    setNavError(null);
  };

  const handleSaveNavItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNavItem || editingNavIndex === null) return;
    if (!editingNavItem.label.trim()) {
      setNavError('Menu label zaroori hai.');
      return;
    }
    const validLinks = navSubLinks
      .map((l) => ({
        label: l.label.trim(),
        filterKey: l.filterKey.trim() || l.label.trim(),
      }))
      .filter((l) => l.label);

    const updatedItem: NavItem = {
      label: editingNavItem.label.trim().toUpperCase(),
      filterKey:
        editingNavItem.filterKey.trim() || editingNavItem.label.trim(),
      isSale: Boolean(editingNavItem.isSale),
      megaImage: editingNavItem.megaImage || undefined,
      columns:
        validLinks.length > 0
          ? [
              {
                heading: navHeadingInput.trim() || 'Categories',
                links: validLinks,
              },
            ]
          : undefined,
    };

    if (editingNavIndex === -1) {
      setNavItems((prev) => [...prev, updatedItem]);
    } else {
      setNavItems((prev) =>
        prev.map((it, i) => (i === editingNavIndex ? updatedItem : it))
      );
    }
    setEditingNavIndex(null);
    setEditingNavItem(null);
    showToast('Saved');
  };

  const moveNavItem = (index: number, dir: -1 | 1) => {
    setNavItems((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    showToast('Saved');
  };

  const handleDeleteNavItem = (item: NavItem, index: number) => {
    setNavItems((prev) => prev.filter((_, i) => i !== index));
    showToast('Deleted', () => {
      setNavItems((prev) => {
        const next = [...prev];
        next.splice(Math.min(Math.max(0, index), next.length), 0, item);
        return next;
      });
    });
  };

  // ---------------- H) ORDERS STATE & HANDLERS ----------------
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = useMemo(
    () => orders.find((o) => o.orderId === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const handleDeleteOrder = (order: PlacedOrder) => {
    setConfirmDialog({
      title: 'Delete Order?',
      message: `Order ${order.orderId} (${order.address.fullName}) ko delete karna chahte hain?`,
      confirmLabel: 'DELETE',
      onConfirm: () => {
        const idx = orders.findIndex((o) => o.orderId === order.orderId);
        setOrders((prev) => prev.filter((o) => o.orderId !== order.orderId));
        if (selectedOrderId === order.orderId) {
          setSelectedOrderId(null);
        }
        setConfirmDialog(null);
        showToast('Deleted', () => {
          setOrders((prev) => {
            if (prev.some((o) => o.orderId === order.orderId)) return prev;
            const next = [...prev];
            next.splice(Math.min(Math.max(0, idx), next.length), 0, order);
            return next;
          });
        });
      },
    });
  };

  // ---------------- I) SETTINGS & BACKUP STATE & HANDLERS ----------------
  const [settingsForm, setSettingsForm] = useState(() => ({
    storeName: settings.storeName,
    whatsappNumber: settings.whatsappNumber,
    email: settings.email,
    phone: settings.phone,
    address: settings.address,
    instagramUrl: settings.instagramUrl,
    facebookUrl: settings.facebookUrl,
    footerText: settings.footerText,
    copyrightText: settings.copyrightText,
    discountTiers: settings.discountTiers.map((t) => ({ ...t })),
  }));
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordChangeErr, setPasswordChangeErr] = useState<string | null>(
    null
  );
  const backupFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettingsForm({
      storeName: settings.storeName,
      whatsappNumber: settings.whatsappNumber,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      instagramUrl: settings.instagramUrl,
      facebookUrl: settings.facebookUrl,
      footerText: settings.footerText,
      copyrightText: settings.copyrightText,
      discountTiers: settings.discountTiers.map((t) => ({ ...t })),
    });
  }, [settings]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedTiers: DiscountTier[] = settingsForm.discountTiers
      .map((t) => ({
        minQty: Math.max(1, Math.floor(Number(t.minQty) || 1)),
        discountPercent: Math.min(
          90,
          Math.max(0, Math.floor(Number(t.discountPercent) || 0))
        ),
      }))
      .filter((t) => t.discountPercent > 0)
      .sort((a, b) => a.minQty - b.minQty);

    updateSettings({
      storeName: settingsForm.storeName.trim() || 'AAROHA',
      whatsappNumber: settingsForm.whatsappNumber.trim() || '919820041290',
      email: settingsForm.email.trim(),
      phone: settingsForm.phone.trim(),
      address: settingsForm.address.trim(),
      instagramUrl: settingsForm.instagramUrl.trim(),
      facebookUrl: settingsForm.facebookUrl.trim(),
      footerText: settingsForm.footerText.trim(),
      copyrightText: settingsForm.copyrightText.trim(),
      discountTiers: cleanedTiers,
    });
    showToast('Saved');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeErr(null);
    if (newAdminPassword.trim().length < 4) {
      setPasswordChangeErr('Naya password kam se kam 4 characters ka rakhein.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordChangeErr('Dono password match nahi kar rahe.');
      return;
    }
    updateSettings({
      adminPasswordHash: hashSecret(newAdminPassword),
    });
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    showToast('Saved');
  };

  const handleExportBackup = () => {
    const payload: StoreDataState = {
      products,
      heroSlides,
      categories,
      collectionBanners,
      testimonials,
      navItems,
      orders,
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `aaroha-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup exported');
  };

  const handleImportFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<StoreDataState>;
        if (!parsed || typeof parsed !== 'object') {
          showToast('Invalid backup JSON file');
          return;
        }
        setConfirmDialog({
          title: 'Restore Backup?',
          message:
            'Kya aap chuni hui backup file se poora store aur orders restore karna chahte hain?',
          confirmLabel: 'RESTORE',
          onConfirm: () => {
            importBackupData(parsed);
            setConfirmDialog(null);
            showToast('Saved');
          },
        });
      } catch {
        showToast('Invalid backup JSON file');
      } finally {
        if (backupFileRef.current) backupFileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleResetStore = () => {
    setConfirmDialog({
      title: 'Reset Store to Default?',
      message:
        'Sabhi products, slides, banners, settings aur orders default seed state par wapas aa jayenge. Kya aap pakka reset karna chahte hain?',
      confirmLabel: 'RESET ALL',
      onConfirm: () => {
        resetToDefault();
        setConfirmDialog(null);
        showToast('Saved');
      },
    });
  };

  // ---------------- DASHBOARD METRICS ----------------
  const totalSales = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (Number(o.totalPaid) || 0), 0),
    [orders]
  );

  // ---------------- LOGIN SCREEN ----------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f2f2f2]/60 flex flex-col justify-between p-4">
        <header className="max-w-[1240px] w-full mx-auto flex items-center justify-between py-2">
          <button
            type="button"
            onClick={onExitAdmin}
            className="min-h-[44px] px-3 bg-white border border-[#e8e8e8] text-[#321004] hover:text-[#d74a5d] inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[1px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
          <span className="text-[13px] font-medium uppercase tracking-[2.5px] text-[#321004]">
            {settings.storeName || 'AAROHA'} ADMIN
          </span>
        </header>

        <div className="w-full max-w-sm mx-auto bg-white border border-[#e8e8e8] shadow-lg p-6 sm:p-8 my-auto">
          <div className="w-11 h-11 bg-[#321004] text-[#dcb48c] flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-[18px] font-medium uppercase tracking-[1px] text-[#000000] mb-1">
            Atelier Admin Login
          </h1>
          <p className="text-[12px] text-[#777777] mb-5">
            Enter your administrator password to manage catalog, banners, orders, and store settings.
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
              >
                Admin Password
              </label>
              <input
                id="admin-password-input"
                type="password"
                disabled={lockRemainingSec > 0}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none disabled:bg-[#f2f2f2]"
              />
            </div>

            {lockRemainingSec > 0 ? (
              <div className="p-3 bg-[#d74a5d]/10 border border-[#d74a5d] text-[12px] text-[#d74a5d] font-medium">
                Too many failed attempts. Locked for {lockRemainingSec}s.
              </div>
            ) : (
              loginError && (
                <div className="p-3 bg-[#d74a5d]/10 border border-[#d74a5d] text-[12px] text-[#d74a5d]">
                  {loginError}
                </div>
              )
            )}

            <button
              type="submit"
              disabled={lockRemainingSec > 0 || !passwordInput}
              className="w-full min-h-[48px] bg-[#321004] hover:bg-[#d74a5d] disabled:opacity-50 text-white text-[12px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
            >
              {lockRemainingSec > 0
                ? `WAIT ${lockRemainingSec}S`
                : 'UNLOCK ADMIN'}
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-[#777777] py-2">
          Protected Atelier Session
        </div>
      </div>
    );
  }

  const NAV_SECTIONS: {
    id: AdminSectionId;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      shortLabel: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'products',
      label: 'Products',
      shortLabel: 'Products',
      icon: ShoppingBag,
      badge: products.length,
    },
    {
      id: 'orders',
      label: 'Orders',
      shortLabel: 'Orders',
      icon: Package,
      badge: orders.length,
    },
    {
      id: 'hero',
      label: 'Hero Slides',
      shortLabel: 'Hero',
      icon: Sparkles,
    },
    {
      id: 'categories',
      label: 'Categories',
      shortLabel: 'Cats',
      icon: FolderKanban,
    },
    {
      id: 'banners',
      label: 'Collection Banners',
      shortLabel: 'Banners',
      icon: Megaphone,
    },
    {
      id: 'testimonials',
      label: 'Reviews',
      shortLabel: 'Reviews',
      icon: MessageSquareQuote,
    },
    {
      id: 'menu',
      label: 'Menu Links',
      shortLabel: 'Menu',
      icon: ListTree,
    },
    {
      id: 'settings',
      label: 'Settings & Backup',
      shortLabel: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <div
      className={`min-h-screen bg-[#f2f2f2]/55 text-[#000000] flex flex-col ${
        keyboardOpen ? 'pb-6' : 'pb-[78px] lg:pb-8'
      }`}
    >
      {/* Top Admin Header */}
      <header className="aaroha-sticky-topbar bg-[#321004] text-white border-b border-[#c8a078]/30">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-[52px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onExitAdmin}
              aria-label="Back to store"
              className="min-w-[44px] min-h-[44px] -ml-1 flex items-center justify-center text-white hover:text-[#dcb48c] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[13px] sm:text-[14px] font-medium uppercase tracking-[1.5px] truncate">
                {settings.storeName || 'AAROHA'} ADMIN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExitAdmin}
              className="min-h-[38px] px-3 border border-white/30 hover:border-white text-[11px] font-medium uppercase tracking-[1px] text-white whitespace-nowrap cursor-pointer"
            >
              View Store
            </button>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="min-h-[38px] px-3 bg-[#d74a5d] hover:bg-[#b8384a] text-white text-[11px] font-medium uppercase tracking-[1px] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout: Left Sidebar on Desktop, Content Area on Right */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto lg:grid lg:grid-cols-[240px_1fr] lg:gap-6 px-3 sm:px-6 pt-4 sm:pt-6">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:block">
          <nav
            aria-label="Admin sections"
            className="bg-white border border-[#e8e8e8] divide-y divide-[#e8e8e8] sticky top-[68px]"
          >
            {NAV_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const active = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full min-h-[48px] px-4 flex items-center justify-between gap-2 text-left text-[12px] font-medium uppercase tracking-[1px] transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#321004] text-white'
                      : 'bg-white text-[#343434] hover:bg-[#f2f2f2]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-[#dcb48c]' : 'text-[#321004]'
                      }`}
                    />
                    <span className="truncate">{sec.label}</span>
                  </span>
                  {sec.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-[10px] tabular-nums ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-[#f2f2f2] text-[#343434]'
                      }`}
                    >
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Active Section Content */}
        <main className="min-w-0 space-y-4">
          {/* ==================== A) DASHBOARD ==================== */}
          {activeSection === 'dashboard' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6">
                <h1 className="text-[16px] sm:text-[18px] font-medium uppercase tracking-[1px] text-[#000000] mb-4">
                  Atelier Overview
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection('products')}
                    className="p-4 bg-[#f2f2f2]/70 border border-[#e8e8e8] hover:border-[#c8a078] text-left cursor-pointer"
                  >
                    <p className="text-[11px] uppercase tracking-[1px] text-[#777777]">
                      Total Products
                    </p>
                    <p className="text-[24px] font-semibold text-[#000000] tabular-nums mt-1">
                      {products.length}
                    </p>
                    <p className="text-[11px] text-[#15803d] mt-0.5">
                      {products.filter((p) => p.visible !== false).length}{' '}
                      visible on storefront
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection('orders')}
                    className="p-4 bg-[#f2f2f2]/70 border border-[#e8e8e8] hover:border-[#c8a078] text-left cursor-pointer"
                  >
                    <p className="text-[11px] uppercase tracking-[1px] text-[#777777]">
                      Total Orders
                    </p>
                    <p className="text-[24px] font-semibold text-[#000000] tabular-nums mt-1">
                      {orders.length}
                    </p>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      Live checkout orders
                    </p>
                  </button>

                  <div className="p-4 bg-[#321004] text-white border border-[#321004]">
                    <p className="text-[11px] uppercase tracking-[1px] text-[#dcb48c]">
                      Total Sales (₹)
                    </p>
                    <p className="text-[24px] font-semibold text-white tabular-nums mt-1">
                      {formatINR(totalSales)}
                    </p>
                    <p className="text-[11px] text-white/75 mt-0.5">
                      Excluding cancelled orders
                    </p>
                  </div>
                </div>
              </div>

              {/* Latest 5 Orders */}
              <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-[14px] sm:text-[15px] font-medium uppercase tracking-[1px] text-[#000000]">
                    Latest 5 Orders
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveSection('orders')}
                    className="text-[11px] font-medium uppercase tracking-[1px] text-[#d74a5d] underline cursor-pointer"
                  >
                    View All ({orders.length})
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-[13px] text-[#777777] py-6 text-center">
                    Abhi tak koi order place nahi hua hai. Checkout se order place hote hi yahan dikhega.
                  </p>
                ) : (
                  <div className="divide-y divide-[#e8e8e8]">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.orderId}
                        className="py-3 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#000000] tabular-nums">
                            {ord.orderId}
                          </p>
                          <p className="text-[12px] text-[#343434]">
                            {ord.address.fullName} · {ord.placedAt}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-[#f2f2f2] border border-[#e8e8e8] text-[10px] font-medium uppercase tracking-[0.8px] text-[#321004]">
                            {ord.status ?? 'Placed'}
                          </span>
                          <span className="text-[13px] font-semibold text-[#000000] tabular-nums">
                            {formatINR(ord.totalPaid)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderId(ord.orderId);
                              setActiveSection('orders');
                            }}
                            className="min-h-[38px] px-3 border border-[#c8a078] text-[#321004] hover:bg-[#321004] hover:text-white text-[10px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                          >
                            OPEN
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== B) PRODUCTS ==================== */}
          {activeSection === 'products' && (
            <div className="space-y-4">
              {editingProduct ? (
                <form
                  onSubmit={handleSaveProduct}
                  noValidate
                  className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#e8e8e8]">
                    <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000]">
                      {isCreatingProduct ? 'Add New Product' : 'Edit Product'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setIsCreatingProduct(false);
                      }}
                      className="min-h-[44px] px-3 text-[11px] font-medium uppercase tracking-[1px] text-[#777777] hover:text-[#000000] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        value={editingProduct.title}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g. Meher Ivory Chanderi Straight Suit"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                      />
                      {productErrors.title && (
                        <p className="mt-1 text-[12px] text-[#d74a5d]">
                          {productErrors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Category *
                      </label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value as Product['category'],
                          })
                        }
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                      >
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Sub-Category
                      </label>
                      <input
                        type="text"
                        value={editingProduct.subCategory}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            subCategory: e.target.value,
                          })
                        }
                        placeholder="e.g. Straight, Anarkali, Flared, A-Line, Girls, Boys"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        MRP Price (₹) *
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={editingProduct.price}
                        onChange={(e) => {
                          const nextPrice = Number(e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            price: nextPrice,
                            onSale: editingProduct.salePrice < nextPrice,
                          });
                        }}
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                      />
                      {productErrors.price && (
                        <p className="mt-1 text-[12px] text-[#d74a5d]">
                          {productErrors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Sale Price (₹, &le; MRP) *
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={editingProduct.salePrice}
                        onChange={(e) => {
                          const nextSale = Number(e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            salePrice: nextSale,
                            onSale: nextSale < editingProduct.price,
                          });
                        }}
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                      />
                      {productErrors.salePrice && (
                        <p className="mt-1 text-[12px] text-[#d74a5d]">
                          {productErrors.salePrice}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Collection Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={productTagInput}
                        onChange={(e) => setProductTagInput(e.target.value)}
                        placeholder="Festive, Spring Summer, Work Wear, Autumn Winter"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <p className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-2">
                        Available Sizes *
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ALL_SIZES.map((sz) => {
                          const checked = editingProduct.sizes.includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                const nextSizes = checked
                                  ? editingProduct.sizes.filter((s) => s !== sz)
                                  : [...editingProduct.sizes, sz];
                                setEditingProduct({
                                  ...editingProduct,
                                  sizes: nextSizes,
                                });
                              }}
                              className={`min-h-[44px] min-w-[52px] px-3 border text-[12px] font-medium uppercase tracking-[0.8px] cursor-pointer ${
                                checked
                                  ? 'bg-[#321004] text-white border-[#321004]'
                                  : 'bg-white text-[#343434] border-[#e8e8e8]'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                      {productErrors.sizes && (
                        <p className="mt-1 text-[12px] text-[#d74a5d]">
                          {productErrors.sizes}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <ImageField
                        label="Primary Product Image"
                        value={editingProduct.primaryImage}
                        onChange={(val) =>
                          setEditingProduct({
                            ...editingProduct,
                            primaryImage: val,
                          })
                        }
                        fallbackBg={editingProduct.fallbackTone}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <ImageField
                        label="Secondary / Gallery Image"
                        value={editingProduct.secondaryImage}
                        onChange={(val) =>
                          setEditingProduct({
                            ...editingProduct,
                            secondaryImage: val,
                          })
                        }
                        fallbackBg={editingProduct.fallbackTone}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Fabric &amp; Lining
                      </label>
                      <input
                        type="text"
                        value={editingProduct.fabric}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            fabric: e.target.value,
                          })
                        }
                        placeholder="Pure Chanderi Silk · Cotton Mulmul Lining"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Dispatch Timeline
                      </label>
                      <input
                        type="text"
                        value={editingProduct.dispatchDays}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            dispatchDays: e.target.value,
                          })
                        }
                        placeholder="Made to order in 7–10 business days"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                        placeholder="Detailed craftsmanship and silhouette notes..."
                        className="w-full p-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Fallback Color Block Tone
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={extractHexFromFallback(
                            editingProduct.fallbackTone
                          )}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              fallbackTone: e.target.value,
                            })
                          }
                          className="w-12 h-[48px] p-1 bg-white border border-[#e8e8e8] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingProduct.fallbackTone}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              fallbackTone: e.target.value,
                            })
                          }
                          className="flex-1 min-w-0 h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-end gap-2">
                      <label className="min-h-[48px] px-3.5 border border-[#e8e8e8] bg-[#f2f2f2]/60 flex items-center justify-between cursor-pointer">
                        <span className="text-[12px] font-medium uppercase tracking-[0.8px] text-[#000000]">
                          Visible on Storefront
                        </span>
                        <input
                          type="checkbox"
                          checked={editingProduct.visible !== false}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              visible: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-[#321004]"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e8e8e8]">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setIsCreatingProduct(false);
                      }}
                      className="min-h-[44px] px-5 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[1px] text-[#343434] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="min-h-[44px] px-6 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.2px] cursor-pointer"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h1 className="text-[16px] sm:text-[18px] font-medium uppercase tracking-[1px] text-[#000000]">
                        Products ({filteredAdminProducts.length})
                      </h1>
                      <p className="text-[12px] text-[#777777]">
                        Add, edit, duplicate, toggle visibility, or remove catalog pieces.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddProduct}
                      className="min-h-[44px] px-4 bg-[#d74a5d] hover:bg-[#321004] text-white text-[11px] font-medium uppercase tracking-[1.2px] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ ADD PRODUCT</span>
                    </button>
                  </div>

                  {/* Search & Category Filter */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1 min-w-0">
                      <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products by name or category..."
                        className="w-full h-[46px] pl-10 pr-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>
                    <select
                      value={productCatFilter}
                      onChange={(e) => setProductCatFilter(e.target.value)}
                      className="h-[46px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                    >
                      <option value="ALL">All Categories</option>
                      {PRODUCT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Products List */}
                  <div className="divide-y divide-[#e8e8e8]">
                    {filteredAdminProducts.map((prod) => {
                      const isVisible = prod.visible !== false;
                      return (
                        <div
                          key={prod.id}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-14 h-[72px] shrink-0 bg-[#f2f2f2] border border-[#e8e8e8] overflow-hidden">
                              <SmartImage
                                src={prod.primaryImage}
                                alt={prod.title}
                                width={100}
                                height={130}
                                className="w-full h-full object-cover"
                                fallbackBg={prod.fallbackTone}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-medium text-[#000000] leading-snug whitespace-normal [overflow-wrap:anywhere]">
                                {prod.title}
                              </p>
                              <p className="text-[11px] uppercase tracking-[0.8px] text-[#c8a078] mt-0.5">
                                {prod.category} · {prod.subCategory}
                              </p>
                              <div className="flex items-baseline gap-2 mt-1 tabular-nums text-[12px]">
                                <span className="font-semibold text-[#000000]">
                                  {formatINR(prod.salePrice)}
                                </span>
                                {prod.onSale && prod.price > prod.salePrice && (
                                  <span className="text-[#777777] line-through">
                                    {formatINR(prod.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleProductVisible(prod.id)}
                              className={`min-h-[44px] px-3 border text-[11px] font-medium uppercase tracking-[0.8px] inline-flex items-center gap-1.5 cursor-pointer ${
                                isVisible
                                  ? 'border-[#15803d]/50 bg-[#15803d]/10 text-[#15803d]'
                                  : 'border-[#e8e8e8] bg-[#f2f2f2] text-[#777777]'
                              }`}
                            >
                              {isVisible ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Visible</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Hidden</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditProduct(prod)}
                              className="min-h-[44px] px-3 border border-[#e8e8e8] hover:border-[#321004] text-[11px] font-medium uppercase tracking-[0.8px] text-[#000000] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>EDIT</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateProduct(prod)}
                              className="min-h-[44px] px-3 border border-[#e8e8e8] hover:border-[#321004] text-[11px] font-medium uppercase tracking-[0.8px] text-[#343434] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>DUPLICATE</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod)}
                              className="min-h-[44px] px-3 border border-[#e8e8e8] hover:border-[#d74a5d] text-[11px] font-medium uppercase tracking-[0.8px] text-[#d74a5d] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>DELETE</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== C) HERO SLIDES ==================== */}
          {activeSection === 'hero' && (
            <div className="space-y-4">
              {editingSlide ? (
                <form
                  onSubmit={handleSaveSlide}
                  className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                    <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000]">
                      {isCreatingSlide ? 'Add Hero Slide' : 'Edit Hero Slide'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlide(null);
                        setIsCreatingSlide(false);
                      }}
                      className="min-h-[44px] px-3 text-[11px] uppercase tracking-[1px] text-[#777777] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {slideError && (
                    <p className="text-[12px] text-[#d74a5d]">{slideError}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Eyebrow Text
                      </label>
                      <input
                        type="text"
                        value={editingSlide.eyebrow}
                        onChange={(e) =>
                          setEditingSlide({
                            ...editingSlide,
                            eyebrow: e.target.value,
                          })
                        }
                        placeholder="NEW ARRIVAL · 2026 EDIT"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Heading *
                      </label>
                      <input
                        type="text"
                        value={editingSlide.title}
                        onChange={(e) =>
                          setEditingSlide({
                            ...editingSlide,
                            title: e.target.value,
                          })
                        }
                        placeholder="HANDWOVEN CHANDERI SILK"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Paragraph / Subtitle
                      </label>
                      <textarea
                        rows={2}
                        value={editingSlide.subtitle}
                        onChange={(e) =>
                          setEditingSlide({
                            ...editingSlide,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full p-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={editingSlide.ctaLabel}
                        onChange={(e) =>
                          setEditingSlide({
                            ...editingSlide,
                            ctaLabel: e.target.value,
                          })
                        }
                        placeholder="SHOP SUIT SETS"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Button Link / Category Filter
                      </label>
                      <input
                        type="text"
                        value={editingSlide.filterKey}
                        onChange={(e) =>
                          setEditingSlide({
                            ...editingSlide,
                            filterKey: e.target.value,
                          })
                        }
                        placeholder="Suit Sets, Kurtas, Co-ord Sets, Kids, Festive, ALL"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <ImageField
                        label="Slide Banner Image"
                        value={editingSlide.desktopImage}
                        onChange={(val) =>
                          setEditingSlide({
                            ...editingSlide,
                            desktopImage: val,
                            mobileImage: val,
                          })
                        }
                        fallbackBg={editingSlide.fallbackBg}
                        aspectClass="aspect-[16/9] w-36"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#e8e8e8]">
                    <button
                      type="submit"
                      className="min-h-[44px] px-6 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.2px] cursor-pointer"
                    >
                      Save Slide
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h1 className="text-[16px] sm:text-[18px] font-medium uppercase tracking-[1px] text-[#000000]">
                        Hero Slides ({heroSlides.length})
                      </h1>
                      <p className="text-[12px] text-[#777777]">
                        Manage homepage hero carousel slides and order.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddSlide}
                      className="min-h-[44px] px-4 bg-[#d74a5d] hover:bg-[#321004] text-white text-[11px] font-medium uppercase tracking-[1.2px] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ ADD SLIDE</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[#e8e8e8]">
                    {heroSlides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-24 aspect-[16/10] shrink-0 bg-[#321004] border border-[#e8e8e8] overflow-hidden">
                            <SmartImage
                              src={slide.desktopImage}
                              alt={slide.title}
                              width={200}
                              height={120}
                              className="w-full h-full object-cover"
                              fallbackBg={slide.fallbackBg}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[1px] text-[#c8a078]">
                              {slide.eyebrow}
                            </p>
                            <p className="text-[13px] font-medium text-[#000000]">
                              {slide.title}
                            </p>
                            <p className="text-[11px] text-[#777777] mt-0.5">
                              CTA: {slide.ctaLabel} → {slide.filterKey}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveHeroSlide(idx, -1)}
                            aria-label="Move slide up"
                            className="min-h-[44px] min-w-[44px] border border-[#e8e8e8] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === heroSlides.length - 1}
                            onClick={() => moveHeroSlide(idx, 1)}
                            aria-label="Move slide down"
                            className="min-h-[44px] min-w-[44px] border border-[#e8e8e8] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSlide({ ...slide });
                              setIsCreatingSlide(false);
                              setSlideError(null);
                            }}
                            className="min-h-[44px] px-3 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                          >
                            EDIT
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlide(slide)}
                            className="min-h-[44px] px-3 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] text-[#d74a5d] cursor-pointer"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== D) CATEGORIES ==================== */}
          {activeSection === 'categories' && (
            <div className="space-y-4">
              {editingCategory ? (
                <form
                  onSubmit={handleSaveCategory}
                  className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                    <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000]">
                      {isCreatingCategory ? 'Add Category Card' : 'Edit Category Card'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setIsCreatingCategory(false);
                      }}
                      className="min-h-[44px] px-3 text-[11px] uppercase tracking-[1px] text-[#777777] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {categoryError && (
                    <p className="text-[12px] text-[#d74a5d]">{categoryError}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g. Suit Sets"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Target Filter / Category Link
                      </label>
                      <input
                        type="text"
                        value={editingCategory.filterKey}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            filterKey: e.target.value,
                          })
                        }
                        placeholder="e.g. Suit Sets, Kurtas, Co-ord Sets, Kids"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <ImageField
                        label="Category Card Image (3:4)"
                        value={editingCategory.image}
                        onChange={(val) =>
                          setEditingCategory({
                            ...editingCategory,
                            image: val,
                          })
                        }
                        fallbackBg={editingCategory.fallbackTone}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-[#e8e8e8]">
                    <button
                      type="submit"
                      className="min-h-[44px] px-6 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.2px] cursor-pointer"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h1 className="text-[16px] sm:text-[18px] font-medium uppercase tracking-[1px] text-[#000000]">
                        Shop By Category Cards ({categories.length})
                      </h1>
                      <p className="text-[12px] text-[#777777]">
                        Add, edit, delete, or reorder category cards on the home page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddCategory}
                      className="min-h-[44px] px-4 bg-[#d74a5d] hover:bg-[#321004] text-white text-[11px] font-medium uppercase tracking-[1.2px] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ ADD CATEGORY</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[#e8e8e8]">
                    {categories.map((cat, idx) => (
                      <div
                        key={cat.id}
                        className="py-3.5 flex items-center justify-between gap-3 flex-wrap"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-[72px] shrink-0 bg-[#f2f2f2] border border-[#e8e8e8] overflow-hidden">
                            <SmartImage
                              src={cat.image}
                              alt={cat.name}
                              width={100}
                              height={130}
                              className="w-full h-full object-cover"
                              fallbackBg={cat.fallbackTone}
                            />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#000000]">
                              {cat.name}
                            </p>
                            <p className="text-[11px] text-[#777777]">
                              Filter: {cat.filterKey}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveCategory(idx, -1)}
                            aria-label="Move category up"
                            className="min-h-[44px] min-w-[44px] border border-[#e8e8e8] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === categories.length - 1}
                            onClick={() => moveCategory(idx, 1)}
                            aria-label="Move category down"
                            className="min-h-[44px] min-w-[44px] border border-[#e8e8e8] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory({ ...cat });
                              setIsCreatingCategory(false);
                              setCategoryError(null);
                            }}
                            className="min-h-[44px] px-3 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                          >
                            EDIT
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="min-h-[44px] px-3 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] text-[#d74a5d] cursor-pointer"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== E) COLLECTION BANNERS ==================== */}
          {activeSection === 'banners' && (
            <div className="space-y-4">
              {editingBanner ? (
                <form
                  onSubmit={handleSaveBanner}
                  className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                    <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000]">
                      {isCreatingBanner
                        ? 'Add Collection Banner'
                        : 'Edit Collection Banner'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBanner(null);
                        setIsCreatingBanner(false);
                      }}
                      className="min-h-[44px] px-3 text-[11px] uppercase tracking-[1px] text-[#777777] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {bannerError && (
                    <p className="text-[12px] text-[#d74a5d]">{bannerError}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Label / Eyebrow
                      </label>
                      <input
                        type="text"
                        value={editingBanner.eyebrow ?? ''}
                        onChange={(e) =>
                          setEditingBanner({
                            ...editingBanner,
                            eyebrow: e.target.value,
                          })
                        }
                        placeholder="CELEBRATION EDIT"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Heading *
                      </label>
                      <input
                        type="text"
                        value={editingBanner.title}
                        onChange={(e) =>
                          setEditingBanner({
                            ...editingBanner,
                            title: e.target.value,
                          })
                        }
                        placeholder="FESTIVE"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Paragraph / Subtitle
                      </label>
                      <textarea
                        rows={2}
                        value={editingBanner.subtitle}
                        onChange={(e) =>
                          setEditingBanner({
                            ...editingBanner,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full p-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={editingBanner.ctaLabel}
                        onChange={(e) =>
                          setEditingBanner({
                            ...editingBanner,
                            ctaLabel: e.target.value,
                          })
                        }
                        placeholder="SHOP NOW"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Filter / Category Link
                      </label>
                      <input
                        type="text"
                        value={editingBanner.filterKey}
                        onChange={(e) =>
                          setEditingBanner({
                            ...editingBanner,
                            filterKey: e.target.value,
                          })
                        }
                        placeholder="Festive, Work Wear, Suit Sets"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <ImageField
                        label="Banner Image (3:2)"
                        value={editingBanner.image}
                        onChange={(val) =>
                          setEditingBanner({
                            ...editingBanner,
                            image: val,
                          })
                        }
                        fallbackBg={editingBanner.fallbackBg}
                        aspectClass="aspect-[3/2] w-32"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-[#e8e8e8]">
                    <button
                      type="submit"
                      className="min-h-[44px] px-6 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.2px] cursor-pointer"
                    >
                      Save Banner
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h1 className="text-[16px] sm:text-[18px] font-medium uppercase tracking-[1px] text-[#000000]">
                        Collection Banners ({collectionBanners.length})
                      </h1>
                      <p className="text-[12px] text-[#777777]">
                        Manage large editorial collection banners on the home page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddBanner}
                      className="min-h-[44px] px-4 bg-[#d74a5d] hover:bg-[#321004] text-white text-[11px] font-medium uppercase tracking-[1.2px] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ ADD BANNER</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[#e8e8e8]">
                    {collectionBanners.map((b, idx) => (
                      <div
                        key={b.id}
                        className="py-3.5 flex items-center justify-between gap-3 flex-wrap"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-24 aspect-[3/2] shrink-0 bg-[#321004] border border-[#e8e8e8] overflow-hidden">
                            <SmartImage
                              src={b.image}
                              alt={b.title}
                              width={180}
                              height={120}
                              className="w-full h-full object-cover"
                              fallbackBg={b.fallbackBg}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[1px] text-[#c8a078]">
                              {b.eyebrow}
                            </p>
                            <p className="text-[13px] font-medium text-[#000000]">
                              {b.title}
                            </p>
                            <p className="text-[11px] text-[#777777] mt-0.5">
                              {b.ctaLabel} → {b.filterKey}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveBanner(idx, -1)}
                            aria-label="Move banner up"
                            className="min-h-[44px] min-w-[44px] border border-[#e8e8e8] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === collectionBanners.length - 1}
                            onClick={() => moveBanner(idx, 1)}
                            aria-label="Move banner down"
                            className="min-h-[44px] min-w-[44px] border border-[#e8e8e8] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBanner({ ...b });
                              setIsCreatingBanner(false);
                              setBannerError(null);
                            }}
                            className="min-h-[44px] px-3 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                          >
                            EDIT
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(b)}
                            className="min-h-[44px] px-3 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] text-[#d74a5d] cursor-pointer"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== F) TESTIMONIALS / REVIEWS ==================== */}
          {activeSection === 'testimonials' && (
            <div className="space-y-4">
              {editingTestimonial ? (
                <form
                  onSubmit={handleSaveTestimonial}
                  className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                    <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000]">
                      {isCreatingTestimonial
                        ? 'Add Customer Review'
                        : 'Edit Customer Review'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTestimonial(null);
                        setIsCreatingTestimonial(false);
                      }}
                      className="min-h-[44px] px-3 text-[11px] uppercase tracking-[1px] text-[#777777] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {testimonialError && (
                    <p className="text-[12px] text-[#d74a5d]">
                      {testimonialError}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={editingTestimonial.name}
                        onChange={(e) =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            name: e.target.value,
                          })
                        }
                        placeholder="Ananya Deshmukh"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={editingTestimonial.city}
                        onChange={(e) =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            city: e.target.value,
                          })
                        }
                        placeholder="Mumbai, India"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Rating (1 to 5)
                      </label>
                      <select
                        value={editingTestimonial.rating ?? 5}
                        onChange={(e) =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            rating: Number(e.target.value),
                          })
                        }
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      >
                        {[5, 4, 3, 2, 1].map((r) => (
                          <option key={r} value={r}>
                            {r} Stars ({'★'.repeat(r)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Outfit Bought (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingTestimonial.outfitBought}
                        onChange={(e) =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            outfitBought: e.target.value,
                          })
                        }
                        placeholder="Meher Ivory Chanderi Straight Suit"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Review Text *
                      </label>
                      <textarea
                        rows={3}
                        value={editingTestimonial.review}
                        onChange={(e) =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            review: e.target.value,
                          })
                        }
                        placeholder="Share customer review..."
                        className="w-full p-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <ImageField
                        label="Customer Avatar Photo (Optional)"
                        value={editingTestimonial.avatar ?? ''}
                        onChange={(val) =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            avatar: val,
                          })
                        }
                        aspectClass="aspect-square w-16 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-[#e8e8e8]">
                    <button
                      type="submit"
                      className="min-h-[44px] px-6 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.2px] cursor-pointer"
                    >
                      Save Review
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h1 className="text-[16px] sm:text-[18px] font-medium uppercase tracking-[1px] text-[#000000]">
                        Testimonials / Reviews ({testimonials.length})
                      </h1>
                      <p className="text-[12px] text-[#777777]">
                        Add, edit, or delete customer reviews shown on the storefront.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddTestimonial}
                      className="min-h-[44px] px-4 bg-[#d74a5d] hover:bg-[#321004] text-white text-[11px] font-medium uppercase tracking-[1.2px] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ ADD REVIEW</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[#e8e8e8]">
                    {testimonials.map((t) => (
                      <div
                        key={t.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-[#000000]">
                              {t.name}
                            </span>
                            <span className="text-[11px] text-[#777777]">
                              · {t.city}
                            </span>
                            <span className="text-[11px] text-[#c8a078] font-semibold">
                              {'★'.repeat(t.rating ?? 5)}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#343434] mt-1 line-clamp-2">
                            &ldquo;{t.review}&rdquo;
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTestimonial({ ...t });
                              setIsCreatingTestimonial(false);
                              setTestimonialError(null);
                            }}
                            className="min-h-[44px] px-3 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                          >
                            EDIT
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTestimonial(t)}
                            className="min-h-[44px] px-3 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] text-[#d74a5d] cursor-pointer"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== G) MENU (NAV_ITEMS) ==================== */}
          {activeSection === 'menu' && (
            <div className="space-y-4">
              {editingNavItem ? (
                <form
                  onSubmit={handleSaveNavItem}
                  className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e8]">
                    <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000]">
                      {editingNavIndex === -1
                        ? 'Add Menu Item'
                        : 'Edit Menu Item'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNavItem(null);
                        setEditingNavIndex(null);
                      }}
                      className="min-h-[44px] px-3 text-[11px] uppercase tracking-[1px] text-[#777777] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {navError && (
                    <p className="text-[12px] text-[#d74a5d]">{navError}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Menu Label *
                      </label>
                      <input
                        type="text"
                        value={editingNavItem.label}
                        onChange={(e) =>
                          setEditingNavItem({
                            ...editingNavItem,
                            label: e.target.value,
                          })
                        }
                        placeholder="SUIT SETS"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                        Filter / Category Key
                      </label>
                      <input
                        type="text"
                        value={editingNavItem.filterKey}
                        onChange={(e) =>
                          setEditingNavItem({
                            ...editingNavItem,
                            filterKey: e.target.value,
                          })
                        }
                        placeholder="Suit Sets, Kurtas, ALL, SALE"
                        className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="min-h-[48px] px-3.5 border border-[#e8e8e8] bg-[#f2f2f2]/60 flex items-center justify-between cursor-pointer">
                        <span className="text-[12px] font-medium uppercase tracking-[0.8px] text-[#000000]">
                          Highlight as Sale Item (Red Accent)
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(editingNavItem.isSale)}
                          onChange={(e) =>
                            setEditingNavItem({
                              ...editingNavItem,
                              isSale: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-[#d74a5d]"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Submenu Links Editor */}
                  <div className="pt-3 border-t border-[#e8e8e8] space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-medium uppercase tracking-[1px] text-[#000000]">
                        Submenu Links ({navSubLinks.length})
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setNavSubLinks((prev) => [
                            ...prev,
                            { label: '', filterKey: '' },
                          ])
                        }
                        className="min-h-[40px] px-3 bg-[#f2f2f2] hover:bg-[#321004] text-[#000000] hover:text-white border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                      >
                        + Add Submenu Link
                      </button>
                    </div>

                    {navSubLinks.length > 0 && (
                      <div>
                        <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                          Submenu Column Heading
                        </label>
                        <input
                          type="text"
                          value={navHeadingInput}
                          onChange={(e) => setNavHeadingInput(e.target.value)}
                          placeholder="Silhouettes / Seasonal Edits"
                          className="w-full h-[46px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      {navSubLinks.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-[#f2f2f2]/50 border border-[#e8e8e8]"
                        >
                          <input
                            type="text"
                            value={sub.label}
                            onChange={(e) =>
                              setNavSubLinks((prev) =>
                                prev.map((item, i) =>
                                  i === sIdx
                                    ? { ...item, label: e.target.value }
                                    : item
                                )
                              )
                            }
                            placeholder="Submenu label (e.g. Anarkali)"
                            className="flex-1 min-w-0 h-[44px] px-3 bg-white border border-[#e8e8e8] text-[16px]"
                          />
                          <input
                            type="text"
                            value={sub.filterKey}
                            onChange={(e) =>
                              setNavSubLinks((prev) =>
                                prev.map((item, i) =>
                                  i === sIdx
                                    ? { ...item, filterKey: e.target.value }
                                    : item
                                )
                              )
                            }
                            placeholder="Filter key (e.g. Anarkali)"
                            className="flex-1 min-w-0 h-[44px] px-3 bg-white border border-[#e8e8e8] text-[16px]"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={sIdx === 0}
                              onClick={() =>
                                setNavSubLinks((prev) => {
                                  const next = [...prev];
                                  const [m] = next.splice(sIdx, 1);
                                  next.splice(sIdx - 1, 0, m);
                                  return next;
                                })
                              }
                              className="min-h-[44px] min-w-[44px] bg-white border border-[#e8e8e8] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={sIdx === navSubLinks.length - 1}
                              onClick={() =>
                                setNavSubLinks((prev) => {
                                  const next = [...prev];
                                  const [m] = next.splice(sIdx, 1);
                                  next.splice(sIdx + 1, 0, m);
                                  return next;
                                })
                              }
                              className="min-h-[44px] min-w-[44px] bg-white border border-[#e8e8e8] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setNavSubLinks((prev) =>
                                  prev.filter((_, i) => i !== sIdx)
                                )
                              }
                              className="min-h-[44px] min-w-[44px] bg-white border border-[#e8e8e8] text-[#d74a5d] flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-[#e8e8e8]">
                    <button
                      type="submit"
                      className="min-h-[44px] px-6 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.2px] cursor-pointer"
                    >
                      Save Menu Item
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h1 className="text-[16px] sm:text-[18px] font-medium uppercase tracking-[1px] text-[#000000]">
                        Navigation Menu ({navItems.length})
                      </h1>
                      <p className="text-[12px] text-[#777777]">
                        Manage header navigation items, submenus, and order.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openAddNavItem}
                      className="min-h-[44px] px-4 bg-[#d74a5d] hover:bg-[#321004] text-white text-[11px] font-medium uppercase tracking-[1.2px] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ ADD MENU ITEM</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[#e8e8e8]">
                    {navItems.map((item, idx) => {
                      const subCount =
                        item.columns?.reduce(
                          (s, c) => s + c.links.length,
                          0
                        ) ?? 0;
                      return (
                        <div
                          key={`${item.label}-${idx}`}
                          className="py-3.5 flex items-center justify-between gap-3 flex-wrap"
                        >
                          <div>
                            <p
                              className={`text-[13px] font-medium uppercase tracking-[1px] ${
                                item.isSale
                                  ? 'text-[#d74a5d]'
                                  : 'text-[#000000]'
                              }`}
                            >
                              {item.label}
                            </p>
                            <p className="text-[11px] text-[#777777]">
                              Filter: {item.filterKey} · {subCount} submenu{' '}
                              {subCount === 1 ? 'link' : 'links'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveNavItem(idx, -1)}
                              aria-label="Move menu item up"
                              className="min-h-[44px] min-w-[44px] border border-[#e8e8e8] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === navItems.length - 1}
                              onClick={() => moveNavItem(idx, 1)}
                              aria-label="Move menu item down"
                              className="min-h-[44px] min-w-[44px] border border-[#e8e8e8] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditNavItem(item, idx)}
                              className="min-h-[44px] px-3 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                            >
                              EDIT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNavItem(item, idx)}
                              className="min-h-[44px] px-3 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] text-[#d74a5d] cursor-pointer"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== H) ORDERS ==================== */}
          {activeSection === 'orders' && (
            <div className="space-y-4">
              {selectedOrder ? (
                <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e8e8e8]">
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(null)}
                        className="min-h-[40px] inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1px] text-[#321004] hover:text-[#d74a5d] cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Orders List</span>
                      </button>
                      <h2 className="text-[16px] font-semibold text-[#000000] tabular-nums mt-1">
                        Order {selectedOrder.orderId}
                      </h2>
                      <p className="text-[12px] text-[#777777]">
                        Placed on {selectedOrder.placedAt} · Est. Delivery:{' '}
                        {selectedOrder.estimatedDelivery}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedOrder.status ?? 'Placed'}
                        onChange={(e) => {
                          updateOrderStatus(
                            selectedOrder.orderId,
                            e.target.value as OrderStatus
                          );
                          showToast('Saved');
                        }}
                        className="h-[44px] px-3 bg-[#f2f2f2] border border-[#c8a078] text-[14px] font-medium text-[#321004] focus:outline-none cursor-pointer"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            Status: {st}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(selectedOrder)}
                        className="min-h-[44px] px-3 border border-[#e8e8e8] hover:border-[#d74a5d] text-[#d74a5d] text-[11px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>

                  {/* Customer & Payment Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                    <div className="p-3.5 bg-[#f2f2f2]/60 border border-[#e8e8e8]">
                      <p className="text-[10px] font-medium uppercase tracking-[1px] text-[#c8a078] mb-1.5">
                        Delivery Address
                      </p>
                      <p className="font-semibold text-[#000000]">
                        {selectedOrder.address.fullName}
                      </p>
                      <p>{selectedOrder.address.addressLine1}</p>
                      {selectedOrder.address.addressLine2 && (
                        <p>{selectedOrder.address.addressLine2}</p>
                      )}
                      <p>
                        {selectedOrder.address.city},{' '}
                        {selectedOrder.address.state} –{' '}
                        {selectedOrder.address.pincode}
                      </p>
                      <p className="mt-1.5 text-[12px] text-[#343434]">
                        Phone: {selectedOrder.address.mobile}
                        <br />
                        Email: {selectedOrder.address.email}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#f2f2f2]/60 border border-[#e8e8e8] flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[1px] text-[#c8a078] mb-1.5">
                          Payment &amp; Summary
                        </p>
                        <p className="font-medium text-[#000000] mb-3">
                          {selectedOrder.paymentMethodLabel}
                        </p>
                      </div>

                      <div className="space-y-1 text-[12px] tabular-nums border-t border-[#e8e8e8] pt-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatINR(selectedOrder.subtotal)}</span>
                        </div>
                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-[#15803d]">
                            <span>Discount</span>
                            <span>
                              -{formatINR(selectedOrder.discountAmount)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-[15px] font-semibold text-[#000000] pt-1 border-t border-[#e8e8e8]">
                          <span>Total Paid</span>
                          <span>{formatINR(selectedOrder.totalPaid)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ordered Items */}
                  <div className="divide-y divide-[#e8e8e8] border-t border-[#e8e8e8]">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.key}
                        className="py-3 flex items-start gap-3"
                      >
                        <div className="w-14 h-[72px] shrink-0 bg-[#f2f2f2] border border-[#e8e8e8] overflow-hidden">
                          <SmartImage
                            src={item.product.primaryImage}
                            alt={item.product.title}
                            width={80}
                            height={100}
                            className="w-full h-full object-cover"
                            fallbackBg={item.product.fallbackTone}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-[#000000]">
                            {item.product.title}
                          </p>
                          <p className="text-[11px] text-[#777777] mt-0.5">
                            Size: {item.size} · Qty: {item.quantity}
                          </p>
                          {item.customNote && (
                            <p className="text-[11px] text-[#321004] italic mt-0.5">
                              Custom Fit: {item.customNote}
                            </p>
                          )}
                        </div>
                        <div className="text-[13px] font-semibold text-[#000000] tabular-nums">
                          {formatINR(item.product.salePrice * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4">
                  <div>
                    <h1 className="text-[16px] sm:text-[18px] font-medium uppercase tracking-[1px] text-[#000000]">
                      Customer Orders ({orders.length})
                    </h1>
                    <p className="text-[12px] text-[#777777]">
                      View order details, update fulfillment status, or delete orders.
                    </p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-[13px] text-[#777777]">
                      No orders placed yet. Orders placed from Checkout appear here automatically.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e8e8e8]">
                      {orders.map((ord) => (
                        <div
                          key={ord.orderId}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13px] font-semibold text-[#000000] tabular-nums">
                                {ord.orderId}
                              </span>
                              <span className="text-[11px] text-[#777777]">
                                · {ord.placedAt}
                              </span>
                              <span className="text-[13px] font-semibold text-[#321004] tabular-nums">
                                {formatINR(ord.totalPaid)}
                              </span>
                            </div>
                            <p className="text-[12px] text-[#343434] mt-0.5">
                              {ord.address.fullName} ({ord.address.mobile}) ·{' '}
                              {ord.address.city}, {ord.address.state}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={ord.status ?? 'Placed'}
                              onChange={(e) => {
                                updateOrderStatus(
                                  ord.orderId,
                                  e.target.value as OrderStatus
                                );
                                showToast('Saved');
                              }}
                              aria-label={`Order ${ord.orderId} status`}
                              className="h-[44px] px-2.5 bg-[#f2f2f2] border border-[#e8e8e8] text-[13px] font-medium text-[#000000] focus:outline-none cursor-pointer"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => setSelectedOrderId(ord.orderId)}
                              className="min-h-[44px] px-3.5 bg-[#321004] text-white text-[11px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                            >
                              VIEW DETAILS
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(ord)}
                              className="min-h-[44px] px-3 border border-[#e8e8e8] hover:border-[#d74a5d] text-[#d74a5d] text-[11px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== I) STORE SETTINGS & BACKUP ==================== */}
          {activeSection === 'settings' && (
            <div className="space-y-4">
              <form
                onSubmit={handleSaveSettings}
                className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-4"
              >
                <h1 className="text-[16px] sm:text-[18px] font-medium uppercase tracking-[1px] text-[#000000] pb-3 border-b border-[#e8e8e8]">
                  Store Settings
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                      Store Brand Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.storeName}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          storeName: e.target.value,
                        })
                      }
                      className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                      WhatsApp Number (with country code)
                    </label>
                    <input
                      type="tel"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          whatsappNumber: e.target.value,
                        })
                      }
                      placeholder="919820041290"
                      className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                      Phone Display Text
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                      Atelier Address
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={settingsForm.instagramUrl}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          instagramUrl: e.target.value,
                        })
                      }
                      className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={settingsForm.facebookUrl}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          facebookUrl: e.target.value,
                        })
                      }
                      className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                      Footer Brand Description
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.footerText}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          footerText: e.target.value,
                        })
                      }
                      className="w-full p-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1">
                      Footer Copyright Line
                    </label>
                    <input
                      type="text"
                      value={settingsForm.copyrightText}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          copyrightText: e.target.value,
                        })
                      }
                      className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Multi-Piece Discount Tiers */}
                <div className="pt-3 border-t border-[#e8e8e8] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-medium uppercase tracking-[1px] text-[#000000]">
                      Multi-Piece Discount Tiers
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          discountTiers: [
                            ...prev.discountTiers,
                            { minQty: 4, discountPercent: 15 },
                          ],
                        }))
                      }
                      className="min-h-[40px] px-3 bg-[#f2f2f2] border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[0.8px] cursor-pointer"
                    >
                      + Add Tier
                    </button>
                  </div>

                  {settingsForm.discountTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-[#f2f2f2]/60 border border-[#e8e8e8]"
                    >
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] uppercase text-[#777777]">
                          Min Pieces
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={tier.minQty}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              discountTiers: prev.discountTiers.map((t, i) =>
                                i === idx
                                  ? { ...t, minQty: Number(e.target.value) }
                                  : t
                              ),
                            }))
                          }
                          className="w-full h-[44px] px-3 bg-white border border-[#e8e8e8] text-[16px]"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] uppercase text-[#777777]">
                          Discount %
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={tier.discountPercent}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              discountTiers: prev.discountTiers.map((t, i) =>
                                i === idx
                                  ? {
                                      ...t,
                                      discountPercent: Number(e.target.value),
                                    }
                                  : t
                              ),
                            }))
                          }
                          className="w-full h-[44px] px-3 bg-white border border-[#e8e8e8] text-[16px]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            discountTiers: prev.discountTiers.filter(
                              (_, i) => i !== idx
                            ),
                          }))
                        }
                        aria-label="Remove tier"
                        className="mt-4 min-h-[44px] min-w-[44px] bg-white border border-[#e8e8e8] text-[#d74a5d] flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-3 border-t border-[#e8e8e8]">
                  <button
                    type="submit"
                    className="min-h-[46px] px-6 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.2px] cursor-pointer"
                  >
                    Save Store Settings
                  </button>
                </div>
              </form>

              {/* Change Admin Password */}
              <form
                onSubmit={handleChangePassword}
                className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-3"
              >
                <h2 className="text-[14px] font-medium uppercase tracking-[1px] text-[#000000]">
                  Change Admin Password
                </h2>
                {passwordChangeErr && (
                  <p className="text-[12px] text-[#d74a5d]">
                    {passwordChangeErr}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                  />
                  <input
                    type="password"
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] text-[16px] text-[#000000] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 bg-[#321004] hover:bg-[#d74a5d] text-white text-[11px] font-medium uppercase tracking-[1.2px] cursor-pointer"
                >
                  Update Password
                </button>
              </form>

              {/* Backup & Restore */}
              <div className="bg-white border border-[#e8e8e8] p-4 sm:p-6 space-y-3">
                <h2 className="text-[14px] font-medium uppercase tracking-[1px] text-[#000000]">
                  Backup &amp; Restore
                </h2>
                <p className="text-[12px] text-[#777777]">
                  Export your entire store catalog, banners, settings, and orders as a JSON file or restore from a saved backup.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="min-h-[44px] px-4 bg-[#321004] hover:bg-[#000000] text-white text-[11px] font-medium uppercase tracking-[1px] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Backup (.json)</span>
                  </button>

                  <input
                    ref={backupFileRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportFilePicked}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => backupFileRef.current?.click()}
                    className="min-h-[44px] px-4 bg-[#f2f2f2] hover:bg-[#321004] text-[#000000] hover:text-white border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[1px] inline-flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetStore}
                    className="min-h-[44px] px-4 border border-[#d74a5d] text-[#d74a5d] hover:bg-[#d74a5d] hover:text-white text-[11px] font-medium uppercase tracking-[1px] inline-flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Default</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (hidden when virtual keyboard is open) */}
      <nav
        aria-label="Admin mobile navigation"
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#e8e8e8] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-200 ${
          keyboardOpen
            ? 'hidden translate-y-full pointer-events-none'
            : 'translate-y-0'
        }`}
      >
        <div className="flex items-stretch overflow-x-auto no-scrollbar">
          {NAV_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const active = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`flex-1 min-w-[68px] min-h-[56px] px-2 py-1.5 flex flex-col items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-[0.5px] whitespace-nowrap border-t-2 transition-colors cursor-pointer ${
                  active
                    ? 'border-[#d74a5d] text-[#321004] bg-[#f2f2f2]/60'
                    : 'border-transparent text-[#777777]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[#d74a5d]' : 'text-[#343434]'
                  }`}
                />
                <span>{sec.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Confirm Dialog Modal */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/55"
            onClick={() => setConfirmDialog(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white border border-[#e8e8e8] shadow-2xl p-6">
            <h3 className="text-[14px] font-medium uppercase tracking-[1px] text-[#000000] mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-[13px] text-[#343434] leading-relaxed mb-5">
              {confirmDialog.message}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="min-h-[44px] px-4 border border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[1px] text-[#343434] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="min-h-[44px] px-4 bg-[#d74a5d] hover:bg-[#321004] text-white text-[11px] font-medium uppercase tracking-[1px] cursor-pointer"
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Toast + 5s UNDO Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[68px] lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#321004] text-white border border-[#c8a078] shadow-xl flex items-center gap-3 text-[12px] font-medium whitespace-nowrap"
        >
          <Check className="w-4 h-4 text-[#dcb48c] shrink-0" />
          <span>{toast.message}</span>
          {toast.onUndo && (
            <button
              type="button"
              onClick={() => {
                const fn = toast.onUndo;
                setToast(null);
                if (fn) fn();
              }}
              className="min-h-[34px] px-2.5 bg-[#dcb48c] text-[#321004] text-[11px] font-semibold uppercase tracking-[0.8px] cursor-pointer"
            >
              {toast.undoLabel || 'UNDO'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
