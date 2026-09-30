import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Volume2 } from 'lucide-react';
import { UserProgress } from '../../types/math';
import { recordAnswerResult } from '../../utils/storage';
import { sound } from '../../utils/sound';

interface MiniGameAppleTreeProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onBack: () => void;
}

interface TreeRound {
  a: number;
  b: number;
  answer: number;
  apples: { id: number; value: number; x: number; y: number; harvested: boolean }[];
}

function generateTreeRound(): TreeRound {
  const a = Math.floor(Math.random() * 6) + 4; // 4 to 9
  const b = Math.floor(Math.random() * 6) + 2; // 2 to 7
  const answer = a + b;

  const choicesSet = new Set<number>([answer]);
  const offsets = [-1, 1, -2, 2];
  offsets.sort(() => Math.random() - 0.5);

  for (const off of offsets) {
    if (choicesSet.size >= 3) break;
    const cand = answer + off;
    if (cand > 0 && cand !== answer) choicesSet.add(cand);
  }

  const values = Array.from(choicesSet).sort(() => Math.random() - 0.5);
  // Positions inside tree foliage
  const positions = [
    { x: 25, y: 35 },
    { x: 50, y: 20 },
    { x: 75, y: 35 },
  ];

  const apples = values.map((val, idx) => ({
    id: idx,
    value: val,
    x: positions[idx].x,
    y: positions[idx].y,
    harvested: false,
  }));

  return { a, b, answer, apples };
}

export const MiniGameAppleTree: React.FC<MiniGameAppleTreeProps> = ({
  progress,
  onUpdateProgress,
  onBack,
}) => {
  const [round, setRound] = useState<TreeRound>(() => generateTreeRound());
  const [harvestedCount, setHarvestedCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);
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

  const handlePickApple = (appleId: number, val: number) => {
    sound.playTap();

    if (val === round.answer) {
      sound.playSuccess();
      sound.playPop();
      const praise = sound.speakRandomPraise();
      setFeedback(`Táo rơi vào giỏ rồi! ${praise} 🍎🧺`);

      setRound((prev) => ({
        ...prev,
        apples: prev.apples.map((ap) => (ap.id === appleId ? { ...ap, harvested: true } : ap)),
      }));

      const result = recordAnswerResult(progress, 'world_6_over_10', true);
      onUpdateProgress(result.updatedProgress);
      setHarvestedCount((prev) => prev + 1);

      setTimeout(() => {
        setFeedback(null);
        setRound(generateTreeRound());
      }, 1600);
    } else {
      sound.playGentleRetry();
      const gentle = sound.speakGentleRetry();
      setFeedback(gentle);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-green-50 to-emerald-100 flex flex-col justify-between p-4 max-w-2xl mx-auto select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.cancelSpeech();
            sound.playTap();
            onBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 font-black rounded-2xl border-2 border-slate-200 shadow-[0_3px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-emerald-600" />
          <span>Trở Về</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 border-2 border-rose-600 rounded-2xl font-black text-white text-sm shadow-[0_3px_0_#be123c]">
            <span>🍎 {harvestedCount} Quả</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 border-2 border-amber-500 rounded-2xl font-black text-amber-950 text-sm shadow-[0_3px_0_#d97706]">
            <Sparkles className="w-4 h-4 fill-amber-100" />
            <span>{progress.totalStars} ⭐</span>
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        {/* Title & Equation */}
        <div className="text-center mb-3">
          <div className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-3 py-1 rounded-full inline-block mb-1">
            Trò Chơi 4 • Cây Táo Thông Minh
          </div>
          <div className="flex items-center justify-center gap-3 bg-white/95 px-6 py-2.5 rounded-3xl border-3 border-emerald-300 shadow-md text-3xl sm:text-4xl font-black text-slate-800">
            <span className="text-rose-600">{round.a}</span>
            <span className="text-amber-500">+</span>
            <span className="text-emerald-600">{round.b}</span>
            <span className="text-slate-400">=</span>
            <span className="text-amber-500">?</span>
            <button
              onClick={handleReRead}
              className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:scale-95 transition cursor-pointer"
              title="Đọc lại câu hỏi"
              aria-label="Đọc lại câu hỏi"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {feedback && (
            <div className="mt-2 text-sm font-black text-emerald-800 animate-bounce">
              {feedback}
            </div>
          )}
        </div>

        {/* Tree Graphic with Interactive Apples */}
        <div className="relative w-72 sm:w-88 h-72 sm:h-88 my-2">
          {/* Trunk */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-32 bg-amber-800 rounded-t-lg border-x-4 border-amber-950" />

          {/* Foliage Green Canopy */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-56 sm:h-64 bg-emerald-500 rounded-full border-4 border-emerald-600 shadow-xl flex items-center justify-center">
            {/* Texture circles */}
            <div className="absolute top-4 left-6 w-24 h-24 bg-emerald-400 rounded-full opacity-60" />
            <div className="absolute top-8 right-6 w-28 h-28 bg-emerald-400 rounded-full opacity-60" />
          </div>

          {/* Apples on tree */}
          {round.apples.map((ap) => {
            if (ap.harvested) return null;

            return (
              <button
                key={ap.id}
                onClick={() => handlePickApple(ap.id, ap.value)}
                style={{ left: `${ap.x}%`, top: `${ap.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                title={`Hái quả táo ${ap.value}`}
              >
                <div className="relative w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center filter drop-shadow-md">
                  {/* Apple SVG */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Stem & Leaf */}
                    <path d="M50 20 Q55 5 45 0" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M50 15 Q65 10 65 20 Q55 25 50 15 Z" fill="#22C55E" />
                    {/* Apple Body */}
                    <path d="M50 25 C20 20 10 45 20 70 C30 95 45 95 50 85 C55 95 70 95 80 70 C90 45 80 20 50 25 Z" fill="#EF4444" stroke="#DC2626" strokeWidth="3" />
                  </svg>
                  {/* Number label */}
                  <span className="absolute inset-0 flex items-center justify-center pt-2 text-xl sm:text-2xl font-black text-white drop-shadow-md">
                    {ap.value}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Basket at tree base */}
          <div className="absolute bottom-2 right-4 flex flex-col items-center animate-bounce-subtle">
            <span className="text-4xl">🧺</span>
            <span className="text-[10px] font-black text-amber-900 bg-white/80 px-2 rounded-full">
              Giỏ táo ({harvestedCount})
            </span>
          </div>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="text-center text-xs font-bold text-emerald-900/70 pb-2">
        👇 Chạm vào quả táo có đáp án đúng để hái vào giỏ nhé!
      </div>
    </div>
  );
};
