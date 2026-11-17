import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { NAV_ITEMS } from '../data/catalog';
import { SmartImage } from './SmartImage';

interface HeaderProps {
  cartCount: number;
  activeFilter: string;
  onSelectFilter: (filterKey: string) => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  activeFilter,
  onSelectFilter,
  onOpenCart,
  onOpenSearch,
  onOpenAccount,
}) => {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState<string | null>(
    null
  );

  const handleNavClick = (filterKey: string) => {
    onSelectFilter(filterKey);
    setHoveredMenu(null);
    setMobileDrawerOpen(false);
  };

  const activeMegaItem = NAV_ITEMS.find(
    (item) => item.label === hoveredMenu && item.columns
  );

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-white border-b border-[#e8e8e8]"
        onMouseLeave={() => setHoveredMenu(null)}
      >
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-16 lg:h-[72px] grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left Zone: Hamburger on mobile, Nav Links on desktop */}
          <div className="flex items-center justify-start min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden -ml-2 p-2.5 text-[#000000] hover:text-[#d74a5d] transition-colors"
            >
              <Menu className="w-5 h-5 stroke-[1.6]" />
            </button>

            <nav
              aria-label="Primary navigation"
              className="hidden lg:flex items-center gap-3.5 xl:gap-5"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeFilter === item.filterKey;
                return (
                  <div
                    key={item.label}
                    className="relative py-2"
                    onMouseEnter={() =>
                      setHoveredMenu(item.columns ? item.label : null)
                    }
                  >
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.filterKey)}
                      aria-expanded={
                        item.columns ? hoveredMenu === item.label : undefined
                      }
                      className={`inline-flex items-center gap-1 text-[11px] xl:text-[12px] font-medium uppercase tracking-[1px] whitespace-nowrap shrink-0 pb-0.5 border-b transition-colors duration-150 ${
                        item.isSale
                          ? 'text-[#d74a5d] border-transparent hover:border-[#d74a5d]'
                          : isActive
                          ? 'text-[#000000] border-[#000000]'
                          : 'text-[#343434] border-transparent hover:text-[#d74a5d] hover:border-[#d74a5d]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.columns && (
                        <ChevronDown className="w-3 h-3 opacity-70" />
                      )}
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Center Zone: Brand Logo */}
          <div className="flex items-center justify-center">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                onSelectFilter('ALL');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[20px] sm:text-[24px] font-medium uppercase tracking-[4px] text-[#000000] whitespace-nowrap shrink-0 select-none"
            >
              AAROHA
            </a>
          </div>

          {/* Right Zone: Search, Account, Cart */}
          <div className="flex items-center justify-end gap-1 sm:gap-2.5">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search products"
              className="p-2 text-[#000000] hover:text-[#d74a5d] transition-colors"
            >
              <Search className="w-[19px] h-[19px] stroke-[1.6]" />
            </button>

            <button
              type="button"
              onClick={onOpenAccount}
              aria-label="Account"
              className="p-2 text-[#000000] hover:text-[#d74a5d] transition-colors"
            >
              <User className="w-[19px] h-[19px] stroke-[1.6]" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Shopping bag with ${cartCount} items`}
              className="relative p-2 text-[#000000] hover:text-[#d74a5d] transition-colors"
            >
              <ShoppingBag className="w-[19px] h-[19px] stroke-[1.6]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[17px] h-[17px] px-1 bg-[#d74a5d] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Mega-Menu Dropdown */}
        {activeMegaItem && (
          <div className="hidden lg:block absolute left-0 right-0 top-full bg-white border-b border-[#e8e8e8] shadow-lg z-40">
            <div className="max-w-[1440px] mx-auto px-8 py-8 grid grid-cols-[240px_1fr] gap-10 items-start">
              {activeMegaItem.megaImage && (
                <div className="aspect-[3/4] w-full overflow-hidden bg-[#f2f2f2] border border-[#e8e8e8]">
                  <SmartImage
                    src={activeMegaItem.megaImage}
                    alt={activeMegaItem.label}
                    className="w-full h-full object-cover"
                    fallbackLabel={activeMegaItem.label}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-12 pt-1">
                {activeMegaItem.columns?.map((col, idx) => (
                  <div key={idx} className="min-w-[180px]">
                    {col.heading && (
                      <p className="text-[11px] uppercase tracking-[1.5px] font-medium text-[#c8a078] mb-4">
                        {col.heading}
                      </p>
                    )}
                    <ul className="space-y-2.5">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <button
                            type="button"
                            onClick={() => handleNavClick(link.filterKey)}
                            className="text-[13px] text-[#343434] hover:text-[#d74a5d] transition-colors tracking-[0.5px] text-left"
                          >
                            {link.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="min-w-[200px] border-l border-[#e8e8e8] pl-8">
                  <p className="text-[11px] uppercase tracking-[1.5px] font-medium text-[#c8a078] mb-3">
                    Atelier Promise
                  </p>
                  <p className="text-[13px] text-[#343434] leading-relaxed mb-4 max-w-[260px]">
                    Every garment is cut and hand-finished to your chosen measurements in 7–10 days.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleNavClick(activeMegaItem.filterKey)}
                    className="text-[11px] uppercase tracking-[1px] font-medium text-[#000000] border-b border-[#000000] hover:text-[#d74a5d] hover:border-[#d74a5d] pb-0.5 transition-colors"
                  >
                    View All {activeMegaItem.label}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-full max-w-[340px] bg-white h-full flex flex-col z-10 shadow-xl">
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#e8e8e8]">
              <span className="text-[16px] font-medium uppercase tracking-[3px] text-[#000000]">
                AAROHA
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-[#000000] hover:text-[#d74a5d]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-[#e8e8e8]">
              <button
                type="button"
                onClick={() => handleNavClick('ALL')}
                className="w-full py-3.5 text-left text-[13px] font-medium uppercase tracking-[1px] text-[#000000]"
              >
                All Collections
              </button>

              {NAV_ITEMS.map((item) => {
                const hasChildren = Boolean(item.columns?.length);
                const isExpanded = expandedMobileGroup === item.label;
                return (
                  <div key={item.label} className="py-1">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.filterKey)}
                        className={`py-3 text-left text-[13px] font-medium uppercase tracking-[1px] flex-1 ${
                          item.isSale ? 'text-[#d74a5d]' : 'text-[#000000]'
                        }`}
                      >
                        {item.label}
                      </button>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedMobileGroup(isExpanded ? null : item.label)
                          }
                          aria-label={`Toggle ${item.label} submenu`}
                          className="p-2.5 text-[#343434]"
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform duration-150 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {hasChildren && isExpanded && (
                      <div className="pb-3 pl-4 space-y-2 border-t border-[#f2f2f2] pt-2">
                        {item.columns?.map((col) =>
                          col.links.map((link) => (
                            <button
                              key={link.label}
                              type="button"
                              onClick={() => handleNavClick(link.filterKey)}
                              className="block w-full text-left py-1.5 text-[13px] text-[#343434] hover:text-[#d74a5d]"
                            >
                              {link.label}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-5 bg-[#f2f2f2] border-t border-[#e8e8e8] space-y-3">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenAccount();
                }}
                className="w-full py-2.5 px-4 bg-[#321004] text-white text-[11px] font-medium uppercase tracking-[1.2px] text-center"
              >
                Account &amp; Order Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
