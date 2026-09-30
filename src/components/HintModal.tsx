import React from 'react';
import { Lightbulb, Volume2, X } from 'lucide-react';
import { Question } from '../types/math';
import { TenFrame } from './TenFrame';
import { BunnyCharacter } from './BunnyCharacter';
import { sound } from '../utils/sound';

interface HintModalProps {
  isOpen: boolean;
  question: Question;
  onClose: () => void;
  hat?: string;
  glasses?: string;
  shirt?: string;
  backpack?: string;
  item?: string;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  question,
  onClose,
  hat,
  glasses,
  shirt,
  backpack,
  item,
}) => {
  if (!isOpen) return null;

  const handleSpeakHint = () => {
    if (question.hintExplanation) {
      sound.speak(question.hintExplanation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-amber-50 rounded-3xl p-5 sm:p-7 max-w-lg w-full border-4 border-amber-400 shadow-2xl relative flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-700 transition cursor-pointer"
          aria-label="Đóng gợi ý"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Bulb */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-amber-400 rounded-2xl shadow-sm text-amber-950">
            <Lightbulb className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-900">
            Thỏ Bông Mách Nhỏ Nè!
          </h3>
        </div>

        <BunnyCharacter
          mood="thinking"
          size="sm"
          showSpeechBubble={false}
          className="mb-2"
          hat={hat}
          glasses={glasses}
          shirt={shirt}
          backpack={backpack}
          item={item}
        />

        {/* Visual Hint depending on question type */}
        <div className="w-full bg-white rounded-2xl p-4 border-2 border-amber-200 mb-4 shadow-sm flex flex-col items-center">
          {question.type === 'make_10' && (
            <TenFrame
              filledCountA={question.operandA}
              filledCountB={question.answer}
              itemAIcon="🍎"
              itemBIcon="⭐"
              label="Khung 10 Ô: Cần thêm sao để đầy"
            />
          )}

          {question.type === 'over_10' && question.needToMake10 !== undefined && (
            <div className="flex flex-col items-center gap-3">
              <TenFrame
                filledCountA={question.operandA}
                filledCountB={question.needToMake10}
                itemAIcon="🔴"
                itemBIcon="🔵"
                label={`Khung 1: ${question.operandA} đỏ + ${question.needToMake10} xanh = 10`}
              />
              <div className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                Còn dư {question.remainder} chấm xanh ở khung 2! ➡️ 10 + {question.remainder} = {question.answer}
              </div>
            </div>
          )}

          {question.type === 'add_basic' && (
            <div className="flex items-center gap-2 text-2xl font-black text-amber-900">
              <span className="p-2 bg-rose-100 rounded-xl border border-rose-300">
                {Array.from({ length: question.operandA }).map(() => '🍎').join('')}
              </span>
              <span>+</span>
              <span className="p-2 bg-blue-100 rounded-xl border border-blue-300">
                {Array.from({ length: question.operandB || 0 }).map(() => '⭐').join('')}
              </span>
            </div>
          )}

          {question.type === 'count' && (
            <div className="text-sm font-bold text-slate-700">
              Chạm ngón tay vào từng hình và đếm to theo nhịp: 1, 2, 3... nhé!
            </div>
          )}

          {/* Text Explanation with Listen Button */}
          {question.hintExplanation && (
            <div className="mt-3 text-slate-700 font-bold text-sm sm:text-base flex items-center justify-center gap-2">
              <span>{question.hintExplanation}</span>
              <button
                onClick={handleSpeakHint}
                className="p-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-full shrink-0 transition"
                title="Nghe đọc gợi ý"
                aria-label="Nghe đọc gợi ý"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* "Con Đã Hiểu" Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-[0_5px_0_#059669] active:translate-y-1 active:shadow-none transition cursor-pointer"
        >
          Con Đã Hiểu Rồi! 👍
        </button>
      </div>
    </div>
  );
};
