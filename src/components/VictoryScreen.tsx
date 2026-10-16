import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Map, Sparkles, Star, Flame, Gift } from 'lucide-react';
import { CompanionRenderer } from './plush/CompanionRenderer';
import { sound } from '../utils/sound';
import { BunnyAccessory } from '../types/math';

interface VictoryScreenProps {
  stars: number; // 1 to 3
  xpEarned: number;
  bestCombo?: number;
  newReward?: BunnyAccessory | null;
  levelNumber: number;
  worldName: string;
  onNextLevel: () => void;
  onReplay: () => void;
  onGoToMap: () => void;
  companionId?: string | null;
  hat?: string;
  glasses?: string;
  shirt?: string;
  backpack?: string;
  item?: string;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  stars,
  xpEarned,
  bestCombo = 0,
  newReward,
  levelNumber,
  worldName,
  onNextLevel,
  onReplay,
  onGoToMap,
  companionId,
  hat,
  glasses,
  shirt,
  backpack,
  item,
}) => {
  const [animatedStars, setAnimatedStars] = useState<number>(0);

  useEffect(() => {
    // Confetti burst
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    } catch {}

    sound.playFanfare();

    if (stars === 3) {
      sound.speak('Xuất sắc! Con đã nhận được ba ngôi sao rực rỡ!');
    } else {
      sound.speak('Tuyệt vời! Con đã hoàn thành thử thách!');
    }

    // Staggered star animation with sounds
    const timer1 = setTimeout(() => {
      setAnimatedStars(1);
      sound.playStar();
    }, 400);

    const timer2 = setTimeout(() => {
      if (stars >= 2) {
        setAnimatedStars(2);
        sound.playStar();
      }
    }, 800);

    const timer3 = setTimeout(() => {
      if (stars >= 3) {
        setAnimatedStars(3);
        sound.playStar();
      }
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [stars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-300 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
        {/* Header Title */}
        <div className="flex items-center justify-center gap-1.5 mb-1 text-amber-600 font-extrabold text-sm uppercase tracking-wide">
          <Sparkles className="w-4 h-4 fill-amber-500" />
          <span>{worldName} • Màn {levelNumber}</span>
          <Sparkles className="w-4 h-4 fill-amber-500" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-amber-900 mb-3">
          {stars === 3 ? '🌟 TUYỆT VỜI!' : '🎉 HOÀN THÀNH!'}
        </h2>

        {/* Mascot & Companion */}
        <div className="my-2 flex items-end justify-center gap-2">
          <CompanionRenderer companionId={companionId ?? 'bunny'} size={140} reaction="CELEBRATE" canSpeakOnClick={false} showBadge={false} accessories={{hat,glasses,shirt,backpack,item}} />
        </div>

        {/* 3 Stars Drop In */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[1, 2, 3].map((starIndex) => (
            <div
              key={starIndex}
              className={`transform transition-all duration-500 ${
                animatedStars >= starIndex
                  ? 'scale-125 rotate-0 opacity-100'
                  : 'scale-50 -rotate-12 opacity-30'
              }`}
            >
              <Star
                className={`w-12 h-12 sm:w-14 sm:h-14 ${
                  animatedStars >= starIndex
                    ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                    : 'text-slate-300 fill-slate-200'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Stats Pills: XP & Combo */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-amber-100 border-2 border-amber-300 text-amber-900 font-black text-sm sm:text-base px-3.5 py-1.5 rounded-2xl flex items-center gap-1 shadow-sm">
            <span>⭐</span>
            <span>+{xpEarned} XP</span>
          </div>

          {bestCombo > 1 && (
            <div className="bg-orange-100 border-2 border-orange-300 text-orange-900 font-black text-sm sm:text-base px-3.5 py-1.5 rounded-2xl flex items-center gap-1 shadow-sm">
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
              <span>Combo: x{bestCombo}</span>
            </div>
          )}
        </div>

        {/* Newly Unlocked Reward Banner if available */}
        {newReward && (
          <div className="mb-4 p-3 bg-white border-2 border-amber-300 rounded-2xl shadow-sm flex items-center justify-center gap-3 animate-pulse">
            <span className="text-3xl">{newReward.emoji}</span>
            <div className="text-left">
              <div className="text-xs font-black text-amber-700 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> MỞ KHÓA VẬT PHẨM MỚI!
              </div>
              <div className="text-sm font-extrabold text-slate-800">{newReward.name}</div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Next Level */}
          <button
            onClick={() => {
              sound.playTap();
              onNextLevel();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-lg shadow-lg active:scale-98 transition flex items-center justify-center gap-2 border-b-4 border-emerald-600 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>MÀN TIẾP THEO</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* Replay */}
            <button
              onClick={() => {
                sound.playTap();
                onReplay();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm active:scale-95 transition flex items-center justify-center gap-1.5 border-2 border-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>CHƠI LẠI</span>
            </button>

            {/* Map */}
            <button
              onClick={() => {
                sound.playTap();
                onGoToMap();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm shadow-sm active:scale-95 transition flex items-center justify-center gap-1.5 border-2 border-amber-300 cursor-pointer"
            >
              <Map className="w-4 h-4" />
              <span>VỀ BẢN ĐỒ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
