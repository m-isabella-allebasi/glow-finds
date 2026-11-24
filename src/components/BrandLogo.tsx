import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const heightClass = {
    sm: 'h-10',
    md: 'h-14 sm:h-16',
    lg: 'h-20 sm:h-24',
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <img
        src="/logo.svg"
        alt="Glow Finds"
        className={`${heightClass} w-auto object-contain`}
      />
    </div>
  );
}
