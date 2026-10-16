import React from 'react';
import { EquippedWearable, WearableRear } from './wardrobe/WearableArt';
import { Volume2 } from 'lucide-react';
import { sound } from '../utils/sound';

export type BunnyMood = 
  | 'idle' 
  | 'happy' 
  | 'thinking' 
  | 'celebrate' 
  | 'jump' 
  | 'wave' 
  | 'sad-but-encouraging' 
  | 'running' 
  | 'sleeping' 
  | 'pointing'
  | 'cheer'
  | 'eating';

interface BunnyCharacterProps {
  mood?: BunnyMood;
  speechText?: string;
  hat?: string;
  glasses?: string;
  shirt?: string;
  backpack?: string;
  item?: string;
  badge?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSpeechBubble?: boolean;
  onTap?: () => void;
}

export const BunnyCharacter: React.FC<BunnyCharacterProps> = ({
  mood = 'idle',
  speechText,
  hat,
  glasses,
  shirt = 'shirt_sky',
  backpack = 'backpack_yellow',
  item = 'item_carrot',
  badge,
  size = 'md',
  className = '',
  showSpeechBubble = true,
  onTap,
}) => {
  const sizeMap = {
    sm: 'w-24 h-28',
    md: 'w-36 h-44',
    lg: 'w-48 h-56',
    xl: 'w-60 h-72',
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speechText) {
      sound.cancelSpeech();
      sound.speak(speechText);
    }
  };

  const getAnimationClass = () => {
    switch (mood) {
      case 'celebrate':
      case 'jump':
        return 'animate-bounce';
      case 'running':
        return 'animate-pulse';
      case 'sleeping':
        return 'opacity-90';
      case 'wave':
        return 'animate-bounce-subtle';
      default:
        return 'animate-float';
    }
  };

  return (
    <div 
      onClick={onTap}
      className={`flex flex-col items-center select-none relative ${onTap ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''} ${className}`}
    >
      {/* Speech Bubble */}
      {showSpeechBubble && speechText && (
        <div className="relative mb-2 px-4 py-2.5 bg-white border-3 border-amber-300 rounded-2xl shadow-xl text-slate-800 text-sm sm:text-base font-extrabold flex items-center gap-2 max-w-[280px] sm:max-w-xs animate-bounce-subtle text-center z-20">
          <span>{speechText}</span>
          <button
            onClick={handleSpeak}
            className="p-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 transition transform active:scale-90 shrink-0 shadow-sm"
            title="Nghe Thỏ nói"
            aria-label="Nghe Thỏ Bông đọc"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-9 border-x-transparent border-t-9 border-t-amber-300 -z-10" />
        </div>
      )}

      {/* 3D-Look Cartoon Mascot SVG */}
      <div className={`relative ${sizeMap[size]} transition-transform duration-300 ${getAnimationClass()}`}>
        <svg
          viewBox="0 0 200 240"
          className="w-full h-full drop-shadow-xl overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients for 3D rounded look */}
            <linearGradient id="bunnyFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>

            <linearGradient id="innerEarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>

            <linearGradient id="skyShirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="yellowBackpackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>

            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          <EquippedWearable id={backpack} type="backpack" />
          <WearableRear id={shirt} />

          {/* Ears */}
          {/* Left Ear */}
          <g className={mood === 'happy' || mood === 'jump' || mood === 'celebrate' ? 'rotate-[-8deg] origin-[65px_100px]' : ''}>
            <ellipse cx="65" cy="52" rx="18" ry="48" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />
            <ellipse cx="65" cy="56" rx="9" ry="34" fill="url(#innerEarGrad)" />
          </g>

          {/* Right Ear */}
          <g className={mood === 'happy' || mood === 'jump' || mood === 'celebrate' ? 'rotate-[8deg] origin-[135px_100px]' : ''}>
            <ellipse cx="135" cy="52" rx="18" ry="48" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />
            <ellipse cx="135" cy="56" rx="9" ry="34" fill="url(#innerEarGrad)" />
          </g>

          {/* Body */}
          <ellipse cx="100" cy="180" rx="58" ry="50" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />

          <EquippedWearable id={shirt} type="shirt" />

          {/* Feet */}
          <ellipse cx="65" cy="225" rx="20" ry="12" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />
          <ellipse cx="135" cy="225" rx="20" ry="12" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />
          {/* Paw pads */}
          <circle cx="65" cy="224" r="5" fill="#FDA4AF" />
          <circle cx="135" cy="224" r="5" fill="#FDA4AF" />

          {/* Head */}
          <circle cx="100" cy="118" r="50" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />

          {/* Rosy Cheeks */}
          <circle cx="66" cy="130" r="11" fill="#FECDD3" opacity="0.85" />
          <circle cx="134" cy="130" r="11" fill="#FECDD3" opacity="0.85" />

          {/* Eyes depending on mood */}
          {mood === 'happy' || mood === 'jump' || mood === 'celebrate' ? (
            <>
              {/* Happy curved eyes ^^ */}
              <path d="M70 114 Q80 102 90 114" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M110 114 Q120 102 130 114" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" fill="none" />
            </>
          ) : mood === 'sleeping' ? (
            <>
              {/* Sleeping cute closed eyes */}
              <path d="M72 116 Q81 122 90 116" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M110 116 Q119 122 128 116" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <text x="140" y="90" fontSize="16" fontWeight="bold" fill="#818CF8">z</text>
              <text x="150" y="80" fontSize="20" fontWeight="bold" fill="#6366F1">Z</text>
            </>
          ) : mood === 'thinking' ? (
            <>
              {/* Curious looking up eyes */}
              <circle cx="82" cy="110" r="7.5" fill="#0F172A" />
              <circle cx="85" cy="107" r="2.5" fill="#FFFFFF" />
              <circle cx="122" cy="110" r="7.5" fill="#0F172A" />
              <circle cx="125" cy="107" r="2.5" fill="#FFFFFF" />
              {/* Thinking lightbulb / question sparkle above ear */}
              <text x="146" y="80" fontSize="22">💡</text>
            </>
          ) : mood === 'sad-but-encouraging' ? (
            <>
              {/* Encouraging gentle eyes */}
              <circle cx="80" cy="115" r="7" fill="#0F172A" />
              <circle cx="82" cy="113" r="2.5" fill="#FFFFFF" />
              <circle cx="120" cy="115" r="7" fill="#0F172A" />
              <circle cx="122" cy="113" r="2.5" fill="#FFFFFF" />
              <path d="M95 132 Q100 135 105 132" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Default Big Pixar-style sparkling eyes */}
              <circle cx="80" cy="114" r="8" fill="#0F172A" />
              <circle cx="83" cy="111" r="3" fill="#FFFFFF" />
              <circle cx="78" cy="117" r="1.5" fill="#FFFFFF" />
              <circle cx="120" cy="114" r="8" fill="#0F172A" />
              <circle cx="123" cy="111" r="3" fill="#FFFFFF" />
              <circle cx="118" cy="117" r="1.5" fill="#FFFFFF" />
            </>
          )}

          {/* Nose */}
          <polygon points="100,125 94,120 106,120" fill="#F43F5E" />

          {/* Mouth */}
          {mood === 'celebrate' || mood === 'happy' || mood === 'jump' ? (
            <path d="M92 127 Q100 144 108 127" stroke="#0F172A" strokeWidth="3" fill="#F43F5E" strokeLinecap="round" />
          ) : mood === 'wave' ? (
            <path d="M93 127 Q100 138 107 127" stroke="#0F172A" strokeWidth="3" fill="#F43F5E" strokeLinecap="round" />
          ) : (
            <path d="M94 126 Q100 132 106 126" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
          )}

          {/* Whiskers */}
          <line x1="50" y1="125" x2="30" y2="121" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="132" x2="30" y2="134" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="150" y1="125" x2="170" y2="121" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="150" y1="132" x2="170" y2="134" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Paws */}
          {mood === 'celebrate' || mood === 'jump' ? (
            <>
              {/* Both paws raised high */}
              <ellipse cx="44" cy="130" rx="14" ry="18" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" transform="rotate(-35 44 130)" />
              <ellipse cx="156" cy="130" rx="14" ry="18" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" transform="rotate(35 156 130)" />
              {/* Confetti / stars around */}
              <text x="24" y="90" fontSize="16">✨</text>
              <text x="160" y="90" fontSize="16">✨</text>
            </>
          ) : mood === 'wave' ? (
            <>
              {/* Right paw waving */}
              <ellipse cx="70" cy="175" rx="13" ry="16" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />
              <ellipse cx="160" cy="115" rx="14" ry="18" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" transform="rotate(40 160 115)" />
              <text x="175" y="105" fontSize="16">👋</text>
            </>
          ) : mood === 'pointing' ? (
            <>
              <ellipse cx="70" cy="175" rx="13" ry="16" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />
              {/* Pointing paw */}
              <ellipse cx="155" cy="140" rx="18" ry="12" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" transform="rotate(15 155 140)" />
              <text x="170" y="142" fontSize="18">👉</text>
            </>
          ) : mood === 'thinking' ? (
            <>
              <ellipse cx="60" cy="175" rx="12" ry="15" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />
              {/* Hand to chin */}
              <ellipse cx="118" cy="140" rx="12" ry="15" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" transform="rotate(-40 118 140)" />
            </>
          ) : (
            <>
              {/* Resting paws */}
              <ellipse cx="72" cy="175" rx="13" ry="16" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />
              <ellipse cx="128" cy="175" rx="13" ry="16" fill="url(#bunnyFurGrad)" stroke="#CBD5E1" strokeWidth="3.5" />
            </>
          )}

          <EquippedWearable id={glasses} type="glasses" />
          <EquippedWearable id={hat} type="hat" />
          <EquippedWearable id={item} type="item" />
          <EquippedWearable id={badge} type="badge" />
        </svg>
      </div>
    </div>
  );
};
