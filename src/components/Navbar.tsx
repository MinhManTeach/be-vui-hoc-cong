import React from 'react';
import { Home, Volume2, VolumeX, Sparkles, Flame, UserCheck } from 'lucide-react';
import { sound } from '../utils/sound';

interface NavbarProps {
  totalStars: number;
  streak?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome: () => void;
  onOpenParents: () => void;
  currentScreenTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalStars,
  streak = 0,
  soundEnabled,
  onToggleSound,
  onGoHome,
  onOpenParents,
  currentScreenTitle,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 z-20">
      {/* Home Button */}
      <button
        onClick={() => {
          sound.playTap();
          onGoHome();
        }}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white/90 hover:bg-white text-slate-800 font-extrabold rounded-2xl shadow-[0_4px_0_#cbd5e1] active:translate-y-1 active:shadow-none border-2 border-slate-200 transition-all text-sm sm:text-base cursor-pointer"
        aria-label="Về trang chủ"
      >
        <Home className="w-5 h-5 text-amber-500" />
        <span className="hidden sm:inline">Trang Chủ</span>
      </button>

      {/* Screen Title (if applicable) */}
      {currentScreenTitle && (
        <div className="hidden md:flex items-center px-4 py-1.5 bg-amber-200/80 border-2 border-amber-300 rounded-full font-black text-amber-900 text-sm">
          {currentScreenTitle}
        </div>
      )}

      {/* Right Stats & Action Group */}
      <div className="flex items-center gap-2">
        {/* Streak combo flame if streak >= 2 */}
        {streak >= 2 && (
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md animate-pulse">
            <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>x{streak}</span>
          </div>
        )}

        {/* Stars pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 border-2 border-amber-500 rounded-2xl font-black text-amber-950 text-sm sm:text-base shadow-[0_3px_0_#d97706]">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-100 text-amber-100" />
          <span>{totalStars}</span>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => {
            sound.playTap();
            onToggleSound();
          }}
          className={`p-2 rounded-2xl border-2 transition-all shadow-[0_3px_0_#cbd5e1] active:translate-y-0.5 active:shadow-none cursor-pointer ${
            soundEnabled
              ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
              : 'bg-slate-100 border-slate-300 text-slate-400'
          }`}
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          aria-label="Âm thanh"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Parent Corner Button */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenParents();
          }}
          className="p-2 sm:px-3 sm:py-2 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-800 rounded-2xl font-bold text-xs sm:text-sm shadow-[0_3px_0_#d8b4fe] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all cursor-pointer"
          title="Góc phụ huynh"
          aria-label="Góc phụ huynh"
        >
          <UserCheck className="w-5 h-5" />
          <span className="hidden lg:inline">Phụ Huynh</span>
        </button>
      </div>
    </header>
  );
};
