export type SizeOption = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Custom';

export interface Product {
  id: string;
  title: string;
  category: 'Suit Sets' | 'Kurtas' | 'Co-ord Sets' | 'Kids';
  subCategory: string;
  collectionTags: string[];
  regularPrice: number;
  salePrice: number;
  onSale: boolean;
  primaryImage: string;
  secondaryImage: string;
  fallbackTone: string;
  fabric: string;
  description: string;
  sizes: SizeOption[];
  dispatchDays: string;
}

export interface CartItem {
  key: string;
  product: Product;
  size: SizeOption;
  quantity: number;
  customNote?: string;
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
