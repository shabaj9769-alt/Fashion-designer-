import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Product, SortOption } from '../types/store';
import { SmartImage } from './SmartImage';

interface RecommendedProductsProps {
  products: Product[];
  activeFilter: string;
  sortBy: SortOption;
  onSelectFilter: (filterKey: string) => void;
  onChangeSort: (sort: SortOption) => void;
  onOpenQuickView: (product: Product) => void;
}

const FILTER_TABS = [
  { label: 'All', key: 'ALL' },
  { label: 'Suit Sets', key: 'Suit Sets' },
  { label: 'Kurtas', key: 'Kurtas' },
  { label: 'Co-ord Sets', key: 'Co-ord Sets' },
  { label: 'Kids', key: 'Kids' },
];

export const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  products,
  activeFilter,
  sortBy,
  onSelectFilter,
  onChangeSort,
  onOpenQuickView,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.75, 280);
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const isPresetFilter = FILTER_TABS.some(
    (t) => t.key.toLowerCase() === activeFilter.toLowerCase()
  );

  return (
    <section
      id="recommended-products"
      className="py-12 sm:py-16 bg-[#f2f2f2]/55 border-y border-[#e8e8e8]"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <h2 className="aaroha-section-heading font-medium uppercase text-[#000000]">
            {activeFilter === 'ALL'
              ? 'Recommended For You'
              : `${activeFilter} Edit`}
          </h2>
          <p className="mt-1.5 text-[12px] text-[#343434]">
            Showing {products.length}{' '}
            {products.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>

        {/* Category Filter Tabs + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7 pb-4 border-b border-[#e8e8e8]">
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Filter products by category"
          >
            {FILTER_TABS.map((tab) => {
              const active =
                activeFilter.toLowerCase() === tab.key.toLowerCase();
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectFilter(tab.key)}
                  className={`min-h-[44px] px-4 py-2 text-[11px] font-medium uppercase tracking-[1px] border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#321004] text-white border-[#321004]'
                      : 'bg-white text-[#343434] border-[#e8e8e8] hover:border-[#c8a078] hover:text-[#000000]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            {!isPresetFilter && (
              <button
                type="button"
                onClick={() => onSelectFilter('ALL')}
                className="min-h-[44px] px-4 py-2 text-[11px] font-medium uppercase tracking-[1px] bg-[#d74a5d] text-white border border-[#d74a5d] cursor-pointer"
              >
                {activeFilter} ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <label
              htmlFor="catalog-sort"
              className="text-[11px] font-medium uppercase tracking-[1px] text-[#343434] whitespace-nowrap"
            >
              Sort By
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => onChangeSort(e.target.value as SortOption)}
              className="min-h-[44px] px-3 py-2 bg-white border border-[#e8e8e8] focus:border-[#c8a078] focus:outline-none text-[12px] text-[#000000] cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="relative">
          {/* Desktop Carousel Arrows */}
          {products.length > 4 && (
            <>
              <button
                type="button"
                onClick={() => scrollTrack('left')}
                aria-label="Scroll products left"
                className="aaroha-carousel-arrow absolute -left-3 top-[38%] -translate-y-1/2 z-20 w-11 h-11 bg-white border border-[#e8e8e8] text-[#000000] hover:border-[#c8a078] hover:text-[#d74a5d] items-center justify-center shadow-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrack('right')}
                aria-label="Scroll products right"
                className="aaroha-carousel-arrow absolute -right-3 top-[38%] -translate-y-1/2 z-20 w-11 h-11 bg-white border border-[#e8e8e8] text-[#000000] hover:border-[#c8a078] hover:text-[#d74a5d] items-center justify-center shadow-sm transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Responsive: 2-Col Grid on Mobile/Touch, Horizontal Slider on Desktop */}
          <div ref={trackRef} className="aaroha-products-track no-scrollbar">
            {products.map((product) => (
              <article
                key={product.id}
                className="aaroha-product-card group flex flex-col bg-white border border-[#e8e8e8]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f2f2f2]">
                  {product.onSale && (
                    <span className="absolute top-2.5 left-2.5 z-20 bg-[#d74a5d] text-white text-[10px] font-medium uppercase tracking-[1px] px-2 py-1 leading-none">
                      SALE
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenQuickView(product)}
                    className="block w-full h-full text-left cursor-pointer"
                    aria-label={`Quick view ${product.title}`}
                  >
                    {/* Primary Image */}
                    <SmartImage
                      src={product.primaryImage}
                      alt={product.title}
                      width={600}
                      height={800}
                      aspectRatio="3 / 4"
                      className="w-full h-full object-cover transition-opacity duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-0"
                      fallbackBg={product.fallbackTone}
                    />
                    {/* Secondary Hover Image (desktop hover:hover only) */}
                    <div className="aaroha-hover-img absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <SmartImage
                        src={product.secondaryImage}
                        alt={`${product.title} alternate view`}
                        width={600}
                        height={800}
                        aspectRatio="3 / 4"
                        className="w-full h-full object-cover"
                        fallbackBg={product.fallbackTone}
                      />
                    </div>
                  </button>

                  {/* Quick View Desktop Overlay Button */}
                  <div className="hidden lg:flex absolute inset-x-3 bottom-3 z-20 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => onOpenQuickView(product)}
                      className="w-full min-h-[44px] py-2.5 bg-white/95 hover:bg-[#d74a5d] text-[#000000] hover:text-white border border-[#e8e8e8] hover:border-[#d74a5d] text-[11px] font-medium uppercase tracking-[1px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between min-w-0">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[1px] text-[#c8a078] font-medium mb-1">
                      {product.category}
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenQuickView(product)}
                      className="w-full text-left text-[14px] font-medium text-[#000000] hover:text-[#d74a5d] transition-colors leading-[1.4] whitespace-normal [overflow-wrap:anywhere] min-h-[2.8em] cursor-pointer"
                    >
                      {product.title}
                    </button>
                  </div>

                  <div className="mt-2.5 flex flex-col min-w-0">
                    <div className="flex flex-wrap items-baseline gap-[8px] tabular-nums">
                      {product.onSale && (
                        <span className="text-[13px] text-[#777777] line-through">
                          ${product.regularPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-[15px] sm:text-[16px] font-semibold text-[#d74a5d]">
                        ${product.salePrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenQuickView(product)}
                      className="w-full mt-[10px] min-h-[44px] px-2 border border-[#c8a078] text-[#321004] hover:bg-[#321004] hover:border-[#321004] hover:text-white text-[11px] font-medium uppercase tracking-[1px] whitespace-nowrap transition-colors cursor-pointer flex items-center justify-center"
                    >
                      SELECT SIZE
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
