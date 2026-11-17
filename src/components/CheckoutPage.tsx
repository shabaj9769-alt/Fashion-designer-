import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  Building2,
  CreditCard,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { INDIAN_STATES } from '../data/catalog';
import {
  CartItem,
  DeliveryAddress,
  PaymentMethodId,
  PlacedOrder,
} from '../types/store';
import { formatINR } from '../utils/currency';
import { SmartImage } from './SmartImage';

interface CheckoutPageProps {
  items: CartItem[];
  confirmLeaveOpen: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onUpdateQuantity: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onRequestBack: (isDirty: boolean) => void;
  onStay: () => void;
  onConfirmGoBack: () => void;
  onGoHome: () => void;
  onOrderPlaced: (order: PlacedOrder) => void;
}

type FieldErrors = Partial<
  Record<
    keyof DeliveryAddress | 'upiId' | 'cardNumber' | 'cardExpiry' | 'cardCvv',
    string
  >
>;

const PAYMENT_OPTIONS: {
  id: PaymentMethodId;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'upi',
    label: 'UPI (GPay / PhonePe / Paytm)',
    subtitle: 'Instant payment via UPI ID',
    icon: Smartphone,
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    subtitle: 'All major Indian banks',
    icon: Building2,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    subtitle: 'Pay with cash or UPI upon delivery',
    icon: Banknote,
  },
];

const NETBANKING_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
];

function formatDateRange5To7Days(): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() + 5);
  const end = new Date(now);
  end.setDate(now.getDate() + 7);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

function generateOrderId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AAR-${y}${m}${day}-${rand}`;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  confirmLeaveOpen,
  onDirtyChange,
  onUpdateQuantity,
  onRemoveItem,
  onRequestBack,
  onStay,
  onConfirmGoBack,
  onGoHome,
  onOrderPlaced,
}) => {
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: '',
    mobile: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState(NETBANKING_BANKS[0]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPlacing, setIsPlacing] = useState(false);
  const [removingKeys, setRemovingKeys] = useState<Record<string, boolean>>({});

  const formRef = useRef<HTMLFormElement>(null);
  const removeTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    return () => {
      Object.values(removeTimersRef.current).forEach((id) =>
        window.clearTimeout(id)
      );
      removeTimersRef.current = {};
    };
  }, []);

  const triggerSmoothRemove = (key: string) => {
    if (removingKeys[key]) return;
    setRemovingKeys((prev) => ({ ...prev, [key]: true }));
    removeTimersRef.current[key] = window.setTimeout(() => {
      delete removeTimersRef.current[key];
      setRemovingKeys((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      onRemoveItem(key);
    }, 180);
  };

  const isDirty = Boolean(
    address.fullName.trim() ||
      address.mobile.trim() ||
      address.email.trim() ||
      address.addressLine1.trim() ||
      address.addressLine2.trim() ||
      address.city.trim() ||
      address.state ||
      address.pincode.trim() ||
      upiId.trim() ||
      cardNumber.trim() ||
      cardExpiry.trim() ||
      cardCvv.trim()
  );

  useEffect(() => {
    onDirtyChange(isDirty && items.length > 0 && !isPlacing);
  }, [isDirty, items.length, isPlacing, onDirtyChange]);

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );
  const discountRate = totalQty >= 3 ? 0.1 : totalQty >= 2 ? 0.05 : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const finalTotal = subtotal - discountAmount;

  const updateAddressField = (field: keyof DeliveryAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateAll = (): FieldErrors => {
    const next: FieldErrors = {};
    if (address.fullName.trim().length < 2) {
      next.fullName = 'Please enter your full name.';
    }
    if (!/^[6-9][0-9]{9}$/.test(address.mobile.trim())) {
      next.mobile = 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    if (address.addressLine1.trim().length < 5) {
      next.addressLine1 = 'Please enter your house/flat/street address.';
    }
    if (address.city.trim().length < 2) {
      next.city = 'Please enter your city.';
    }
    if (!address.state) {
      next.state = 'Please select your state.';
    }
    if (!/^[1-9][0-9]{5}$/.test(address.pincode.trim())) {
      next.pincode = 'Please enter a valid 6-digit PIN code.';
    }

    if (paymentMethod === 'upi') {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
        next.upiId = 'Please enter a valid UPI ID (e.g. name@okaxis).';
      }
    } else if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\s+/g, '');
      if (!/^[0-9]{12,19}$/.test(digits)) {
        next.cardNumber = 'Please enter a valid card number.';
      }
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardExpiry.trim())) {
        next.cardExpiry = 'Enter expiry as MM/YY.';
      }
      if (!/^[0-9]{3,4}$/.test(cardCvv.trim())) {
        next.cardCvv = 'Enter 3 or 4 digit CVV.';
      }
    }

    return next;
  };

  const handlePlaceOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isPlacing) return;

    const validationErrors = validateAll();
    setErrors(validationErrors);

    const errorKeys = Object.keys(validationErrors) as (keyof FieldErrors)[];
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const targetEl = document.getElementById(`checkout-${firstKey}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.focus({ preventScroll: true });
      }
      return;
    }

    setIsPlacing(true);
    onDirtyChange(false);
    const selectedOption = PAYMENT_OPTIONS.find((p) => p.id === paymentMethod);
    const paymentLabel =
      paymentMethod === 'netbanking'
        ? `Net Banking (${selectedBank})`
        : paymentMethod === 'upi'
        ? `UPI (${upiId.trim()})`
        : selectedOption?.label ?? 'Cash on Delivery';

    window.setTimeout(() => {
      const order: PlacedOrder = {
        orderId: generateOrderId(),
        placedAt: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        estimatedDelivery: formatDateRange5To7Days(),
        items: [...items],
        address: { ...address },
        paymentMethodLabel: paymentLabel,
        subtotal,
        discountAmount,
        totalPaid: finalTotal,
      };
      setIsPlacing(false);
      onOrderPlaced(order);
    }, 1500);
  };

  const CheckoutHeader = (
    <header className="aaroha-sticky-topbar bg-white border-b border-[#e8e8e8]">
      <div className="max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8 h-14 grid grid-cols-[44px_1fr_auto] items-center gap-2">
        <button
          type="button"
          onClick={() => onRequestBack(isDirty && items.length > 0)}
          aria-label="Go back"
          className="w-11 h-11 bg-white text-[#321004] hover:text-[#d74a5d] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 min-w-0">
          <Lock className="w-3.5 h-3.5 text-[#c8a078] shrink-0" />
          <span className="text-[13px] sm:text-[15px] font-medium uppercase tracking-[1.5px] text-[#000000] truncate">
            Secure Checkout
          </span>
        </div>

        <button
          type="button"
          onClick={onGoHome}
          className="px-2 text-[12px] sm:text-[14px] font-medium uppercase tracking-[2.5px] text-[#321004] whitespace-nowrap cursor-pointer"
        >
          AAROHA
        </button>
      </div>
    </header>
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {CheckoutHeader}
        <main className="flex-1 flex flex-col items-center justify-center px-5 py-16 text-center">
          <ShoppingBag className="w-12 h-12 text-[#c8a078] stroke-[1.3] mb-4" />
          <h1 className="text-[18px] sm:text-[22px] font-medium uppercase tracking-[1px] text-[#000000] mb-2">
            Your bag is empty
          </h1>
          <p className="text-[13px] text-[#343434] max-w-sm mb-6">
            Add your favourite Chanderi suit sets, kurtas, or co-ord sets before proceeding to checkout.
          </p>
          <button
            type="button"
            onClick={onGoHome}
            className="min-h-[46px] px-7 py-3 bg-[#321004] hover:bg-[#d74a5d] text-white text-[12px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
          >
            EXPLORE COLLECTION
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2]/45 pb-[100px]">
      {CheckoutHeader}

      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
        {/* Step Indicator */}
        <nav
          aria-label="Checkout progress"
          className="flex items-center justify-center gap-2 sm:gap-3 text-[11px] uppercase tracking-[1.2px] text-[#777777] mb-6 pb-4 border-b border-[#e8e8e8]"
        >
          <span>Bag</span>
          <span aria-hidden="true">→</span>
          <span className="text-[#000000] font-semibold">Address</span>
          <span aria-hidden="true">→</span>
          <span className="text-[#000000] font-semibold">Payment</span>
        </nav>

        <form
          ref={formRef}
          onSubmit={handlePlaceOrder}
          noValidate
          className="aaroha-checkout-grid"
        >
          {/* LEFT COLUMN: Delivery Address + Payment Method */}
          <div className="space-y-6 min-w-0">
            {/* Delivery Address Form */}
            <section className="bg-white border border-[#e8e8e8] p-5 sm:p-7">
              <h1 className="text-[15px] sm:text-[16px] font-medium uppercase tracking-[1px] text-[#000000] pb-3.5 mb-5 border-b border-[#e8e8e8]">
                Delivery Address
              </h1>

              <div className="space-y-[14px]">
                <div>
                  <label
                    htmlFor="checkout-fullName"
                    className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="checkout-fullName"
                    type="text"
                    value={address.fullName}
                    onChange={(e) =>
                      updateAddressField('fullName', e.target.value)
                    }
                    placeholder="Enter your full name"
                    className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none ${
                      errors.fullName
                        ? 'border-[#d74a5d]'
                        : 'border-[#e8e8e8] focus:border-[#321004]'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-[12px] text-[#d74a5d]">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-mobile"
                    className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                  >
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    id="checkout-mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={address.mobile}
                    onChange={(e) =>
                      updateAddressField(
                        'mobile',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    placeholder="10-digit mobile number"
                    className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none ${
                      errors.mobile
                        ? 'border-[#d74a5d]'
                        : 'border-[#e8e8e8] focus:border-[#321004]'
                    }`}
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-[12px] text-[#d74a5d]">
                      {errors.mobile}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-email"
                    className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                  >
                    Email Address *
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={address.email}
                    onChange={(e) => updateAddressField('email', e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none ${
                      errors.email
                        ? 'border-[#d74a5d]'
                        : 'border-[#e8e8e8] focus:border-[#321004]'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[12px] text-[#d74a5d]">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-addressLine1"
                    className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                  >
                    Address Line 1 *
                  </label>
                  <input
                    id="checkout-addressLine1"
                    type="text"
                    value={address.addressLine1}
                    onChange={(e) =>
                      updateAddressField('addressLine1', e.target.value)
                    }
                    placeholder="House / Flat No., Building, Street"
                    className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none ${
                      errors.addressLine1
                        ? 'border-[#d74a5d]'
                        : 'border-[#e8e8e8] focus:border-[#321004]'
                    }`}
                  />
                  {errors.addressLine1 && (
                    <p className="mt-1 text-[12px] text-[#d74a5d]">
                      {errors.addressLine1}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-addressLine2"
                    className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                  >
                    Address Line 2 (Optional)
                  </label>
                  <input
                    id="checkout-addressLine2"
                    type="text"
                    value={address.addressLine2}
                    onChange={(e) =>
                      updateAddressField('addressLine2', e.target.value)
                    }
                    placeholder="Landmark, Area, Colony"
                    className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-city"
                    className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                  >
                    City *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    value={address.city}
                    onChange={(e) => updateAddressField('city', e.target.value)}
                    placeholder="e.g. Jaipur, Mumbai, Bengaluru"
                    className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none ${
                      errors.city
                        ? 'border-[#d74a5d]'
                        : 'border-[#e8e8e8] focus:border-[#321004]'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-[12px] text-[#d74a5d]">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-state"
                    className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                  >
                    State *
                  </label>
                  <select
                    id="checkout-state"
                    value={address.state}
                    onChange={(e) => updateAddressField('state', e.target.value)}
                    className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none cursor-pointer ${
                      errors.state
                        ? 'border-[#d74a5d]'
                        : 'border-[#e8e8e8] focus:border-[#321004]'
                    }`}
                  >
                    <option value="">Select State / Union Territory</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-[12px] text-[#d74a5d]">
                      {errors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-pincode"
                    className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                  >
                    Pincode (6 Digits) *
                  </label>
                  <input
                    id="checkout-pincode"
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) =>
                      updateAddressField(
                        'pincode',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    placeholder="6-digit PIN code"
                    className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none ${
                      errors.pincode
                        ? 'border-[#d74a5d]'
                        : 'border-[#e8e8e8] focus:border-[#321004]'
                    }`}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-[12px] text-[#d74a5d]">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white border border-[#e8e8e8] p-5 sm:p-7">
              <h2 className="text-[15px] sm:text-[16px] font-medium uppercase tracking-[1px] text-[#000000] pb-3.5 mb-5 border-b border-[#e8e8e8]">
                Payment Method
              </h2>

              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = paymentMethod === option.id;
                  return (
                    <div
                      key={option.id}
                      className={`border transition-colors ${
                        active
                          ? 'border-[#321004] bg-[#f2f2f2]/45'
                          : 'border-[#e8e8e8] bg-white'
                      }`}
                    >
                      <label className="flex items-start gap-3 p-4 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.id}
                          checked={active}
                          onChange={() => {
                            setPaymentMethod(option.id);
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.upiId;
                              delete next.cardNumber;
                              delete next.cardExpiry;
                              delete next.cardCvv;
                              return next;
                            });
                          }}
                          className="mt-1 accent-[#321004] w-4 h-4 shrink-0"
                        />
                        <Icon className="w-5 h-5 text-[#321004] shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] sm:text-[14px] font-medium text-[#000000]">
                            {option.label}
                          </p>
                          <p className="text-[12px] text-[#777777] mt-0.5">
                            {option.subtitle}
                          </p>
                        </div>
                      </label>

                      {active && option.id === 'upi' && (
                        <div className="px-4 pb-4 pt-1 border-t border-[#e8e8e8]/80 space-y-2">
                          <label
                            htmlFor="checkout-upiId"
                            className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434]"
                          >
                            UPI ID *
                          </label>
                          <input
                            id="checkout-upiId"
                            type="text"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              if (errors.upiId) {
                                setErrors((p) => ({ ...p, upiId: undefined }));
                              }
                            }}
                            placeholder="yourname@okaxis"
                            className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none ${
                              errors.upiId
                                ? 'border-[#d74a5d]'
                                : 'border-[#e8e8e8] focus:border-[#321004]'
                            }`}
                          />
                          {errors.upiId && (
                            <p className="text-[12px] text-[#d74a5d]">
                              {errors.upiId}
                            </p>
                          )}
                        </div>
                      )}

                      {active && option.id === 'card' && (
                        <div className="px-4 pb-4 pt-2 border-t border-[#e8e8e8]/80 space-y-[14px]">
                          <div>
                            <label
                              htmlFor="checkout-cardNumber"
                              className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                            >
                              Card Number *
                            </label>
                            <input
                              id="checkout-cardNumber"
                              type="tel"
                              inputMode="numeric"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => {
                                const raw = e.target.value
                                  .replace(/\D/g, '')
                                  .slice(0, 16);
                                const grouped = raw.replace(
                                  /(.{4})/g,
                                  '$1 '
                                ).trim();
                                setCardNumber(grouped);
                                if (errors.cardNumber) {
                                  setErrors((p) => ({
                                    ...p,
                                    cardNumber: undefined,
                                  }));
                                }
                              }}
                              placeholder="1234 5678 9012 3456"
                              className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none ${
                                errors.cardNumber
                                  ? 'border-[#d74a5d]'
                                  : 'border-[#e8e8e8] focus:border-[#321004]'
                              }`}
                            />
                            {errors.cardNumber && (
                              <p className="mt-1 text-[12px] text-[#d74a5d]">
                                {errors.cardNumber}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor="checkout-cardExpiry"
                                className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                              >
                                Expiry (MM/YY) *
                              </label>
                              <input
                                id="checkout-cardExpiry"
                                type="text"
                                inputMode="numeric"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => {
                                  const digits = e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 4);
                                  const formatted =
                                    digits.length > 2
                                      ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                                      : digits;
                                  setCardExpiry(formatted);
                                  if (errors.cardExpiry) {
                                    setErrors((p) => ({
                                      ...p,
                                      cardExpiry: undefined,
                                    }));
                                  }
                                }}
                                placeholder="MM/YY"
                                className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none ${
                                  errors.cardExpiry
                                    ? 'border-[#d74a5d]'
                                    : 'border-[#e8e8e8] focus:border-[#321004]'
                                }`}
                              />
                              {errors.cardExpiry && (
                                <p className="mt-1 text-[12px] text-[#d74a5d]">
                                  {errors.cardExpiry}
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor="checkout-cardCvv"
                                className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
                              >
                                CVV *
                              </label>
                              <input
                                id="checkout-cardCvv"
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                value={cardCvv}
                                onChange={(e) => {
                                  setCardCvv(e.target.value.replace(/\D/g, ''));
                                  if (errors.cardCvv) {
                                    setErrors((p) => ({
                                      ...p,
                                      cardCvv: undefined,
                                    }));
                                  }
                                }}
                                placeholder="123"
                                className={`w-full h-[48px] px-3.5 bg-white border text-[16px] text-[#000000] focus:outline-none ${
                                  errors.cardCvv
                                    ? 'border-[#d74a5d]'
                                    : 'border-[#e8e8e8] focus:border-[#321004]'
                                }`}
                              />
                              {errors.cardCvv && (
                                <p className="mt-1 text-[12px] text-[#d74a5d]">
                                  {errors.cardCvv}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {active && option.id === 'netbanking' && (
                        <div className="px-4 pb-4 pt-2 border-t border-[#e8e8e8]/80 space-y-2">
                          <label
                            htmlFor="checkout-bank"
                            className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434]"
                          >
                            Select Your Bank
                          </label>
                          <select
                            id="checkout-bank"
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full h-[48px] px-3.5 bg-white border border-[#e8e8e8] focus:border-[#321004] text-[16px] text-[#000000] focus:outline-none cursor-pointer"
                          >
                            {NETBANKING_BANKS.map((bank) => (
                              <option key={bank} value={bank}>
                                {bank}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {active && option.id === 'cod' && (
                        <div className="px-4 pb-4 pt-2 border-t border-[#e8e8e8]/80 text-[12px] text-[#343434]">
                          Pay comfortably via cash or UPI QR when your bespoke parcel arrives.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Order Summary Card */}
          <aside className="bg-white border border-[#e8e8e8] p-5 sm:p-6 min-w-0">
            <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000] pb-3.5 mb-4 border-b border-[#e8e8e8]">
              Order Summary ({totalQty} {totalQty === 1 ? 'piece' : 'pieces'})
            </h2>

            <div className="divide-y divide-[#e8e8e8]">
              {items.map((item) => {
                const isRemoving = Boolean(removingKeys[item.key]);
                return (
                  <div
                    key={item.key}
                    className={`py-3.5 first:pt-0 flex items-start gap-3 transition-all duration-200 ${
                      isRemoving
                        ? 'opacity-0 -translate-x-2 pointer-events-none'
                        : 'opacity-100 translate-x-0'
                    }`}
                  >
                    <div className="w-[64px] h-[80px] shrink-0 bg-[#f2f2f2] border border-[#e8e8e8] overflow-hidden">
                      <SmartImage
                        src={item.product.primaryImage}
                        alt={item.product.title}
                        width={64}
                        height={80}
                        className="w-full h-full object-cover"
                        fallbackBg={item.product.fallbackTone}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#000000] leading-snug whitespace-normal [overflow-wrap:anywhere]">
                          {item.product.title}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.8px] text-[#777777] mt-1">
                          Size: {item.size}
                        </p>
                        {item.customNote && (
                          <p className="text-[11px] text-[#321004] italic mt-0.5 whitespace-normal [overflow-wrap:anywhere]">
                            Note: {item.customNote}
                          </p>
                        )}
                      </div>

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

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-[#000000] tabular-nums whitespace-nowrap">
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

            <div className="mt-4 pt-4 border-t border-[#e8e8e8] space-y-2 text-[13px] tabular-nums">
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
                <span className="uppercase text-[12px] font-medium text-[#15803d]">
                  FREE
                </span>
              </div>

              <div className="flex justify-between items-baseline text-[16px] sm:text-[18px] font-semibold text-[#000000] pt-3 border-t border-[#e8e8e8]">
                <span>Total Payable</span>
                <span>{formatINR(finalTotal)}</span>
              </div>
            </div>
          </aside>
        </form>
      </main>

      {/* Confirm Leave Checkout Popup when form has unsaved entries */}
      {confirmLeaveOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="leave-checkout-title"
        >
          <div className="fixed inset-0 bg-black/55" onClick={onStay} />
          <div className="relative z-10 w-full max-w-sm bg-white border border-[#e8e8e8] shadow-2xl p-6">
            <h2
              id="leave-checkout-title"
              className="text-[14px] font-medium uppercase tracking-[1px] text-[#000000] mb-2"
            >
              Leave Checkout?
            </h2>
            <p className="text-[13px] text-[#343434] leading-relaxed mb-5">
              Aapka bhara hua data jaa sakta hai. Wapas jaayein?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onStay}
                className="min-h-[44px] px-4 bg-[#321004] hover:bg-[#000000] text-white text-[11px] font-medium uppercase tracking-[1.2px] cursor-pointer"
              >
                STAY
              </button>
              <button
                type="button"
                onClick={onConfirmGoBack}
                className="min-h-[44px] px-4 border border-[#c8a078] text-[#321004] hover:bg-[#d74a5d] hover:border-[#d74a5d] hover:text-white text-[11px] font-medium uppercase tracking-[1.2px] transition-colors cursor-pointer"
              >
                GO BACK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#e8e8e8] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="tabular-nums">
            <p className="text-[10px] uppercase tracking-[0.8px] text-[#777777]">
              Total Payable
            </p>
            <p className="text-[18px] sm:text-[20px] font-semibold text-[#000000] leading-tight">
              {formatINR(finalTotal)}
            </p>
          </div>

          <button
            type="button"
            disabled={isPlacing || items.length === 0}
            onClick={() => handlePlaceOrder()}
            className="min-h-[48px] px-7 sm:px-10 bg-[#321004] hover:bg-[#d74a5d] disabled:opacity-60 text-white text-[12px] font-medium uppercase tracking-[1.5px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isPlacing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Placing order...</span>
              </>
            ) : (
              <span>PLACE ORDER</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
