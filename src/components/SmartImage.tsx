import React from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  fallbackBg?: string;
}

/**
 * Renders <img> only when a non-empty URL is provided in IMAGES.
 * Otherwise renders a clean plain color/gradient block with no text, icons, or error fallback logic.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  width = 600,
  height = 800,
  aspectRatio,
  fallbackBg = 'linear-gradient(135deg, #f2f2f2, #e8e8e8)',
}) => {
  const cleanSrc = src ? src.trim() : '';

  if (!cleanSrc) {
    return (
      <div
        aria-hidden="true"
        className={`w-full h-full ${className}`}
        style={{
          background: fallbackBg,
          ...(aspectRatio ? { aspectRatio } : {}),
        }}
      />
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      width={width}
      height={height}
      className={`w-full h-full object-cover ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    />
  );
};
