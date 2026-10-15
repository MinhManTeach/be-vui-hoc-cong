import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, Rocket, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';
import { HeroCharacter } from './HeroCharacter';

interface BossChallengeRocket10Props {
  onComplete: (earnedStars: number) => void;
  onExit: () => void;
  hat?: string;
  glasses?: string;
  shirt?: string;
  backpack?: string;
  item?: string;
}

interface QuestionOver10 {
  a: number;
  b: number;
  needToMake10: number;
  remainder: number;
  answer: number;
  choices: number[];
}

export const BossChallengeRocket10: React.FC<BossChallengeRocket10Props> = ({
  onComplete,
  onExit,
  hat,
  glasses,
  shirt,
  backpack,
  item,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [fuelPercent, setFuelPercent] = useState<number>(0);
  const [isLaunched, setIsLaunched] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isWobbling, setIsWobbling] = useState<boolean>(false);

  // Generate 5 questions for making 10 first
  const [questions] = useState<QuestionOver10[]>(() => {
    const list = [
      { a: 9, b: 4, needToMake10: 1, remainder: 3, answer: 13 },
      { a: 8, b: 5, needToMake10: 2, remainder: 3, answer: 13 },
      { a: 7, b: 5, needToMake10: 3, remainder: 2, answer: 12 },
      { a: 8, b: 6, needToMake10: 2, remainder: 4, answer: 14 },
      { a: 9, b: 6, needToMake10: 1, remainder: 5, answer: 15 },
    ];
    return list.map((q) => {
      const choicesSet = new Set<number>([q.answer]);
      while (choicesSet.size < 3) {
        const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1);
        const fake = q.answer + offset;
        if (fake >= 11 && fake <= 18) choicesSet.add(fake);
      }
      return {
        ...q,
        choices: Array.from(choicesSet).sort(() => Math.random() - 0.5),
      };
    });
  });

  const curQ = questions[currentIdx];

  // Auto read prompt
  useEffect(() => {
    if (!isLaunched && curQ) {
      const text = `${curQ.a} cộng ${curQ.b} bằng bao nhiêu? Hãy tạo thành 10 trước nhé!`;
      const timer = setTimeout(() => {
        sound.speak(text, {
          eventType: 'QUESTION_CHANGED',
          questionId: `rocket10-${currentIdx}`,
        });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, curQ?.a, curQ?.b, isLaunched]);

  const handleSelectChoice = (choice: number) => {
    if (isLaunched || selectedChoice !== null) return;
    setSelectedChoice(choice);

    if (choice === curQ.answer) {
      sound.playSuccess();
      sound.playStar();
      sound.speakRandomPraise({
        questionId: `rocket10-${currentIdx}`,
      });

      const newPercent = fuelPercent + 20;
      setFuelPercent(newPercent);

      if (currentIdx + 1 >= questions.length) {
        // Rocket ready to launch!
        setTimeout(() => {
          setIsLaunched(true);
          sound.playRocketLaunch();
          sound.playFanfare();
          sound.speak('Năng lượng đã đầy 100%! Tên lửa bay lên vũ trụ! Con là bậc thầy tính nhẩm!');
          try {
            confetti({
              particleCount: 110,
              spread: 100,
              origin: { y: 0.4 },
              colors: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
            });
          } catch {}
        }, 800);
      } else {
        setTimeout(() => {
          setSelectedChoice(null);
          setCurrentIdx((prev) => prev + 1);
        }, 900);
      }
    } else {
      sound.playGentleRetry();
      sound.speakGentleRetry({
        questionId: `rocket10-${currentIdx}`,
      });
      setIsWobbling(true);
      setTimeout(() => {
        setIsWobbling(false);
        setSelectedChoice(null);
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 p-4 sm:p-6 text-white flex flex-col items-center justify-between select-none">
      {/* Top Header */}
      <div className="w-full max-w-xl flex items-center justify-between">
        <button
          onClick={onExit}
          className="px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-bold active:scale-95 transition"
        >
          ← Quay lại
        </button>
        <div className="flex items-center gap-1.5 text-cyan-300 font-black text-base sm:text-lg">
          <Rocket className="w-5 h-5 text-cyan-400" />
          <span>THỬ THÁCH: NẠP NĂNG LƯỢNG TÊN LỬA</span>
        </div>
      </div>

      {/* Main Presentation */}
      <div className="w-full max-w-md my-auto flex flex-col items-center">
        {/* Launchpad Visual */}
        <div className="relative w-full aspect-[4/3] bg-slate-900/80 border-4 border-cyan-400 rounded-3xl p-5 flex flex-col items-center justify-between shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Starry space background */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <span className="absolute top-4 left-6 text-xs">✨</span>
            <span className="absolute top-12 right-12 text-sm">⭐</span>
            <span className="absolute bottom-16 left-10 text-xs">🪐</span>
            <span className="absolute top-8 left-1/2 text-xs">✨</span>
          </div>

          {/* Rocket visualization */}
          <div className={`my-auto transition-transform duration-1000 ${isLaunched ? '-translate-y-48 scale-110' : 'animate-bounce-subtle'}`}>
            <div className="text-7xl sm:text-8xl">🚀</div>
            {isLaunched && <div className="text-3xl text-center animate-ping">🔥</div>}
          </div>

          {/* Fuel Progress Bar */}
          <div className="w-full z-10">
            <div className="flex items-center justify-between text-xs font-black text-cyan-200 mb-1">
              <span>NĂNG LƯỢNG TÊN LỬA</span>
              <span>{fuelPercent}%</span>
            </div>
            <div className="w-full h-4 bg-slate-800 rounded-full border-2 border-cyan-400 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-full transition-all duration-500 shadow-[0_0_10px_#38BDF8]"
                style={{ width: `${fuelPercent}%` }}
              />
            </div>
          </div>

          {/* Bunny mascot */}
          <div className="absolute bottom-2 right-4">
            <HeroCharacter
              mood={isLaunched ? 'celebrate' : 'happy'}
              size="sm"
              showSpeechBubble={false}
              hat={hat || 'hat_astronaut'}
              glasses={glasses}
              shirt={shirt || 'shirt_space'}
              backpack={backpack}
              item={item}
            />
          </div>
        </div>

        {/* Question Panel */}
        {!isLaunched && curQ && (
          <div className="w-full mt-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-5 text-center shadow-lg">
            <div className="text-xs font-bold text-cyan-300 mb-1 flex items-center justify-center gap-2">
              <span>Nhiệm vụ {currentIdx + 1}/5: Tạo 10 trước!</span>
              <button
                onClick={() =>
                  sound.speak(`${curQ.a} cộng ${curQ.b} bằng bao nhiêu?`, {
                    eventType: 'REPLAY',
                    questionId: `rocket10-${currentIdx}`,
                    forceReplay: true,
                  })
                }
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-cyan-300"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Formula */}
            <div className="text-3xl sm:text-4xl font-black text-white my-2">
              {curQ.a} + {curQ.b} = ?
            </div>

            {/* Kid Strategy Hint */}
            <div className="inline-block bg-cyan-950/80 border border-cyan-400/50 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-200 my-1">
              {curQ.a} + {curQ.needToMake10} = 10, rồi 10 + {curQ.remainder} = ?
            </div>

            {/* Answer Choices */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {curQ.choices.map((choice) => {
                const isSelected = selectedChoice === choice;
                const isCorrect = isSelected && choice === curQ.answer;

                return (
                  <button
                    key={choice}
                    onClick={() => handleSelectChoice(choice)}
                    className={`py-4 rounded-2xl font-black text-2xl sm:text-3xl shadow-lg border-b-4 transition transform active:scale-95 cursor-pointer ${
                      isWobbling && isSelected
                        ? 'bg-rose-500 border-rose-700 text-white animate-wiggle'
                        : isCorrect
                        ? 'bg-emerald-500 border-emerald-700 text-white scale-105'
                        : 'bg-white hover:bg-cyan-100 text-slate-900 border-slate-300'
                    }`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Launch Victory Button */}
        {isLaunched && (
          <div className="w-full mt-6 flex flex-col items-center gap-3">
            <button
              onClick={() => onComplete(3)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black text-xl shadow-xl active:scale-95 transition flex items-center justify-center gap-2 border-b-4 border-cyan-700 cursor-pointer animate-pulse"
            >
              <span>CHINH PHỤC VŨ TRỤ THÀNH CÔNG!</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
};
