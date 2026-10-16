import React, { useEffect, useState } from 'react';
import { HeroCharacter } from './HeroCharacter';
import { sound } from '../utils/sound';

interface BreakTimeModalProps {
  limitMinutes: number;
  equipped: Record<string, string | undefined>;
  onParentExtend: () => void;
}

/** Shown when today's play time set by the parent is used up. Only a grown-up can add more time. */
export const BreakTimeModal: React.FC<BreakTimeModalProps> = ({ limitMinutes, equipped, onParentExtend }) => {
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [challenge] = useState(() => ({ a: 6 + Math.floor(Math.random() * 4), b: 3 + Math.floor(Math.random() * 4) }));

  useEffect(() => {
    sound.cancelSpeech();
    sound.speak('Con chơi giỏi lắm! Giờ mình nghỉ một chút nhé. Mình cùng nghỉ mắt, uống nước và vận động một chút nhé. Hẹn gặp con ngày mai!');
    return () => sound.cancelSpeech();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer, 10) === challenge.a * challenge.b) onParentExtend();
    else { setError(true); setAnswer(''); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-950/80 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Giờ nghỉ">
      <div className="bg-gradient-to-b from-indigo-100 to-sky-50 rounded-[2rem] border-4 border-indigo-300 p-6 max-w-sm w-full text-center shadow-2xl">
        <div className="flex justify-center">
          <HeroCharacter mood="sleeping" size="md" showSpeechBubble={false} {...equipped} />
        </div>
        <h2 className="mt-2 text-2xl font-black text-indigo-950">Giờ nghỉ rồi!</h2>
        <p className="mt-2 font-bold text-slate-700 leading-relaxed">
          Con đã chơi đủ {limitMinutes} phút hôm nay. Mình nghỉ mắt, uống nước và chạy nhảy một chút nhé. Hẹn gặp con ngày mai! 🌙
        </p>

        {!asking ? (
          <button
            onClick={() => setAsking(true)}
            className="mt-5 text-xs font-bold text-indigo-700 underline underline-offset-2 cursor-pointer"
          >
            Dành cho bố mẹ: cho con chơi thêm
          </button>
        ) : (
          <form onSubmit={submit} className="mt-4 bg-white rounded-2xl border-2 border-indigo-200 p-3">
            <label className="block text-sm font-black text-slate-700" htmlFor="break-gate">
              Bố mẹ trả lời: {challenge.a} × {challenge.b} = ?
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="break-gate"
                inputMode="numeric"
                type="number"
                value={answer}
                onChange={e => { setAnswer(e.target.value); setError(false); }}
                className="flex-1 min-w-0 rounded-xl border-2 border-slate-300 px-3 py-2 font-black text-lg"
                autoFocus
              />
              <button type="submit" className="px-4 rounded-xl bg-indigo-600 text-white font-black cursor-pointer">
                Thêm 10 phút
              </button>
            </div>
            {error && <p className="mt-1 text-xs font-bold text-rose-600">Chưa đúng, bố mẹ thử lại nhé.</p>}
          </form>
        )}
      </div>
    </div>
  );
};
