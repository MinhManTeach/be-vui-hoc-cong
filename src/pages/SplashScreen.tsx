import {ChildAvatar} from '../components/ChildAvatar';
import type {AvatarConfig} from '../domain/avatar/avatar';
import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { BunnyCharacter, BunnyMood } from '../components/BunnyCharacter';
import { CompanionRenderer } from '../components/plush/CompanionRenderer';
import { sound } from '../utils/sound';
import { homeCompanionCopy } from '../utils/companion';

interface SplashScreenProps {
  onStartAdventure: () => void;
  hat?: string;
  glasses?: string;
  shirt?: string;
  backpack?: string;
  item?: string;
  companionId?: string | null;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  avatar?: AvatarConfig;
  childNickname?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onStartAdventure,
  hat,
  glasses,
  shirt,
  backpack,
  item,
  companionId,
  soundEnabled = true,
  onToggleSound,
  avatar,
  childNickname = 'Bé Yêu',
}) => {
  const [bunnyMood, setBunnyMood] = useState<BunnyMood>('wave');
  const copy = homeCompanionCopy(companionId);
  const [reactionSpeech, setReactionSpeech] = useState<{ greeting: string; text: string } | null>(null);
  const speechText = reactionSpeech?.greeting === copy.greeting ? reactionSpeech.text : copy.greeting;

  useEffect(() => {
    // Initial welcome voice after short delay
    const timer = setTimeout(() => {
      sound.speak(copy.greeting, {
        eventType: 'SYSTEM',
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [copy.greeting]);

  const handleStart = () => {
    sound.initCtx();
    sound.playTap();
    sound.playStar();
    sound.speak('Tuyệt vời! Chúng mình cùng bước vào thế giới Toán học nào!', {
      eventType: 'UI_CLICK',
      forceReplay: true,
    });
    onStartAdventure();
  };

  const handleMascotTap = () => {
    sound.playTap();
    sound.playStar();
    setBunnyMood('jump');
    const cheers = [
      'Hi hi, Thỏ Bông yêu con nhiều lắm!',
      'Hôm nay chúng mình sẽ cùng học thật vui nhé!',
      'Con đã sẵn sàng thu thập thêm nhiều ngôi sao chưa nào?',
    ];
    const cheer = cheers[Math.floor(Math.random() * cheers.length)];
    setReactionSpeech({ greeting: copy.greeting, text: cheer });
    sound.speak(cheer, {
      eventType: 'UI_CLICK',
      forceReplay: true,
    });
    setTimeout(() => {
      setBunnyMood('wave');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#60A5FA] via-[#93C5FD] to-[#BBF7D0] flex flex-col justify-between p-4 sm:p-8 select-none relative overflow-hidden">
      {/* 1. SKY & BACKGROUND FAIRY-TALE ELEMENTS */}
      {/* Gentle Sun with rotating rays */}
      <div className="absolute -top-12 -right-12 w-48 h-48 sm:w-64 sm:h-64 pointer-events-none opacity-90">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow">
          <circle cx="100" cy="100" r="45" fill="#FDE047" stroke="#F59E0B" strokeWidth="4" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="100"
              y1="40"
              x2="100"
              y2="15"
              stroke="#FBBF24"
              strokeWidth="5"
              strokeLinecap="round"
              transform={`rotate(${i * 30} 100 100)`}
            />
          ))}
        </svg>
      </div>

      {/* Fluffy drifting cartoon clouds */}
      <div className="absolute top-10 left-6 w-36 h-14 bg-white/80 rounded-full blur-[1px] pointer-events-none animate-float-slow">
        <div className="absolute -top-5 left-6 w-16 h-16 bg-white/80 rounded-full" />
        <div className="absolute -top-2 left-16 w-12 h-12 bg-white/80 rounded-full" />
      </div>

      <div className="absolute top-24 right-1/4 w-44 h-16 bg-white/70 rounded-full blur-[1px] pointer-events-none animate-float">
        <div className="absolute -top-7 left-10 w-20 h-20 bg-white/70 rounded-full" />
      </div>

      {/* Floating Rainbow Arch in mid-sky */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-80 sm:w-[480px] pointer-events-none opacity-50">
        <svg viewBox="0 0 400 160" className="w-full h-auto">
          <path d="M40 150 Q200 20 360 150" stroke="#F43F5E" strokeWidth="10" fill="none" opacity="0.6" />
          <path d="M40 150 Q200 30 360 150" stroke="#FBBF24" strokeWidth="10" fill="none" opacity="0.6" />
          <path d="M40 150 Q200 40 360 150" stroke="#34D399" strokeWidth="10" fill="none" opacity="0.6" />
          <path d="M40 150 Q200 50 360 150" stroke="#60A5FA" strokeWidth="10" fill="none" opacity="0.6" />
        </svg>
      </div>

      {/* Distant Rolling Mountains */}
      <div className="absolute bottom-24 inset-x-0 h-48 pointer-events-none opacity-40">
        <svg viewBox="0 0 1200 300" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <path d="M0 240 Q300 120 600 220 T1200 180 L1200 300 L0 300 Z" fill="#6EE7B7" />
          <path d="M0 260 Q400 160 800 250 T1200 220 L1200 300 L0 300 Z" fill="#34D399" />
        </svg>
      </div>

      {/* 2. TOP STATUS / UTILITY BAR */}
      <header className="relative z-30 flex items-center justify-between w-full max-w-4xl mx-auto">
        {/* Child Profile Greeting Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border-3 border-amber-300 shadow-md">
          <div className="w-9 h-9 rounded-full bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-xl shadow-inner">
            <ChildAvatar config={avatar}/>
          </div>
          <div className="text-left pr-2">
            <div className="text-xs font-black text-slate-800 leading-tight">
              Xin chào {childNickname}!
            </div>
            <div className="text-[10px] font-bold text-amber-700">
              Cùng học toán vui mỗi ngày ⭐
            </div>
          </div>
        </div>

        {/* Audio Toggle */}
        {onToggleSound && (
          <button
            onClick={() => {
              sound.playTap();
              onToggleSound();
            }}
            className={`p-3 rounded-full border-3 shadow-md transition-transform active:scale-90 cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-400 border-emerald-600 text-white'
                : 'bg-slate-200 border-slate-400 text-slate-500'
            }`}
            title="Bật / tắt âm thanh"
            aria-label="Bật tắt âm thanh"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 fill-current" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        )}
      </header>

      {/* 3. CENTER: TITLE BRANDING & 3D STORYBOOK MASCOT SCENE */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center my-auto w-full max-w-3xl mx-auto text-center">
        {/* Genre Tag */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/90 backdrop-blur-xs border-2 border-amber-400 shadow-md text-amber-900 text-xs sm:text-sm font-black mb-2 animate-bounce-subtle">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>GAME PHIÊU LƯU TOÁN HỌC MẦM NON 4-6 TUỔI</span>
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
        </div>

        {/* Main 3D Game Title */}
        <div className="relative mb-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight drop-shadow-[0_6px_0_#D97706] stroke-amber-600">
            BÉ VUI HỌC CỘNG
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-sm sm:text-base md:text-lg font-black text-amber-950 bg-amber-200/90 border-2 border-amber-400 px-4 py-0.5 rounded-full shadow-sm">
              🌟 Khám Phá 6 Vương Quốc Diệu Kỳ 🌟
            </span>
          </div>
        </div>

        {/* Mascot + Companion Play Scene */}
        <div className="relative my-2 sm:my-4 flex items-end justify-center gap-2 sm:gap-4">
          {/* Thỏ Bông with interactive tap response */}
          <div className="cursor-pointer" onClick={handleMascotTap} title="Chạm vào Thỏ Bông nhé!">
            <BunnyCharacter
              mood={bunnyMood}
              speechText={speechText}
              size="lg"
              hat={hat}
              glasses={glasses}
              shirt={shirt}
              backpack={backpack}
              item={item}
            />
          </div>

          {/* Active Companion if equipped */}
          {copy.companionId && (
            <div className="scale-90 sm:scale-100 -translate-x-2 animate-bounce-subtle pointer-events-auto">
              <CompanionRenderer
                companionId={copy.companionId}
                size={80}
                showBadge={true}
                canSpeakOnClick={true}
              />
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm font-extrabold text-amber-950/80 max-w-md">
          {copy.instruction}
        </p>
      </main>

      {/* 4. BOTTOM ROLLING HILL WITH PLAY BUTTON */}
      <footer className="relative z-30 w-full max-w-md mx-auto mb-2 flex flex-col items-center">
        <button
          onClick={handleStart}
          className="w-full py-5 px-8 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xl sm:text-2xl shadow-[0_8px_0_#b45309] active:translate-y-2 active:shadow-[0_2px_0_#b45309] transition-all transform hover:scale-105 flex items-center justify-center gap-3 border-3 border-white cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/90 text-amber-600 flex items-center justify-center shadow-md group-hover:scale-110 transition">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
          <span className="tracking-wide">BẮT ĐẦU PHIÊU LƯU!</span>
        </button>
      </footer>
    </div>
  );
};
