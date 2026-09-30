import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Volume2 } from 'lucide-react';
import { UserProgress } from '../../types/math';
import { recordAnswerResult } from '../../utils/storage';
import { sound } from '../../utils/sound';

interface MiniGameBubblePopProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onBack: () => void;
}

interface BubbleRound {
  a: number;
  b: number;
  answer: number;
  bubbles: { id: number; value: number; color: string; popped: boolean }[];
}

const BUBBLE_COLORS = [
  'from-pink-400 to-rose-500 shadow-rose-300',
  'from-sky-400 to-blue-500 shadow-blue-300',
  'from-emerald-400 to-teal-500 shadow-teal-300',
  'from-amber-400 to-orange-500 shadow-orange-300',
];

function generateBubbleRound(): BubbleRound {
  const a = Math.floor(Math.random() * 7) + 3; // 3 to 9
  const b = Math.floor(Math.random() * 7) + 3; // 3 to 9
  const answer = a + b;

  const set = new Set<number>([answer]);
  const offsets = [-2, -1, 1, 2, 3];
  offsets.sort(() => Math.random() - 0.5);

  for (const off of offsets) {
    if (set.size >= 4) break;
    const cand = answer + off;
    if (cand > 0 && cand !== answer) set.add(cand);
  }

  const values = Array.from(set).sort(() => Math.random() - 0.5);
  const bubbles = values.map((val, idx) => ({
    id: idx,
    value: val,
    color: BUBBLE_COLORS[idx % BUBBLE_COLORS.length],
    popped: false,
  }));

  return { a, b, answer, bubbles };
}

export const MiniGameBubblePop: React.FC<MiniGameBubblePopProps> = ({
  progress,
  onUpdateProgress,
  onBack,
}) => {
  const [round, setRound] = useState<BubbleRound>(() => generateBubbleRound());
  const [poppedCount, setPoppedCount] = useState<number>(0);
  const [popFeedback, setPopFeedback] = useState<string | null>(null);
  const speechCancelRef = useRef<(() => void) | null>(null);

  // Auto-read question on new round
  useEffect(() => {
    sound.cancelSpeech();
    if (speechCancelRef.current) speechCancelRef.current();

    speechCancelRef.current = sound.speakQuestion(`${round.a} + ${round.b}`, 400);

    return () => {
      sound.cancelSpeech();
      if (speechCancelRef.current) speechCancelRef.current();
    };
  }, [round.a, round.b]);

  const handleReRead = () => {
    sound.playTap();
    sound.speak(`${round.a} cộng ${round.b} bằng bao nhiêu?`);
  };

  const handlePop = (bubbleId: number, value: number) => {
    sound.playPop();

    if (value === round.answer) {
      sound.playSuccess();
      sound.playStar();
      const praise = sound.speakRandomPraise();
      setPopFeedback(`BÙM! ${praise} 🎉`);

      setRound((prev) => ({
        ...prev,
        bubbles: prev.bubbles.map((b) => (b.id === bubbleId ? { ...b, popped: true } : b)),
      }));

      const result = recordAnswerResult(progress, 'world_3_add_10', true);
      onUpdateProgress(result.updatedProgress);
      setPoppedCount((prev) => prev + 1);

      setTimeout(() => {
        setPopFeedback(null);
        setRound(generateBubbleRound());
      }, 1400);
    } else {
      sound.playGentleRetry();
      const gentle = sound.speakGentleRetry();
      setPopFeedback(gentle);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-indigo-100 flex flex-col justify-between p-4 max-w-2xl mx-auto select-none overflow-hidden relative">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={() => {
            sound.cancelSpeech();
            sound.playTap();
            onBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 font-black rounded-2xl border-2 border-slate-200 shadow-[0_3px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-sky-500" />
          <span>Trở Về</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-sky-400 border-2 border-sky-500 rounded-2xl font-black text-sky-950 text-sm shadow-[0_3px_0_#0284c7]">
            <span>🎈 {poppedCount} Nổ</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 border-2 border-amber-500 rounded-2xl font-black text-amber-950 text-sm shadow-[0_3px_0_#d97706]">
            <Sparkles className="w-4 h-4 fill-amber-100" />
            <span>{progress.totalStars} ⭐</span>
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-4">
        {/* Title & Equation */}
        <div className="text-center mb-6 z-10">
          <div className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-200/80 px-3 py-1 rounded-full inline-block mb-1">
            Trò Chơi 2 • Bắn Bong Bóng Phép Cộng
          </div>
          <div className="flex items-center justify-center gap-3 bg-white/90 backdrop-blur-xs px-6 py-3.5 rounded-3xl border-3 border-sky-300 shadow-xl text-3xl sm:text-5xl font-black text-slate-800">
            <span className="text-blue-600">{round.a}</span>
            <span className="text-pink-500">+</span>
            <span className="text-emerald-600">{round.b}</span>
            <span className="text-slate-400">=</span>
            <span className="text-amber-500">?</span>
            <button
              onClick={handleReRead}
              className="p-2 rounded-2xl bg-sky-100 text-sky-700 hover:bg-sky-200 active:scale-95 transition cursor-pointer"
              title="Đọc lại câu hỏi"
              aria-label="Đọc lại câu hỏi"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {popFeedback && (
            <div className="mt-2 text-base font-black text-sky-800 animate-bounce">
              {popFeedback}
            </div>
          )}
        </div>

        {/* Floating Bubbles Container */}
        <div className="grid grid-cols-2 gap-6 sm:gap-10 p-4 w-full max-w-sm place-items-center">
          {round.bubbles.map((b, idx) => {
            if (b.popped) {
              return (
                <div
                  key={b.id}
                  className="w-28 h-28 rounded-full flex items-center justify-center text-4xl animate-ping"
                >
                  ⭐
                </div>
              );
            }

            const floatDelays = ['animate-float', 'animate-bounce-subtle', 'animate-float', 'animate-bounce-subtle'];
            const anim = floatDelays[idx % floatDelays.length];

            return (
              <button
                key={b.id}
                onClick={() => handlePop(b.id, b.value)}
                className={`w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-gradient-to-tr ${b.color} shadow-xl hover:scale-110 active:scale-90 transition-transform cursor-pointer flex items-center justify-center relative border-4 border-white/60 ${anim}`}
                style={{ animationDuration: `${2.5 + idx * 0.4}s` }}
              >
                {/* Bubble highlight shine */}
                <div className="absolute top-2 left-4 w-7 h-4 bg-white/60 rounded-full rotate-[-30deg] blur-xs" />
                <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-md select-none">
                  {b.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer prompt */}
      <div className="text-center text-xs font-bold text-sky-900/70 pb-2 z-10">
        👆 Chạm vào quả bóng có số đúng để làm bóng nổ tung nhé!
      </div>
    </div>
  );
};
