import React, { useEffect } from 'react';
import { Calendar, CheckCircle2, CreditCard, MapPin, Package, X } from 'lucide-react';
import { PlacedOrder } from '../types/store';
import { formatINR } from '../utils/currency';
import { SmartImage } from './SmartImage';

interface OrderSuccessPageProps {
  order: PlacedOrder | null;
  onContinueShopping: () => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order,
  onContinueShopping,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const scrollToDetails = () => {
    document
      .getElementById('order-details-card')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2]/45">
      {/* Sticky Top Bar: X (44x44) Home button + centered AAROHA logo */}
      <header className="aaroha-sticky-topbar bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8 h-14 grid grid-cols-[44px_1fr_44px] items-center">
          <button
            type="button"
            onClick={onContinueShopping}
            aria-label="Go to Home"
            className="w-11 h-11 bg-white text-[#321004] hover:text-[#d74a5d] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onContinueShopping}
            className="text-[18px] sm:text-[22px] font-medium uppercase tracking-[3px] sm:tracking-[4px] text-[#000000] whitespace-nowrap cursor-pointer justify-self-center"
          >
            AAROHA
          </button>

          <span className="w-11" aria-hidden="true" />
        </div>
      </header>

      <main className="flex-1 max-w-[820px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!order ? (
          <div className="bg-white border border-[#e8e8e8] p-8 sm:p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#15803d] mx-auto mb-4 stroke-[1.5]" />
            <h1 className="text-[18px] sm:text-[22px] font-medium uppercase tracking-[1px] text-[#000000] mb-2">
              No Recent Order Found
            </h1>
            <p className="text-[13px] text-[#343434] mb-6">
              Explore our curated suit sets, kurtas, and co-ord collections to place a new order.
            </p>
            <button
              type="button"
              onClick={onContinueShopping}
              className="min-h-[46px] px-7 py-3 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Hero Banner */}
            <section className="bg-white border border-[#e8e8e8] p-6 sm:p-10 text-center">
              <CheckCircle2 className="w-14 h-14 text-[#15803d] mx-auto mb-4 stroke-[1.6]" />
              <h1 className="text-[20px] sm:text-[26px] font-medium uppercase tracking-[1px] text-[#000000] mb-2">
                Order Placed Successfully!
              </h1>
              <p className="text-[13px] text-[#343434] mb-4">
                Thank you for shopping with Aaroha Atelier. Our master tailors have received your order.
              </p>

              <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-5 px-5 py-3 bg-[#f2f2f2] border border-[#e8e8e8] text-[12px] text-[#000000] mb-6">
                <span>
                  <strong className="uppercase tracking-[0.8px] text-[#777777] font-medium">
                    Order ID:
                  </strong>{' '}
                  <span className="font-semibold tabular-nums">
                    {order.orderId}
                  </span>
                </span>
                <span className="hidden sm:inline text-[#c8a078]">|</span>
                <span className="inline-flex items-center gap-1.5 text-[#15803d] font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Estimated delivery: {order.estimatedDelivery}</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onContinueShopping}
                  className="min-h-[46px] px-7 py-3 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
                >
                  CONTINUE SHOPPING
                </button>
                <button
                  type="button"
                  onClick={scrollToDetails}
                  className="min-h-[46px] px-7 py-3 border border-[#c8a078] text-[#321004] hover:bg-[#321004] hover:border-[#321004] hover:text-white text-[12px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
                >
                  VIEW ORDER DETAILS
                </button>
              </div>
            </section>

            {/* Order Details Card */}
            <section
              id="order-details-card"
              className="bg-white border border-[#e8e8e8] p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3.5">
                <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#c8a078]" />
                  <span>Order Details</span>
                </h2>
                <span className="text-[12px] text-[#777777]">
                  Placed on {order.placedAt}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-[#e8e8e8]">
                {order.items.map((item) => (
                  <div key={item.key} className="py-3.5 first:pt-0 flex gap-3.5">
                    <div className="w-[72px] h-[90px] shrink-0 bg-[#f2f2f2] border border-[#e8e8e8] overflow-hidden">
                      <SmartImage
                        src={item.product.primaryImage}
                        alt={item.product.title}
                        width={72}
                        height={90}
                        className="w-full h-full object-cover"
                        fallbackBg={item.product.fallbackTone}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-[13px] font-medium text-[#000000] leading-snug">
                          {item.product.title}
                        </p>
                        <p className="text-[11px] text-[#777777] mt-1">
                          Size: {item.size} · Qty: {item.quantity}
                        </p>
                        {item.customNote && (
                          <p className="text-[11px] text-[#321004] italic mt-0.5">
                            Custom Note: {item.customNote}
                          </p>
                        )}
                      </div>
                      <p className="text-[13px] font-semibold text-[#000000] tabular-nums mt-2">
                        {formatINR(item.product.salePrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Address & Payment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#e8e8e8] text-[13px] text-[#343434]">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[1px] text-[#c8a078] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Delivery Address</span>
                  </p>
                  <p className="font-medium text-[#000000]">
                    {order.address.fullName}
                  </p>
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && (
                    <p>{order.address.addressLine2}</p>
                  )}
                  <p>
                    {order.address.city}, {order.address.state} –{' '}
                    {order.address.pincode}
                  </p>
                  <p className="mt-1 text-[12px] text-[#777777]">
                    Mobile: {order.address.mobile} · {order.address.email}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[1px] text-[#c8a078] mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment &amp; Total</span>
                  </p>
                  <p className="font-medium text-[#000000] mb-3">
                    {order.paymentMethodLabel}
                  </p>

                  <div className="space-y-1 text-[12px] tabular-nums">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatINR(order.subtotal)}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-[#15803d] font-medium">
                        <span>Multi-Piece Discount</span>
                        <span>-{formatINR(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-[#15803d] font-medium">FREE</span>
                    </div>
                    <div className="flex justify-between text-[15px] font-semibold text-[#000000] pt-2 border-t border-[#e8e8e8]">
                      <span>Total Paid</span>
                      <span>{formatINR(order.totalPaid)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
