import React, { useEffect, useState } from 'react';

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
 * Renders <img> only when a non-empty valid URL/base64 is provided.
 * Otherwise renders a clean plain color/gradient block with no broken image icon.
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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [cleanSrc]);

  if (!cleanSrc || failed) {
    return (
      <div
        aria-hidden="true"
        className={`w-full h-full ${className}`}
        style={{
          background: fallbackBg || 'linear-gradient(135deg, #f2f2f2, #e8e8e8)',
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
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    />
  );
};

