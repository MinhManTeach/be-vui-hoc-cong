import React, { useState } from 'react';
import { ItemTheme } from '../types/math';
import { sound } from '../utils/sound';
import { ItemVisual } from './ItemVisual';

interface VisualCountersProps {
  count: number;
  theme: ItemTheme;
  interactiveTapCount?: boolean;
  highlightCount?: number;
  size?: 'sm' | 'md' | 'lg';
  groupLabel?: string;
  badgeColor?: string;
  containerBg?: string;
  className?: string;
  onCountChange?: (counted: number) => void;
}

export const VisualCounters: React.FC<VisualCountersProps> = ({
  count,
  theme,
  interactiveTapCount = true,
  size = 'md',
  groupLabel,
  badgeColor = 'bg-amber-400 text-amber-950',
  containerBg = 'bg-white/80',
  className = '',
  onCountChange,
}) => {
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);

  const handleItemClick = (index: number) => {
    if (!interactiveTapCount) return;

    sound.playPop();
    let newIndices: number[];
    if (tappedIndices.includes(index)) {
      newIndices = tappedIndices.filter((i) => i !== index);
    } else {
      newIndices = [...tappedIndices, index];
    }
    setTappedIndices(newIndices);
    if (onCountChange) {
      onCountChange(newIndices.length);
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-10 sm:w-12 sm:h-12',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {groupLabel && (
        <div className="mb-2 px-3 py-1 bg-white/90 border border-amber-200 rounded-full font-bold text-xs sm:text-sm text-slate-700 shadow-sm">
          {groupLabel}
        </div>
      )}

      <div
        className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-3xl border-3 border-amber-200/80 shadow-inner ${containerBg} max-w-md`}
      >
        {Array.from({ length: count }).map((_, idx) => {
          const isTapped = tappedIndices.includes(idx);
          const tapOrder = tappedIndices.indexOf(idx) + 1;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleItemClick(idx)}
              className={`relative flex items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer ${
                sizeClasses[size]
              } ${
                isTapped
                  ? 'scale-110 bg-amber-100/90 shadow-md ring-3 ring-amber-400 rotate-3'
                  : 'hover:scale-105 active:scale-95 bg-white/80 hover:bg-white shadow-sm'
              }`}
              title="Chạm để đếm"
              aria-label={`Vật phẩm ${idx + 1}`}
            >
              <ItemVisual theme={theme} size={size === 'lg' ? 'md' : 'sm'} />

              {/* Number tag when tapped */}
              {isTapped && (
                <span
                  className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-black shadow-md animate-scale-in ${badgeColor}`}
                >
                  {tapOrder}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {interactiveTapCount && count > 0 && (
        <div className="mt-2 text-xs font-medium text-amber-900/70 italic flex items-center gap-1">
          <span>👆 Chạm vào từng hình để đếm nhé!</span>
          {tappedIndices.length > 0 && (
            <span className="font-bold text-amber-700 not-italic">
              (Đã đếm: {tappedIndices.length}/{count})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
