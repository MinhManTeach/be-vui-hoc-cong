import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Volume2 } from 'lucide-react';
import { UserProgress } from '../../types/math';
import { BunnyCharacter } from '../../components/BunnyCharacter';
import { recordAnswerResult } from '../../utils/storage';
import { sound } from '../../utils/sound';

interface MiniGameRabbitCarrotProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onBack: () => void;
}

interface CarrotRound {
  a: number;
  b: number;
  answer: number;
  choices: number[];
}

function generateCarrotRound(): CarrotRound {
  const a = Math.floor(Math.random() * 8) + 2; // 2 to 9
  const b = Math.floor(Math.random() * 8) + 2; // 2 to 9
  const answer = a + b;
  const offsets = [-1, 1, -2, 2];
  const distractors = offsets
    .map((off) => answer + off)
    .filter((n) => n > 0 && n !== answer)
    .slice(0, 2);

  const choices = [answer, ...distractors].sort(() => Math.random() - 0.5);
  return { a, b, answer, choices };
}

export const MiniGameRabbitCarrot: React.FC<MiniGameRabbitCarrotProps> = ({
  progress,
  onUpdateProgress,
  onBack,
}) => {
  const [round, setRound] = useState<CarrotRound>(() => generateCarrotRound());
  const [bunnyMood, setBunnyMood] = useState<'idle' | 'happy' | 'cheer' | 'eating' | 'thinking'>('idle');
  const [speech, setSpeech] = useState<string>('Thỏ Bông đói bụng quá! Cho Thỏ ăn củ cà rốt đúng nhé!');
  const [eatenCarrots, setEatenCarrots] = useState<number>(0);
  const [showHearts, setShowHearts] = useState<boolean>(false);
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

  const handleFeedCarrot = (chosenNumber: number) => {
    sound.playTap();

    if (chosenNumber === round.answer) {
      sound.playChomp();
      sound.playSuccess();
      setBunnyMood('eating');
      setShowHearts(true);
      setSpeech('Ngon quá! Cà rốt giòn ngọt quá! Cảm ơn con nhé! 🥕😋');
      sound.speak('Ngon quá! Cà rốt giòn ngọt quá! Cảm ơn con nhé!');

      const result = recordAnswerResult(progress, 'world_3_add_10', true);
      onUpdateProgress(result.updatedProgress);
      setEatenCarrots((prev) => prev + 1);

      setTimeout(() => {
        setBunnyMood('happy');
        setShowHearts(false);
        setRound(generateCarrotRound());
        setSpeech('Cho Thỏ ăn thêm củ nữa nào!');
      }, 1800);
    } else {
      sound.playGentleRetry();
      setBunnyMood('thinking');
      const gentle = sound.speakGentleRetry();
      setSpeech(gentle);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col justify-between p-4 max-w-2xl mx-auto select-none">
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
          <ArrowLeft className="w-5 h-5 text-amber-500" />
          <span>Trở Về</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-400 border-2 border-orange-500 rounded-2xl font-black text-orange-950 text-sm shadow-[0_3px_0_#c2410c]">
            <span>🥕 {eatenCarrots} Củ</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 border-2 border-amber-500 rounded-2xl font-black text-amber-950 text-sm shadow-[0_3px_0_#d97706]">
            <Sparkles className="w-4 h-4 fill-amber-100" />
            <span>{progress.totalStars} ⭐</span>
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        {/* Title & Equation */}
        <div className="text-center mb-4">
          <div className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-3 py-1 rounded-full inline-block mb-1">
            Trò Chơi 1 • Cho Thỏ Ăn Cà Rốt
          </div>
          <div className="flex items-center justify-center gap-3 bg-white px-6 py-3 rounded-3xl border-3 border-orange-300 shadow-lg text-3xl sm:text-4xl font-black text-slate-800">
            <span className="text-orange-600">{round.a}</span>
            <span className="text-amber-500">+</span>
            <span className="text-emerald-600">{round.b}</span>
            <span className="text-slate-400">=</span>
            <span className="text-rose-500">?</span>
            <button
              onClick={handleReRead}
              className="p-2 rounded-2xl bg-orange-100 text-orange-700 hover:bg-orange-200 active:scale-95 transition cursor-pointer"
              title="Đọc lại câu hỏi"
              aria-label="Đọc lại câu hỏi"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bunny Area with Eating Animation */}
        <div className="relative my-2">
          {showHearts && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2 animate-bounce text-2xl z-20">
              <span>💖</span>
              <span>🥕</span>
              <span>✨</span>
            </div>
          )}
          <BunnyCharacter
            mood={bunnyMood}
            speechText={speech}
            size="lg"
            hat={progress.equippedAccessories.hat}
            glasses={progress.equippedAccessories.glasses}
          />
        </div>

        {/* 3 Carrots to choose */}
        <div className="w-full mt-4">
          <div className="text-center text-xs font-bold text-slate-500 mb-3">
            👇 Bấm vào củ cà rốt có số đúng để đút cho Thỏ Bông:
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {round.choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleFeedCarrot(choice)}
                className="group relative flex flex-col items-center justify-center p-3 rounded-3xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {/* Carrot SVG */}
                <div className="relative w-20 sm:w-24 h-28 sm:h-32 flex items-center justify-center drop-shadow-lg group-hover:-translate-y-2 transition-transform">
                  <svg viewBox="0 0 100 130" className="w-full h-full">
                    {/* Leaf */}
                    <path d="M50 30 C45 10 30 15 25 5 C35 15 45 25 50 30 Z" fill="#22C55E" />
                    <path d="M50 30 C50 5 55 5 50 0 C45 10 48 20 50 30 Z" fill="#16A34A" />
                    <path d="M50 30 C55 10 70 15 75 5 C65 15 55 25 50 30 Z" fill="#22C55E" />
                    {/* Carrot Body */}
                    <path d="M20 30 Q50 25 80 30 Q65 90 50 125 Q35 90 20 30 Z" fill="#F97316" stroke="#EA580C" strokeWidth="3" />
                    <line x1="32" y1="50" x2="55" y2="50" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="45" y1="70" x2="68" y2="70" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="38" y1="90" x2="60" y2="90" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  {/* Big Number inside Carrot */}
                  <div className="absolute inset-0 flex items-center justify-center pt-4">
                    <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {choice}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer advice */}
      <div className="text-center text-xs font-bold text-amber-800/70 pb-2">
        Mỗi củ cà rốt đúng sẽ giúp bạn Thỏ thêm no bụng và tặng bé 1 ⭐!
      </div>
    </div>
  );
};
