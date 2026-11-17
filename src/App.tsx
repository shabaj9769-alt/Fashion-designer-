import React, { useEffect, useMemo, useState } from 'react';
import { PRODUCTS } from './data/catalog';
import { CartItem, Product, SizeOption, SortOption } from './types/store';
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
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [guideTopic, setGuideTopic] = useState<
    'Made to Order' | 'Custom Sizing' | null
  >(null);

  const anyOverlayOpen =
    mobileMenuOpen ||
    cartOpen ||
    searchOpen ||
    accountOpen ||
    Boolean(quickViewProduct) ||
    Boolean(guideTopic);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuickViewProduct(null);
        setSearchOpen(false);
        setCartOpen(false);
        setAccountOpen(false);
        setMobileMenuOpen(false);
        setGuideTopic(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = useMemo(() => {
    const base =
      activeFilter === 'ALL'
        ? PRODUCTS
        : activeFilter === 'SALE'
        ? PRODUCTS.filter((p) => p.onSale)
        : PRODUCTS.filter(
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
  }, [activeFilter, sortBy]);

  const handleSelectFilter = (filterKey: string, scroll = true) => {
    setActiveFilter(filterKey);
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
        mobileDrawerOpen={mobileMenuOpen}
        onMobileDrawerOpenChange={setMobileMenuOpen}
        onSelectFilter={(key) => handleSelectFilter(key, true)}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
      />

      <main className="flex-1">
        {/* Section 3: Full-Width Slideshow */}
        <HeroSlideshow onExploreFilter={(key) => handleSelectFilter(key, true)} />

        {/* Section 4: Featured Collections */}
        <FeaturedCollections
          onSelectCategory={(key) => handleSelectFilter(key, true)}
        />

        {/* Section 5: Recommended For You Product Slider / Mobile 2-Col Grid + Filter/Sort */}
        <RecommendedProducts
          products={filteredProducts}
          activeFilter={activeFilter}
          sortBy={sortBy}
          onSelectFilter={(key) => handleSelectFilter(key, false)}
          onChangeSort={setSortBy}
          onOpenQuickView={(product) => setQuickViewProduct(product)}
        />

        {/* Section 6: Collection Banner Section (Festive & Work Wear) */}
        <CollectionBanners
          onSelectCollection={(key) => handleSelectFilter(key, true)}
        />

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
        onSelectFilter={(key) => handleSelectFilter(key, true)}
        onOpenCustomGuide={(topic) => setGuideTopic(topic)}
        onOpenAccount={() => setAccountOpen(true)}
      />

      {/* Interactive Overlays, Drawers & WhatsApp Floating Button */}
      <WhatsAppButton hidden={anyOverlayOpen} />

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
        onSelectFilter={(key) => handleSelectFilter(key, true)}
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
