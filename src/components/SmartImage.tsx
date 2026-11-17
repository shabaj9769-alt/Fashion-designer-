import React, { useEffect, useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  loading?: 'lazy' | 'eager';
  fallbackBg?: string;
  fallbackLabel?: string;
  lightText?: boolean;
}

/**
 * Generates an alternate lock URL if the primary LoremFlickr URL fails to load.
 */
function buildAlternateLockUrl(originalUrl: string): string | null {
  try {
    const url = new URL(originalUrl);
    const currentLock = url.searchParams.get('lock');
    if (currentLock) {
      const nextLock = Number(currentLock) + 500;
      url.searchParams.set('lock', String(Number.isFinite(nextLock) ? nextLock : 999));
      return url.toString();
    }
    url.searchParams.set('lock', '777');
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Renders a responsive cover image with width/height attributes, configurable loading,
 * aspect-ratio, one automatic alternate-lock retry on error, and a plain
 * soft-gradient fallback (#f2f2f2 to #e8e8e8) with zero text.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  width = 600,
  height = 800,
  aspectRatio,
  loading = 'lazy',
  fallbackBg = 'linear-gradient(145deg, #f2f2f2 0%, #e8e8e8 100%)',
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retried, setRetried] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setRetried(false);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (!retried && currentSrc) {
      const altUrl = buildAlternateLockUrl(currentSrc);
      if (altUrl && altUrl !== currentSrc) {
        setRetried(true);
        setCurrentSrc(altUrl);
        return;
      }
    }
    setFailed(true);
  };

  if (failed || !currentSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
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
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={`w-full h-full object-cover ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    />
  );
};
