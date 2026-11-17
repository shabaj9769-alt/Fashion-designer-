import React from 'react';
import { Star } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import { SmartImage } from './SmartImage';

export const Testimonials: React.FC = () => {
  const { testimonials } = useStoreData();
  if (testimonials.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#f2f2f2] border-t border-[#e8e8e8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[11px] font-medium uppercase tracking-[2px] text-[#c8a078] mb-2">
            PATRON NOTES
          </p>
          <h2 className="aaroha-section-heading font-medium uppercase text-[#000000]">
            Worn Around The World
          </h2>
        </div>

        {/* 3-col grid on desktop, horizontal swipe on mobile */}
        <div className="aaroha-testimonials-track no-scrollbar">
          {testimonials.map((item) => {
            const stars = Math.min(5, Math.max(1, item.rating ?? 5));
            return (
              <article
                key={item.id}
                className="aaroha-testimonial-card bg-white border border-[#e8e8e8] p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div
                    className="flex items-center gap-1 mb-4"
                    aria-label={`${stars} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < stars
                            ? 'fill-[#c8a078] text-[#c8a078]'
                            : 'text-[#e8e8e8]'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-[13px] sm:text-[14px] text-[#343434] leading-[1.75] mb-6">
                    &ldquo;{item.review}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-[#e8e8e8] flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-[#e8e8e8] bg-[#f2f2f2]">
                    <SmartImage
                      src={item.avatar ?? ''}
                      alt={item.name}
                      width={200}
                      height={200}
                      aspectRatio="1 / 1"
                      className="w-full h-full object-cover"
                      fallbackBg="linear-gradient(135deg, #f2f2f2, #e8e8e8)"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium uppercase tracking-[1px] text-[#000000]">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      {item.city}
                      {item.outfitBought ? ` · ${item.outfitBought}` : ''}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

