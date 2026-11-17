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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
          {COLLECTION_BANNERS.map((banner) => (
            <div
              key={banner.id}
              className="group relative aspect-[4/5] sm:aspect-[5/6] overflow-hidden bg-[#321004]"
            >
              <SmartImage
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                fallbackBg={banner.fallbackBg}
                fallbackLabel={banner.title}
                lightText
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 text-white">
                <h3 className="text-[22px] sm:text-[26px] font-medium uppercase tracking-[1px] text-white mb-2">
                  {banner.title}
                </h3>
                <p className="text-[13px] text-white/90 leading-relaxed mb-5 max-w-sm">
                  {banner.subtitle}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectCollection(banner.filterKey)}
                  className="inline-flex items-center justify-center px-6 py-2.5 border border-white text-white hover:bg-white hover:text-[#000000] text-[11px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
                >
                  {banner.ctaLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
