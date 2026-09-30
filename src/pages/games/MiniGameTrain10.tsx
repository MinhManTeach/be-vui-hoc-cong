import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Volume2 } from 'lucide-react';
import { UserProgress } from '../../types/math';
import { recordAnswerResult } from '../../utils/storage';
import { sound } from '../../utils/sound';
import { numberToVietnamese } from '../../utils/speechService';

interface MiniGameTrain10Props {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onBack: () => void;
}

interface TrainRound {
  firstCarNumber: number;
  answer: number;
  choices: number[];
}

function generateTrainRound(): TrainRound {
  const firstCarNumber = Math.floor(Math.random() * 9) + 1; // 1 to 9
  const answer = 10 - firstCarNumber;

  const choicesSet = new Set<number>([answer]);
  while (choicesSet.size < 3) {
    const r = Math.floor(Math.random() * 9) + 1;
    if (r !== answer) choicesSet.add(r);
  }

  const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);
  return { firstCarNumber, answer, choices };
}

export const MiniGameTrain10: React.FC<MiniGameTrain10Props> = ({
  progress,
  onUpdateProgress,
  onBack,
}) => {
  const [round, setRound] = useState<TrainRound>(() => generateTrainRound());
  const [trainRuns, setTrainRuns] = useState<number>(0);
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [selectedWagon, setSelectedWagon] = useState<number | null>(null);
  const speechCancelRef = useRef<(() => void) | null>(null);

  // Auto-read question on new round
  useEffect(() => {
    sound.cancelSpeech();
    if (speechCancelRef.current) speechCancelRef.current();

    const text = `Toa tàu có số ${numberToVietnamese(round.firstCarNumber)}. Cần thêm mấy để tạo thành mười?`;
    speechCancelRef.current = sound.speakQuestion(text, 400);

    return () => {
      sound.cancelSpeech();
      if (speechCancelRef.current) speechCancelRef.current();
    };
  }, [round.firstCarNumber]);

  const handleReRead = () => {
    sound.playTap();
    sound.speak(`Toa tàu có số ${numberToVietnamese(round.firstCarNumber)}. Cần thêm mấy để tạo thành mười?`);
  };

  const handleSelectWagon = (chosenVal: number) => {
    sound.playTap();

    if (chosenVal === round.answer) {
      setSelectedWagon(chosenVal);
      sound.playTrainToot();
      sound.playSuccess();
      setIsDriving(true);
      sound.speak(`Đúng rồi! ${numberToVietnamese(round.firstCarNumber)} cộng ${numberToVietnamese(chosenVal)} bằng mười! Đoàn tàu khởi hành nào!`);

      const result = recordAnswerResult(progress, 'world_4_make_10', true);
      onUpdateProgress(result.updatedProgress);
      setTrainRuns((prev) => prev + 1);

      setTimeout(() => {
        setIsDriving(false);
        setSelectedWagon(null);
        setRound(generateTrainRound());
      }, 2200);
    } else {
      sound.playGentleRetry();
      sound.speak('Chưa đúng rồi! Con tìm toa khác để gộp đủ mười nhé!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-emerald-50 to-green-100 flex flex-col justify-between p-4 max-w-2xl mx-auto select-none overflow-hidden">
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
          <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 border-2 border-emerald-600 rounded-2xl font-black text-white text-sm shadow-[0_3px_0_#047857]">
            <span>🚂 {trainRuns} Chuyến</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 border-2 border-amber-500 rounded-2xl font-black text-amber-950 text-sm shadow-[0_3px_0_#d97706]">
            <Sparkles className="w-4 h-4 fill-amber-100" />
            <span>{progress.totalStars} ⭐</span>
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        {/* Title */}
        <div className="text-center mb-4">
          <div className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-3 py-1 rounded-full inline-block mb-1">
            Trò Chơi 3 • Đoàn Tàu Số 10
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 flex items-center justify-center gap-2">
            <span>Tìm toa tàu để tạo thành 10!</span>
            <button
              onClick={handleReRead}
              className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:scale-95 transition cursor-pointer"
              title="Đọc lại câu hỏi"
              aria-label="Đọc lại câu hỏi"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Train Illustration on Track */}
        <div className={`w-full max-w-xl py-6 flex items-center justify-center transition-transform duration-1000 ${isDriving ? 'translate-x-full opacity-80' : ''}`}>
          <div className="flex items-end gap-1 sm:gap-2">
            {/* Locomotive Head */}
            <div className="flex flex-col items-center relative">
              {/* Smoke puff */}
              {isDriving && (
                <div className="absolute -top-6 right-4 flex gap-1 animate-bounce">
                  <span className="text-xl">💨</span>
                  <span className="text-lg">💨</span>
                </div>
              )}
              <div className="w-24 sm:w-28 h-20 sm:h-24 bg-rose-600 rounded-t-3xl rounded-l-md border-3 border-rose-800 shadow-md flex flex-col items-center justify-center text-white relative">
                <div className="absolute -top-4 right-3 w-5 h-5 bg-slate-800 rounded-t-sm" />
                <span className="text-xs font-black uppercase tracking-wider">ĐẦU TÀU</span>
                <span className="text-2xl sm:text-3xl font-black">10</span>
              </div>
              {/* Wheels */}
              <div className="flex gap-4 -mt-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600" />
                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600" />
              </div>
            </div>

            {/* Wagon 1 (Given number) */}
            <div className="flex flex-col items-center">
              <div className="w-20 sm:w-24 h-16 sm:h-20 bg-amber-500 rounded-2xl border-3 border-amber-700 shadow-md flex flex-col items-center justify-center text-white">
                <span className="text-xs font-bold text-amber-100">Toa 1</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-950">
                  {round.firstCarNumber}
                </span>
              </div>
              <div className="flex gap-4 -mt-2">
                <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600" />
                <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600" />
              </div>
            </div>

            {/* Link symbol */}
            <span className="text-2xl font-black text-slate-700 pb-4">+</span>

            {/* Wagon 2 (Slot to attach) */}
            <div className="flex flex-col items-center">
              <div className={`w-20 sm:w-24 h-16 sm:h-20 rounded-2xl border-3 flex flex-col items-center justify-center ${
                selectedWagon !== null
                  ? 'bg-blue-500 border-blue-700 text-white shadow-md'
                  : 'bg-white/80 border-dashed border-slate-400 text-slate-400'
              }`}>
                <span className="text-xs font-bold">Toa 2</span>
                <span className="text-2xl sm:text-3xl font-black">
                  {selectedWagon !== null ? selectedWagon : '?'}
                </span>
              </div>
              <div className="flex gap-4 -mt-2">
                <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600" />
                <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Railway tracks */}
        <div className="w-full max-w-lg h-3 bg-slate-700 rounded-full my-2 flex items-center justify-around px-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-1.5 h-5 bg-amber-900 rounded-xs -mt-1" />
          ))}
        </div>

        {/* Wagon choices */}
        <div className="w-full mt-6">
          <div className="text-center text-xs font-bold text-slate-600 mb-3">
            👇 Chọn toa có số phù hợp để nối vào tàu nhé:
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6">
            {round.choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleSelectWagon(choice)}
                className="w-20 sm:w-24 h-20 sm:h-24 bg-sky-500 hover:bg-sky-400 text-white rounded-3xl border-3 border-sky-700 shadow-[0_5px_0_#0369a1] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center cursor-pointer"
              >
                <span className="text-xs font-bold opacity-80">Toa số</span>
                <span className="text-3xl font-black">{choice}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs font-bold text-emerald-800/70 pb-2">
        Toa {round.firstCarNumber} + Toa ? = 10
      </div>
    </div>
  );
};
