import React from 'react';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '../data/catalog';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#f2f2f2] border-t border-[#e8e8e8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[11px] font-medium uppercase tracking-[2px] text-[#c8a078] mb-2">
            PATRON NOTES
          </p>
          <h2 className="text-[20px] sm:text-[24px] font-medium uppercase tracking-[1px] text-[#000000]">
            Worn Around The World
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIALS.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-[#e8e8e8] p-6 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <div
                  className="flex items-center gap-1 mb-4"
                  aria-label="5 out of 5 stars"
                >
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="w-4 h-4 fill-[#c8a078] text-[#c8a078]"
                    />
                  ))}
                </div>

                <p className="text-[13px] sm:text-[14px] text-[#343434] leading-[1.75] mb-6">
                  &ldquo;{item.review}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#e8e8e8]">
                <p className="text-[12px] font-medium uppercase tracking-[1px] text-[#000000]">
                  {item.name}
                </p>
                <p className="text-[11px] text-[#777777] mt-0.5">
                  {item.city} · {item.outfitBought}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
