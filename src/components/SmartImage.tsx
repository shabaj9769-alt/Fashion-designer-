import React, { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackBg?: string;
  fallbackLabel?: string;
  lightText?: boolean;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackBg = '#f2ebe4',
  fallbackLabel,
  lightText = false,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
        style={{ background: fallbackBg }}
      >
        <div
          className={`w-10 h-10 mb-3 border flex items-center justify-center ${
            lightText ? 'border-white/40 text-white/80' : 'border-[#c8a078] text-[#321004]'
          }`}
        >
          <span className="text-[11px] tracking-[2px] font-medium">A</span>
        </div>
        <span
          className={`text-[11px] uppercase tracking-[1.5px] font-medium max-w-[180px] leading-relaxed ${
            lightText ? 'text-white/90' : 'text-[#321004]'
          }`}
        >
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
};
