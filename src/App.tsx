import React, { useEffect, useMemo, useState } from 'react';
import { PRODUCTS } from './data/catalog';
import { CartItem, Product, SizeOption } from './types/store';
import { AnnouncementBar } from './components/AnnouncementBar';
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
import { QuickViewModal } from './components/QuickViewModal';
import { AccountModal } from './components/AccountModal';
import { AtelierGuideModal } from './components/AtelierGuideModal';
import { WhatsAppButton } from './components/WhatsAppButton';

export default function App() {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [guideTopic, setGuideTopic] = useState<
    'Made to Order' | 'Custom Sizing' | null
  >(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuickViewProduct(null);
        setSearchOpen(false);
        setCartOpen(false);
        setAccountOpen(false);
        setGuideTopic(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'ALL') return PRODUCTS;
    if (activeFilter === 'SALE') return PRODUCTS.filter((p) => p.onSale);

    return PRODUCTS.filter(
      (p) =>
        p.category.toLowerCase() === activeFilter.toLowerCase() ||
        p.subCategory.toLowerCase() === activeFilter.toLowerCase() ||
        p.collectionTags.some(
          (tag) => tag.toLowerCase() === activeFilter.toLowerCase()
        )
    );
  }, [activeFilter]);

  const handleSelectFilter = (filterKey: string) => {
    setActiveFilter(filterKey);
    const section = document.getElementById('recommended-products');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddToCart = (
    product: Product,
    size: SizeOption,
    quantity: number,
    customNote?: string
  ) => {
    const key = `${product.id}__${size}__${customNote ?? ''}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { key, product, size, quantity, customNote }];
    });
    setCartOpen(true);
  };

  const handleUpdateQuantity = (key: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (key: string) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  return (
    <div id="top" className="min-h-screen flex flex-col bg-white text-[#000000]">
      {/* Section 1: Announcement Bar */}
      <AnnouncementBar />

      {/* Section 2: Sticky Header + Mega-Menu + Mobile Drawer */}
      <Header
        cartCount={cartCount}
        activeFilter={activeFilter}
        onSelectFilter={handleSelectFilter}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
      />

      <main className="flex-1">
        {/* Section 3: Full-Width Slideshow */}
        <HeroSlideshow onExploreFilter={handleSelectFilter} />

        {/* Section 4: Featured Collections */}
        <FeaturedCollections onSelectCategory={handleSelectFilter} />

        {/* Section 5: Recommended For You Product Slider / Mobile 2-Col Grid */}
        <RecommendedProducts
          products={filteredProducts}
          activeFilter={activeFilter}
          onResetFilter={() => setActiveFilter('ALL')}
          onOpenQuickView={(product) => setQuickViewProduct(product)}
        />

        {/* Section 6: Collection Banner Section (Festive & Work Wear) */}
        <CollectionBanners onSelectCollection={handleSelectFilter} />

        {/* Section 7: Rich Text Brand Story Section */}
        <BrandStory />

        {/* Section 8: Image + Content Split Blocks */}
        <EditorialSplits onOpenCustomGuide={(topic) => setGuideTopic(topic)} />

        {/* Section 9: Customer Testimonials */}
        <Testimonials />

        {/* Section 10: Icon Features Strip */}
        <IconFeatures />
      </main>

      {/* Section 11: Dark Brown Footer */}
      <Footer
        onSelectFilter={handleSelectFilter}
        onOpenCustomGuide={(topic) => setGuideTopic(topic)}
        onOpenAccount={() => setAccountOpen(true)}
      />

      {/* Interactive Overlays, Drawers & WhatsApp Floating Button */}
      <WhatsAppButton />

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(product) => setQuickViewProduct(product)}
        onSelectFilter={handleSelectFilter}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenSizeGuide={() => {
          setQuickViewProduct(null);
          setGuideTopic('Custom Sizing');
        }}
      />

      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
      />

      <AtelierGuideModal
        topic={guideTopic}
        onClose={() => setGuideTopic(null)}
      />
    </div>
  );
}
