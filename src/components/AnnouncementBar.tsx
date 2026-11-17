import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ANNOUNCEMENTS } from '../data/catalog';

export const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const prev = () =>
    setIndex((i) => (i - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  const next = () => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length);

  return (
    <div
      className="bg-[#321004] text-white h-9 flex items-center justify-center px-3 relative select-none"
      role="region"
      aria-label="Store announcements"
    >
      <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous announcement"
          className="p-1.5 text-white/70 hover:text-white transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-white"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <p
          key={index}
          className="min-w-0 text-[10px] sm:text-[11px] font-medium tracking-[1px] uppercase text-center truncate transition-opacity duration-300"
        >
          {ANNOUNCEMENTS[index]}
        </p>

        <button
          type="button"
          onClick={next}
          aria-label="Next announcement"
          className="p-1.5 text-white/70 hover:text-white transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-white"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
