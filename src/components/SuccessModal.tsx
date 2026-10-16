import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, RotateCcw, Home, Sparkles } from 'lucide-react';
import { HeroCharacter } from './HeroCharacter';
import { sound } from '../utils/sound';

interface SuccessModalProps {
  isOpen: boolean;
  starsEarned: number;
  totalCorrect?: number;
  totalQuestions?: number;
  message?: string;
  onNext: () => void;
  onReplay: () => void;
  onGoHome: () => void;
  rewardUnlockedName?: string;
  rewardUnlockedEmoji?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  starsEarned,
  totalCorrect,
  totalQuestions,
  message = 'XUẤT SẮC! Con đã hoàn thành bài học!',
  onNext,
  onReplay,
  onGoHome,
  rewardUnlockedName,
  rewardUnlockedEmoji,
}) => {
  useEffect(() => {
    if (isOpen) {
      sound.playFanfare();
      sound.speak(message);
      // Shoot celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
        });
      } catch {
        // Fallback
      }
    }
  }, [isOpen, message]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow backdrop circle */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-200/50 rounded-full blur-2xl -z-0" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-rose-200/50 rounded-full blur-2xl -z-0" />

        {/* Bunny cheering */}
        <HeroCharacter
          mood="cheer"
          size="md"
          showSpeechBubble={false}
          className="mb-1"
        />

        <h2 className="text-2xl sm:text-3xl font-black text-amber-600 mb-2 mt-1 drop-shadow-xs">
          🎉 XUẤT SẮC!
        </h2>
        <p className="text-slate-700 font-bold text-base sm:text-lg mb-4">
          {message}
        </p>

        {/* Score & Stars Display */}
        <div className="flex items-center gap-3 bg-amber-100/90 border-2 border-amber-300 rounded-2xl px-5 py-3 mb-5 shadow-sm">
          {totalCorrect !== undefined && totalQuestions !== undefined && (
            <div className="text-sm font-black text-amber-900 pr-3 border-r-2 border-amber-300">
              Đúng: {totalCorrect}/{totalQuestions}
            </div>
          )}
          <div className="flex items-center gap-2 font-black text-amber-700 text-lg sm:text-xl">
            <Sparkles className="w-6 h-6 fill-amber-500 text-amber-500 animate-spin" />
            <span>+{starsEarned} Sao</span>
          </div>
        </div>

        {/* Unlocked Reward Badge if any */}
        {rewardUnlockedName && (
          <div className="mb-5 p-3 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl flex items-center gap-3 animate-pulse">
            <span className="text-3xl">{rewardUnlockedEmoji || '🎁'}</span>
            <div className="text-left">
              <span className="text-xs font-black text-purple-600 block uppercase">
                Mở khóa phần thưởng mới!
              </span>
              <span className="text-sm font-black text-purple-900">
                {rewardUnlockedName}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
          <button
            onClick={() => {
              sound.playTap();
              onNext();
            }}
            className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-[0_5px_0_#059669] active:translate-y-1 active:shadow-none transition flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <span>Học Tiếp</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onReplay();
            }}
            className="py-3 px-4 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-2xl shadow-[0_5px_0_#d97706] active:translate-y-1 active:shadow-none transition flex items-center justify-center gap-1.5 text-base cursor-pointer"
            title="Chơi lại"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="sm:hidden">Chơi Lại</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onGoHome();
            }}
            className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-2xl shadow-[0_5px_0_#94a3b8] active:translate-y-1 active:shadow-none transition flex items-center justify-center gap-1.5 text-base cursor-pointer"
            title="Về trang chủ"
          >
            <Home className="w-5 h-5" />
            <span className="sm:hidden">Trang Chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
