import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Product } from '../types/store';
import { SmartImage } from './SmartImage';

interface RecommendedProductsProps {
  products: Product[];
  activeFilter: string;
  onResetFilter: () => void;
  onOpenQuickView: (product: Product) => void;
}

export const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  products,
  activeFilter,
  onResetFilter,
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

  return (
    <section
      id="recommended-products"
      className="py-12 sm:py-16 bg-[#f2f2f2]/55 border-y border-[#e8e8e8]"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <h2 className="text-[20px] sm:text-[24px] font-medium uppercase tracking-[1px] text-[#000000]">
            {activeFilter === 'ALL'
              ? 'Recommended For You'
              : `${activeFilter} Edit`}
          </h2>
          {activeFilter !== 'ALL' && (
            <div className="mt-2.5 flex items-center gap-3 text-[12px] text-[#343434]">
              <span>
                Showing {products.length}{' '}
                {products.length === 1 ? 'piece' : 'pieces'}
              </span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onResetFilter}
                className="uppercase tracking-[1px] text-[#d74a5d] hover:underline font-medium cursor-pointer"
              >
                Show All
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          {/* Desktop Carousel Arrows */}
          {products.length > 4 && (
            <>
              <button
                type="button"
                onClick={() => scrollTrack('left')}
                aria-label="Scroll products left"
                className="hidden md:flex absolute -left-3 top-[38%] -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#e8e8e8] text-[#000000] hover:border-[#c8a078] hover:text-[#d74a5d] items-center justify-center shadow-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrack('right')}
                aria-label="Scroll products right"
                className="hidden md:flex absolute -right-3 top-[38%] -translate-y-1/2 z-20 w-10 h-10 bg-white border border-[#e8e8e8] text-[#000000] hover:border-[#c8a078] hover:text-[#d74a5d] items-center justify-center shadow-sm transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* 2-col Grid on Mobile (no horizontal scroll), Horizontal Slider on Tablet/Desktop */}
          <div
            ref={trackRef}
            className="grid grid-cols-2 gap-3.5 sm:gap-5 md:flex md:gap-6 md:overflow-x-auto no-scrollbar md:scroll-smooth"
          >
            {products.map((product) => (
              <article
                key={product.id}
                className="group md:shrink-0 md:w-[calc(25%-18px)] lg:w-[calc(25%-18px)] flex flex-col bg-white border border-[#e8e8e8]"
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
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                      fallbackBg={product.fallbackTone}
                      fallbackLabel={product.title}
                    />
                    {/* Secondary Hover Image */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <SmartImage
                        src={product.secondaryImage}
                        alt={`${product.title} alternate view`}
                        className="w-full h-full object-cover"
                        fallbackBg={product.fallbackTone}
                        fallbackLabel={`${product.title} — Detail`}
                      />
                    </div>
                  </button>

                  {/* Quick View Desktop Overlay Button */}
                  <div className="hidden md:flex absolute inset-x-3 bottom-3 z-20 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                    <button
                      type="button"
                      onClick={() => onOpenQuickView(product)}
                      className="w-full py-2.5 bg-white/95 hover:bg-[#d74a5d] text-[#000000] hover:text-white border border-[#e8e8e8] hover:border-[#d74a5d] text-[11px] font-medium uppercase tracking-[1px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[1px] text-[#c8a078] font-medium mb-1">
                      {product.category}
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenQuickView(product)}
                      className="text-left text-[12px] sm:text-[13px] font-medium text-[#000000] hover:text-[#d74a5d] transition-colors leading-snug line-clamp-2 cursor-pointer"
                    >
                      {product.title}
                    </button>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 tabular-nums">
                      {product.onSale && (
                        <span className="text-[12px] text-[#777777] line-through">
                          ${product.regularPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-[13px] sm:text-[14px] font-semibold text-[#d74a5d]">
                        ${product.salePrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenQuickView(product)}
                      className="md:hidden text-[10px] uppercase tracking-[1px] font-medium text-[#321004] border border-[#c8a078] px-2 py-1 hover:bg-[#321004] hover:text-white transition-colors"
                    >
                      Select
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
