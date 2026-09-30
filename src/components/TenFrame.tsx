import React from 'react';

interface TenFrameProps {
  filledCountA: number;
  filledCountB?: number;
  itemAIcon?: string;
  itemBIcon?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TenFrame: React.FC<TenFrameProps> = ({
  filledCountA,
  filledCountB = 0,
  itemAIcon = '🍎',
  itemBIcon = '⭐',
  label = 'Khung 10 Ô',
  size = 'md',
  className = '',
}) => {
  const totalSlots = 10;

  const slotSizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {label && (
        <span className="text-xs sm:text-sm font-bold text-amber-900/80 mb-1.5 flex items-center gap-1.5">
          <span>📦 {label}</span>
          <span className="bg-amber-200/80 px-2 py-0.5 rounded-full text-amber-900 text-xs font-black">
            {Math.min(totalSlots, filledCountA + filledCountB)}/10
          </span>
        </span>
      )}

      {/* 2x5 Grid */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-amber-100/80 border-3 border-amber-300 rounded-2xl shadow-inner">
        {Array.from({ length: totalSlots }).map((_, idx) => {
          let content = null;
          let bgClass = 'bg-white/80 border border-dashed border-amber-300/80';

          if (idx < filledCountA) {
            content = <span className="animate-scale-in drop-shadow-sm">{itemAIcon}</span>;
            bgClass = 'bg-rose-100 border-2 border-rose-300 shadow-sm';
          } else if (idx < filledCountA + filledCountB) {
            content = <span className="animate-scale-in drop-shadow-sm">{itemBIcon}</span>;
            bgClass = 'bg-blue-100 border-2 border-blue-300 shadow-sm';
          }

          return (
            <div
              key={idx}
              className={`flex items-center justify-center rounded-xl transition-all ${slotSizes[size]} ${bgClass}`}
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
