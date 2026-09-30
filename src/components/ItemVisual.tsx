import React from 'react';
import { ItemTheme } from '../types/math';

interface ItemVisualProps {
  theme: ItemTheme | 'carrot' | 'train';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customSvgSrc?: string; // Slot for future external PNG/WebP/SVG files
}

export const ItemVisual: React.FC<ItemVisualProps> = ({
  theme,
  className = '',
  size = 'md',
  customSvgSrc,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // If external file path is provided in future
  if (customSvgSrc) {
    return <img src={customSvgSrc} alt={theme} className={`${sizeMap[size]} object-contain ${className}`} />;
  }

  // High-fidelity custom SVG vector illustrations
  switch (theme) {
    case 'apple':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeMap[size]} ${className} drop-shadow-sm`}>
          <path d="M50 22 Q54 6 46 2" stroke="#78350F" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M50 16 Q65 10 65 20 Q55 24 50 16 Z" fill="#22C55E" />
          <path d="M50 25 C20 18 10 45 22 72 C32 94 45 92 50 84 C55 92 68 94 78 72 C90 45 80 18 50 25 Z" fill="#EF4444" />
          <path d="M30 35 Q38 30 42 32" stroke="#FCA5A5" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
        </svg>
      );

    case 'star':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeMap[size]} ${className} drop-shadow-sm`}>
          <polygon
            points="50,5 64,36 98,39 72,62 80,95 50,77 20,95 28,62 2,39 36,36"
            fill="#FBBF24"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <polygon points="50,15 60,38 78,40 60,56 65,78 50,67" fill="#FEF08A" opacity="0.6" />
        </svg>
      );

    case 'fish':
      return (
        <svg viewBox="0 0 100 80" className={`${sizeMap[size]} ${className} drop-shadow-sm`}>
          {/* Tail */}
          <polygon points="15,40 0,15 0,65" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
          {/* Body */}
          <ellipse cx="55" cy="40" rx="35" ry="25" fill="#0EA5E9" stroke="#0284C7" strokeWidth="3" />
          {/* Belly */}
          <path d="M35 48 Q55 65 75 48 Z" fill="#BAE6FD" />
          {/* Eye */}
          <circle cx="72" cy="34" r="5" fill="#FFFFFF" />
          <circle cx="74" cy="34" r="2.5" fill="#0F172A" />
          {/* Fin */}
          <path d="M48 38 Q58 26 54 48 Z" fill="#38BDF8" />
        </svg>
      );

    case 'balloon':
      return (
        <svg viewBox="0 0 80 100" className={`${sizeMap[size]} ${className} drop-shadow-sm`}>
          <ellipse cx="40" cy="40" rx="30" ry="36" fill="#F43F5E" />
          <polygon points="36,75 44,75 40,82" fill="#E11D48" />
          <path d="M40 82 Q34 90 42 100" stroke="#94A3B8" strokeWidth="2" fill="none" />
          <ellipse cx="26" cy="28" rx="6" ry="12" fill="#FDA4AF" opacity="0.7" transform="rotate(-25 26 28)" />
        </svg>
      );

    case 'car':
      return (
        <svg viewBox="0 0 100 70" className={`${sizeMap[size]} ${className} drop-shadow-sm`}>
          <rect x="10" y="28" width="80" height="24" rx="8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
          <path d="M25 28 L35 12 L65 12 L75 28 Z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2" />
          <circle cx="28" cy="52" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
          <circle cx="72" cy="52" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
          <circle cx="28" cy="52" r="4" fill="#E2E8F0" />
          <circle cx="72" cy="52" r="4" fill="#E2E8F0" />
          <rect x="42" y="16" width="16" height="10" rx="2" fill="#EFF6FF" opacity="0.8" />
        </svg>
      );

    case 'rabbit':
      return (
        <svg viewBox="0 0 80 90" className={`${sizeMap[size]} ${className} drop-shadow-sm`}>
          <ellipse cx="28" cy="24" rx="8" ry="22" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="28" cy="26" rx="4" ry="14" fill="#FDA4AF" />
          <ellipse cx="52" cy="24" rx="8" ry="22" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="52" cy="26" rx="4" ry="14" fill="#FDA4AF" />
          <circle cx="40" cy="54" r="24" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="32" cy="50" r="3.5" fill="#1E293B" />
          <circle cx="48" cy="50" r="3.5" fill="#1E293B" />
          <polygon points="40,56 37,53 43,53" fill="#F43F5E" />
          <circle cx="26" cy="58" r="4" fill="#FECDD3" />
          <circle cx="54" cy="58" r="4" fill="#FECDD3" />
        </svg>
      );

    case 'butterfly':
      return (
        <svg viewBox="0 0 100 80" className={`${sizeMap[size]} ${className} drop-shadow-sm`}>
          {/* Wings */}
          <path d="M50 40 Q25 5 10 25 Q0 50 35 55 Q48 50 50 40 Z" fill="#C084FC" stroke="#9333EA" strokeWidth="2" />
          <path d="M50 40 Q75 5 90 25 Q100 50 65 55 Q52 50 50 40 Z" fill="#C084FC" stroke="#9333EA" strokeWidth="2" />
          <circle cx="28" cy="32" r="6" fill="#FDE047" />
          <circle cx="72" cy="32" r="6" fill="#FDE047" />
          {/* Body */}
          <ellipse cx="50" cy="42" rx="4" ry="18" fill="#581C87" />
          <path d="M48 24 Q44 14 38 12" stroke="#581C87" strokeWidth="2" fill="none" />
          <path d="M52 24 Q56 14 62 12" stroke="#581C87" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'flower':
      return (
        <svg viewBox="0 0 90 90" className={`${sizeMap[size]} ${className} drop-shadow-sm`}>
          {/* Petals */}
          <circle cx="45" cy="22" r="14" fill="#F472B6" />
          <circle cx="45" cy="68" r="14" fill="#F472B6" />
          <circle cx="22" cy="45" r="14" fill="#F472B6" />
          <circle cx="68" cy="45" r="14" fill="#F472B6" />
          <circle cx="28" cy="28" r="12" fill="#FB7185" />
          <circle cx="62" cy="28" r="12" fill="#FB7185" />
          <circle cx="28" cy="62" r="12" fill="#FB7185" />
          <circle cx="62" cy="62" r="12" fill="#FB7185" />
          {/* Center */}
          <circle cx="45" cy="45" r="15" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
        </svg>
      );

    case 'strawberry':
      return (
        <svg viewBox="0 0 90 90" className={`${sizeMap[size]} ${className} drop-shadow-sm`}>
          {/* Berry body */}
          <path d="M45 22 C20 18 10 40 22 68 C32 86 45 88 45 88 C45 88 58 86 68 68 C80 40 70 18 45 22 Z" fill="#E11D48" />
          {/* Seeds */}
          <circle cx="34" cy="38" r="1.8" fill="#FDE047" />
          <circle cx="56" cy="38" r="1.8" fill="#FDE047" />
          <circle cx="45" cy="50" r="1.8" fill="#FDE047" />
          <circle cx="32" cy="62" r="1.8" fill="#FDE047" />
          <circle cx="58" cy="62" r="1.8" fill="#FDE047" />
          <circle cx="45" cy="72" r="1.8" fill="#FDE047" />
          {/* Leaves */}
          <path d="M45 22 Q40 6 30 10 Q40 18 45 22 Z" fill="#22C55E" />
          <path d="M45 22 Q50 6 60 10 Q50 18 45 22 Z" fill="#22C55E" />
          <path d="M45 22 Q45 8 45 2 Q45 14 45 22 Z" stroke="#16A34A" strokeWidth="3" />
        </svg>
      );

    case 'carrot':
      return (
        <svg viewBox="0 0 80 100" className={`${sizeMap[size]} ${className} drop-shadow-sm`}>
          <path d="M40 24 Q36 6 22 8 Q34 18 40 24 Z" fill="#22C55E" />
          <path d="M40 24 Q44 6 58 8 Q46 18 40 24 Z" fill="#22C55E" />
          <path d="M20 24 Q40 20 60 24 Q50 70 40 98 Q30 70 20 24 Z" fill="#F97316" stroke="#EA580C" strokeWidth="2.5" />
          <line x1="28" y1="42" x2="44" y2="42" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          <line x1="36" y1="58" x2="52" y2="58" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="74" x2="46" y2="74" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    default:
      return <span className="text-3xl select-none">🍎</span>;
  }
};
