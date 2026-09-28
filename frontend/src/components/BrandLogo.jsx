import React from 'react';

export default function BrandLogo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="LandslideGuard AI Logo"
    >
      {/* Rear High Peak (Navy / Blue Ridge) */}
      <polygon points="14,34 25,10 36,34" fill="#1e3a8a" />
      <polygon points="25,10 30,21 36,34 25,34" fill="#2563eb" opacity="0.9" />
      {/* Snow cap on rear peak */}
      <polygon points="25,10 21,17 29,17" fill="#ffffff" />

      {/* Foreground Mountain Peak (Vibrant Orange / Amber Ridge) */}
      <polygon points="6,34 17,16 30,34" fill="#f97316" />
      <polygon points="17,16 23,24 30,34 17,34" fill="#ea580c" />
      {/* Snow cap on front peak */}
      <polygon points="17,16 13,22 21,22" fill="#ffffff" />

      {/* Base bedrock foundation */}
      <line x1="5" y1="34" x2="37" y2="34" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
