import React, { useEffect, useState } from 'react';
import { Sparkles, Star } from 'lucide-react';
import { tenFrameHintTargets } from '../utils/tenFrameHint';

interface InteractiveToyTenFrameProps {
  initialCountA: number; // e.g. 1
  targetTotal?: number;  // 10
  highlightEmptySlots?: boolean; // Visual hint trigger
  additionCount?: number;
  label?: string;
  hintInstruction?: string;
  isAnimatingFill?: boolean; // When answered correctly, fly items in!
  itemIcon?: string; // e.g. 🍎 or ⭐
  fillItemIcon?: string;
  className?: string;
}

export const InteractiveToyTenFrame: React.FC<InteractiveToyTenFrameProps> = ({
  initialCountA,
  targetTotal = 10,
  highlightEmptySlots = false,
  additionCount = targetTotal - initialCountA,
  label = `Đã có ${initialCountA} • Thêm mấy để đủ ${targetTotal}?`,
  hintInstruction,
  isAnimatingFill = false,
  itemIcon = '🍎',
  fillItemIcon = '⭐',
  className = '',
}) => {
  const [filledSlots, setFilledSlots] = useState<number>(initialCountA);
  const [isTrayGlowing, setIsTrayGlowing] = useState<boolean>(false);
  const hintTargets = tenFrameHintTargets(initialCountA, additionCount, highlightEmptySlots);

  useEffect(() => {
    setFilledSlots(initialCountA);
    setIsTrayGlowing(false);
  }, [initialCountA]);

  // Sequential fly-in animation when answered correctly
  useEffect(() => {
    if (isAnimatingFill) {
      let current = initialCountA;
      const interval = setInterval(() => {
        current += 1;
        setFilledSlots(current);
        if (current >= targetTotal) {
          clearInterval(interval);
          setIsTrayGlowing(true);
        }
      }, 90);

      return () => clearInterval(interval);
    }
  }, [isAnimatingFill, initialCountA, targetTotal]);

  return (
    <div
      className={`relative p-3.5 sm:p-5 rounded-3xl bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 border-4 border-amber-600 shadow-[0_8px_0_#92400e] transition-all duration-500 ${
        isTrayGlowing ? 'ring-4 ring-yellow-400 shadow-[0_0_25px_#fde047]' : ''
      } ${className}`}
    >
      {/* Wood grain & highlight line */}
      <div className="absolute top-1.5 inset-x-6 h-2 bg-white/40 rounded-full pointer-events-none" />

      {/* Ten-Frame 2 Rows x 5 Columns Toy Slots */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 bg-amber-900/15 p-2 sm:p-3 rounded-2xl shadow-inner border-2 border-amber-500/40">
        {Array.from({ length: targetTotal }).map((_, index) => {
          const isSlotFilledWithA = index < initialCountA;
          const isSlotFilledWithAnim = index >= initialCountA && index < filledSlots;
          const isSlotEmpty = index >= filledSlots;
          const isHintTarget = isSlotEmpty && hintTargets.includes(index + 1);

          return (
            <div
              key={index}
              data-hint-target={isHintTarget ? 'true' : undefined}
              aria-label={`Ô ${index + 1}${isHintTarget ? ', thêm vào đây' : isSlotEmpty ? ', để trống' : ', đã có'}`}
              style={isHintTarget ? { animationDelay: `${(index - initialCountA) * 70}ms` } : undefined}
              className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl border-3 flex items-center justify-center relative transition-all duration-300 select-none ${
                isSlotFilledWithA
                  ? 'bg-gradient-to-b from-white to-amber-50 border-amber-400 shadow-md'
                  : isSlotFilledWithAnim
                  ? 'bg-gradient-to-b from-yellow-200 to-amber-400 border-yellow-500 scale-105 animate-bounce shadow-md'
                  : isHintTarget
                  ? 'ten-frame-hint-target'
                  : 'bg-amber-900/10 border-amber-600/30 shadow-inner'
              }`}
            >
              {/* Slot Index Subscript */}
              <span className="absolute bottom-0.5 right-1 text-[9px] font-black text-amber-900/30">
                {index + 1}
              </span>

              {/* Slot Content */}
              {isSlotFilledWithA && (
                <span className="text-2xl sm:text-3xl filter drop-shadow animate-scale-up">
                  {itemIcon}
                </span>
              )}

              {isSlotFilledWithAnim && (
                <span className="text-2xl sm:text-3xl filter drop-shadow animate-scale-up">
                  {fillItemIcon}
                </span>
              )}

              {isHintTarget && (
                <span className="ten-frame-hint-marker" aria-hidden="true"><Star className="w-7 h-7" strokeWidth={2.5} /><span className="absolute top-0 right-1 text-sm">+</span></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tray Status Label below */}
      <div className="mt-2 text-center flex items-center justify-center gap-1.5 text-xs sm:text-sm font-black text-amber-950">
        {isTrayGlowing ? (
          <span className="text-emerald-800 flex items-center gap-1 animate-pulse">
            <Sparkles className="w-4 h-4 fill-emerald-500 text-emerald-600" />
            ĐÃ ĐỦ 10 Ô RỒI! XUẤT SẮC!
            <Sparkles className="w-4 h-4 fill-emerald-500 text-emerald-600" />
          </span>
        ) : (
          <span>
            {highlightEmptySlots && hintInstruction ? hintInstruction : label}
          </span>
        )}
      </div>
    </div>
  );
};
