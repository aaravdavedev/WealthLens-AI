// Shared WealthLens logo component — extracted for reuse across auth + dashboard pages

import React from "react";

export default function WealthLensLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg-gold-c" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0D080" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id="lg-abs-c" x1="44" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8EFF8B" />
          <stop offset="100%" stopColor="#3DFF6E" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="rg-core-c" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </radialGradient>
        <filter id="glow-logo-c" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <polygon points="22,2 39,11.5 39,32.5 22,42 5,32.5 5,11.5" stroke="url(#lg-gold-c)" strokeWidth="0.6" fill="none" opacity="0.4" />
      <polygon points="22,8 34,15 34,29 22,36 10,29 10,15" stroke="url(#lg-gold-c)" strokeWidth="1.2" fill="url(#rg-core-c)" filter="url(#glow-logo-c)" />
      <circle cx="22" cy="22" r="7" stroke="url(#lg-gold-c)" strokeWidth="0.9" fill="none" />
      <circle cx="22" cy="22" r="2.8" fill="url(#lg-gold-c)" />
      <path d="M 22 15 A 7 7 0 0 1 29 22" stroke="url(#lg-abs-c)" strokeWidth="1.6" strokeLinecap="round" fill="none" filter="url(#glow-logo-c)" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const r1 = 17.5, r2 = 20, rad = (deg * Math.PI) / 180;
        return (
          <line key={deg}
            x1={22 + r1 * Math.sin(rad)} y1={22 - r1 * Math.cos(rad)}
            x2={22 + r2 * Math.sin(rad)} y2={22 - r2 * Math.cos(rad)}
            stroke="url(#lg-gold-c)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        );
      })}
    </svg>
  );
}
