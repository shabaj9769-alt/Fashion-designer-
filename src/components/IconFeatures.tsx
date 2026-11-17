import React from 'react';
import { Globe, Headphones, Ruler, Scissors } from 'lucide-react';

const FEATURES = [
  {
    icon: Globe,
    title: 'Free Shipping',
    subtitle: 'Complimentary worldwide delivery',
  },
  {
    icon: Scissors,
    title: 'Made to Order',
    subtitle: 'Crafted fresh per order in Jaipur',
  },
  {
    icon: Ruler,
    title: 'Custom Fit',
    subtitle: 'Tailored lengths & sizing at no fee',
  },
  {
    icon: Headphones,
    title: 'Easy Support',
    subtitle: 'Dedicated stylist help via chat',
  },
];

export const IconFeatures: React.FC = () => {
  return (
    <section className="py-12 sm:py-14 bg-white border-t border-[#e8e8e8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="flex flex-col items-center text-center px-2"
              >
                <div className="w-12 h-12 border border-[#c8a078] flex items-center justify-center text-[#321004] mb-3.5">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-[12px] sm:text-[13px] font-medium uppercase tracking-[1px] text-[#000000]">
                  {feat.title}
                </h3>
                <p className="text-[12px] text-[#343434] mt-1 leading-relaxed">
                  {feat.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
