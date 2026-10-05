'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

interface TravelImageProps extends Omit<ImageProps, 'src' | 'alt' | 'onError'> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  aspectRatioClass?: string;
}

function isForbiddenOrInvalidUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return true;
  const clean = url.trim().toLowerCase();
  if (!clean || clean === 'null' || clean === 'undefined') return true;
  if (clean.includes('wikimedia.org') || clean.includes('wikipedia.org')) return true;
  if (clean.includes('shutterstock.com') || clean.includes('shutterstock')) return true;
  if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('/')) return true;
  return false;
}

export const TravelImage: React.FC<TravelImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  fill,
  width,
  height,
  priority,
  sizes,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const cleanSrc = src && typeof src === 'string' && src.trim() !== '' ? src.trim() : null;
  const cleanFallback = fallbackSrc && typeof fallbackSrc === 'string' && fallbackSrc.trim() !== '' ? fallbackSrc.trim() : null;

  const primaryIsForbidden = isForbiddenOrInvalidUrl(cleanSrc);
  const fallbackIsForbidden = isForbiddenOrInvalidUrl(cleanFallback);

  const activeSrc = !primaryIsForbidden && !error
    ? cleanSrc
    : !fallbackIsForbidden && !error
    ? cleanFallback
    : null;

  if (!activeSrc) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#12100D] border border-white/10 text-gray-400 p-4 text-center select-none ${
          fill ? 'w-full h-full absolute inset-0' : ''
        } ${className}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <ImageOff className="w-6 h-6 text-[#FF8A00] opacity-60 mb-1" />
        <span className="text-[11px] font-medium tracking-wide">No image available</span>
      </div>
    );
  }

  return (
    <Image
      src={activeSrc}
      alt={alt || 'Travel Genie Tourism Photography'}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      className={`${className} ${!loaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default TravelImage;
