import React, { useState } from 'react';
import { PackageCheck, User, X } from 'lucide-react';

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ open, onClose }) => {
  const [tab, setTab] = useState<'signin' | 'track'>('signin');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'signin') {
      if (!email.trim()) return;
      setStatusMessage(
        `A one-time sign-in link has been prepared for ${email.trim()}.`
      );
      setEmail('');
    } else {
      if (!orderId.trim()) return;
      setStatusMessage(
        `Order ${orderId.trim().toUpperCase()} is currently in tailoring quality check at our Jaipur atelier.`
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Aaroha Account"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white border border-[#e8e8e8] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8e8]">
          <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000]">
            Aaroha Account
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account modal"
            className="p-1.5 text-[#343434] hover:text-[#d74a5d] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-[#e8e8e8]">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setStatusMessage(null);
            }}
            className={`py-3 text-[11px] font-medium uppercase tracking-[1px] flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'signin'
                ? 'text-[#000000] border-b-2 border-[#321004]'
                : 'text-[#777777] hover:text-[#000000]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('track');
              setStatusMessage(null);
            }}
            className={`py-3 text-[11px] font-medium uppercase tracking-[1px] flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'track'
                ? 'text-[#000000] border-b-2 border-[#321004]'
                : 'text-[#777777] hover:text-[#000000]'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {tab === 'signin' ? (
            <div>
              <label
                htmlFor="account-email"
                className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="account-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 border border-[#e8e8e8] focus:border-[#c8a078] focus:outline-none text-[13px] text-[#000000]"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="order-id"
                className="block text-[11px] font-medium uppercase tracking-[1px] text-[#343434] mb-1.5"
              >
                Order Reference Number
              </label>
              <input
                id="order-id"
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. AAR-2048"
                className="w-full px-3.5 py-2.5 border border-[#e8e8e8] focus:border-[#c8a078] focus:outline-none text-[13px] text-[#000000]"
              />
            </div>
          )}

          {statusMessage && (
            <p className="p-3 bg-[#f2f2f2] border border-[#c8a078] text-[12px] text-[#321004] leading-relaxed">
              {statusMessage}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#321004] hover:bg-[#d74a5d] text-white text-[11px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
          >
            {tab === 'signin' ? 'SEND SIGN-IN CODE' : 'CHECK STATUS'}
          </button>
        </form>
      </div>
    </div>
  );
};
