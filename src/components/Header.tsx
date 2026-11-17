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
import { useStoreData } from '../context/StoreDataContext';
import { SmartImage } from './SmartImage';

interface HeaderProps {
  cartCount: number;
  activeFilter: string;
  mobileDrawerOpen: boolean;
  onMobileDrawerOpenChange: (open: boolean) => void;
  onSelectFilter: (filterKey: string) => void;
  onGoHome?: () => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  activeFilter,
  mobileDrawerOpen,
  onMobileDrawerOpenChange,
  onSelectFilter,
  onGoHome,
  onOpenCart,
  onOpenSearch,
  onOpenAccount,
}) => {
  const { navItems, settings } = useStoreData();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState<string | null>(
    null
  );

  const handleNavClick = (filterKey: string) => {
    onSelectFilter(filterKey);
    setHoveredMenu(null);
  };

  const activeMegaItem = navItems.find(
    (item) =>
      item.label === hoveredMenu &&
      item.columns &&
      item.columns.some((c) => c.links.length > 0)
  );

  return (
    <>
      <header
        className="aaroha-sticky-topbar bg-white border-b border-[#e8e8e8]"
        onMouseLeave={() => setHoveredMenu(null)}
      >
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-16 lg:h-[72px] grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          {/* Left Zone: Hamburger on mobile, Nav Links on desktop */}
          <div className="flex items-center justify-start min-w-0">
            <button
              type="button"
              onClick={() => onMobileDrawerOpenChange(true)}
              aria-label="Open navigation menu"
              className="aaroha-mobile-hamburger -ml-2 p-2.5 text-[#000000] hover:text-[#d74a5d] transition-colors items-center justify-center min-w-[44px] min-h-[44px]"
            >
              <Menu className="w-5 h-5 stroke-[1.6]" />
            </button>

            <nav
              aria-label="Primary navigation"
              className="aaroha-desktop-nav items-center gap-3.5 xl:gap-5"
            >
              {navItems.map((item) => {
                const isActive = activeFilter === item.filterKey;
                const hasColumns = Boolean(
                  item.columns && item.columns.some((c) => c.links.length > 0)
                );
                return (
                  <div
                    key={item.label}
                    className="relative py-2"
                    onMouseEnter={() =>
                      setHoveredMenu(hasColumns ? item.label : null)
                    }
                  >
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.filterKey)}
                      aria-expanded={
                        hasColumns ? hoveredMenu === item.label : undefined
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
                      {hasColumns && (
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
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                if (onGoHome) {
                  onGoHome();
                } else {
                  onSelectFilter('ALL');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="text-[18px] sm:text-[24px] font-medium uppercase tracking-[3px] sm:tracking-[4px] text-[#000000] whitespace-nowrap shrink-0 select-none"
            >
              {settings.storeName || 'AAROHA'}
            </a>
          </div>

          {/* Right Zone: Search, Account, Cart */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-2.5">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search products"
              className="p-2 text-[#000000] hover:text-[#d74a5d] transition-colors min-w-[40px] min-h-[44px] flex items-center justify-center"
            >
              <Search className="w-[19px] h-[19px] stroke-[1.6]" />
            </button>

            <button
              type="button"
              onClick={onOpenAccount}
              aria-label="Account"
              className="p-2 text-[#000000] hover:text-[#d74a5d] transition-colors min-w-[40px] min-h-[44px] flex items-center justify-center"
            >
              <User className="w-[19px] h-[19px] stroke-[1.6]" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Shopping bag with ${cartCount} items`}
              className="relative w-11 h-11 text-[#000000] hover:text-[#d74a5d] transition-colors flex items-center justify-center overflow-visible"
            >
              <ShoppingBag className="w-[19px] h-[19px] stroke-[1.6]" />
              {cartCount > 0 && (
                <span className="absolute top-[6px] right-[5px] min-w-[17px] h-[17px] px-1 rounded-full bg-[#d74a5d] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums leading-none">
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
              {activeMegaItem.megaImage !== undefined && (
                <div className="aspect-[3/4] w-full overflow-hidden bg-[#f2f2f2] border border-[#e8e8e8]">
                  <SmartImage
                    src={activeMegaItem.megaImage}
                    alt={activeMegaItem.label}
                    width={500}
                    height={680}
                    aspectRatio="3 / 4"
                    className="w-full h-full object-cover"
                    fallbackBg="linear-gradient(135deg, #f2f2f2, #e8e8e8)"
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
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => onMobileDrawerOpenChange(false)}
          />
          <div className="relative w-full max-w-[340px] bg-white h-[100dvh] flex flex-col z-10 shadow-xl overflow-hidden">
            <div className="shrink-0 flex items-center justify-between px-5 h-16 border-b border-[#e8e8e8]">
              <span className="text-[16px] font-medium uppercase tracking-[3px] text-[#000000]">
                {settings.storeName || 'AAROHA'}
              </span>
              <button
                type="button"
                onClick={() => onMobileDrawerOpenChange(false)}
                aria-label="Close navigation menu"
                className="p-2 text-[#000000] hover:text-[#d74a5d]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5">
              <button
                type="button"
                onClick={() => handleNavClick('ALL')}
                className="w-full min-h-[56px] flex items-center text-left text-[13px] font-medium uppercase tracking-[1px] text-[#000000] border-b border-[#e8e8e8]"
              >
                All Collections
              </button>

              {navItems.map((item) => {
                const hasChildren = Boolean(
                  item.columns?.some((c) => c.links.length > 0)
                );
                const isExpanded = expandedMobileGroup === item.label;
                return (
                  <div key={item.label} className="border-b border-[#e8e8e8]">
                    <div className="min-h-[56px] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.filterKey)}
                        className={`min-h-[56px] flex items-center text-left text-[13px] font-medium uppercase tracking-[1px] flex-1 ${
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
                          className="w-11 h-[56px] flex items-center justify-end text-[#343434]"
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

            <div className="shrink-0 p-4 sm:p-5 bg-[#f2f2f2] border-t border-[#e8e8e8]">
              <button
                type="button"
                onClick={onOpenAccount}
                className="w-full min-h-[44px] py-3 px-4 bg-[#321004] hover:bg-[#d74a5d] text-white text-[11px] font-medium uppercase tracking-[1.2px] text-center transition-colors cursor-pointer"
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

