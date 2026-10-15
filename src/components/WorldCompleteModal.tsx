import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';
import { HeroCharacter } from './HeroCharacter';

interface WorldCompleteModalProps {
  worldName: string;
  worldAdventureName: string;
  worldIcon: string;
  nextWorldName?: string;
  onContinue: () => void;
  hat?: string;
  glasses?: string;
  shirt?: string;
  backpack?: string;
  item?: string;
}

export const WorldCompleteModal: React.FC<WorldCompleteModalProps> = ({
  worldAdventureName,
  worldIcon,
  nextWorldName,
  onContinue,
  hat,
  glasses,
  shirt,
  backpack,
  item,
}) => {
  useEffect(() => {
    sound.playFanfare();
    sound.speak(`Tuyệt vời! Con đã chinh phục trọn vẹn ${worldAdventureName}! Thế giới mới đã mở ra!`);

    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    } catch {}
  }, [worldAdventureName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-amber-50 to-orange-100 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
        {/* Confetti / Sparkle decor */}
        <div className="text-5xl mb-2 animate-bounce">🏆</div>

        <div className="inline-block px-3 py-1 rounded-full bg-amber-200 text-amber-900 font-black text-xs uppercase mb-2">
          CHINH PHỤC THÀNH CÔNG
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 leading-tight mb-1">
          CON ĐÃ CHINH PHỤC
        </h2>
        <div className="text-xl sm:text-2xl font-black text-amber-600 mb-4 flex items-center justify-center gap-2">
          <span>{worldIcon}</span>
          <span>{worldAdventureName.toUpperCase()}!</span>
        </div>

        {/* Bunny in Celebration */}
        <div className="my-3 flex justify-center">
          <HeroCharacter
            mood="celebrate"
            size="md"
            showSpeechBubble={false}
            hat={hat}
            glasses={glasses}
            shirt={shirt}
            backpack={backpack}
            item={item}
          />
        </div>

        {/* Next world preview badge */}
        {nextWorldName && (
          <div className="my-4 p-3 bg-white/90 border-2 border-emerald-300 rounded-2xl shadow-sm">
            <div className="text-xs font-bold text-slate-500">Thế giới tiếp theo đã mở khóa:</div>
            <div className="text-base font-black text-emerald-700 flex items-center justify-center gap-1.5 mt-0.5">
              <Sparkles className="w-4 h-4 fill-emerald-500" />
              <span>{nextWorldName}</span>
              <Sparkles className="w-4 h-4 fill-emerald-500" />
            </div>
          </div>
        )}

        <button
          onClick={() => {
            sound.playTap();
            onContinue();
          }}
          className="w-full mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-xl active:scale-95 transition flex items-center justify-center gap-2 border-b-4 border-emerald-700 cursor-pointer"
        >
          <span>TIẾP TỤC HÀNH TRÌNH</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
