import React from 'react';
import { Volume2, VolumeX, Pause, Star } from 'lucide-react';
import { sound } from '../utils/sound';
import { getPlayerLevelInfo } from '../utils/storage';

interface GameHUDProps {
  levelNumber: number;
  worldName: string;
  worldIcon: string;
  currentStars: number;
  maxStars?: number;
  xp: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  streak?: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  levelNumber,
  worldName,
  worldIcon,
  currentStars,
  maxStars = 3,
  xp,
  soundEnabled,
  onToggleSound,
  onPause,
  streak = 0,
}) => {
  const levelInfo = getPlayerLevelInfo(xp);

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-4 border-amber-200 px-3 sm:px-6 py-2.5 shadow-md flex items-center justify-between gap-2 z-30 select-none">
      {/* Left: World & Level */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPause}
          className="p-2 sm:p-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-800 shadow-sm active:scale-95 transition-transform"
          title="Tạm dừng game"
          aria-label="Tạm dừng game"
        >
          <Pause className="w-5 h-5 fill-current" />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-black text-slate-800 text-sm sm:text-base leading-tight">
            <span>{worldIcon}</span>
            <span className="truncate max-w-[120px] sm:max-w-none">{worldName}</span>
          </div>
          <span className="text-xs font-bold text-amber-700">Màn {levelNumber}</span>
        </div>
      </div>

      {/* Center: Stars & Streak */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-amber-50 border-2 border-amber-200 px-2.5 py-1 rounded-2xl shadow-inner">
          {Array.from({ length: maxStars }).map((_, idx) => (
            <Star
              key={idx}
              className={`w-5 h-5 transition-transform duration-300 ${
                idx < currentStars
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow'
                  : 'text-slate-300 fill-slate-200'
              }`}
            />
          ))}
        </div>
        {streak >= 3 && (
          <div className="hidden sm:flex items-center gap-1 bg-orange-500 text-white font-black text-xs px-2.5 py-1 rounded-full animate-bounce shadow">
            <span>🔥</span>
            <span>x{streak}</span>
          </div>
        )}
      </div>

      {/* Right: XP Bar & Sound */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* XP Bar */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-xs font-black text-amber-900">
            <span className="hidden sm:inline text-amber-600 font-extrabold">{levelInfo.title}</span>
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-black">
              ⭐ {xp} XP
            </span>
          </div>
          <div className="w-20 sm:w-28 h-2.5 bg-slate-200 rounded-full overflow-hidden border border-amber-300 mt-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500 rounded-full"
              style={{ width: `${levelInfo.percent}%` }}
            />
          </div>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            sound.playTap();
            onToggleSound();
          }}
          className={`p-2 sm:p-2.5 rounded-2xl border-2 transition-transform active:scale-95 shadow-sm ${
            soundEnabled
              ? 'bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'
          }`}
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
