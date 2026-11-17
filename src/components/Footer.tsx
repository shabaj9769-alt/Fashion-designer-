import React, { useState } from 'react';
import { Check, Instagram, Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  onSelectFilter: (filterKey: string) => void;
  onOpenCustomGuide: (topic: 'Made to Order' | 'Custom Sizing') => void;
  onOpenAccount: () => void;
}

const SHOP_LINKS = [
  { label: 'Suit Sets', filterKey: 'Suit Sets' },
  { label: 'Kurtas', filterKey: 'Kurtas' },
  { label: 'Co-ord Sets', filterKey: 'Co-ord Sets' },
  { label: 'Kids Edit', filterKey: 'Kids' },
  { label: 'Festive Collection', filterKey: 'Festive' },
  { label: 'Archive Sale', filterKey: 'SALE' },
];

const PAYMENT_LABELS = ['VISA', 'MASTERCARD', 'AMEX', 'APPLE PAY', 'UPI'];

export const Footer: React.FC<FooterProps> = ({
  onSelectFilter,
  onOpenCustomGuide,
  onOpenAccount,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#321004] text-white mt-auto">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.55fr_0.8fr_1.05fr_1.2fr] gap-10 lg:gap-8">
          {/* Column 1: About + Newsletter */}
          <div>
            <p className="text-[18px] font-medium uppercase tracking-[3.5px] text-white mb-4">
              AAROHA
            </p>
            <p className="text-[13px] text-white/80 leading-[1.75] max-w-md mb-6">
              Modern Indian ethnic wear shaped by regional handlooms, natural fibers,
              and thoughtful made-to-order tailoring from our Jaipur atelier.
            </p>

            <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#dcb48c] mb-2.5">
              JOIN THE ATELIER LIST
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 py-2.5 px-3.5 bg-white/10 border border-[#c8a078]/60 text-[12px] text-white">
                <Check className="w-4 h-4 text-[#dcb48c] shrink-0" />
                <span>Thank you for joining the Aaroha journal.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-sm">
                <label htmlFor="footer-newsletter" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 bg-white/10 border border-white/25 px-3.5 py-2.5 text-[12px] text-white placeholder:text-white/55 focus:outline-none focus:border-[#c8a078]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#d74a5d] hover:bg-[#b8384a] text-white text-[11px] font-medium uppercase tracking-[1.2px] shrink-0 transition-colors cursor-pointer"
                >
                  JOIN
                </button>
              </form>
            )}
          </div>

          {/* Column 2: Shop Links */}
          <div>
            <h3 className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#dcb48c] mb-4">
              SHOP
            </h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => onSelectFilter(link.filterKey)}
                    className="text-[13px] text-white/80 hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help Links */}
          <div>
            <h3 className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#dcb48c] mb-4">
              CLIENT CARE
            </h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCustomGuide('Custom Sizing')}
                  className="text-[13px] text-white/80 hover:text-white transition-colors text-left cursor-pointer"
                >
                  Custom Sizing Guide
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCustomGuide('Made to Order')}
                  className="text-[13px] text-white/80 hover:text-white transition-colors text-left cursor-pointer"
                >
                  Made to Order Process
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAccount}
                  className="text-[13px] text-white/80 hover:text-white transition-colors text-left cursor-pointer"
                >
                  Track Your Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenCustomGuide('Made to Order')}
                  className="text-[13px] text-white/80 hover:text-white transition-colors text-left cursor-pointer"
                >
                  Shipping &amp; Exchanges
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact + Social */}
          <div>
            <h3 className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#dcb48c] mb-4">
              CONTACT ATELIER
            </h3>
            <ul className="space-y-3 text-[13px] text-white/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c8a078] shrink-0 mt-0.5" />
                <span>14 Johari Courtyard, C-Scheme, Jaipur 302001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c8a078] shrink-0" />
                <a
                  href="mailto:care@aarohaatelier.com"
                  className="hover:text-white transition-colors"
                >
                  care@aarohaatelier.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c8a078] shrink-0" />
                <span>+91 98200 41290 (Mon–Sat, 10 AM – 7 PM IST)</span>
              </li>
            </ul>

            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Aaroha on Instagram"
                className="w-9 h-9 border border-white/25 hover:border-[#dcb48c] flex items-center justify-center text-white/85 hover:text-[#dcb48c] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:care@aarohaatelier.com"
                aria-label="Email Aaroha"
                className="w-9 h-9 border border-white/25 hover:border-[#dcb48c] flex items-center justify-center text-white/85 hover:text-[#dcb48c] transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Payment Strip */}
        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[1px] text-white/70 text-center sm:text-left">
            &copy; {new Date().getFullYear()} AAROHA ATELIER. ALL RIGHTS RESERVED.
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-2"
            aria-label="Accepted payment methods"
          >
            {PAYMENT_LABELS.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 border border-white/25 bg-white/5 text-[10px] font-medium tracking-[0.8px] text-white/85"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
