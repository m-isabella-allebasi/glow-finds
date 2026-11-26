'use client';

import React, { useState } from 'react';

interface CopyPresellButtonProps {
  productId: string | number;
}

export function CopyPresellButton({ productId }: CopyPresellButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://glow-finds.vercel.app';

    const presellUrl = `${origin}/produto/${productId}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(presellUrl);
      } else {
        throw new Error('Fallback necessário');
      }
    } catch {
      // Fallback garantido para Safari iOS / WebViews
      const textarea = document.createElement('textarea');
      textarea.value = presellUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
        copied
          ? 'bg-[#E8B4BC] text-[#0A0A0A] border-[#E8B4BC]'
          : 'bg-[#4A0E1C]/60 hover:bg-[#6E162B] text-[#F8F4EF] border-[#E8B4BC]/35'
      }`}
    >
      {copied ? (
        <>
          <span>Link Presell Copiado</span>
          <span>✓</span>
        </>
      ) : (
        <>
          <span>Copiar Link Presell</span>
          <span className="text-[#E8B4BC]">✦</span>
        </>
      )}
    </button>
  );
}