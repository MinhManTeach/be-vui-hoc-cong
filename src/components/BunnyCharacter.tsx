import React from 'react';
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
          className="w-full h-full drop-shadow-xl"
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

          {/* Yellow Backpack behind body */}
          {(backpack === 'backpack_yellow' || !backpack) && (
            <g transform="translate(138, 140)">
              <rect x="0" y="0" width="34" height="42" rx="10" fill="url(#yellowBackpackGrad)" stroke="#CA8A04" strokeWidth="3" />
              <path d="M6 10 H28" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="17" cy="22" r="5" fill="#FEF08A" />
            </g>
          )}
          {backpack === 'backpack_carrot' && (
            <g transform="translate(138, 135) rotate(15)">
              <polygon points="16,36 32,0 0,0" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
              <path d="M16 0 C16 -10 10 -12 6 -10" stroke="#22C55E" strokeWidth="3" fill="none" />
            </g>
          )}
          {backpack === 'backpack_rocket' && (
            <g transform="translate(142, 130)">
              <rect x="0" y="8" width="22" height="34" rx="6" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
              <polygon points="11,0 0,8 22,8" fill="#FFFFFF" />
              <circle cx="11" cy="22" r="4" fill="#38BDF8" />
              <polygon points="4,42 11,52 18,42" fill="#F59E0B" />
            </g>
          )}
          {backpack === 'backpack_star' && (
            <g transform="translate(136, 138)">
              <text x="0" y="30" fontSize="32">⭐</text>
            </g>
          )}

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

          {/* Shirt / Outfit */}
          {(shirt === 'shirt_sky' || !shirt) && (
            <g>
              <path d="M54 165 C54 148 146 148 146 165 C146 195 54 195 54 165 Z" fill="url(#skyShirtGrad)" stroke="#0284C7" strokeWidth="2.5" />
              {/* Collar detail */}
              <polygon points="100,166 90,154 110,154" fill="#E0F2FE" />
              {/* Cute pocket */}
              <rect x="74" y="172" width="16" height="14" rx="3" fill="#0284C7" opacity="0.4" />
            </g>
          )}
          {shirt === 'shirt_stripe' && (
            <g>
              <path d="M54 165 C54 148 146 148 146 165 C146 195 54 195 54 165 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
              <line x1="60" y1="165" x2="140" y2="165" stroke="#0284C7" strokeWidth="4" />
              <line x1="64" y1="175" x2="136" y2="175" stroke="#0284C7" strokeWidth="4" />
              <line x1="72" y1="185" x2="128" y2="185" stroke="#0284C7" strokeWidth="4" />
            </g>
          )}
          {shirt === 'shirt_hero' && (
            <g>
              {/* Red cape behind */}
              <path d="M50 160 Q20 200 40 230 Q100 210 160 230 Q180 200 150 160 Z" fill="#EF4444" opacity="0.9" />
              <path d="M54 165 C54 148 146 148 146 165 C146 195 54 195 54 165 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" />
              {/* Hero emblem */}
              <polygon points="100,166 88,184 112,184" fill="#FBBF24" />
              <text x="96" y="181" fontSize="11" fontWeight="bold" fill="#B45309">S</text>
            </g>
          )}
          {shirt === 'shirt_space' && (
            <g>
              <path d="M54 165 C54 148 146 148 146 165 C146 195 54 195 54 165 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
              <rect x="88" y="168" width="24" height="16" rx="4" fill="#0EA5E9" />
              <circle cx="95" cy="176" r="2.5" fill="#EF4444" />
              <circle cx="105" cy="176" r="2.5" fill="#22C55E" />
            </g>
          )}

          {/* Yellow backpack strap on front */}
          {(backpack === 'backpack_yellow' || !backpack) && (
            <g>
              <path d="M72 152 Q68 175 70 190" stroke="#CA8A04" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M128 152 Q132 175 130 190" stroke="#CA8A04" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </g>
          )}

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

          {/* Glasses Accessory */}
          {glasses === 'glasses_cool' && (
            <g transform="translate(62, 102)">
              <rect x="0" y="0" width="32" height="18" rx="4" fill="#0F172A" />
              <rect x="44" y="0" width="32" height="18" rx="4" fill="#0F172A" />
              <line x1="32" y1="8" x2="44" y2="8" stroke="#0F172A" strokeWidth="4" />
              <line x1="5" y1="3" x2="25" y2="15" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
            </g>
          )}
          {glasses === 'glasses_star' && (
            <g transform="translate(58, 98)">
              <text x="0" y="24" fontSize="28">⭐</text>
              <text x="46" y="24" fontSize="28">⭐</text>
              <line x1="28" y1="12" x2="48" y2="12" stroke="#EAB308" strokeWidth="3.5" />
            </g>
          )}
          {glasses === 'glasses_smart' && (
            <g transform="translate(64, 102)">
              <circle cx="15" cy="12" r="15" fill="none" stroke="#3B82F6" strokeWidth="3.5" />
              <circle cx="43" cy="12" r="15" fill="none" stroke="#3B82F6" strokeWidth="3.5" />
              <line x1="30" y1="12" x2="32" y2="12" stroke="#3B82F6" strokeWidth="3.5" />
            </g>
          )}
          {glasses === 'glasses_heart' && (
            <g transform="translate(60, 98)">
              <text x="0" y="24" fontSize="26">💖</text>
              <text x="46" y="24" fontSize="26">💖</text>
            </g>
          )}

          {/* Hat Accessory */}
          {hat === 'hat_cap' && (
            <g transform="translate(56, 58)">
              <path d="M10 24 Q44 -12 78 24 Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
              <path d="M2 24 C12 24 64 22 96 32 C74 27 20 25 2 24 Z" fill="#EA580C" />
            </g>
          )}
          {hat === 'hat_party' && (
            <g transform="translate(76, 26)">
              <polygon points="24,0 0,55 48,55" fill="#EC4899" stroke="#BE185D" strokeWidth="2" />
              <circle cx="24" cy="0" r="7" fill="#FBBF24" />
              <line x1="6" y1="40" x2="42" y2="40" stroke="#FBBF24" strokeWidth="4" />
              <line x1="12" y1="25" x2="36" y2="25" stroke="#38BDF8" strokeWidth="4" />
            </g>
          )}
          {hat === 'hat_crown' && (
            <g transform="translate(68, 44)">
              <path d="M0 26 L12 4 L32 18 L52 4 L64 26 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
              <circle cx="12" cy="4" r="3.5" fill="#EF4444" />
              <circle cx="32" cy="18" r="3.5" fill="#3B82F6" />
              <circle cx="52" cy="4" r="3.5" fill="#10B981" />
              <rect x="0" y="26" width="64" height="7" rx="3" fill="#F59E0B" />
            </g>
          )}
          {hat === 'hat_chef' && (
            <g transform="translate(66, 36)">
              <path d="M8 36 C-4 20 12 0 34 6 C48 -4 68 10 66 30 C74 36 58 44 56 36 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
              <rect x="14" y="34" width="42" height="12" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
            </g>
          )}
          {hat === 'hat_pirate' && (
            <g transform="translate(60, 48)">
              <path d="M0 30 Q40 -6 80 30 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <text x="32" y="24" fontSize="14">☠️</text>
            </g>
          )}
          {hat === 'hat_astronaut' && (
            <g transform="translate(56, 50)">
              <ellipse cx="44" cy="40" rx="46" ry="42" fill="none" stroke="#38BDF8" strokeWidth="5" opacity="0.8" />
              <path d="M12 25 Q44 10 76 25" stroke="#FFFFFF" strokeWidth="3" opacity="0.6" fill="none" />
            </g>
          )}

          {/* Held Item */}
          {item === 'item_carrot' && (
            <g transform="translate(118, 150) rotate(-20)">
              <polygon points="12,32 24,0 0,0" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
              <line x1="6" y1="10" x2="16" y2="10" stroke="#EA580C" strokeWidth="2" />
              <line x1="8" y1="20" x2="14" y2="20" stroke="#EA580C" strokeWidth="2" />
              <path d="M12 0 C12 -12 6 -14 0 -12 C6 -8 10 -4 12 0 Z" fill="#22C55E" />
              <path d="M12 0 C12 -14 18 -16 22 -12 C16 -8 14 -4 12 0 Z" fill="#16A34A" />
            </g>
          )}
          {item === 'item_balloon' && (
            <g transform="translate(136, 115)">
              <ellipse cx="20" cy="20" rx="16" ry="20" fill="#EF4444" />
              <polygon points="17,40 23,40 20,44" fill="#DC2626" />
              <path d="M20 44 Q14 55 10 75" stroke="#64748B" strokeWidth="1.5" fill="none" />
            </g>
          )}
          {item === 'item_flower' && (
            <g transform="translate(125, 140)">
              <text x="0" y="24" fontSize="28">🌻</text>
            </g>
          )}
          {item === 'item_magic_wand' && (
            <g transform="translate(126, 135) rotate(35)">
              <rect x="0" y="10" width="7" height="38" rx="3.5" fill="#A855F7" stroke="#7E22CE" strokeWidth="1.5" />
              <text x="-6" y="10" fontSize="18">⭐</text>
            </g>
          )}

          {/* Badge pinned on chest */}
          {badge && (
            <g transform="translate(70, 172)">
              <circle cx="10" cy="10" r="9" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
              <text x="4" y="14" fontSize="10">⭐</text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
