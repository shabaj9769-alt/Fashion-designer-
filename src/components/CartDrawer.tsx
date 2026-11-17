import React, { useState } from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { CartItem } from '../types/store';
import { SmartImage } from './SmartImage';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'confirm' | 'done'>(
    'cart'
  );
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderRef, setOrderRef] = useState('');

  if (!open) return null;

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );

  // Multi-buy automatic tier discount matching announcement bar
  const discountRate = totalQty >= 3 ? 0.1 : totalQty >= 2 ? 0.05 : 0;
  const discountAmount = subtotal * discountRate;
  const finalTotal = subtotal - discountAmount;

  // Progress bar across 3 milestones: 1 item (Free Shipping), 2 items (5% Off), 3 items (10% Off)
  const progressPercent = Math.min(100, Math.round((totalQty / 3) * 100));

  const getProgressCopy = () => {
    if (totalQty === 0) {
      return 'Add 1 outfit for Free Worldwide Shipping · Buy 2 for 5% off, Buy 3 for 10% off.';
    }
    if (totalQty === 1) {
      return 'Free Worldwide Shipping unlocked! Add 1 more piece for 5% OFF.';
    }
    if (totalQty === 2) {
      return 'Free Shipping + 5% OFF unlocked! Add 1 more piece for 10% OFF.';
    }
    return 'Maximum Atelier Reward unlocked: Free Worldwide Shipping + 10% OFF!';
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `AAR-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderRef(ref);
    setCheckoutStep('done');
    onClearCart();
  };

  const handleClose = () => {
    setCheckoutStep('cart');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative z-10 w-full sm:max-w-[440px] bg-white h-full flex flex-col shadow-2xl">
        {/* Top Bar */}
        <div className="px-5 py-4 border-b border-[#e8e8e8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#321004]" />
            <h2 className="text-[14px] font-medium uppercase tracking-[1.2px] text-[#000000]">
              Shopping Bag ({totalQty})
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close shopping bag"
            className="p-1.5 text-[#343434] hover:text-[#d74a5d] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping & Multi-Buy Discount Progress Bar */}
        {checkoutStep !== 'done' && (
          <div className="px-5 py-3.5 bg-[#f2f2f2] border-b border-[#e8e8e8]">
            <div className="flex items-start gap-2 mb-2">
              <Truck className="w-4 h-4 text-[#321004] shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-[#321004] leading-snug">
                {getProgressCopy()}
              </p>
            </div>
            <div className="w-full h-1.5 bg-[#e8e8e8] overflow-hidden">
              <div
                className="h-full bg-[#d74a5d] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-[0.8px] text-[#777777] mt-1.5">
              <span className={totalQty >= 1 ? 'text-[#321004] font-medium' : ''}>
                1+ Free Ship
              </span>
              <span className={totalQty >= 2 ? 'text-[#321004] font-medium' : ''}>
                2+ 5% Off
              </span>
              <span className={totalQty >= 3 ? 'text-[#d74a5d] font-medium' : ''}>
                3+ 10% Off
              </span>
            </div>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {checkoutStep === 'done' ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 px-4">
              <CheckCircle2 className="w-11 h-11 text-[#321004] mb-4 stroke-[1.5]" />
              <h3 className="text-[16px] font-medium uppercase tracking-[1px] text-[#000000] mb-2">
                Order Received · {orderRef}
              </h3>
              <p className="text-[13px] text-[#343434] leading-relaxed mb-6 max-w-xs">
                Thank you for choosing Aaroha. A confirmation has been prepared for{' '}
                <strong className="font-medium text-[#000000]">
                  {customerEmail || 'your email'}
                </strong>{' '}
                and our master tailors will begin cutting shortly.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="px-7 py-3 bg-[#321004] hover:bg-[#d74a5d] text-white text-[11px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-10 h-10 text-[#c8a078] stroke-[1.3] mb-3" />
              <p className="text-[14px] font-medium uppercase tracking-[1px] text-[#000000] mb-1.5">
                Your Bag Is Empty
              </p>
              <p className="text-[13px] text-[#777777] max-w-xs mb-6">
                Explore handwoven Chanderi suit sets, mulmul kurtas, and made-to-order edits.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-[#321004] hover:bg-[#d74a5d] text-white text-[11px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
              >
                EXPLORE COLLECTION
              </button>
            </div>
          ) : checkoutStep === 'confirm' ? (
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13px] font-medium uppercase tracking-[1px] text-[#000000]">
                  Express Atelier Checkout
                </h3>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="text-[11px] uppercase tracking-[1px] text-[#d74a5d] underline cursor-pointer"
                >
                  Edit Bag
                </button>
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="block text-[11px] uppercase tracking-[1px] text-[#343434] mb-1.5"
                >
                  Email For Order Updates
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 border border-[#e8e8e8] focus:border-[#c8a078] focus:outline-none text-[13px]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-[11px] uppercase tracking-[1px] text-[#343434] mb-1.5"
                >
                  Shipping City &amp; Country
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  placeholder="e.g. Mumbai, India or London, UK"
                  className="w-full px-3.5 py-2.5 border border-[#e8e8e8] focus:border-[#c8a078] focus:outline-none text-[13px]"
                />
              </div>

              <div className="p-3.5 bg-[#f2f2f2] border border-[#e8e8e8] text-[12px] text-[#343434] space-y-1">
                <p className="font-medium text-[#000000]">
                  Order Summary ({totalQty} {totalQty === 1 ? 'piece' : 'pieces'})
                </p>
                <p>Complimentary Insured Worldwide Shipping included.</p>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-[#e8e8e8]">
              {items.map((item) => (
                <div key={item.key} className="py-4 first:pt-0 flex gap-3.5">
                  <div className="w-20 aspect-[3/4] shrink-0 bg-[#f2f2f2] border border-[#e8e8e8] overflow-hidden">
                    <SmartImage
                      src={item.product.primaryImage}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                      fallbackBg={item.product.fallbackTone}
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[12px] sm:text-[13px] font-medium text-[#000000] leading-snug line-clamp-2">
                          {item.product.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          aria-label={`Remove ${item.product.title}`}
                          className="p-1 text-[#777777] hover:text-[#d74a5d] shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] uppercase tracking-[0.8px] text-[#777777] mt-1">
                        Size: {item.size}
                      </p>
                      {item.customNote && (
                        <p className="text-[11px] text-[#321004] mt-0.5 italic">
                          Note: {item.customNote}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#e8e8e8]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.key, -1)}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center text-[#000000] hover:bg-[#f2f2f2] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-[12px] font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.key, 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center text-[#000000] hover:bg-[#f2f2f2] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right tabular-nums">
                        <span className="text-[13px] font-semibold text-[#000000]">
                          ${(item.product.salePrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Totals & CTA */}
        {items.length > 0 && checkoutStep !== 'done' && (
          <div className="p-5 bg-white border-t border-[#e8e8e8] space-y-3">
            <div className="space-y-1.5 text-[12px] tabular-nums">
              <div className="flex justify-between text-[#343434]">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#d74a5d] font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Multi-Buy Discount ({Math.round(discountRate * 100)}% Off)
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#343434]">
                <span>Worldwide Shipping</span>
                <span className="uppercase text-[11px] font-medium text-[#321004]">
                  FREE
                </span>
              </div>

              <div className="flex justify-between text-[14px] font-semibold text-[#000000] pt-2 border-t border-[#e8e8e8]">
                <span>Estimated Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {checkoutStep === 'cart' ? (
              <button
                type="button"
                onClick={() => setCheckoutStep('confirm')}
                className="w-full py-3.5 bg-[#d74a5d] hover:bg-[#321004] text-white text-[12px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
              >
                PROCEED TO CHECKOUT
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                className="w-full py-3.5 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
              >
                COMPLETE ORDER · ${finalTotal.toFixed(2)}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
