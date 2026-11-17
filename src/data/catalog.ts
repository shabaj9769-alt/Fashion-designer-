import {
  CollectionBannerItem,
  FeaturedCategory,
  HeroSlide,
  NavItem,
  Product,
  TestimonialItem,
} from '../types/store';

export const ANNOUNCEMENTS: string[] = [
  'FREE WORLDWIDE SHIPPING  ·  DUTIES PREPAID ON ALL INTERNATIONAL ORDERS',
  'BUY 2 GET 5% OFF  ·  BUY 3 GET 10% OFF  ·  APPLIED AUTOMATICALLY IN CART',
];

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'SUIT SETS',
    filterKey: 'Suit Sets',
    megaImage:
      'https://placehold.co/500x680/ece4dc/321004?text=AAROHA%0ASUIT+SETS&font=montserrat',
    columns: [
      {
        heading: 'Silhouettes',
        links: [
          { label: 'Straight', filterKey: 'Straight' },
          { label: 'Anarkali', filterKey: 'Anarkali' },
          { label: 'Flared', filterKey: 'Flared' },
          { label: 'A-Line', filterKey: 'A-Line' },
        ],
      },
    ],
  },
  {
    label: 'KURTAS',
    filterKey: 'Kurtas',
  },
  {
    label: 'CO-ORD SETS',
    filterKey: 'Co-ord Sets',
  },
  {
    label: 'KIDS',
    filterKey: 'Kids',
    megaImage:
      'https://placehold.co/500x680/f2ebe4/321004?text=AAROHA%0AKIDS+EDIT&font=montserrat',
    columns: [
      {
        heading: 'By Category',
        links: [
          { label: 'Girls', filterKey: 'Girls' },
          { label: 'Boys', filterKey: 'Boys' },
        ],
      },
    ],
  },
  {
    label: 'COLLECTIONS',
    filterKey: 'ALL',
    megaImage:
      'https://placehold.co/500x680/e8dfd6/321004?text=AAROHA%0ACOLLECTIONS&font=montserrat',
    columns: [
      {
        heading: 'Seasonal Edits',
        links: [
          { label: 'Spring Summer', filterKey: 'Spring Summer' },
          { label: 'Festive', filterKey: 'Festive' },
          { label: 'Autumn Winter', filterKey: 'Autumn Winter' },
          { label: 'Work Wear', filterKey: 'Work Wear' },
        ],
      },
    ],
  },
  {
    label: 'SALE',
    filterKey: 'SALE',
    isSale: true,
  },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-festive',
    eyebrow: 'NEW ARRIVAL · 2026 EDIT',
    title: 'HANDWOVEN CHANDERI SILK',
    subtitle:
      'Fluid silhouettes crafted in Jaipur ateliers with zari border accents and breathable lining.',
    ctaLabel: 'SHOP SUIT SETS',
    filterKey: 'Suit Sets',
    desktopImage:
      'https://placehold.co/1600x760/321004/f5efe8?text=AAROHA+%C2%B7+HANDWOVEN+CHANDERI+EDIT&font=montserrat',
    mobileImage:
      'https://placehold.co/800x1100/321004/f5efe8?text=AAROHA%0ACHANDERI+EDIT&font=montserrat',
    fallbackBg: 'linear-gradient(135deg, #321004 0%, #5e2c1c 100%)',
  },
  {
    id: 'slide-workwear',
    eyebrow: 'EVERYDAY REFINEMENT',
    title: 'ARTISANAL MULMUL KURTAS',
    subtitle:
      'Featherlight hand-block prints and tonal threadwork tailored for warm days and effortless poise.',
    ctaLabel: 'EXPLORE KURTAS',
    filterKey: 'Kurtas',
    desktopImage:
      'https://placehold.co/1600x760/4a2e22/f7f2ec?text=AAROHA+%C2%B7+ARTISANAL+MULMUL+KURTAS&font=montserrat',
    mobileImage:
      'https://placehold.co/800x1100/4a2e22/f7f2ec?text=AAROHA%0AMULMUL+KURTAS&font=montserrat',
    fallbackBg: 'linear-gradient(135deg, #4a2e22 0%, #7d5442 100%)',
  },
  {
    id: 'slide-coords',
    eyebrow: 'MODERN HERITAGE',
    title: 'CONTEMPORARY CO-ORD SETS',
    subtitle:
      'Relaxed tailoring meets subtle gota and resham detailing for intimate gatherings and travel.',
    ctaLabel: 'DISCOVER CO-ORDS',
    filterKey: 'Co-ord Sets',
    desktopImage:
      'https://placehold.co/1600x760/5a3b2e/faf5ef?text=AAROHA+%C2%B7+CONTEMPORARY+CO-ORDS&font=montserrat',
    mobileImage:
      'https://placehold.co/800x1100/5a3b2e/faf5ef?text=AAROHA%0ACO-ORD+SETS&font=montserrat',
    fallbackBg: 'linear-gradient(135deg, #5a3b2e 0%, #8c624d 100%)',
  },
];

export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    id: 'cat-suit-sets',
    name: 'Suit Sets',
    filterKey: 'Suit Sets',
    image:
      'https://placehold.co/600x750/f2ebe4/321004?text=SUIT+SETS&font=montserrat',
    fallbackTone: '#f2ebe4',
  },
  {
    id: 'cat-kurtas',
    name: 'Kurtas',
    filterKey: 'Kurtas',
    image:
      'https://placehold.co/600x750/ece6df/321004?text=KURTAS&font=montserrat',
    fallbackTone: '#ece6df',
  },
  {
    id: 'cat-coords',
    name: 'Co-ord Sets',
    filterKey: 'Co-ord Sets',
    image:
      'https://placehold.co/600x750/f5efe8/321004?text=CO-ORD+SETS&font=montserrat',
    fallbackTone: '#f5efe8',
  },
  {
    id: 'cat-kids',
    name: 'Kids',
    filterKey: 'Kids',
    image:
      'https://placehold.co/600x750/eae3da/321004?text=KIDS&font=montserrat',
    fallbackTone: '#eae3da',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'aar-101',
    title: 'Meher Ivory Chanderi Straight Suit Set',
    category: 'Suit Sets',
    subCategory: 'Straight',
    collectionTags: ['Festive', 'Spring Summer'],
    regularPrice: 165,
    salePrice: 129,
    onSale: true,
    primaryImage:
      'https://placehold.co/600x800/f4efe9/321004?text=MEHER+IVORY%0ASTRAIGHT+SUIT&font=montserrat',
    secondaryImage:
      'https://placehold.co/600x800/e9e0d5/321004?text=MEHER+IVORY%0ADETAIL+VIEW&font=montserrat',
    fallbackTone: '#f4efe9',
    fabric: 'Pure Chanderi Silk · Cotton Mulmul Lining',
    description:
      'Ivory straight-cut kurta finished with delicate antique gold zardozi around the neckline, paired with tapered trousers and a scalloped organza dupatta.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'],
    dispatchDays: 'Made to order in 7–10 business days',
  },
  {
    id: 'aar-102',
    title: 'Ruhani Rose Organza Anarkali Set',
    category: 'Suit Sets',
    subCategory: 'Anarkali',
    collectionTags: ['Festive', 'Autumn Winter'],
    regularPrice: 210,
    salePrice: 158,
    onSale: true,
    primaryImage:
      'https://placehold.co/600x800/f6ecef/321004?text=RUHANI+ROSE%0AANARKALI+SET&font=montserrat',
    secondaryImage:
      'https://placehold.co/600x800/ebd9df/321004?text=RUHANI+ROSE%0ABACK+DRAPE&font=montserrat',
    fallbackTone: '#f6ecef',
    fabric: 'Silk Organza · Shantoon Underskirt',
    description:
      'Sixteen-panel flared Anarkali in muted tea rose accented with tonal resham florals, matched with churidar trousers and a sheer gossamer dupatta.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom'],
    dispatchDays: 'Made to order in 8–12 business days',
  },
  {
    id: 'aar-103',
    title: 'Tara Sage Block-Print Flared Kurta Set',
    category: 'Suit Sets',
    subCategory: 'Flared',
    collectionTags: ['Spring Summer', 'Work Wear'],
    regularPrice: 145,
    salePrice: 109,
    onSale: true,
    primaryImage:
      'https://placehold.co/600x800/eaeeea/321004?text=TARA+SAGE%0AFLARED+SUIT&font=montserrat',
    secondaryImage:
      'https://placehold.co/600x800/dce4dc/321004?text=TARA+SAGE%0APATTERN+VIEW&font=montserrat',
    fallbackTone: '#eaeeea',
    fabric: 'Handspun Cotton Mulmul',
    description:
      'Breezy sage green flared silhouette hand-stamped by Bagru artisans, completed with wide-leg palazzos and a contrast doria dupatta.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'],
    dispatchDays: 'Made to order in 5–7 business days',
  },
  {
    id: 'aar-104',
    title: 'Noor Sand Silk A-Line Suit Set',
    category: 'Suit Sets',
    subCategory: 'A-Line',
    collectionTags: ['Festive', 'Work Wear'],
    regularPrice: 178,
    salePrice: 138,
    onSale: true,
    primaryImage:
      'https://placehold.co/600x800/f1e9df/321004?text=NOOR+SAND%0AA-LINE+SUIT&font=montserrat',
    secondaryImage:
      'https://placehold.co/600x800/e5d8c8/321004?text=NOOR+SAND%0ACLOSEUP&font=montserrat',
    fallbackTone: '#f1e9df',
    fabric: 'Tussar Silk Blend · Pure Cotton Lining',
    description:
      'Warm sandstone A-line kurta with minimalist pintucks and subtle mirror-stitch cuffs, styled with straight pants and a woven Banarasi stole.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'Custom'],
    dispatchDays: 'Made to order in 7–10 business days',
  },
  {
    id: 'aar-105',
    title: 'Kaveri Indigo Handloom Straight Kurta',
    category: 'Kurtas',
    subCategory: 'Work Wear',
    collectionTags: ['Work Wear', 'Spring Summer'],
    regularPrice: 92,
    salePrice: 68,
    onSale: true,
    primaryImage:
      'https://placehold.co/600x800/e8ecf1/321004?text=KAVERI+INDIGO%0AHANDLOOM+KURTA&font=montserrat',
    secondaryImage:
      'https://placehold.co/600x800/d9e0e8/321004?text=KAVERI+INDIGO%0ASLEEVE+DETAIL&font=montserrat',
    fallbackTone: '#e8ecf1',
    fabric: 'Handwoven Slub Cotton',
    description:
      'Natural indigo straight kurta featuring hand-embroidered kantha stitches along the placket and side pockets for effortless workday comfort.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    dispatchDays: 'Made to order in 4–6 business days',
  },
  {
    id: 'aar-106',
    title: 'Zoya Terracotta Linen Co-ord Set',
    category: 'Co-ord Sets',
    subCategory: 'Contemporary',
    collectionTags: ['Spring Summer', 'Work Wear'],
    regularPrice: 128,
    salePrice: 96,
    onSale: true,
    primaryImage:
      'https://placehold.co/600x800/f3e6e1/321004?text=ZOYA+TERRACOTTA%0ACO-ORD+SET&font=montserrat',
    secondaryImage:
      'https://placehold.co/600x800/e8d4cc/321004?text=ZOYA+TERRACOTTA%0ADETAIL+VIEW&font=montserrat',
    fallbackTone: '#f3e6e1',
    fabric: 'Breathable Cotton Linen',
    description:
      'Relaxed tunic with shell buttons and geometric French knot embroidery, paired with ankle-grazing relaxed trousers.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom'],
    dispatchDays: 'Made to order in 5–8 business days',
  },
  {
    id: 'aar-107',
    title: 'Aanya Marigold Girls Festive Sharara Set',
    category: 'Kids',
    subCategory: 'Girls',
    collectionTags: ['Festive', 'Spring Summer'],
    regularPrice: 88,
    salePrice: 64,
    onSale: true,
    primaryImage:
      'https://placehold.co/600x800/f7efdf/321004?text=AANYA+MARIGOLD%0AGIRLS+SHARARA&font=montserrat',
    secondaryImage:
      'https://placehold.co/600x800/eee0c5/321004?text=AANYA+MARIGOLD%0AFESTIVE+VIEW&font=montserrat',
    fallbackTone: '#f7efdf',
    fabric: 'Soft Chanderi & Mulmul Lining',
    description:
      'Skin-friendly marigold short kurti with gentle gota trim, flared sharara pants, and a lightweight netted dupatta designed for young celebrations.',
    sizes: ['XS', 'S', 'M', 'L', 'Custom'],
    dispatchDays: 'Made to order in 5–7 business days',
  },
  {
    id: 'aar-108',
    title: 'Vihaan Ivory Silk Boys Kurta Pyjama',
    category: 'Kids',
    subCategory: 'Boys',
    collectionTags: ['Festive', 'Autumn Winter'],
    regularPrice: 82,
    salePrice: 59,
    onSale: true,
    primaryImage:
      'https://placehold.co/600x800/efece8/321004?text=VIHAAN+IVORY%0ABOYS+KURTA+SET&font=montserrat',
    secondaryImage:
      'https://placehold.co/600x800/e3ded7/321004?text=VIHAAN+IVORY%0AEMBROIDERY&font=montserrat',
    fallbackTone: '#efece8',
    fabric: 'Cotton Silk Blend',
    description:
      'Crisp ivory kurta with subtle mandarin collar threadwork paired with soft elasticated churidar pyjama for all-day comfort.',
    sizes: ['XS', 'S', 'M', 'L', 'Custom'],
    dispatchDays: 'Made to order in 5–7 business days',
  },
  {
    id: 'aar-109',
    title: 'Ira Velvet Plum Winter Kurta Set',
    category: 'Suit Sets',
    subCategory: 'Straight',
    collectionTags: ['Autumn Winter', 'Festive'],
    regularPrice: 195,
    salePrice: 149,
    onSale: true,
    primaryImage:
      'https://placehold.co/600x800/ede5ea/321004?text=IRA+PLUM%0AWINTER+SET&font=montserrat',
    secondaryImage:
      'https://placehold.co/600x800/dfd2da/321004?text=IRA+PLUM%0AZARI+DETAIL&font=montserrat',
    fallbackTone: '#ede5ea',
    fabric: 'Micro Silk Velvet · Organza Dupatta',
    description:
      'Plum micro-velvet straight kurta with delicate antique dori embroidery at the yoke and cuffs, paired with matching velvet pants.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom'],
    dispatchDays: 'Made to order in 8–10 business days',
  },
  {
    id: 'aar-110',
    title: 'Sana Pearl Chikankari Everyday Kurta',
    category: 'Kurtas',
    subCategory: 'Spring Summer',
    collectionTags: ['Spring Summer', 'Work Wear'],
    regularPrice: 98,
    salePrice: 74,
    onSale: true,
    primaryImage:
      'https://placehold.co/600x800/f3f1ee/321004?text=SANA+PEARL%0ACHIKANKARI+KURTA&font=montserrat',
    secondaryImage:
      'https://placehold.co/600x800/e7e4df/321004?text=SANA+PEARL%0ASTITCH+DETAIL&font=montserrat',
    fallbackTone: '#f3f1ee',
    fabric: 'Breathable Mulmul Voile',
    description:
      'Hand-done Lucknowi shadow-work chikankari on pearl-white mulmul, cut in an easy straight drape for warm afternoons.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    dispatchDays: 'Made to order in 5–7 business days',
  },
];

export const COLLECTION_BANNERS: CollectionBannerItem[] = [
  {
    id: 'banner-festive',
    title: 'FESTIVE',
    subtitle: 'Hand-embellished silks & heirloom silhouettes for celebratory evenings.',
    ctaLabel: 'SHOP NOW',
    filterKey: 'Festive',
    image:
      'https://placehold.co/900x1050/3d1c10/f6efe8?text=AAROHA+%C2%B7+FESTIVE+COLLECTION&font=montserrat',
    fallbackBg: 'linear-gradient(160deg, #3d1c10 0%, #6b3420 100%)',
  },
  {
    id: 'banner-workwear',
    title: 'WORK WEAR',
    subtitle: 'Tailored handloom kurtas & breathable co-ords built for daily ease.',
    ctaLabel: 'SHOP NOW',
    filterKey: 'Work Wear',
    image:
      'https://placehold.co/900x1050/4f382e/f7f3ee?text=AAROHA+%C2%B7+WORK+WEAR+EDIT&font=montserrat',
    fallbackBg: 'linear-gradient(160deg, #4f382e 0%, #7d5d4e 100%)',
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'rev-1',
    name: 'Ananya Deshmukh',
    city: 'Austin, USA',
    review:
      'Ordered the Meher Chanderi suit with custom sleeve and length notes. The cotton mulmul lining feels whisper-soft and the finish looks bespoke.',
    outfitBought: 'Meher Ivory Chanderi Straight Suit Set',
  },
  {
    id: 'rev-2',
    name: 'Meera Krishnan',
    city: 'London, UK',
    review:
      'Shipping arrived in nine days with zero extra customs hassle. The sage block-print flared kurta kept its crisp drape all day at a family brunch.',
    outfitBought: 'Tara Sage Block-Print Flared Kurta Set',
  },
  {
    id: 'rev-3',
    name: 'Rhea Malhotra',
    city: 'Bengaluru, India',
    review:
      'Bought matching outfits for myself and my daughter. Subtle embroidery, neat inner seams, and true-to-measure fitting without any alterations.',
    outfitBought: 'Aanya Marigold Girls Festive Sharara Set',
  },
];
