import React, { useEffect, useRef, useState } from 'react';
import { Minus, Plus, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react';
import { CartItem, Product } from '../types/store';
import { formatINR } from '../utils/currency';
import { SmartImage } from './SmartImage';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onProceedToCheckout: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onSelectProduct,
}) => {
  const [removingKeys, setRemovingKeys] = useState<Record<string, boolean>>({});
  const timersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((id) => window.clearTimeout(id));
      timersRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setRemovingKeys({});
    }
  }, [open]);

  if (!open) return null;

  const triggerSmoothRemove = (key: string) => {
    if (removingKeys[key]) return;
    setRemovingKeys((prev) => ({ ...prev, [key]: true }));
    const timer = window.setTimeout(() => {
      delete timersRef.current[key];
      setRemovingKeys((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      onRemoveItem(key);
    }, 180);
    timersRef.current[key] = timer;
  };

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );

  // Multi-buy automatic tier discount: 2 pcs -> 5%, 3+ pcs -> 10%
  const discountRate = totalQty >= 3 ? 0.1 : totalQty >= 2 ? 0.05 : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const finalTotal = subtotal - discountAmount;

  const progressPercent = Math.min(100, Math.round((totalQty / 3) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="aaroha-cart-panel relative z-10 bg-white flex flex-col h-[100dvh] shadow-2xl overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 px-4 py-3.5 border-b border-[#e8e8e8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#321004]" />
            <h2 className="text-[14px] font-medium uppercase tracking-[1.2px] text-[#000000]">
              Shopping Bag ({totalQty})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="w-11 h-11 -mr-2 flex items-center justify-center text-[#343434] hover:text-[#d74a5d] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fixed Thin Progress Bar + 3 Short Labels */}
        <div className="shrink-0 px-4 py-2.5 bg-[#f2f2f2] border-b border-[#e8e8e8]">
          <div className="w-full h-1.5 bg-[#e8e8e8] overflow-hidden">
            <div
              className="h-full bg-[#d74a5d] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-[0.8px] text-[#777777] mt-1.5">
            <span className={totalQty >= 1 ? 'text-[#321004] font-medium' : ''}>
              1+ FREE SHIP
            </span>
            <span className={totalQty >= 2 ? 'text-[#321004] font-medium' : ''}>
              2+ 5% OFF
            </span>
            <span className={totalQty >= 3 ? 'text-[#d74a5d] font-medium' : ''}>
              3+ 10% OFF
            </span>
          </div>
        </div>

        {/* Scrollable Items List (flex: 1, min-height: 0, overflow-y: auto) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-10 h-10 text-[#c8a078] stroke-[1.3] mb-3" />
              <p className="text-[14px] font-medium uppercase tracking-[1px] text-[#000000] mb-1.5">
                Your bag is empty
              </p>
              <p className="text-[13px] text-[#777777] max-w-xs mb-6">
                Explore handwoven Chanderi suit sets, mulmul kurtas, and made-to-order edits.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-6 py-3 bg-[#321004] hover:bg-[#d74a5d] text-white text-[11px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#e8e8e8]">
              {items.map((item) => {
                const isRemoving = Boolean(removingKeys[item.key]);
                return (
                  <div
                    key={item.key}
                    className={`py-4 first:pt-0 flex items-start gap-3 transition-all duration-200 ${
                      isRemoving
                        ? 'opacity-0 -translate-x-2 pointer-events-none'
                        : 'opacity-100 translate-x-0'
                    }`}
                  >
                    {/* Left: 80x100px Color Block / Image */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectProduct) {
                          onSelectProduct(item.product);
                        }
                      }}
                      aria-label={`View ${item.product.title}`}
                      className="w-[80px] h-[100px] shrink-0 bg-[#f2f2f2] border border-[#e8e8e8] overflow-hidden cursor-pointer"
                    >
                      <SmartImage
                        src={item.product.primaryImage}
                        alt={item.product.title}
                        width={80}
                        height={100}
                        className="w-full h-full object-cover"
                        fallbackBg={item.product.fallbackTone}
                      />
                    </button>

                    {/* Right: Top (Name + Size) · Middle (Qty) · Bottom (Price + REMOVE) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                      {/* Top: Full Title & Size */}
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectProduct) {
                              onSelectProduct(item.product);
                            }
                          }}
                          className="text-left text-[13px] font-medium text-[#000000] hover:text-[#d74a5d] leading-snug whitespace-normal [overflow-wrap:anywhere] cursor-pointer"
                        >
                          {item.product.title}
                        </button>
                        <p className="text-[11px] uppercase tracking-[0.8px] text-[#777777] mt-1">
                          Size: {item.size}
                        </p>
                        {item.customNote && (
                          <p className="text-[11px] text-[#321004] mt-0.5 italic whitespace-normal [overflow-wrap:anywhere]">
                            Note: {item.customNote}
                          </p>
                        )}
                      </div>

                      {/* Middle: Quantity (- 1 +) */}
                      <div className="flex items-center">
                        <div className="inline-flex items-center border border-[#e8e8e8] bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantity <= 1
                                ? triggerSmoothRemove(item.key)
                                : onUpdateQuantity(item.key, -1)
                            }
                            aria-label="Decrease quantity"
                            className="w-9 h-9 flex items-center justify-center text-[#000000] hover:bg-[#f2f2f2] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-[12px] font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.key, 1)}
                            aria-label="Increase quantity"
                            className="w-9 h-9 flex items-center justify-center text-[#000000] hover:bg-[#f2f2f2] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom: Price (₹) + REMOVE Button (min 44px height) */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[14px] font-semibold text-[#000000] tabular-nums whitespace-nowrap">
                          {formatINR(item.product.salePrice * item.quantity)}
                        </span>

                        <button
                          type="button"
                          onClick={() => triggerSmoothRemove(item.key)}
                          aria-label={`Remove ${item.product.title}`}
                          className="min-h-[44px] min-w-[44px] px-2.5 inline-flex items-center justify-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.8px] text-[#343434] hover:text-[#d74a5d] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span>REMOVE</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fixed Compact Footer */}
        {items.length > 0 && (
          <div className="shrink-0 p-4 bg-white border-t border-[#e8e8e8] space-y-2.5">
            <div className="space-y-1 text-[12px] tabular-nums">
              <div className="flex justify-between text-[#343434]">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#15803d] font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Multi-Piece Discount ({Math.round(discountRate * 100)}% Off)
                  </span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#343434]">
                <span>Shipping</span>
                <span className="uppercase text-[11px] font-medium text-[#15803d]">
                  FREE
                </span>
              </div>

              <div className="flex justify-between text-[14px] font-semibold text-[#000000] pt-1.5 border-t border-[#e8e8e8]">
                <span>Estimated Total</span>
                <span>{formatINR(finalTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full min-h-[46px] py-3 bg-[#d74a5d] hover:bg-[#321004] text-white text-[12px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
