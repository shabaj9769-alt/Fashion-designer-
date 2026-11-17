import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { HERO_SLIDES } from '../data/catalog';
import { SmartImage } from './SmartImage';

interface HeroSlideshowProps {
  onExploreFilter: (filterKey: string) => void;
}

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({
  onExploreFilter,
}) => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const goPrev = () =>
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const goNext = () =>
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#321004]"
      aria-roledescription="carousel"
      aria-label="Featured seasonal campaigns"
    >
      <div className="relative h-[460px] sm:h-[520px] lg:h-[620px] w-full">
        {HERO_SLIDES.map((slide, idx) => {
          const active = idx === current;
          return (
            <div
              key={slide.id}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-700 ${
                active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Desktop image */}
              <div className="hidden sm:block w-full h-full">
                <SmartImage
                  src={slide.desktopImage}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  fallbackBg={slide.fallbackBg}
                  fallbackLabel={slide.title}
                  lightText
                />
              </div>

              {/* Mobile image */}
              <div className="block sm:hidden w-full h-full">
                <SmartImage
                  src={slide.mobileImage}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  fallbackBg={slide.fallbackBg}
                  fallbackLabel={slide.title}
                  lightText
                />
              </div>

              {/* Contrast Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

              {/* Left-bottom Overlay */}
              <div className="absolute inset-0 max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14 flex items-end pb-14 sm:pb-16 lg:pb-20">
                <div className="max-w-xl text-white">
                  <p className="text-[11px] font-medium uppercase tracking-[2px] text-[#dcb48c] mb-2">
                    {slide.eyebrow}
                  </p>
                  <h1 className="text-[28px] sm:text-[38px] lg:text-[46px] font-normal uppercase tracking-[1px] leading-[1.15] text-white mb-3">
                    {slide.title}
                  </h1>
                  <p className="text-[13px] sm:text-[14px] text-white/90 leading-relaxed mb-6 max-w-md">
                    {slide.subtitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => onExploreFilter(slide.filterKey)}
                    className="inline-flex items-center justify-center px-7 py-3 bg-[#d74a5d] hover:bg-[#b8384a] text-white text-[12px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
                  >
                    {slide.ctaLabel}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Prev / Next Arrows */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous slide"
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/85 hover:bg-white text-[#000000] items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next slide"
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/85 hover:bg-white text-[#000000] items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Controls: Dots + Autoplay Pause/Play */}
        <div className="absolute bottom-4 left-0 right-0 z-20 max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === current ? 'true' : undefined}
                className={`h-2 transition-all duration-200 cursor-pointer ${
                  idx === current
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
            className="w-9 h-9 bg-black/45 hover:bg-black/70 text-white border border-white/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
