import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { PRODUCTS } from '../data/catalog';
import { Product } from '../types/store';
import { SmartImage } from './SmartImage';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectFilter: (filterKey: string) => void;
}

const POPULAR_TERMS = [
  'Chanderi',
  'Anarkali',
  'Kurtas',
  'Co-ord',
  'Kids',
  'Festive',
];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  open,
  onClose,
  onSelectProduct,
  onSelectFilter,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery('');
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS.slice(0, 4);
    return PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.collectionTags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Search Aaroha catalog"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full bg-white border-b border-[#e8e8e8] shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-8 py-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#e8e8e8]">
            <Search className="w-5 h-5 text-[#343434] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Chanderi suits, mulmul kurtas, kids festive, co-ords..."
              className="flex-1 min-w-0 text-[14px] sm:text-[15px] text-[#000000] placeholder:text-[#777777] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[11px] uppercase tracking-[1px] text-[#777777] hover:text-[#d74a5d] px-2 cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="p-2 text-[#000000] hover:text-[#d74a5d] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 py-4">
            <span className="text-[11px] uppercase tracking-[1px] text-[#777777] mr-1">
              Popular:
            </span>
            {POPULAR_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="px-3 py-1 bg-[#f2f2f2] hover:bg-[#321004] text-[#000000] hover:text-white text-[11px] uppercase tracking-[1px] border border-[#e8e8e8] transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Results Grid */}
          {results.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[14px] text-[#343434] mb-4">
                No pieces matched &ldquo;{query}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  onSelectFilter('ALL');
                  onClose();
                }}
                className="px-5 py-2.5 bg-[#321004] text-white text-[11px] uppercase tracking-[1.2px] cursor-pointer"
              >
                View Full Collection
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[11px] uppercase tracking-[1px] text-[#777777] mb-3">
                {query.trim()
                  ? `${results.length} matching ${
                      results.length === 1 ? 'piece' : 'pieces'
                    }`
                  : 'Curated Highlights'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-2">
                {results.slice(0, 8).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectProduct(product);
                    }}
                    className="group text-left border border-[#e8e8e8] bg-white hover:border-[#c8a078] transition-colors cursor-pointer"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-[#f2f2f2]">
                      <SmartImage
                        src={product.primaryImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        fallbackBg={product.fallbackTone}
                        fallbackLabel={product.title}
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] font-medium text-[#000000] group-hover:text-[#d74a5d] line-clamp-1">
                        {product.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[12px] tabular-nums">
                        {product.onSale && (
                          <span className="text-[#777777] line-through">
                            ${product.regularPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="font-semibold text-[#d74a5d]">
                          ${product.salePrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
