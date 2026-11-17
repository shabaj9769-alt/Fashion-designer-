import React from 'react';
import { FEATURED_CATEGORIES } from '../data/catalog';
import { SmartImage } from './SmartImage';

interface FeaturedCollectionsProps {
  onSelectCategory: (filterKey: string) => void;
}

export const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({
  onSelectCategory,
}) => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10">
        <h2 className="text-[20px] sm:text-[24px] font-medium uppercase tracking-[1px] text-[#000000] text-center mb-8 sm:mb-10">
          Shop By Category
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.filterKey)}
              className="group text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#321004]"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-[#f2f2f2] border border-[#e8e8e8]">
                <SmartImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  fallbackBg={cat.fallbackTone}
                  fallbackLabel={cat.name}
                />
              </div>
              <span className="block mt-3.5 text-[13px] sm:text-[14px] font-medium uppercase tracking-[1px] text-[#000000] group-hover:text-[#d74a5d] transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
