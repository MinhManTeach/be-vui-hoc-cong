import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Home, ArrowRight } from 'lucide-react';
import { PlushFriend } from '../../types/plush';
import { PlushFriendRenderer } from './PlushFriendRenderer';
import { BunnyCharacter } from '../BunnyCharacter';
import { QuestionSession } from '../../utils/questionSession';
import { sound } from '../../utils/sound';

interface PlushRevealModalProps {
  isOpen: boolean;
  plushFriend: PlushFriend | null;
  onHug: (friend: PlushFriend) => void;
  onGoToHouse: () => void;
  onClose: () => void;
  hat?: string;
  glasses?: string;
  shirt?: string;
  backpack?: string;
  item?: string;
}

export const PlushRevealModal: React.FC<PlushRevealModalProps> = ({
  isOpen,
  plushFriend,
  onHug,
  onGoToHouse,
  onClose,
  hat,
  glasses,
  shirt,
  backpack,
  item,
}) => {
  const session = useRef(new QuestionSession()).current;
  const [phase, setPhase] = useState<'countdown' | 'revealed' | 'hugged'>('countdown');
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    if (!isOpen || !plushFriend) return;

    session.begin();
    // Reset phase
    setPhase('countdown');
    setCount(3);

    // Initial announcement voice
    session.ownSpeech(sound.speak('Con đã hoàn thành chặng rồi! Có một người bạn nhỏ đang chờ con đấy!', {
      eventType: 'SYSTEM',
    }));

    // Countdown 3, 2, 1
    session.schedule(() => {
      setCount(2);
      sound.playTap();
    }, 1100);

    session.schedule(() => {
      setCount(1);
      sound.playTap();
    }, 2100);

    session.schedule(() => {
      // Reveal the plush friend
      setPhase('revealed');
      sound.playLevelUp();
      sound.playStar();

      // Plush speaks greeting in Vietnamese
      session.schedule(() => {
        session.ownSpeech(sound.speak(plushFriend.greeting, {
          eventType: 'UI_CLICK',
          forceReplay: true,
        }));
      }, 700);
    }, 3100);

    return () => {
      session.dispose();
    };
  }, [isOpen, plushFriend?.id, session]);

  if (!isOpen || !plushFriend) return null;

  const handleHugClick = () => {
    session.begin();
    sound.playSuccess();
    sound.playStar();
    setPhase('hugged');
    onHug(plushFriend);
    session.ownSpeech(sound.speak(
      `Thật ấm áp! ${plushFriend.name} đã trở thành bạn thân của chúng mình rồi!`,
      {
        eventType: 'UI_CLICK',
        forceReplay: true,
      }
    ));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="relative max-w-lg w-full bg-gradient-to-b from-amber-50 via-pink-50 to-purple-50 rounded-3xl p-6 sm:p-8 border-4 border-amber-300 shadow-2xl text-center overflow-hidden">
        {/* Floating Celebration Sparkles */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-pink-300/30 rounded-full blur-2xl pointer-events-none" />

        {/* Header Tag */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 border-2 border-amber-500 text-amber-950 font-black text-xs uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 fill-amber-100" />
          <span>PHẦN THƯỞNG CHẶNG ĐẶC BIỆT</span>
        </div>

        {/* PHASE 1: COUNTDOWN & SHAKING MYSTERY GIFT */}
        {phase === 'countdown' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-4xl sm:text-5xl font-black text-amber-900 mb-4 animate-bounce">
              {count}
            </div>

            <div className="relative my-4 animate-wobble">
              <svg viewBox="0 0 160 160" className="w-36 h-36 drop-shadow-xl" fill="none">
                {/* Gift box shadow */}
                <ellipse cx="80" cy="145" rx="55" ry="12" fill="#000000" fillOpacity="0.15" />
                {/* Box base */}
                <rect x="25" y="55" width="110" height="85" rx="14" fill="#F43F5E" stroke="#BE123C" strokeWidth="4" />
                {/* Golden ribbon vertical */}
                <rect x="68" y="55" width="24" height="85" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
                {/* Golden ribbon horizontal */}
                <rect x="25" y="90" width="110" height="22" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
                {/* Box lid */}
                <rect x="18" y="42" width="124" height="25" rx="8" fill="#FB7185" stroke="#BE123C" strokeWidth="4" />
                <rect x="68" y="42" width="24" height="25" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
                {/* Big cute bow */}
                <ellipse cx="58" cy="30" rx="20" ry="14" fill="#FDE047" stroke="#D97706" strokeWidth="3" transform="rotate(-20 58 30)" />
                <ellipse cx="102" cy="30" rx="20" ry="14" fill="#FDE047" stroke="#D97706" strokeWidth="3" transform="rotate(20 102 30)" />
                <circle cx="80" cy="36" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
              </svg>
            </div>

            <p className="text-sm font-black text-slate-700 max-w-xs leading-relaxed mt-2">
              Hộp quà bí ẩn đang rung rinh... Ai đang chờ con bên trong nhỉ? ✨
            </p>
          </div>
        )}

        {/* PHASE 2 & 3: PLUSH REVEALED & HUG MOMENT */}
        {(phase === 'revealed' || phase === 'hugged') && (
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1 leading-tight flex items-center gap-2 justify-center">
              <span>🎉 BẠN MỚI:</span>
              <span className="text-purple-600">{plushFriend.name}</span>
            </h2>
            <p className="text-xs font-black text-amber-800 mb-4">
              {plushFriend.title} • {plushFriend.worldName}
            </p>

            {/* Visual stage: Bunny & Plush Friend */}
            <div className="relative w-full max-w-xs h-48 flex items-center justify-center my-1">
              {/* Soft starburst backdrop */}
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/50 via-pink-200/50 to-purple-200/50 rounded-3xl blur-md" />

              {/* Heart Burst when hugged */}
              {phase === 'hugged' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-ping">
                  <Heart className="w-16 h-16 text-rose-500 fill-rose-400" />
                </div>
              )}

              <div
                className={`relative z-10 flex items-center justify-center gap-2 transition-all duration-500 ${
                  phase === 'hugged' ? 'scale-105' : ''
                }`}
              >
                {/* Bunny Character */}
                <div
                  className={`transition-transform duration-500 ${
                    phase === 'hugged' ? 'translate-x-3 rotate-6' : ''
                  }`}
                >
                  <BunnyCharacter
                    mood="cheer"
                    size="sm"
                    hat={hat}
                    glasses={glasses}
                    shirt={shirt}
                    backpack={backpack}
                    item={item}
                  />
                </div>

                {/* Sparkling Hearts between them */}
                <div className="flex flex-col items-center">
                  <Heart
                    className={`w-8 h-8 text-rose-500 fill-rose-400 transition-all ${
                      phase === 'hugged' ? 'scale-125 animate-bounce' : 'opacity-70 animate-pulse'
                    }`}
                  />
                  <span className="text-xs">✨</span>
                </div>

                {/* The Unlocked Plush Friend */}
                <div
                  className={`transition-transform duration-500 ${
                    phase === 'hugged' ? '-translate-x-3 -rotate-6' : 'animate-bounce-subtle'
                  }`}
                >
                  <PlushFriendRenderer
                    plushId={plushFriend.id}
                    size={140}
                    animationState={phase === 'hugged' ? 'happy' : 'wave'}
                  />
                </div>
              </div>
            </div>

            {/* Dialogue Bubble */}
            <div className="bg-white/95 border-2 border-purple-200 rounded-2xl p-3.5 max-w-sm mx-auto my-3 shadow-sm text-left">
              <div className="text-[11px] font-black text-purple-700 mb-0.5">
                {plushFriend.name} gửi lời chào:
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                "{plushFriend.greeting}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
              {phase === 'revealed' ? (
                <button
                  onClick={handleHugClick}
                  className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  <span>ÔM BẠN MỚI ❤️</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    sound.playTap();
                    onGoToHouse();
                  }}
                  className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Home className="w-5 h-5" />
                  <span>VỀ NGÔI NHÀ BẠN NHỎ 🏠</span>
                </button>
              )}

              <button
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                <span>Tiếp tục học</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
