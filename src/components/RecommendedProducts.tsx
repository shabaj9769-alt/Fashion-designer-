import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, SortOption } from '../types/store';
import { formatINR, getDiscountPercent } from '../utils/currency';
import { SmartImage } from './SmartImage';

interface RecommendedProductsProps {
  products: Product[];
  activeFilter: string;
  sortBy: SortOption;
  onSelectFilter: (filterKey: string) => void;
  onChangeSort: (sort: SortOption) => void;
  onOpenProduct: (product: Product) => void;
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
  onOpenProduct,
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
            {products.map((product) => {
              const discountPct = getDiscountPercent(
                product.price,
                product.salePrice
              );
              return (
                <article
                  key={product.id}
                  className="aaroha-product-card group flex flex-col bg-white border border-[#e8e8e8]"
                >
                  <a
                    href={`#/product/${product.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenProduct(product);
                    }}
                    className="flex flex-col flex-1 text-left cursor-pointer"
                    aria-label={`View ${product.title}`}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f2f2f2]">
                      {product.onSale && discountPct > 0 && (
                        <span className="absolute top-2.5 left-2.5 z-20 bg-[#d74a5d] text-white text-[10px] font-medium uppercase tracking-[1px] px-2 py-1 leading-none">
                          SALE
                        </span>
                      )}

                      <SmartImage
                        src={product.primaryImage}
                        alt={product.title}
                        width={600}
                        height={800}
                        aspectRatio="3 / 4"
                        className="w-full h-full object-cover"
                        fallbackBg={product.fallbackTone}
                      />
                    </div>

                    <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between min-w-0">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[1px] text-[#c8a078] font-medium mb-1">
                          {product.category}
                        </p>
                        <h3 className="text-[14px] font-medium text-[#000000] group-hover:text-[#d74a5d] transition-colors leading-[1.4] whitespace-normal [overflow-wrap:anywhere] min-h-[2.8em] normal-case tracking-normal">
                          {product.title}
                        </h3>
                      </div>

                      <div className="mt-2.5 flex flex-col min-w-0">
                        <div className="flex flex-wrap items-baseline gap-[6px] sm:gap-[8px] tabular-nums">
                          <span className="text-[15px] sm:text-[16px] font-semibold text-[#000000]">
                            {formatINR(product.salePrice)}
                          </span>
                          {product.onSale && product.price > product.salePrice && (
                            <>
                              <span className="text-[12px] sm:text-[13px] text-[#777777] line-through">
                                {formatINR(product.price)}
                              </span>
                              <span className="text-[11px] font-semibold text-[#15803d]">
                                {discountPct}% OFF
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
        </div>
      </div>
    </section>
  );
};
