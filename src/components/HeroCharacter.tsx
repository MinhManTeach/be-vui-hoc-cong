import React, {createContext, useContext} from 'react';
import {Volume2} from 'lucide-react';
import {EquippedWearable, WearableRear} from './wardrobe/WearableArt';
import {AVATAR_OPTIONS, DEFAULT_AVATAR, normalizeAvatar, type AvatarConfig} from '../domain/avatar/avatar';
import {sound} from '../utils/sound';

export type HeroMood =
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

/** The child's own chibi boy or girl. Screens read it from here so every hero matches the pick. */
export const HeroAvatarContext = createContext<AvatarConfig>(DEFAULT_AVATAR);

export type HeroOutfit = {hat?: string; glasses?: string; shirt?: string; backpack?: string; item?: string; badge?: string};

const O = '#5B4636'; // same outline as the wardrobe art
const CHEEK = '#FF9EA8';
const EYE = '#3B2A33';
const line = {stroke: O, strokeWidth: 3.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

/** Hair drawn behind the head (long hair, pigtails, bun). */
function HairBack({style, color}: {style: AvatarConfig['hairStyle']; color: string}) {
  if (style === 'bob') return <path d="M40 112 C34 64 64 50 100 50 C136 50 166 64 160 112 L163 160 Q150 170 138 160 L62 160 Q50 170 37 160 Z" fill={color} {...line} />;
  if (style === 'pigtails') return (
    <g fill={color} {...line}>
      <path d="M48 104 C24 104 14 132 22 158 C26 168 36 164 36 154 C38 136 46 124 54 118 Z" />
      <path d="M152 104 C176 104 186 132 178 158 C174 168 164 164 164 154 C162 136 154 124 146 118 Z" />
    </g>
  );
  if (style === 'bun') return <circle cx="100" cy="52" r="20" fill={color} {...line} />;
  return null;
}

/** Fringe and crown in front of the head. */
function HairFront({style, color}: {style: AvatarConfig['hairStyle']; color: string}) {
  const crown = 'M43 118 C36 70 62 52 100 52 C138 52 164 70 157 118';
  const d =
    style === 'crop'
      ? `${crown} L150 100 L144 90 Q128 96 114 84 Q102 98 86 86 Q72 98 56 90 L50 100 Z`
      : style === 'sweep'
      ? `${crown} L152 98 Q144 84 130 78 Q108 100 62 96 L50 102 Z`
      : `${crown} L151 100 Q132 96 120 78 Q106 96 76 92 Q62 94 50 102 Z`;
  return (
    <g>
      <path d={d} fill={color} {...line} />
      {style === 'crop' && <path d="M98 53 Q102 38 116 40 Q106 45 106 54" fill={color} {...line} strokeWidth={3} />}
      <path d="M66 70 Q80 60 96 60" stroke="#FFF" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  );
}

function GirlTrim({style}: {style: AvatarConfig['hairStyle']}) {
  const bow = (x: number, y: number, s = 1) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C-6 -12 -20 -10 -18 0 C-20 10 -6 12 0 0 Z M0 0 C6 -12 20 -10 18 0 C20 10 6 12 0 0 Z" fill="#F472B6" {...line} strokeWidth={2.5} />
      <circle r="4.5" fill="#FBCFE8" {...line} strokeWidth={2.5} />
    </g>
  );
  if (style === 'pigtails') return <g>{bow(44, 108, 0.8)}{bow(156, 108, 0.8)}</g>;
  return bow(138, 66, 0.9);
}

function Eyes({mood, girl}: {mood: HeroMood; girl: boolean}) {
  if (mood === 'happy' || mood === 'jump' || mood === 'celebrate' || mood === 'cheer') {
    return (
      <g stroke={EYE} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M71 122 Q80 110 89 122" />
        <path d="M111 122 Q120 110 129 122" />
      </g>
    );
  }
  if (mood === 'sleeping') {
    return (
      <g>
        <g stroke={EYE} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M71 120 Q80 127 89 120" />
          <path d="M111 120 Q120 127 129 120" />
        </g>
        <text x="146" y="78" fontSize="16" fontWeight="bold" fill="#818CF8">z</text>
        <text x="156" y="66" fontSize="20" fontWeight="bold" fill="#6366F1">Z</text>
      </g>
    );
  }
  const look = mood === 'thinking' ? -4 : 0;
  return (
    <g>
      {[80, 120].map(x => (
        <g key={x}>
          <ellipse cx={x} cy={120 + look} rx="8" ry="10" fill={EYE} />
          <circle cx={x + 3} cy={116 + look} r="3.4" fill="#FFF" />
          <circle cx={x - 2.5} cy={124 + look} r="1.6" fill="#FFF" />
        </g>
      ))}
      {girl && (
        <g stroke={EYE} strokeWidth="2.5" strokeLinecap="round">
          <path d="M71 114 L66 110 M73 111 L69 106" />
          <path d="M129 114 L134 110 M127 111 L131 106" />
        </g>
      )}
      {mood === 'thinking' && <text x="148" y="76" fontSize="22">💡</text>}
    </g>
  );
}

function Mouth({mood}: {mood: HeroMood}) {
  if (mood === 'celebrate' || mood === 'happy' || mood === 'jump' || mood === 'cheer' || mood === 'wave') {
    return <path d="M90 136 Q100 152 110 136 Z" fill="#F87171" stroke={EYE} strokeWidth="3" strokeLinejoin="round" />;
  }
  if (mood === 'sleeping') return <ellipse cx="100" cy="140" rx="4" ry="3" fill="#F87171" stroke={EYE} strokeWidth="2.5" />;
  if (mood === 'sad-but-encouraging') return <path d="M93 141 Q100 136 107 141" stroke={EYE} strokeWidth="3" fill="none" strokeLinecap="round" />;
  return <path d="M92 136 Q100 144 108 136" stroke={EYE} strokeWidth="3.2" fill="none" strokeLinecap="round" />;
}

function Hands({mood, skin}: {mood: HeroMood; skin: string}) {
  const hand = (cx: number, cy: number, key?: string) => <circle key={key} cx={cx} cy={cy} r="11" fill={skin} {...line} />;
  if (mood === 'celebrate' || mood === 'jump' || mood === 'cheer') {
    return (
      <g>
        {hand(40, 138)}
        {hand(160, 138)}
        <text x="18" y="100" fontSize="16">✨</text>
        <text x="164" y="100" fontSize="16">✨</text>
      </g>
    );
  }
  if (mood === 'wave') return <g>{hand(56, 180)}{hand(162, 120)}<text x="172" y="108" fontSize="16">👋</text></g>;
  if (mood === 'pointing') return <g>{hand(56, 180)}{hand(158, 150)}<text x="168" y="156" fontSize="18">👉</text></g>;
  if (mood === 'thinking') return <g>{hand(56, 180)}{hand(118, 160)}</g>;
  return <g>{hand(56, 180)}{hand(144, 180)}</g>;
}

/** The chibi hero in a 200×240 box, with the same slot anchors the wardrobe art is drawn for. */
export function HeroArt({avatar, mood = 'idle', outfit = {}}: {avatar?: unknown; mood?: HeroMood; outfit?: HeroOutfit}) {
  const a = normalizeAvatar(avatar);
  const girl = a.base === 'girl';
  const hair = AVATAR_OPTIONS.hairColor.find(o => o.id === a.hairColor)!.color;
  const skin = AVATAR_OPTIONS.skin.find(o => o.id === a.skin)!.color;
  const {hat, glasses, shirt = 'shirt_sky', backpack = 'backpack_yellow', item, badge} = outfit;
  return (
    <g data-character-role="child" data-avatar-base={a.base}>
      <ellipse cx="100" cy="236" rx="56" ry="6" fill="#795548" opacity=".14" />
      <EquippedWearable id={backpack} type="backpack" />
      <WearableRear id={shirt} />
      <g data-layer="hair-back"><HairBack style={a.hairStyle} color={hair} /></g>
      {/* Body, then the shirt hugs it */}
      <g data-layer="body">
      <ellipse cx="100" cy="182" rx="52" ry="46" fill="#FFFFFF" {...line} />
      <path d="M86 140 Q100 150 114 140" fill="none" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <EquippedWearable id={shirt} type="shirt" />
      {/* Shoes */}
      <g fill={girl ? '#F472B6' : '#60A5FA'} {...line}>
        <ellipse cx="74" cy="226" rx="19" ry="11" />
        <ellipse cx="126" cy="226" rx="19" ry="11" />
      </g>
      <g fill="#FFF" opacity=".7">
        <ellipse cx="68" cy="222" rx="6" ry="3" />
        <ellipse cx="120" cy="222" rx="6" ry="3" />
      </g>
      {/* Head */}
      <g data-layer="face">
      <g fill={skin} {...line}>
        <circle cx="44" cy="124" r="10" />
        <circle cx="156" cy="124" r="10" />
        <ellipse cx="100" cy="116" rx="57" ry="54" />
      </g>
      <g fill={CHEEK} opacity=".55">
        <ellipse cx="66" cy="136" rx="10" ry="6" />
        <ellipse cx="134" cy="136" rx="10" ry="6" />
      </g>
      <Eyes mood={mood} girl={girl} />
      <path d="M98 130 Q100 132 102 130" stroke="#C98A6A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Mouth mood={mood} />
      </g>
      <g data-layer="hair-front">
        <HairFront style={a.hairStyle} color={hair} />
        {girl && <GirlTrim style={a.hairStyle} />}
      </g>
      <Hands mood={mood} skin={skin} />
      <EquippedWearable id={glasses} type="glasses" />
      <EquippedWearable id={hat} type="hat" />
      <EquippedWearable id={item} type="item" />
      <EquippedWearable id={badge} type="badge" />
    </g>
  );
}

interface HeroCharacterProps extends HeroOutfit {
  mood?: HeroMood;
  speechText?: string;
  /** Defaults to the child's pick from HeroAvatarContext. */
  avatar?: unknown;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSpeechBubble?: boolean;
  onTap?: () => void;
}

const SIZES = {sm: 'w-24 h-28', md: 'w-36 h-44', lg: 'w-48 h-56', xl: 'w-60 h-72'};

function animationFor(mood: HeroMood) {
  if (mood === 'celebrate' || mood === 'jump') return 'animate-bounce';
  if (mood === 'running') return 'animate-pulse';
  if (mood === 'sleeping') return 'opacity-90';
  if (mood === 'wave') return 'animate-bounce-subtle';
  return 'animate-float';
}

export const HeroCharacter: React.FC<HeroCharacterProps> = ({
  mood = 'idle',
  speechText,
  avatar,
  size = 'md',
  className = '',
  showSpeechBubble = true,
  onTap,
  ...outfit
}) => {
  const picked = useContext(HeroAvatarContext);
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speechText) {
      sound.cancelSpeech();
      sound.speak(speechText);
    }
  };
  return (
    <div
      onClick={onTap}
      className={`flex flex-col items-center select-none relative ${onTap ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''} ${className}`}
    >
      {showSpeechBubble && speechText && (
        <div className="relative mb-2 px-4 py-2.5 bg-white border-3 border-amber-300 rounded-2xl shadow-xl text-slate-800 text-sm sm:text-base font-extrabold flex items-center gap-2 max-w-[280px] sm:max-w-xs animate-bounce-subtle text-center z-20">
          <span>{speechText}</span>
          <button
            onClick={handleSpeak}
            className="p-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 transition transform active:scale-90 shrink-0 shadow-sm"
            title="Nghe đọc"
            aria-label="Nghe đọc"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-9 border-x-transparent border-t-9 border-t-amber-300 -z-10" />
        </div>
      )}
      <div className={`relative ${SIZES[size]} transition-transform duration-300 ${animationFor(mood)}`}>
        <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-xl overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <HeroArt avatar={avatar ?? picked} mood={mood} outfit={outfit} />
        </svg>
      </div>
    </div>
  );
};
