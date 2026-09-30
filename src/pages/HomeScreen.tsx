import React, { useState } from 'react';
import { Play, Flame, Trophy, Gift, Volume2, VolumeX, Users, Gamepad2 } from 'lucide-react';
import { UserProgress } from '../types/math';
import { BunnyCharacter } from '../components/BunnyCharacter';
import { sound } from '../utils/sound';

interface HomeScreenProps {
  progress: UserProgress;
  onStartLearning: () => void;
  onOpenChallenge: () => void;
  onOpenMiniGames: () => void;
  onOpenCollection: () => void;
  onOpenParents: () => void;
  onToggleSound: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onStartLearning,
  onOpenChallenge,
  onOpenMiniGames,
  onOpenCollection,
  onOpenParents,
  onToggleSound,
}) => {
  const [bunnyGreeting] = useState(
    'Xin chào! 👋 Hôm nay chúng mình cùng chơi với những con số nhé!'
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 max-w-xl mx-auto select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pt-2">
        {/* Star Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-400 border-2 border-amber-500 rounded-2xl shadow-[0_3px_0_#d97706] font-black text-amber-950 text-base sm:text-lg">
          <span className="text-xl">⭐</span>
          <span>{progress.totalStars} Sao</span>
        </div>

        {/* Sound toggle & Parent Corner */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playTap();
              onToggleSound();
            }}
            className={`p-2.5 rounded-2xl border-2 transition-all shadow-[0_3px_0_#cbd5e1] active:translate-y-0.5 active:shadow-none cursor-pointer ${
              progress.soundEnabled
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
            title="Âm thanh"
            aria-label="Bật tắt âm thanh"
          >
            {progress.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenParents();
            }}
            className="p-2.5 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-800 rounded-2xl shadow-[0_3px_0_#d8b4fe] active:translate-y-0.5 active:shadow-none transition cursor-pointer"
            title="Góc phụ huynh"
            aria-label="Góc phụ huynh"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="my-2 text-center">
        <div className="inline-block px-4 py-1 bg-amber-200/90 text-amber-900 rounded-full font-black text-xs sm:text-sm tracking-wide uppercase shadow-xs mb-1">
          Toán Học Mầm Non 4 - 6 Tuổi
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-amber-600 tracking-tight drop-shadow-sm flex items-center justify-center gap-2">
          <span>BÉ VUI HỌC CỘNG</span>
        </h1>
      </div>

      {/* Hero Bunny Mascot */}
      <div className="my-2">
        <BunnyCharacter
          mood="happy"
          size="lg"
          speechText={bunnyGreeting}
          hat={progress.equippedAccessories.hat}
          glasses={progress.equippedAccessories.glasses}
          item={progress.equippedAccessories.item}
        />
      </div>

      {/* Big Action Buttons for Preschoolers */}
      <div className="w-full flex flex-col gap-3 my-3">
        {/* Main CTA: BẮT ĐẦU HỌC */}
        <button
          onClick={() => {
            sound.playTap();
            onStartLearning();
          }}
          className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl sm:text-2xl rounded-3xl shadow-[0_8px_0_#047857] active:translate-y-1.5 active:shadow-[0_2px_0_#047857] transition-all flex items-center justify-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition">
            <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
          </div>
          <span>🎮 BẮT ĐẦU HỌC</span>
        </button>

        {/* Secondary Row: MINI GAME & THỬ THÁCH */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              sound.playTap();
              onOpenMiniGames();
            }}
            className="py-3.5 px-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-base sm:text-lg rounded-2xl shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_2px_0_#b45309] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gamepad2 className="w-5 h-5 text-amber-900" />
            <span>TRÒ CHƠI</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenChallenge();
            }}
            className="py-3.5 px-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-base sm:text-lg rounded-2xl shadow-[0_6px_0_#be123c] active:translate-y-1 active:shadow-[0_2px_0_#be123c] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Flame className="w-5 h-5 fill-amber-300 text-amber-300" />
            <span>⭐ THỬ THÁCH</span>
          </button>
        </div>

        {/* Third Row: BỘ SƯU TẬP & THÀNH TÍCH */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              sound.playTap();
              onOpenCollection();
            }}
            className="py-3 px-3 bg-purple-500 hover:bg-purple-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-[0_5px_0_#6b21a8] active:translate-y-1 active:shadow-[0_2px_0_#6b21a8] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Gift className="w-5 h-5 text-pink-200" />
            <span>🎁 BỘ SƯU TẬP</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenCollection();
            }}
            className="py-3 px-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-[0_5px_0_#0369a1] active:translate-y-1 active:shadow-[0_2px_0_#0369a1] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-amber-300" />
            <span>🏆 THÀNH TÍCH</span>
          </button>
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-center text-xs font-bold text-slate-500 pb-2">
        Học bằng hình ảnh và đồ vật • Không học vẹt • Vui như chơi game
      </div>
    </div>
  );
};
