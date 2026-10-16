import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, Check, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';
import { HeroCharacter } from './HeroCharacter';

interface BossChallengeGate10Props {
  onComplete: (earnedStars: number) => void;
  onExit: () => void;
  hat?: string;
  glasses?: string;
  shirt?: string;
  backpack?: string;
  item?: string;
}

interface QuestionMake10 {
  a: number;
  answer: number; // 10 - a
  choices: number[];
}

export const BossChallengeGate10: React.FC<BossChallengeGate10Props> = ({
  onComplete,
  onExit,
  hat,
  glasses,
  shirt,
  backpack,
  item,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [litGems, setLitGems] = useState<boolean[]>([false, false, false, false, false]);
  const [gateOpen, setGateOpen] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isWobbling, setIsWobbling] = useState<boolean>(false);

  // Generate 5 questions for making 10
  const [questions] = useState<QuestionMake10[]>(() => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Pick 5 distinct numbers
    const shuffled = [...numbers].sort(() => Math.random() - 0.5).slice(0, 5);
    return shuffled.map((a) => {
      const answer = 10 - a;
      // generate 3 choices
      const choicesSet = new Set<number>([answer]);
      while (choicesSet.size < 3) {
        const fake = Math.floor(Math.random() * 9) + 1;
        choicesSet.add(fake);
      }
      return {
        a,
        answer,
        choices: Array.from(choicesSet).sort(() => Math.random() - 0.5),
      };
    });
  });

  const curQ = questions[currentIdx];

  // Auto read prompt
  useEffect(() => {
    if (!gateOpen && curQ) {
      const text = `${curQ.a} cần thêm mấy để tạo thành mười?`;
      const timer = setTimeout(() => {
        sound.speak(text, {
          eventType: 'QUESTION_CHANGED',
          questionId: `gate10-${currentIdx}`,
        });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, curQ?.a, curQ?.answer, gateOpen]);

  const handleSelectChoice = (choice: number) => {
    if (gateOpen || selectedChoice !== null) return;
    setSelectedChoice(choice);

    if (choice === curQ.answer) {
      sound.playSuccess();
      sound.playStar();
      sound.speakRandomPraise({
        questionId: `gate10-${currentIdx}`,
      });

      const newLit = [...litGems];
      newLit[currentIdx] = true;
      setLitGems(newLit);

      if (currentIdx + 1 >= questions.length) {
        // All 5 gems complete!
        setTimeout(() => {
          setGateOpen(true);
          sound.playGateOpen();
          sound.playFanfare();
          sound.speak('Cánh cổng lâu đài số mười đã mở rộng! Con xuất sắc lắm!');
          try {
            confetti({
              particleCount: 100,
              spread: 90,
              origin: { y: 0.5 },
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
        questionId: `gate10-${currentIdx}`,
      });
      setIsWobbling(true);
      setTimeout(() => {
        setIsWobbling(false);
        setSelectedChoice(null);
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-950 to-slate-950 p-4 sm:p-6 text-white flex flex-col items-center justify-between select-none">
      {/* Top Header */}
      <div className="w-full max-w-xl flex items-center justify-between">
        <button
          onClick={onExit}
          className="px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-bold active:scale-95 transition"
        >
          ← Quay lại
        </button>
        <div className="flex items-center gap-1.5 text-amber-300 font-black text-base sm:text-lg">
          <Sparkles className="w-5 h-5 fill-amber-400" />
          <span>THỬ THÁCH: MỞ CỔNG LÂU ĐÀI SỐ 10</span>
        </div>
      </div>

      {/* Main Castle Gate Presentation */}
      <div className="w-full max-w-md my-auto flex flex-col items-center">
        {/* Castle Gate Visual */}
        <div className="relative w-full aspect-[4/3] bg-purple-950/80 border-4 border-amber-400 rounded-3xl p-4 flex flex-col items-center justify-between shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Castle top battlements */}
          <div className="absolute top-0 inset-x-0 h-6 flex justify-around items-start">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-8 h-4 bg-amber-400 rounded-b-md" />
            ))}
          </div>

          {/* 5 Gems bar on gate */}
          <div className="mt-8 flex items-center gap-3 bg-purple-900/90 border-2 border-amber-400/50 px-4 py-2 rounded-2xl shadow-inner">
            {litGems.map((isLit, i) => (
              <div
                key={i}
                className={`text-2xl sm:text-3xl transition-all duration-500 transform ${
                  isLit ? 'scale-125 filter drop-shadow-[0_0_12px_#38BDF8]' : 'opacity-30 grayscale'
                }`}
              >
                💎
              </div>
            ))}
          </div>

          {/* Gate Emblem */}
          {!gateOpen ? (
            <div className="my-auto flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-4 border-white flex items-center justify-center text-4xl font-black text-purple-950 shadow-xl">
                10
              </div>
              <p className="mt-2 text-xs font-bold text-amber-200">Thắp sáng 5 viên ngọc để mở cổng</p>
            </div>
          ) : (
            <div className="my-auto flex flex-col items-center animate-bounce">
              <div className="text-6xl mb-2">🏰✨</div>
              <div className="text-2xl font-black text-amber-300">CỔNG LÂU ĐÀI ĐÃ MỞ!</div>
              <div className="text-sm font-bold text-emerald-300">Con đã nhận được Huy Hiệu Số 10!</div>
            </div>
          )}

          {/* Bunny Character in scene */}
          <div className="absolute bottom-2 right-4">
            <HeroCharacter
              mood={gateOpen ? 'celebrate' : 'happy'}
              size="sm"
              showSpeechBubble={false}
              hat={hat}
              glasses={glasses}
              shirt={shirt}
              backpack={backpack}
              item={item}
            />
          </div>
        </div>

        {/* Question Panel */}
        {!gateOpen && curQ && (
          <div className="w-full mt-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-5 text-center shadow-lg">
            <div className="text-sm font-bold text-amber-200 mb-1 flex items-center justify-center gap-2">
              <span>Câu hỏi {currentIdx + 1}/5</span>
              <button
                onClick={() =>
                  sound.speak(`${curQ.a} cần thêm mấy để tạo thành 10?`, {
                    eventType: 'REPLAY',
                    questionId: `gate10-${currentIdx}`,
                    forceReplay: true,
                  })
                }
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-amber-300"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-white my-3">
              {curQ.a} + <span className="text-amber-300 border-b-4 border-amber-400 px-2">?</span> = 10
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
                        : 'bg-white hover:bg-amber-100 text-purple-950 border-slate-300'
                    }`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Victory Button */}
        {gateOpen && (
          <div className="w-full mt-6 flex flex-col items-center gap-3">
            <button
              onClick={() => onComplete(3)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-purple-950 font-black text-xl shadow-xl active:scale-95 transition flex items-center justify-center gap-2 border-b-4 border-amber-600 cursor-pointer animate-pulse"
            >
              <span>NHẬN HUY HIỆU & HOÀN THÀNH</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      <div className="h-4" />
    </div>
  );
};
