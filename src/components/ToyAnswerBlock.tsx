import React from 'react';
import { WorldId } from '../types/math';

interface ToyAnswerBlockProps {
  value: number;
  worldId?: WorldId;
  isSelected?: boolean;
  isCorrect?: boolean;
  isWobbling?: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const ToyAnswerBlock: React.FC<ToyAnswerBlockProps> = ({
  value,
  worldId = 'world_4_make_10',
  isSelected = false,
  isCorrect = false,
  isWobbling = false,
  onClick,
  disabled = false,
  className = '',
}) => {
  // World-specific 3D toy styling
  const getStyleTheme = () => {
    switch (worldId) {
      case 'world_1_counting':
        // Flower Tile: Fresh grass green & sunny gold
        return {
          bg: 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500',
          border: 'border-b-6 border-amber-600 border-x-2 border-t-2 border-amber-200',
          textColor: 'text-amber-950',
          decor: '🌸',
          shadow: 'shadow-[0_8px_0_#b45309]',
        };
      case 'world_2_merge':
        // Apple Basket Wooden Tile
        return {
          bg: 'bg-gradient-to-b from-orange-300 via-orange-400 to-amber-500',
          border: 'border-b-6 border-orange-700 border-x-2 border-t-2 border-orange-200',
          textColor: 'text-orange-950',
          decor: '🍎',
          shadow: 'shadow-[0_8px_0_#c2410c]',
        };
      case 'world_3_add_10':
        // Treasure Coin: Shiny Gold with coin ridge
        return {
          bg: 'bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-500',
          border: 'border-b-6 border-yellow-700 border-x-2 border-t-2 border-yellow-100',
          textColor: 'text-yellow-950',
          decor: '🪙',
          shadow: 'shadow-[0_8px_0_#a16207]',
        };
      case 'world_4_make_10':
        // Magic Number Block: Royal purple with golden trims
        return {
          bg: 'bg-gradient-to-b from-purple-200 via-purple-300 to-indigo-300',
          border: 'border-b-6 border-purple-700 border-x-2 border-t-2 border-purple-200',
          textColor: 'text-purple-950',
          decor: '✨',
          shadow: 'shadow-[0_8px_0_#6b21a8]',
        };
      case 'world_5_split':
        // Warm Wooden Toy Tile
        return {
          bg: 'bg-gradient-to-b from-rose-200 via-rose-300 to-pink-400',
          border: 'border-b-6 border-rose-700 border-x-2 border-t-2 border-rose-100',
          textColor: 'text-rose-950',
          decor: '🧩',
          shadow: 'shadow-[0_8px_0_#be123c]',
        };
      case 'world_6_over_10':
        // Energy Crystal: Cosmic Neon Cyan
        return {
          bg: 'bg-gradient-to-b from-cyan-200 via-sky-300 to-blue-400',
          border: 'border-b-6 border-cyan-700 border-x-2 border-t-2 border-cyan-100',
          textColor: 'text-cyan-950',
          decor: '💎',
          shadow: 'shadow-[0_8px_0_#0369a1]',
        };
      default:
        return {
          bg: 'bg-gradient-to-b from-amber-300 to-amber-500',
          border: 'border-b-6 border-amber-600',
          textColor: 'text-amber-950',
          decor: '⭐',
          shadow: 'shadow-[0_8px_0_#b45309]',
        };
    }
  };

  const theme = getStyleTheme();

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`relative group w-full py-4 sm:py-5 px-3 rounded-3xl select-none transition-all duration-150 transform active:scale-95 active:translate-y-1.5 cursor-pointer ${
        isWobbling
          ? 'bg-gradient-to-b from-rose-400 to-rose-600 border-b-6 border-rose-800 text-white animate-wiggle'
          : isSelected && isCorrect
          ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-b-6 border-emerald-800 text-white scale-105 shadow-xl animate-bounce'
          : `${theme.bg} ${theme.border} ${theme.textColor} ${theme.shadow} hover:brightness-105`
      } ${className}`}
    >
      {/* Top light reflection highlight */}
      <div className="absolute top-1.5 inset-x-4 h-2.5 bg-white/40 rounded-full pointer-events-none" />

      {/* Decorative World Icon in corner */}
      <span className="absolute top-2 right-2.5 text-xs sm:text-sm opacity-60 pointer-events-none">
        {theme.decor}
      </span>

      {/* Large high-contrast crystal-clear number */}
      <span className="block text-4xl sm:text-5xl font-black tracking-wider leading-none drop-shadow-sm font-['Nunito',sans-serif]">
        {value}
      </span>
    </button>
  );
};
