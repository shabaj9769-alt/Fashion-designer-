import React from 'react';
import { SmartImage } from './SmartImage';

interface EditorialSplitsProps {
  onOpenCustomGuide: (topic: 'Made to Order' | 'Custom Sizing') => void;
}

export const EditorialSplits: React.FC<EditorialSplitsProps> = ({
  onOpenCustomGuide,
}) => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 space-y-12 sm:space-y-16">
        {/* Split 1: Image Left / Content Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch border border-[#e8e8e8]">
          <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[420px] bg-[#f2f2f2] overflow-hidden">
            <SmartImage
              src="https://placehold.co/900x700/ece5dc/321004?text=AAROHA+ATELIER%0AMADE+TO+ORDER&font=montserrat"
              alt="Aaroha Made to Order Tailoring"
              className="w-full h-full object-cover"
              fallbackBg="#ece5dc"
              fallbackLabel="Made To Order Craftsmanship"
            />
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-16 bg-white">
            <p className="text-[11px] font-medium uppercase tracking-[2px] text-[#c8a078] mb-3">
              CONSCIOUS CRAFT
            </p>
            <h3 className="text-[20px] sm:text-[24px] font-medium uppercase tracking-[1px] text-[#000000] mb-4">
              MADE TO ORDER
            </h3>
            <p className="text-[14px] text-[#343434] leading-[1.75] mb-6 max-w-md">
              We do not overproduce seasonal inventory. Once you place your order, our
              master tailors cut your fabric, reinforce inner mulmul linings, and hand-finish
              every seam with precision.
            </p>
            <div>
              <button
                type="button"
                onClick={() => onOpenCustomGuide('Made to Order')}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#321004] hover:bg-[#d74a5d] text-white text-[11px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
              >
                OUR PROCESS
              </button>
            </div>
          </div>
        </div>

        {/* Split 2: Content Left / Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch border border-[#e8e8e8]">
          <div className="order-2 lg:order-1 flex flex-col justify-center p-7 sm:p-12 lg:p-16 bg-white">
            <p className="text-[11px] font-medium uppercase tracking-[2px] text-[#c8a078] mb-3">
              TAILORED TO YOU
            </p>
            <h3 className="text-[20px] sm:text-[24px] font-medium uppercase tracking-[1px] text-[#000000] mb-4">
              CUSTOM SIZING
            </h3>
            <p className="text-[14px] text-[#343434] leading-[1.75] mb-6 max-w-md">
              Need an adjusted kurta length, custom sleeve proportion, or bespoke bust
              and waist measurements? Choose Custom Fit on any outfit and share your
              exact specifications at no additional tailoring fee.
            </p>
            <div>
              <button
                type="button"
                onClick={() => onOpenCustomGuide('Custom Sizing')}
                className="inline-flex items-center justify-center px-6 py-3 border border-[#c8a078] text-[#321004] hover:bg-[#d74a5d] hover:border-[#d74a5d] hover:text-white text-[11px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
              >
                EXPLORE CUSTOM FIT
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2 aspect-[4/3] lg:aspect-auto lg:min-h-[420px] bg-[#f2f2f2] overflow-hidden">
            <SmartImage
              src="https://placehold.co/900x700/e8dfd6/321004?text=AAROHA+FIT+STUDIO%0ACUSTOM+SIZING&font=montserrat"
              alt="Aaroha Custom Sizing Studio"
              className="w-full h-full object-cover"
              fallbackBg="#e8dfd6"
              fallbackLabel="Custom Sizing Studio"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
