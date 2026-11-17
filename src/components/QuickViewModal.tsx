import React, { useEffect, useState } from 'react';
import { Check, Minus, Plus, Ruler, X } from 'lucide-react';
import { Product, SizeOption } from '../types/store';
import { SmartImage } from './SmartImage';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    size: SizeOption,
    quantity: number,
    customNote?: string
  ) => void;
  onOpenSizeGuide: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenSizeGuide,
}) => {
  const [selectedSize, setSelectedSize] = useState<SizeOption>('M');
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState<0 | 1>(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes.includes('M') ? 'M' : product.sizes[0]);
    setQuantity(1);
    setCustomNote('');
    setActiveImageIdx(0);
    setAddedFeedback(false);
  }, [product]);

  if (!product) return null;

  const images = [product.primaryImage, product.secondaryImage];

  const handleAdd = () => {
    onAddToCart(
      product,
      selectedSize,
      quantity,
      selectedSize === 'Custom' ? customNote.trim() || undefined : undefined
    );
    setAddedFeedback(true);
    setTimeout(() => {
      onClose();
    }, 350);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
    >
      <div className="fixed inset-0 bg-black/55" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl bg-white border border-[#e8e8e8] shadow-2xl max-h-[92vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product quick view"
          className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/95 border border-[#e8e8e8] flex items-center justify-center text-[#000000] hover:text-[#d74a5d] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Image Column */}
        <div className="bg-[#f2f2f2] p-4 sm:p-5 flex flex-col gap-3">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-white border border-[#e8e8e8]">
            {product.onSale && (
              <span className="absolute top-3 left-3 z-10 bg-[#d74a5d] text-white text-[10px] font-medium uppercase tracking-[1px] px-2.5 py-1 leading-none">
                SALE
              </span>
            )}
            <SmartImage
              src={images[activeImageIdx]}
              alt={product.title}
              className="w-full h-full object-cover"
              fallbackBg={product.fallbackTone}
              fallbackLabel={product.title}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIdx(idx as 0 | 1)}
                className={`aspect-[3/4] max-h-24 w-full overflow-hidden border transition-colors cursor-pointer ${
                  activeImageIdx === idx
                    ? 'border-[#321004]'
                    : 'border-[#e8e8e8] opacity-70 hover:opacity-100'
                }`}
              >
                <SmartImage
                  src={img}
                  alt={`${product.title} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                  fallbackBg={product.fallbackTone}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Details Column */}
        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-[#c8a078] mb-1.5">
              {product.category} · {product.subCategory}
            </p>
            <h2 className="text-[18px] sm:text-[21px] font-medium uppercase tracking-[1px] text-[#000000] leading-snug mb-3 pr-8">
              {product.title}
            </h2>

            <div className="flex items-center gap-3 mb-4 tabular-nums">
              {product.onSale && (
                <span className="text-[15px] text-[#777777] line-through">
                  ${product.regularPrice.toFixed(2)}
                </span>
              )}
              <span className="text-[18px] font-semibold text-[#d74a5d]">
                ${product.salePrice.toFixed(2)}
              </span>
              {product.onSale && (
                <span className="text-[11px] font-medium uppercase tracking-[1px] text-[#321004] bg-[#f2f2f2] px-2 py-0.5 border border-[#e8e8e8]">
                  Save ${(product.regularPrice - product.salePrice).toFixed(0)}
                </span>
              )}
            </div>

            <p className="text-[13px] text-[#343434] leading-[1.7] mb-4">
              {product.description}
            </p>

            <div className="text-[12px] text-[#343434] space-y-1 pb-5 mb-5 border-b border-[#e8e8e8]">
              <p>
                <span className="font-medium text-[#000000]">Fabric:</span>{' '}
                {product.fabric}
              </p>
              <p>
                <span className="font-medium text-[#000000]">Dispatch:</span>{' '}
                {product.dispatchDays}
              </p>
            </div>

            {/* Size Selector */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-medium uppercase tracking-[1px] text-[#000000]">
                  Select Size: {selectedSize}
                </span>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[1px] text-[#321004] hover:text-[#d74a5d] underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-10 px-3 text-[12px] font-medium uppercase tracking-[0.8px] border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#321004] text-white border-[#321004]'
                          : 'bg-white text-[#000000] border-[#e8e8e8] hover:border-[#c8a078]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {selectedSize === 'Custom' && (
                <div className="mt-3">
                  <label
                    htmlFor="custom-size-note"
                    className="block text-[11px] uppercase tracking-[1px] text-[#343434] mb-1.5"
                  >
                    Custom Fit Notes (Optional)
                  </label>
                  <input
                    id="custom-size-note"
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. Bust 35in, Kurta length 44in, 3/4 sleeves"
                    className="w-full px-3 py-2 border border-[#c8a078] text-[12px] text-[#000000] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-stretch gap-3 pt-2">
            <div className="flex items-center border border-[#e8e8e8]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-10 h-11 flex items-center justify-center text-[#000000] hover:bg-[#f2f2f2] cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-9 text-center text-[13px] font-medium tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
                className="w-10 h-11 flex items-center justify-center text-[#000000] hover:bg-[#f2f2f2] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 h-11 bg-[#d74a5d] hover:bg-[#321004] text-white text-[12px] font-medium uppercase tracking-[1.5px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {addedFeedback ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ADDED TO BAG</span>
                </>
              ) : (
                <span>
                  ADD TO BAG · ${(product.salePrice * quantity).toFixed(2)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
