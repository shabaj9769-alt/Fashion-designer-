import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import { SmartImage } from './SmartImage';

interface HeroSlideshowProps {
  onExploreFilter: (filterKey: string) => void;
}

const HERO_FALLBACK_BG = [
  'repeating-linear-gradient(45deg, rgba(220, 180, 140, 0.055) 0px, rgba(220, 180, 140, 0.055) 1px, transparent 1px, transparent 16px)',
  'repeating-linear-gradient(-45deg, rgba(200, 160, 120, 0.04) 0px, rgba(200, 160, 120, 0.04) 1px, transparent 1px, transparent 16px)',
  'radial-gradient(ellipse 80% 65% at 75% 22%, rgba(200, 160, 120, 0.24) 0%, rgba(90, 42, 20, 0.18) 45%, transparent 75%)',
  'radial-gradient(circle at 18% 35%, rgba(138, 66, 32, 0.32) 0%, transparent 55%)',
  'linear-gradient(135deg, #321004 0%, #461c0b 45%, #5a2a14 100%)',
].join(', ');

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({
  onExploreFilter,
}) => {
  const { heroSlides } = useStoreData();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (current >= heroSlides.length && heroSlides.length > 0) {
      setCurrent(0);
    }
  }, [current, heroSlides.length]);

  useEffect(() => {
    if (!isPlaying || heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPlaying, heroSlides.length]);

  if (heroSlides.length === 0) return null;

  const safeIndex = current < heroSlides.length ? current : 0;
  const activeSlide = heroSlides[safeIndex];

  const goPrev = () =>
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const goNext = () =>
    setCurrent((prev) => (prev + 1) % heroSlides.length);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#321004] min-h-[400px] sm:min-h-[540px] lg:min-h-[620px] flex flex-col justify-end"
      aria-roledescription="carousel"
      aria-label="Featured seasonal campaigns"
    >
      {/* Background Gradient / Optional Image Layer: z-index 0 */}
      <div className="absolute inset-0 z-0">
        <div className="hidden sm:block w-full h-full aspect-[16/9]">
          <SmartImage
            key={`${activeSlide.id}-desktop`}
            src={activeSlide.desktopImage}
            alt={activeSlide.title}
            width={1600}
            height={900}
            className="w-full h-full object-cover"
            fallbackBg={HERO_FALLBACK_BG}
          />
        </div>
        <div className="block sm:hidden w-full h-full">
          <SmartImage
            key={`${activeSlide.id}-mobile`}
            src={activeSlide.mobileImage || activeSlide.desktopImage}
            alt={activeSlide.title}
            width={800}
            height={1067}
            className="w-full h-full object-cover"
            fallbackBg={HERO_FALLBACK_BG}
          />
        </div>
      </div>

      {/* Dark Gradient Scrim: rgba(50,16,4,0.55) to transparent */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(50, 16, 4, 0.72) 0%, rgba(50, 16, 4, 0.55) 45%, rgba(50, 16, 4, 0) 100%)',
        }}
      />

      {/* Desktop Prev / Next Arrows */}
      {heroSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-[3] w-11 h-11 bg-white/85 hover:bg-white text-[#000000] items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-[3] w-11 h-11 bg-white/85 hover:bg-white text-[#000000] items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Single Normal-Flow Text & Controls Container: z-index 2, bottom padding 24px */}
      <div className="relative z-[2] w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14 pt-10 sm:pt-20 pb-[24px] flex flex-col gap-4 sm:gap-6">
        <div className="max-w-xl text-white flex flex-col items-start gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[1.5px] sm:tracking-[2px] text-[#dcb48c]">
            {activeSlide.eyebrow}
          </p>
          <h1 className="aaroha-hero-heading font-normal uppercase text-white">
            {activeSlide.title}
          </h1>
          <p className="text-[13px] sm:text-[15px] line-clamp-2 sm:line-clamp-none text-white/90 leading-relaxed max-w-md">
            {activeSlide.subtitle}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onExploreFilter(activeSlide.filterKey)}
              className="inline-flex items-center justify-center min-h-[42px] sm:min-h-[46px] px-6 sm:px-7 py-2.5 sm:py-3 bg-[#d74a5d] hover:bg-[#b8384a] text-white text-[12px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
            >
              {activeSlide.ctaLabel}
            </button>
          </div>
        </div>

        {/* Dots + Pause/Play Controls in Bottom-LEFT */}
        {heroSlides.length > 1 && (
          <div className="flex items-center justify-start gap-3">
            <div className="flex items-center gap-2.5">
              {heroSlides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === safeIndex ? 'true' : undefined}
                  className={`h-2 transition-all duration-200 cursor-pointer ${
                    idx === safeIndex
                      ? 'w-7 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-black/45 hover:bg-black/70 text-white border border-white/30 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

