'use client';

import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClass = {
    sm: 'h-16 sm:h-20 max-w-[200px]',
    md: 'h-24 sm:h-32 max-w-[280px] sm:max-w-[360px]',
    lg: 'h-32 sm:h-40 max-w-[340px] sm:max-w-[420px]',
  }[size];

  if (!imgError) {
    return (
      <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
        <img
          src="/logo.svg"
          alt="Glow Finds"
          onError={() => setImgError(true)}
          className={`${sizeClass} w-auto object-contain`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <span className="font-serif italic font-bold text-4xl sm:text-5xl tracking-tight text-burgundy">
          glow
        </span>
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-burgundy -mt-5 ml-0.5 fill-current"
          aria-hidden="true"
        >
          <path d="M12 0C12.4 7.2 16.8 11.6 24 12C16.8 12.4 12.4 16.8 12 24C11.6 16.8 7.2 12.4 0 12C7.2 11.6 11.6 7.2 12 0Z" />
        </svg>
      </div>
      <span className="font-sans text-xs sm:text-sm font-bold tracking-[0.38em] text-burgundy uppercase -mt-1">
        FINDS
      </span>
    </div>
  );
}
