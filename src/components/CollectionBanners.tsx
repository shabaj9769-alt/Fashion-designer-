import React from 'react';
import { COLLECTION_BANNERS } from '../data/catalog';
import { SmartImage } from './SmartImage';

interface CollectionBannersProps {
  onSelectCollection: (filterKey: string) => void;
}

export const CollectionBanners: React.FC<CollectionBannersProps> = ({
  onSelectCollection,
}) => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="aaroha-banners-grid">
          {COLLECTION_BANNERS.map((banner) => (
            <div
              key={banner.id}
              className="group relative min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] flex flex-col justify-end overflow-hidden bg-[#321004]"
            >
              {/* Background Gradient / Optional Image Layer: z-index 0 */}
              <div className="absolute inset-0 z-0 bg-[#321004]">
                <SmartImage
                  src={banner.image}
                  alt={banner.title}
                  width={1200}
                  height={800}
                  aspectRatio="3 / 2"
                  className="w-full h-full object-cover"
                  fallbackBg={banner.fallbackBg}
                />
              </div>

              {/* Dark Gradient Scrim: rgba(50,16,4,0.55) to transparent */}
              <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(50, 16, 4, 0.72) 0%, rgba(50, 16, 4, 0.55) 45%, rgba(50, 16, 4, 0) 100%)',
                }}
              />

              {/* Normal-flow Flex Column Content: z-index 2 */}
              <div className="relative z-[2] flex flex-col gap-[12px] justify-end p-[24px] sm:p-10 text-white">
                {banner.eyebrow && (
                  <p className="text-[11px] font-medium uppercase tracking-[2px] text-[#dcb48c]">
                    {banner.eyebrow}
                  </p>
                )}
                <h3 className="aaroha-banner-heading font-medium uppercase text-white">
                  {banner.title}
                </h3>
                <p className="text-[13px] sm:text-[14px] text-white/90 leading-relaxed max-w-sm">
                  {banner.subtitle}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectCollection(banner.filterKey)}
                    className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 border border-white text-white hover:bg-white hover:text-[#000000] text-[11px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
                  >
                    {banner.ctaLabel}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
