import React from 'react';

interface NoorCutLogoProps {
  className?: string;
}

/**
 * 2D Flat Minimalist Vector Logo (strictly flat geometric layers, no 3D shapes)
 */
export function NoorCutLogo({ className = 'w-8 h-8' }: NoorCutLogoProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Back studio frame */}
      <rect x="4" y="4" width="20" height="20" rx="5" fill="#1E293B" />
      {/* Precision diagonal cut / foreground subject plane */}
      <rect x="12" y="12" width="20" height="20" rx="5" fill="#0D9488" />
      {/* Crisp inner negative-space aperture */}
      <rect x="17" y="17" width="7" height="7" rx="2" fill="#FFFFFF" />
    </svg>
  );
}
