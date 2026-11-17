import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Minus,
  Plus,
  Ruler,
  Scissors,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react';
import { PRODUCTS } from '../data/catalog';
import { Product, SizeOption } from '../types/store';
import { formatINR, getDiscountPercent } from '../utils/currency';
import { SmartImage } from './SmartImage';

interface ProductDetailPageProps {
  product: Product;
  cartCount: number;
  zoomOpen: boolean;
  onBack: () => void;
  onBackHome: (filterKey?: string) => void;
  onOpenCart: () => void;
  onOpenZoom: () => void;
  onCloseZoom: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (
    product: Product,
    size: SizeOption,
    quantity: number,
    customNote?: string,
    openCheckout?: boolean
  ) => void;
  onOpenSizeGuide: () => void;
}

const GALLERY_SHADES = ['#f2f2f2', '#ece6df', '#e8e1d9', '#f0ebe6'] as const;

function getProductRatingStats(productId: string) {
  const num = parseInt(productId.replace(/\D/g, ''), 10) || 101;
  const rating = Number((4.6 + ((num % 4) * 0.1)).toFixed(1));
  const reviewCount = 24 + ((num * 7) % 41);
  return { rating, reviewCount };
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  cartCount,
  zoomOpen,
  onBack,
  onBackHome,
  onOpenCart,
  onOpenZoom,
  onCloseZoom,
  onSelectProduct,
  onAddToCart,
  onOpenSizeGuide,
}) => {
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [shakeSizes, setShakeSizes] = useState(false);
  const [sizeToast, setSizeToast] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedSize(null);
    setQuantity(1);
    setCustomNote('');
    setActiveImageIdx(0);
    setAddedFeedback(false);
    setShakeSizes(false);
    setSizeToast(false);
    setPincodeResult(null);
  }, [product]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const gallerySlides = [
    { src: product.primaryImage, shade: GALLERY_SHADES[0] },
    { src: product.secondaryImage, shade: GALLERY_SHADES[1] },
    { src: '', shade: GALLERY_SHADES[2] },
    { src: '', shade: GALLERY_SHADES[3] },
  ];

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleGalleryTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    const dy = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        setActiveImageIdx((prev) => (prev + 1) % gallerySlides.length);
      } else {
        setActiveImageIdx(
          (prev) => (prev - 1 + gallerySlides.length) % gallerySlides.length
        );
      }
    }
  };
  const discountPct = getDiscountPercent(product.price, product.salePrice);
  const { rating, reviewCount } = useMemo(
    () => getProductRatingStats(product.id),
    [product.id]
  );

  const similarProducts = useMemo(() => {
    const sameCategory = PRODUCTS.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    const sameTags = PRODUCTS.filter(
      (p) =>
        p.id !== product.id &&
        p.category !== product.category &&
        p.collectionTags.some((t) => product.collectionTags.includes(t))
    );
    const remaining = PRODUCTS.filter(
      (p) =>
        p.id !== product.id &&
        !sameCategory.some((c) => c.id === p.id) &&
        !sameTags.some((c) => c.id === p.id)
    );
    return [...sameCategory, ...sameTags, ...remaining].slice(0, 4);
  }, [product]);

  const productReviews = useMemo(
    () => [
      {
        id: 'pr-1',
        author: 'Shreya Kulkarni',
        city: 'Pune',
        rating: 5,
        date: '14 Oct 2026',
        sizeBought: product.sizes.includes('M') ? 'M' : product.sizes[0],
        comment: `The ${product.fabric.split('·')[0].trim().toLowerCase()} drapes beautifully and the inner lining feels breathable all day. Stitching finish is true boutique quality.`,
      },
      {
        id: 'pr-2',
        author: 'Niharika Verma',
        city: 'New Delhi',
        rating: 5,
        date: '02 Oct 2026',
        sizeBought: product.sizes.includes('Custom') ? 'Custom' : product.sizes[0],
        comment:
          'Requested slight sleeve and length adjustments in Custom sizing—arrived fitting like it was tailored in person. Complimentary delivery across India was super smooth.',
      },
      {
        id: 'pr-3',
        author: 'Divya Nair',
        city: 'Bengaluru',
        rating: 4,
        date: '21 Sep 2026',
        sizeBought: product.sizes.includes('L') ? 'L' : product.sizes[0],
        comment:
          'Rich color tone in natural light and delicate detailing. Looks even better in person than in photos.',
      },
    ],
    [product]
  );

  const triggerSizePrompt = () => {
    sizeSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    setShakeSizes(false);
    window.requestAnimationFrame(() => {
      setShakeSizes(true);
    });
    setSizeToast(true);

    if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);

    shakeTimerRef.current = window.setTimeout(() => setShakeSizes(false), 500);
    toastTimerRef.current = window.setTimeout(() => setSizeToast(false), 2600);
  };

  const handleSelectSizeChip = (size: SizeOption) => {
    setSelectedSize(size);
    setShakeSizes(false);
    setSizeToast(false);
  };

  const handleAddToBag = (openCheckout = false) => {
    if (!selectedSize) {
      triggerSizePrompt();
      return;
    }
    onAddToCart(
      product,
      selectedSize,
      quantity,
      selectedSize === 'Custom' ? customNote.trim() || undefined : undefined,
      openCheckout
    );
    if (!openCheckout) {
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 1800);
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
      setPincodeResult({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }
    setPincodeResult({
      valid: true,
      message: `Free delivery across India to ${cleaned} · ${product.dispatchDays} · UPI, Cards & COD available`,
    });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch {
        setCopiedLink(false);
      }
    }
  };

  return (
    <div className="bg-white pb-[100px]">
      {/* Compact Sticky Top Bar: Back Arrow (44x44) + 1-line Product Name + Cart Icon */}
      <header className="aaroha-sticky-topbar bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="w-11 h-11 shrink-0 bg-white text-[#321004] hover:text-[#d74a5d] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <p className="flex-1 min-w-0 text-center text-[13px] sm:text-[14px] font-medium uppercase tracking-[1px] text-[#000000] truncate px-2">
            {product.title}
          </p>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Shopping bag with ${cartCount} items`}
            className="relative w-11 h-11 shrink-0 bg-white text-[#321004] hover:text-[#d74a5d] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-[19px] h-[19px] stroke-[1.7]" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1 min-w-[17px] h-[17px] px-1 bg-[#d74a5d] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main 2-Column E-Commerce PDP Layout */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 pt-5 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: 4-Slide Gallery with Swipe, Dots & 1/4 Counter */}
          <div className="lg:sticky lg:top-[76px]">
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              {/* 4 Shade Thumbnails */}
              <div className="flex sm:flex-col gap-2.5 sm:w-20 shrink-0">
                {gallerySlides.map((slide, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View slide ${idx + 1} of ${gallerySlides.length}`}
                    className={`w-16 sm:w-full aspect-[3/4] overflow-hidden border transition-colors cursor-pointer ${
                      activeImageIdx === idx
                        ? 'border-[#321004] ring-1 ring-[#321004]'
                        : 'border-[#e8e8e8] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <SmartImage
                      src={slide.src}
                      alt={`${product.title} thumbnail ${idx + 1}`}
                      width={300}
                      height={400}
                      aspectRatio="3 / 4"
                      className="w-full h-full object-cover"
                      fallbackBg={slide.shade}
                    />
                  </button>
                ))}
              </div>

              {/* Primary Swipeable Frame + Dots */}
              <div className="flex-1 min-w-0">
                <div
                  className="relative aspect-[3/4] bg-[#f2f2f2] border border-[#e8e8e8] overflow-hidden touch-pan-y"
                  onTouchStart={handleGalleryTouchStart}
                  onTouchEnd={handleGalleryTouchEnd}
                >
                  {product.onSale && discountPct > 0 && (
                    <span className="absolute top-3 left-3 z-20 bg-[#d74a5d] text-white text-[10px] font-medium uppercase tracking-[1px] px-2.5 py-1 leading-none">
                      {discountPct}% OFF
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={onOpenZoom}
                    aria-label="Open full-screen viewer"
                    className="absolute top-3 right-3 z-20 w-10 h-10 bg-white/95 hover:bg-white border border-[#e8e8e8] flex items-center justify-center text-[#321004] hover:text-[#d74a5d] transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  {/* 4-Slide Horizontal Track */}
                  <div
                    onClick={onOpenZoom}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenZoom();
                      }
                    }}
                    aria-label={`Open viewer for ${product.title}, slide ${activeImageIdx + 1} of ${gallerySlides.length}`}
                    className="flex w-full h-full transition-transform duration-300 ease-out cursor-zoom-in"
                    style={{
                      transform: `translateX(-${activeImageIdx * 100}%)`,
                    }}
                  >
                    {gallerySlides.map((slide, idx) => (
                      <div key={idx} className="w-full h-full shrink-0">
                        <SmartImage
                          src={slide.src}
                          alt={`${product.title} view ${idx + 1}`}
                          width={900}
                          height={1200}
                          aspectRatio="3 / 4"
                          className="w-full h-full object-cover"
                          fallbackBg={slide.shade}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Slide Arrows */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx(
                        (prev) =>
                          (prev - 1 + gallerySlides.length) %
                          gallerySlides.length
                      )
                    }
                    aria-label="Previous slide"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 hover:bg-white border border-[#e8e8e8] flex items-center justify-center text-[#000000] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx(
                        (prev) => (prev + 1) % gallerySlides.length
                      )
                    }
                    aria-label="Next slide"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 hover:bg-white border border-[#e8e8e8] flex items-center justify-center text-[#000000] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* 1/4 Slide Counter */}
                  <span className="absolute bottom-3 right-3 z-20 px-2.5 py-1 bg-white/90 border border-[#e8e8e8] text-[11px] font-medium tabular-nums text-[#321004] leading-none">
                    {activeImageIdx + 1}/{gallerySlides.length}
                  </span>
                </div>

                {/* Pagination Dots */}
                <div
                  className="flex items-center justify-center gap-2 mt-3"
                  role="tablist"
                  aria-label="Product gallery slides"
                >
                  {gallerySlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      role="tab"
                      aria-selected={activeImageIdx === idx}
                      aria-label={`Slide ${idx + 1} of ${gallerySlides.length}`}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                        activeImageIdx === idx
                          ? 'w-6 bg-[#321004]'
                          : 'w-2 bg-[#d6d0c8] hover:bg-[#c8a078]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Info, Offers, Size & Quantity, Delivery, Specs */}
          <div className="min-w-0">
            {/* Brand & Title */}
            <div className="pb-4 border-b border-[#e8e8e8]">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-[#c8a078]">
                  AAROHA ATELIER · {product.category}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWishlisted((w) => !w)}
                    aria-label={
                      wishlisted ? 'Remove from wishlist' : 'Save to wishlist'
                    }
                    className={`p-2 border transition-colors cursor-pointer ${
                      wishlisted
                        ? 'border-[#d74a5d] text-[#d74a5d] bg-[#d74a5d]/5'
                        : 'border-[#e8e8e8] text-[#343434] hover:border-[#c8a078]'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${wishlisted ? 'fill-[#d74a5d]' : ''}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Copy product link"
                    className="p-2 border border-[#e8e8e8] text-[#343434] hover:border-[#c8a078] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Share2 className="w-4 h-4" />
                    {copiedLink && (
                      <span className="text-[10px] uppercase tracking-[0.8px] text-[#15803d] font-medium">
                        Copied
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <h1 className="text-[20px] sm:text-[26px] font-medium uppercase tracking-[1px] text-[#000000] leading-snug mb-3">
                {product.title}
              </h1>

              {/* Rating Summary Box */}
              <a
                href="#pdp-reviews"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById('pdp-reviews')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-2.5 py-1 border border-[#e8e8e8] bg-[#f2f2f2]/70 hover:border-[#c8a078] transition-colors text-[12px]"
              >
                <span className="inline-flex items-center gap-1 font-semibold text-[#000000]">
                  {rating}
                  <Star className="w-3.5 h-3.5 fill-[#c8a078] text-[#c8a078]" />
                </span>
                <span className="text-[#e8e8e8]">|</span>
                <span className="text-[#343434]">
                  {reviewCount} Verified Reviews
                </span>
              </a>
            </div>

            {/* Price Block */}
            <div className="py-4 border-b border-[#e8e8e8]">
              <div className="flex flex-wrap items-baseline gap-3 tabular-nums">
                <span className="text-[24px] sm:text-[28px] font-semibold text-[#000000]">
                  {formatINR(product.salePrice)}
                </span>
                {product.onSale && product.price > product.salePrice && (
                  <>
                    <span className="text-[15px] text-[#777777] line-through">
                      MRP {formatINR(product.price)}
                    </span>
                    <span className="text-[14px] font-semibold text-[#15803d] uppercase tracking-[0.5px]">
                      {discountPct}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#15803d] font-medium mt-1">
                Inclusive of all taxes · Complimentary custom tailoring
              </p>
            </div>

            {/* Atelier Offers */}
            <div className="py-4 border-b border-[#e8e8e8]">
              <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#000000] mb-2.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#d74a5d]" />
                <span>Atelier Offers</span>
              </p>
              <ul className="space-y-1.5 text-[12px] text-[#343434]">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#c8a078] shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-medium text-[#000000]">
                      Multi-Piece Offer:
                    </strong>{' '}
                    Buy 2 get 5% off, Buy 3 get 10% off automatically in your bag.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#c8a078] shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-medium text-[#000000]">
                      Shipping:
                    </strong>{' '}
                    Complimentary delivery across India on all orders.
                  </span>
                </li>
              </ul>
            </div>

            {/* Size Picker + Single Quantity Control */}
            <div ref={sizeSectionRef} className="py-5 border-b border-[#e8e8e8]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-medium uppercase tracking-[1px] text-[#000000]">
                  Select Size:{' '}
                  {selectedSize ? (
                    <span className="text-[#d74a5d]">{selectedSize}</span>
                  ) : (
                    <span className="text-[#777777] font-normal">
                      Choose an option
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[1px] text-[#321004] hover:text-[#d74a5d] underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              <div
                className={`flex flex-wrap gap-2.5 ${
                  shakeSizes ? 'aaroha-shake' : ''
                }`}
              >
                {product.sizes.map((size) => {
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSelectSizeChip(size)}
                      className={`min-w-[52px] min-h-[46px] px-3.5 text-[12px] font-medium uppercase tracking-[0.8px] border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#321004] text-white border-[#321004]'
                          : sizeToast
                          ? 'bg-white text-[#000000] border-[#d74a5d]'
                          : 'bg-white text-[#000000] border-[#e8e8e8] hover:border-[#c8a078]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {selectedSize === 'Custom' && (
                <div className="mt-3.5 p-3.5 bg-[#f2f2f2]/80 border border-[#c8a078]">
                  <label
                    htmlFor="pdp-custom-note"
                    className="block text-[11px] font-medium uppercase tracking-[1px] text-[#321004] mb-1.5"
                  >
                    Custom Fit Measurements (₹0 Extra Fee)
                  </label>
                  <input
                    id="pdp-custom-note"
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. Bust 36in, Waist 30in, Kurta length 44in, 3/4 sleeves"
                    className="w-full min-h-[44px] px-3 py-2 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[12px] text-[#000000] focus:outline-none"
                  />
                </div>
              )}

              {/* Single Quantity Selector */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[11px] font-medium uppercase tracking-[1px] text-[#343434]">
                  Quantity
                </span>
                <div className="inline-flex items-center border border-[#e8e8e8] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 flex items-center justify-center text-[#000000] hover:bg-[#f2f2f2] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-[13px] font-medium tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                    className="w-10 h-10 flex items-center justify-center text-[#000000] hover:bg-[#f2f2f2] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery & PIN Code Check */}
            <div className="py-5 border-b border-[#e8e8e8]">
              <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#000000] mb-2.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#321004]" />
                <span>Check Delivery &amp; Dispatch</span>
              </p>

              <form
                onSubmit={handleCheckPincode}
                className="flex items-stretch max-w-sm"
              >
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code (e.g. 400001)"
                  aria-label="Enter 6-digit PIN code"
                  className="flex-1 min-w-0 min-h-[44px] px-3.5 border border-[#e8e8e8] focus:border-[#c8a078] focus:outline-none text-[12px] text-[#000000]"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-5 bg-[#f2f2f2] hover:bg-[#321004] text-[#000000] hover:text-white border border-l-0 border-[#e8e8e8] text-[11px] font-medium uppercase tracking-[1px] transition-colors cursor-pointer"
                >
                  CHECK
                </button>
              </form>

              {pincodeResult ? (
                <p
                  className={`mt-2 text-[12px] leading-snug ${
                    pincodeResult.valid
                      ? 'text-[#15803d] font-medium'
                      : 'text-[#d74a5d]'
                  }`}
                >
                  {pincodeResult.message}
                </p>
              ) : (
                <p className="mt-2 text-[12px] text-[#343434]">
                  Complimentary delivery across India · {product.dispatchDays}
                </p>
              )}

              <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-[#e8e8e8]">
                <div className="flex flex-col items-center text-center p-2.5 bg-[#f2f2f2]/60 border border-[#e8e8e8]">
                  <Truck className="w-4 h-4 text-[#321004] mb-1.5 stroke-[1.6]" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-[#000000] leading-tight">
                    Free India Shipping
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 bg-[#f2f2f2]/60 border border-[#e8e8e8]">
                  <Scissors className="w-4 h-4 text-[#321004] mb-1.5 stroke-[1.6]" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-[#000000] leading-tight">
                    Made in Jaipur
                  </span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 bg-[#f2f2f2]/60 border border-[#e8e8e8]">
                  <ShieldCheck className="w-4 h-4 text-[#321004] mb-1.5 stroke-[1.6]" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-[#000000] leading-tight">
                    7-Day Alterations
                  </span>
                </div>
              </div>
            </div>

            {/* Product Details & Specifications */}
            <div className="py-5">
              <h2 className="text-[13px] font-medium uppercase tracking-[1.2px] text-[#000000] mb-3">
                Product Details &amp; Specifications
              </h2>
              <p className="text-[13px] text-[#343434] leading-[1.75] mb-5">
                {product.description}
              </p>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 border-t border-[#e8e8e8] pt-4 text-[12px]">
                <div className="border-b border-[#e8e8e8] pb-2.5">
                  <dt className="text-[10px] uppercase tracking-[1px] text-[#777777] mb-0.5">
                    Fabric &amp; Lining
                  </dt>
                  <dd className="text-[#000000] font-medium">{product.fabric}</dd>
                </div>
                <div className="border-b border-[#e8e8e8] pb-2.5">
                  <dt className="text-[10px] uppercase tracking-[1px] text-[#777777] mb-0.5">
                    Silhouette
                  </dt>
                  <dd className="text-[#000000] font-medium">
                    {product.subCategory} · {product.category}
                  </dd>
                </div>
                <div className="border-b border-[#e8e8e8] pb-2.5">
                  <dt className="text-[10px] uppercase tracking-[1px] text-[#777777] mb-0.5">
                    Occasion Edit
                  </dt>
                  <dd className="text-[#000000] font-medium">
                    {product.collectionTags.join(', ')}
                  </dd>
                </div>
                <div className="border-b border-[#e8e8e8] pb-2.5">
                  <dt className="text-[10px] uppercase tracking-[1px] text-[#777777] mb-0.5">
                    Dispatch Timeline
                  </dt>
                  <dd className="text-[#000000] font-medium">
                    {product.dispatchDays}
                  </dd>
                </div>
                <div className="border-b border-[#e8e8e8] pb-2.5">
                  <dt className="text-[10px] uppercase tracking-[1px] text-[#777777] mb-0.5">
                    Wash &amp; Care
                  </dt>
                  <dd className="text-[#000000] font-medium">
                    Dry clean recommended · Steam press inside out
                  </dd>
                </div>
                <div className="border-b border-[#e8e8e8] pb-2.5">
                  <dt className="text-[10px] uppercase tracking-[1px] text-[#777777] mb-0.5">
                    Country of Origin
                  </dt>
                  <dd className="text-[#000000] font-medium">
                    Handcrafted in Jaipur, India
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Ratings & Customer Reviews Section */}
        <section
          id="pdp-reviews"
          className="mt-12 sm:mt-16 pt-10 border-t border-[#e8e8e8]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
            <div className="p-6 bg-[#f2f2f2] border border-[#e8e8e8]">
              <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-[#c8a078] mb-2">
                VERIFIED RATINGS
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[36px] font-semibold text-[#000000] tabular-nums">
                  {rating}
                </span>
                <Star className="w-5 h-5 fill-[#c8a078] text-[#c8a078]" />
              </div>
              <p className="text-[12px] text-[#343434] mb-5">
                Based on {reviewCount} verified buyer reviews
              </p>

              <div className="space-y-2 text-[11px] tabular-nums">
                {[
                  { stars: 5, pct: 78 },
                  { stars: 4, pct: 16 },
                  { stars: 3, pct: 4 },
                  { stars: 2, pct: 2 },
                  { stars: 1, pct: 0 },
                ].map((bar) => (
                  <div key={bar.stars} className="flex items-center gap-2">
                    <span className="w-6 text-[#000000] font-medium">
                      {bar.stars}★
                    </span>
                    <div className="flex-1 h-1.5 bg-[#e8e8e8] overflow-hidden">
                      <div
                        className="h-full bg-[#321004]"
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[#777777]">
                      {bar.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000]">
                Patron Reviews
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {productReviews.map((rev) => (
                  <article
                    key={rev.id}
                    className="p-5 bg-white border border-[#e8e8e8] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#321004] text-white text-[11px] font-medium">
                          {rev.rating}★
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.8px] text-[#777777]">
                          Size: {rev.sizeBought}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#343434] leading-relaxed mb-4">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#e8e8e8] text-[11px] text-[#777777]">
                      <span className="font-medium text-[#000000]">
                        {rev.author}
                      </span>{' '}
                      · {rev.city} · {rev.date}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Similar Styles Section */}
        <section className="mt-12 sm:mt-16 pt-10 border-t border-[#e8e8e8]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="aaroha-section-heading font-medium uppercase text-[#000000]">
              Similar Pieces You May Like
            </h2>
            <button
              type="button"
              onClick={() => onBackHome(product.category)}
              className="text-[11px] font-medium uppercase tracking-[1px] text-[#321004] hover:text-[#d74a5d] underline cursor-pointer"
            >
              View All {product.category}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {similarProducts.map((sim) => {
              const simDiscount = getDiscountPercent(sim.price, sim.salePrice);
              return (
                <article
                  key={sim.id}
                  className="group flex flex-col bg-white border border-[#e8e8e8] min-w-0 overflow-hidden"
                >
                  <a
                    href={`#/product/${sim.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectProduct(sim);
                    }}
                    className="flex flex-col flex-1 text-left cursor-pointer"
                    aria-label={`View ${sim.title}`}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f2f2f2]">
                      {sim.onSale && simDiscount > 0 && (
                        <span className="absolute top-2.5 left-2.5 z-20 bg-[#d74a5d] text-white text-[10px] font-medium uppercase tracking-[1px] px-2 py-1 leading-none">
                          SALE
                        </span>
                      )}
                      <SmartImage
                        src={sim.primaryImage}
                        alt={sim.title}
                        width={600}
                        height={800}
                        aspectRatio="3 / 4"
                        className="w-full h-full object-cover"
                        fallbackBg={sim.fallbackTone}
                      />
                    </div>

                    <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between min-w-0">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[1px] text-[#c8a078] font-medium mb-1">
                          {sim.category}
                        </p>
                        <h3 className="text-[13px] sm:text-[14px] font-medium text-[#000000] group-hover:text-[#d74a5d] transition-colors leading-[1.4] whitespace-normal [overflow-wrap:anywhere] min-h-[2.8em] normal-case tracking-normal">
                          {sim.title}
                        </h3>
                      </div>

                      <div className="mt-2.5 flex flex-col min-w-0">
                        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 tabular-nums">
                          <span className="text-[14px] sm:text-[15px] font-semibold text-[#000000]">
                            {formatINR(sim.salePrice)}
                          </span>
                          {sim.onSale && sim.price > sim.salePrice && (
                            <>
                              <span className="text-[12px] text-[#777777] line-through">
                                {formatINR(sim.price)}
                              </span>
                              <span className="text-[11px] font-semibold text-[#15803d]">
                                {simDiscount}% OFF
                              </span>
                            </>
                          )}
                        </div>

                        <span className="w-full mt-[10px] min-h-[44px] px-2 border border-[#c8a078] text-[#321004] group-hover:bg-[#321004] group-hover:border-[#321004] group-hover:text-white text-[11px] font-medium uppercase tracking-[1px] whitespace-nowrap transition-colors flex items-center justify-center">
                          SELECT SIZE
                        </span>
                      </div>
                    </div>
                  </a>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {/* Size Validation Toast */}
      {sizeToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[86px] left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 bg-[#321004] text-white border border-[#c8a078] shadow-lg flex items-center gap-2 text-[12px] font-medium tracking-[0.5px] whitespace-nowrap"
        >
          <AlertCircle className="w-4 h-4 text-[#dcb48c] shrink-0" />
          <span>Pehle size chuniye</span>
        </div>
      )}

      {/* Fullscreen Viewer Overlay */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Expanded view of ${product.title}`}
        >
          <div className="w-full max-w-[960px] flex items-center justify-between pb-3 text-white">
            <p className="text-[12px] uppercase tracking-[1px] truncate pr-4">
              {product.title} · {activeImageIdx + 1}/{gallerySlides.length}
            </p>
            <button
              type="button"
              onClick={onCloseZoom}
              aria-label="Close zoom viewer"
              className="w-11 h-11 bg-white text-[#321004] hover:text-[#d74a5d] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="relative w-full max-w-[640px] max-h-[75dvh] aspect-[3/4] bg-[#f2f2f2] overflow-hidden touch-pan-y"
            onTouchStart={handleGalleryTouchStart}
            onTouchEnd={handleGalleryTouchEnd}
          >
            <SmartImage
              src={gallerySlides[activeImageIdx].src}
              alt={`${product.title} expanded`}
              width={1200}
              height={1600}
              aspectRatio="3 / 4"
              className="w-full h-full object-contain"
              fallbackBg={gallerySlides[activeImageIdx].shade}
            />

            <button
              type="button"
              onClick={() =>
                setActiveImageIdx(
                  (prev) =>
                    (prev - 1 + gallerySlides.length) % gallerySlides.length
                )
              }
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 text-[#321004] flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveImageIdx((prev) => (prev + 1) % gallerySlides.length)
              }
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 text-[#321004] flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            {gallerySlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Zoom slide ${idx + 1} of ${gallerySlides.length}`}
                onClick={() => setActiveImageIdx(idx)}
                className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  activeImageIdx === idx
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Single Sticky Bottom Purchase Bar (Mobile & Desktop) */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#e8e8e8] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-8 lg:px-10 py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Price + % OFF */}
          <div className="shrink-0 tabular-nums flex flex-col sm:flex-row sm:items-baseline sm:gap-2.5">
            <span className="text-[16px] sm:text-[20px] font-semibold text-[#000000] leading-tight">
              {formatINR(product.salePrice * quantity)}
            </span>
            {product.onSale && product.price > product.salePrice && (
              <div className="flex items-baseline gap-1.5">
                <span className="hidden sm:inline text-[13px] text-[#777777] line-through">
                  {formatINR(product.price * quantity)}
                </span>
                <span className="text-[11px] sm:text-[13px] font-semibold text-[#15803d] leading-tight">
                  {discountPct}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Right: Single ADD TO BAG & BUY NOW buttons */}
          <div className="flex-1 sm:flex-none sm:w-[420px] flex items-stretch gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => handleAddToBag(false)}
              className="flex-1 min-h-[46px] px-3 sm:px-5 bg-[#d74a5d] hover:bg-[#321004] text-white text-[11px] sm:text-[12px] font-medium uppercase tracking-[1.2px] sm:tracking-[1.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {addedFeedback ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ADDED TO BAG</span>
                </>
              ) : (
                <span>ADD TO BAG</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleAddToBag(true)}
              className="flex-1 min-h-[46px] px-3 sm:px-5 bg-[#321004] hover:bg-[#000000] text-white text-[11px] sm:text-[12px] font-medium uppercase tracking-[1.2px] sm:tracking-[1.5px] flex items-center justify-center transition-colors cursor-pointer"
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
