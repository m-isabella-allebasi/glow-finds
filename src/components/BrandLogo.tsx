'use client';

import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  const heightClass = {
    sm: 'h-10',
    md: 'h-14 sm:h-16',
    lg: 'h-20 sm:h-24',
  }[size];

  if (!imgError) {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <img
          src="/logo.svg"
          alt="Glow Finds"
          onError={() => setImgError(true)}
          className={`${heightClass} w-auto object-contain`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <span className="font-serif italic font-bold text-3xl sm:text-4xl tracking-tight text-burgundy">
          glow
        </span>
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 text-burgundy -mt-4 ml-0.5 fill-current"
          aria-hidden="true"
        >
          <path d="M12 0C12.4 7.2 16.8 11.6 24 12C16.8 12.4 12.4 16.8 12 24C11.6 16.8 7.2 12.4 0 12C7.2 11.6 11.6 7.2 12 0Z" />
        </svg>
      </div>
      <span className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.38em] text-burgundy uppercase -mt-1">
        FINDS
      </span>
    </div>
  );
}
