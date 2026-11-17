export type SizeOption = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Custom';

export interface Product {
  id: string;
  title: string;
  category: 'Suit Sets' | 'Kurtas' | 'Co-ord Sets' | 'Kids';
  subCategory: string;
  collectionTags: string[];
  price: number;
  salePrice: number;
  onSale: boolean;
  primaryImage: string;
  secondaryImage: string;
  fallbackTone: string;
  fabric: string;
  description: string;
  sizes: SizeOption[];
  dispatchDays: string;
  visible?: boolean;
}

export interface CartItem {
  key: string;
  product: Product;
  size: SizeOption;
  quantity: number;
  customNote?: string;
}

export type PaymentMethodId = 'upi' | 'card' | 'netbanking' | 'cod';

export type OrderStatus =
  | 'Placed'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface DeliveryAddress {
  fullName: string;
  mobile: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PlacedOrder {
  orderId: string;
  placedAt: string;
  estimatedDelivery: string;
  items: CartItem[];
  address: DeliveryAddress;
  paymentMethodLabel: string;
  subtotal: number;
  discountAmount: number;
  totalPaid: number;
  status?: OrderStatus;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  filterKey: string;
  desktopImage: string;
  mobileImage: string;
  fallbackBg: string;
}

export interface FeaturedCategory {
  id: string;
  name: string;
  filterKey: string;
  image: string;
  fallbackTone: string;
}

export interface CollectionBannerItem {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  filterKey: string;
  image: string;
  fallbackBg: string;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'title-asc';

export interface TestimonialItem {
  id: string;
  name: string;
  city: string;
  review: string;
  outfitBought: string;
  rating?: number;
  avatar?: string;
}

export interface MegaMenuColumn {
  heading?: string;
  links: { label: string; filterKey: string }[];
}

export interface NavItem {
  label: string;
  filterKey: string;
  isSale?: boolean;
  columns?: MegaMenuColumn[];
  megaImage?: string;
}

export interface DiscountTier {
  minQty: number;
  discountPercent: number;
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  discountTiers: DiscountTier[];
  footerText: string;
  copyrightText: string;
  editorialMadeToOrderImage: string;
  editorialCustomSizingImage: string;
  adminPasswordHash: string;
}

export interface StoreDataState {
  products: Product[];
  heroSlides: HeroSlide[];
  categories: FeaturedCategory[];
  collectionBanners: CollectionBannerItem[];
  testimonials: TestimonialItem[];
  navItems: NavItem[];
  orders: PlacedOrder[];
  settings: StoreSettings;
}

