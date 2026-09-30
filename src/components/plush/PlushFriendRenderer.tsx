import React from 'react';

export type PlushAnimationState = 'idle' | 'happy' | 'wave' | 'sleep';

interface PlushFriendRendererProps {
  plushId: string;
  size?: number; // width/height in px (default 160)
  animationState?: PlushAnimationState;
  isSilhouette?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PlushFriendRenderer: React.FC<PlushFriendRendererProps> = ({
  plushId,
  size = 160,
  animationState = 'idle',
  isSilhouette = false,
  className = '',
  onClick,
}) => {
  // Animation classes
  const animClass =
    animationState === 'happy'
      ? 'animate-bounce-subtle'
      : animationState === 'wave'
      ? 'animate-pulse'
      : animationState === 'sleep'
      ? 'opacity-80'
      : 'animate-float-slow';

  // Render Silhouette Mode
  if (isSilhouette) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative flex items-center justify-center select-none cursor-pointer transition-transform hover:scale-105 ${className}`}
        onClick={onClick}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mystery aura */}
          <circle cx="100" cy="100" r="88" fill="#4B5563" fillOpacity="0.12" />
          <circle
            cx="100"
            cy="100"
            r="82"
            stroke="#94A3B8"
            strokeWidth="3"
            strokeDasharray="8 6"
            className="animate-spin-slow"
          />

          {/* Silhouette shadow body */}
          <g filter="url(#shadowFilter)">
            <ellipse cx="100" cy="125" rx="55" ry="50" fill="#334155" />
            <circle cx="100" cy="78" r="46" fill="#334155" />
            {/* Round ears */}
            <circle cx="65" cy="42" r="18" fill="#334155" />
            <circle cx="135" cy="42" r="18" fill="#334155" />
            {/* Paws */}
            <ellipse cx="56" cy="120" rx="14" ry="20" fill="#334155" />
            <ellipse cx="144" cy="120" rx="14" ry="20" fill="#334155" />
            <ellipse cx="80" cy="172" rx="18" ry="12" fill="#334155" />
            <ellipse cx="120" cy="172" rx="18" ry="12" fill="#334155" />
          </g>

          {/* Golden mystery lock badge in center */}
          <g transform="translate(82, 95)">
            <rect x="0" y="8" width="36" height="28" rx="7" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            <path
              d="M9 8V-1C9 -6 27 -6 27 -1V8"
              stroke="#F59E0B"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="18" cy="20" r="3.5" fill="#78350F" />
            <path d="M18 23V27" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    );
  }

  // Common Plush Stitches & Seam Pattern
  const renderStitches = () => (
    <path
      d="M100 95 L100 155"
      stroke="#ffffff"
      strokeOpacity="0.4"
      strokeWidth="2"
      strokeDasharray="4 4"
      strokeLinecap="round"
    />
  );

  // Render based on Plush Toy ID
  const renderPlushContent = () => {
    switch (plushId) {
      // 1. GẤU MẬT ONG (Warm Honey Bear)
      case 'plush_bear_honey':
        return (
          <g>
            {/* Ears */}
            <circle cx="60" cy="45" r="22" fill="#B45309" />
            <circle cx="60" cy="45" r="14" fill="#FDE68A" />
            <circle cx="140" cy="45" r="22" fill="#B45309" />
            <circle cx="140" cy="45" r="14" fill="#FDE68A" />

            {/* Arms/Paws */}
            <ellipse cx="48" cy="122" rx="16" ry="24" fill="#D97706" transform="rotate(15 48 122)" />
            <ellipse cx="152" cy="122" rx="16" ry="24" fill="#D97706" transform="rotate(-15 152 122)" />

            {/* Feet */}
            <ellipse cx="75" cy="172" rx="20" ry="14" fill="#B45309" />
            <ellipse cx="75" cy="172" rx="12" ry="8" fill="#FDE68A" />
            <ellipse cx="125" cy="172" rx="20" ry="14" fill="#B45309" />
            <ellipse cx="125" cy="172" rx="12" ry="8" fill="#FDE68A" />

            {/* Body */}
            <ellipse cx="100" cy="126" rx="54" ry="48" fill="#D97706" />
            {/* Belly patch */}
            <ellipse cx="100" cy="130" rx="36" ry="32" fill="#FEF3C7" />
            {renderStitches()}

            {/* Head */}
            <ellipse cx="100" cy="80" rx="48" ry="44" fill="#D97706" />
            {/* Snout */}
            <ellipse cx="100" cy="88" rx="24" ry="18" fill="#FEF3C7" />
            <ellipse cx="100" cy="80" rx="9" ry="6" fill="#78350F" />
            <path d="M100 86 Q100 96 93 96 M100 86 Q100 96 107 96" stroke="#78350F" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Eyes */}
            {animationState === 'sleep' ? (
              <>
                <path d="M78 74 Q85 80 92 74" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M108 74 Q115 80 122 74" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="82" cy="72" r="6" fill="#292524" />
                <circle cx="80" cy="70" r="2.2" fill="#FFFFFF" />
                <circle cx="118" cy="72" r="6" fill="#292524" />
                <circle cx="116" cy="70" r="2.2" fill="#FFFFFF" />
              </>
            )}

            {/* Cheeks */}
            <circle cx="72" cy="85" r="7" fill="#F43F5E" fillOpacity="0.4" />
            <circle cx="128" cy="85" r="7" fill="#F43F5E" fillOpacity="0.4" />

            {/* Honey jar badge on chest */}
            <g transform="translate(90, 120) scale(0.75)">
              <rect x="0" y="5" width="26" height="24" rx="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
              <rect x="3" y="1" width="20" height="5" rx="2" fill="#D97706" />
              <text x="13" y="21" fontSize="12" textAnchor="middle" fill="#78350F">🍯</text>
            </g>
          </g>
        );

      // 2. MÈO KEM (Pink Cream Kitty)
      case 'plush_cat_cream':
        return (
          <g>
            {/* Pointy Cat Ears */}
            <polygon points="52,65 65,30 85,55" fill="#F472B6" />
            <polygon points="56,62 65,37 80,55" fill="#FCE7F3" />
            <polygon points="148,65 135,30 115,55" fill="#F472B6" />
            <polygon points="144,62 135,37 120,55" fill="#FCE7F3" />

            {/* Tail */}
            <path d="M145 140 Q175 130 170 100" stroke="#F472B6" strokeWidth="14" strokeLinecap="round" fill="none" />

            {/* Paws */}
            <ellipse cx="50" cy="120" rx="14" ry="22" fill="#F472B6" transform="rotate(12 50 120)" />
            <ellipse cx="150" cy="120" rx="14" ry="22" fill="#F472B6" transform="rotate(-12 150 120)" />
            <ellipse cx="78" cy="170" rx="18" ry="13" fill="#F472B6" />
            <ellipse cx="122" cy="170" rx="18" ry="13" fill="#F472B6" />

            {/* Body */}
            <ellipse cx="100" cy="126" rx="52" ry="46" fill="#F472B6" />
            <ellipse cx="100" cy="130" rx="34" ry="30" fill="#FFF1F2" />
            {renderStitches()}

            {/* Head */}
            <ellipse cx="100" cy="80" rx="46" ry="40" fill="#F472B6" />

            {/* Whiskers */}
            <line x1="55" y1="84" x2="35" y2="80" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
            <line x1="55" y1="88" x2="35" y2="92" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
            <line x1="145" y1="84" x2="165" y2="80" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />
            <line x1="145" y1="88" x2="165" y2="92" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" />

            {/* Snout */}
            <ellipse cx="100" cy="86" rx="16" ry="12" fill="#FFF1F2" />
            <polygon points="96,82 104,82 100,87" fill="#DB2777" />
            <path d="M100 87 Q100 93 96 93 M100 87 Q100 93 104 93" stroke="#DB2777" strokeWidth="2" fill="none" />

            {/* Eyes */}
            <circle cx="82" cy="74" r="6" fill="#374151" />
            <circle cx="80" cy="72" r="2.2" fill="#FFFFFF" />
            <circle cx="118" cy="74" r="6" fill="#374151" />
            <circle cx="116" cy="72" r="2.2" fill="#FFFFFF" />

            {/* Cheeks */}
            <circle cx="70" cy="85" r="7" fill="#BE185D" fillOpacity="0.3" />
            <circle cx="130" cy="85" r="7" fill="#BE185D" fillOpacity="0.3" />

            {/* Pink ribbon collar with bell */}
            <path d="M75 98 Q100 110 125 98" stroke="#FB7185" strokeWidth="6" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="106" r="6" fill="#FBBF24" />
          </g>
        );

      // 3. CÚN BÔNG (Golden Puppy)
      case 'plush_doggy':
        return (
          <g>
            {/* Floppy Dog Ears */}
            <ellipse cx="50" cy="75" rx="16" ry="32" fill="#D97706" transform="rotate(-15 50 75)" />
            <ellipse cx="150" cy="75" rx="16" ry="32" fill="#D97706" transform="rotate(15 150 75)" />

            {/* Wagging tail */}
            <path d="M145 145 Q165 130 160 110" stroke="#F59E0B" strokeWidth="12" strokeLinecap="round" fill="none" />

            {/* Paws */}
            <ellipse cx="48" cy="122" rx="15" ry="22" fill="#FBBF24" transform="rotate(12 48 122)" />
            <ellipse cx="152" cy="122" rx="15" ry="22" fill="#FBBF24" transform="rotate(-12 152 122)" />
            <ellipse cx="76" cy="172" rx="19" ry="13" fill="#D97706" />
            <ellipse cx="124" cy="172" rx="19" ry="13" fill="#D97706" />

            {/* Body */}
            <ellipse cx="100" cy="126" rx="52" ry="46" fill="#FBBF24" />
            <ellipse cx="100" cy="130" rx="34" ry="30" fill="#FEF3C7" />
            {renderStitches()}

            {/* Head */}
            <ellipse cx="100" cy="80" rx="46" ry="42" fill="#FBBF24" />
            {/* Eye patch */}
            <ellipse cx="80" cy="72" rx="15" ry="13" fill="#D97706" />

            {/* Snout */}
            <ellipse cx="100" cy="88" rx="22" ry="16" fill="#FEF3C7" />
            <ellipse cx="100" cy="82" rx="8" ry="6" fill="#451A03" />
            <path d="M100 87 Q100 95 94 95 M100 87 Q100 95 106 95" stroke="#451A03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Happy tongue */}
            <path d="M97 95 Q100 102 103 95" fill="#F43F5E" />

            {/* Eyes */}
            <circle cx="80" cy="72" r="5.5" fill="#1C1917" />
            <circle cx="78" cy="70" r="2.2" fill="#FFFFFF" />
            <circle cx="118" cy="72" r="5.5" fill="#1C1917" />
            <circle cx="116" cy="70" r="2.2" fill="#FFFFFF" />

            {/* Cheeks */}
            <circle cx="68" cy="88" r="6" fill="#F87171" fillOpacity="0.4" />
            <circle cx="132" cy="88" r="6" fill="#F87171" fillOpacity="0.4" />

            {/* Bone necklace */}
            <g transform="translate(86, 112) scale(0.65)">
              <rect x="5" y="8" width="30" height="8" rx="3" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.5" />
              <circle cx="5" cy="8" r="5" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.5" />
              <circle cx="5" cy="16" r="5" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.5" />
              <circle cx="35" cy="8" r="5" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.5" />
              <circle cx="35" cy="16" r="5" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.5" />
            </g>
          </g>
        );

      // 4. GẤU TRÚC MŨM MĨM (Chubby Panda)
      case 'plush_panda_chubby':
        return (
          <g>
            {/* Black Panda Ears */}
            <circle cx="62" cy="46" r="20" fill="#1F2937" />
            <circle cx="138" cy="46" r="20" fill="#1F2937" />

            {/* Black Paws */}
            <ellipse cx="48" cy="122" rx="16" ry="24" fill="#1F2937" transform="rotate(15 48 122)" />
            <ellipse cx="152" cy="122" rx="16" ry="24" fill="#1F2937" transform="rotate(-15 152 122)" />
            <ellipse cx="76" cy="172" rx="20" ry="14" fill="#1F2937" />
            <ellipse cx="124" cy="172" rx="20" ry="14" fill="#1F2937" />

            {/* Body (White with black vest) */}
            <ellipse cx="100" cy="126" rx="55" ry="48" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="2" />
            <path d="M50 110 Q100 135 150 110 L154 135 Q100 155 46 135 Z" fill="#1F2937" />
            {renderStitches()}

            {/* Head */}
            <ellipse cx="100" cy="80" rx="48" ry="44" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />

            {/* Big black eye patches angled */}
            <ellipse cx="78" cy="74" rx="14" ry="18" fill="#1F2937" transform="rotate(-20 78 74)" />
            <ellipse cx="122" cy="74" rx="14" ry="18" fill="#1F2937" transform="rotate(20 122 74)" />

            {/* Eyes */}
            <circle cx="78" cy="74" r="5" fill="#FFFFFF" />
            <circle cx="78" cy="74" r="3" fill="#111827" />
            <circle cx="122" cy="74" r="5" fill="#FFFFFF" />
            <circle cx="122" cy="74" r="3" fill="#111827" />

            {/* Snout */}
            <ellipse cx="100" cy="88" rx="16" ry="12" fill="#F3F4F6" />
            <ellipse cx="100" cy="84" rx="7" ry="5" fill="#111827" />
            <path d="M100 88 Q100 95 94 95 M100 88 Q100 95 106 95" stroke="#111827" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Cheeks */}
            <circle cx="66" cy="90" r="7" fill="#F43F5E" fillOpacity="0.3" />
            <circle cx="134" cy="90" r="7" fill="#F43F5E" fillOpacity="0.3" />

            {/* Bamboo branch in hand */}
            <path d="M142 125 L165 95" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="160" cy="98" rx="8" ry="4" fill="#34D399" transform="rotate(-30 160 98)" />
            <ellipse cx="150" cy="112" rx="8" ry="4" fill="#34D399" transform="rotate(-45 150 112)" />
          </g>
        );

      // 5. CÁO CAM (Smart Orange Fox)
      case 'plush_fox_orange':
        return (
          <g>
            {/* Pointed Fox Ears */}
            <polygon points="45,60 62,25 84,52" fill="#EA580C" />
            <polygon points="50,58 62,32 78,52" fill="#1E293B" />
            <polygon points="155,60 138,25 116,52" fill="#EA580C" />
            <polygon points="150,58 138,32 122,52" fill="#1E293B" />

            {/* Big Fluffy Fox Tail with white tip */}
            <path d="M140 145 Q185 140 180 100 Q175 75 150 90" fill="#EA580C" />
            <path d="M180 100 Q175 75 150 90 Q165 98 172 108 Z" fill="#FFFFFF" />

            {/* Paws */}
            <ellipse cx="50" cy="122" rx="14" ry="22" fill="#1E293B" transform="rotate(15 50 122)" />
            <ellipse cx="150" cy="122" rx="14" ry="22" fill="#1E293B" transform="rotate(-15 150 122)" />
            <ellipse cx="78" cy="172" rx="18" ry="12" fill="#1E293B" />
            <ellipse cx="122" cy="172" rx="18" ry="12" fill="#1E293B" />

            {/* Body */}
            <ellipse cx="100" cy="126" rx="52" ry="46" fill="#EA580C" />
            <ellipse cx="100" cy="130" rx="34" ry="30" fill="#FFFFFF" />
            {renderStitches()}

            {/* Head with fox cheeks */}
            <ellipse cx="100" cy="80" rx="46" ry="40" fill="#EA580C" />
            {/* White face mask */}
            <path d="M60 82 Q100 105 100 100 Q100 105 140 82 Q120 105 100 105 Q80 105 60 82 Z" fill="#FFFFFF" />

            {/* Snout */}
            <ellipse cx="100" cy="94" rx="14" ry="10" fill="#FFFFFF" />
            <polygon points="96,90 104,90 100,95" fill="#1E293B" />
            <path d="M100 95 L100 98" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

            {/* Eyes */}
            <circle cx="80" cy="74" r="5.5" fill="#1E293B" />
            <circle cx="78" cy="72" r="2.2" fill="#FFFFFF" />
            <circle cx="120" cy="74" r="5.5" fill="#1E293B" />
            <circle cx="118" cy="72" r="2.2" fill="#FFFFFF" />

            {/* Cheeks */}
            <circle cx="72" cy="88" r="6" fill="#F87171" fillOpacity="0.4" />
            <circle cx="128" cy="88" r="6" fill="#F87171" fillOpacity="0.4" />

            {/* Smart mini detective bow tie */}
            <polygon points="90,108 100,113 90,118" fill="#0284C7" />
            <polygon points="110,108 100,113 110,118" fill="#0284C7" />
            <circle cx="100" cy="113" r="3.5" fill="#38BDF8" />
          </g>
        );

      // 6. KOALA MÂY (Cloud Koala)
      case 'plush_koala_cloud':
        return (
          <g>
            {/* Big Fluffy Round Koala Ears */}
            <circle cx="50" cy="50" r="26" fill="#9CA3AF" />
            <circle cx="50" cy="50" r="16" fill="#FFFFFF" />
            <circle cx="150" cy="50" r="26" fill="#9CA3AF" />
            <circle cx="150" cy="50" r="16" fill="#FFFFFF" />

            {/* Paws */}
            <ellipse cx="50" cy="124" rx="15" ry="22" fill="#6B7280" transform="rotate(15 50 124)" />
            <ellipse cx="150" cy="124" rx="15" ry="22" fill="#6B7280" transform="rotate(-15 150 124)" />
            <ellipse cx="76" cy="172" rx="19" ry="13" fill="#6B7280" />
            <ellipse cx="124" cy="172" rx="19" ry="13" fill="#6B7280" />

            {/* Body */}
            <ellipse cx="100" cy="126" rx="54" ry="46" fill="#9CA3AF" />
            <ellipse cx="100" cy="130" rx="36" ry="30" fill="#F3F4F6" />
            {renderStitches()}

            {/* Head */}
            <ellipse cx="100" cy="80" rx="46" ry="42" fill="#9CA3AF" />

            {/* Big distinctive Koala oval black nose */}
            <ellipse cx="100" cy="84" rx="14" ry="20" fill="#374151" />
            <ellipse cx="97" cy="76" rx="3" ry="5" fill="#6B7280" fillOpacity="0.4" />

            {/* Eyes */}
            <circle cx="76" cy="72" r="5" fill="#1F2937" />
            <circle cx="74" cy="70" r="2" fill="#FFFFFF" />
            <circle cx="124" cy="72" r="5" fill="#1F2937" />
            <circle cx="122" cy="70" r="2" fill="#FFFFFF" />

            {/* Cheeks */}
            <circle cx="68" cy="86" r="6" fill="#F472B6" fillOpacity="0.4" />
            <circle cx="132" cy="86" r="6" fill="#F472B6" fillOpacity="0.4" />

            {/* Cozy Cloud Badge on chest */}
            <g transform="translate(85, 122) scale(0.65)">
              <path
                d="M10 20 Q10 10 22 10 Q28 2 38 7 Q48 5 48 16 Q54 18 52 26 Q50 32 40 32 L15 32 Q8 32 10 20 Z"
                fill="#E0F2FE"
                stroke="#38BDF8"
                strokeWidth="2"
              />
            </g>
          </g>
        );

      // 7. CÁNH CỤT BÔNG (Baby Penguin)
      case 'plush_penguin':
        return (
          <g>
            {/* Flippers */}
            <ellipse cx="46" cy="120" rx="14" ry="26" fill="#0F172A" transform="rotate(22 46 120)" />
            <ellipse cx="154" cy="120" rx="14" ry="26" fill="#0F172A" transform="rotate(-22 154 120)" />

            {/* Orange Feet */}
            <ellipse cx="76" cy="172" rx="20" ry="12" fill="#F97316" />
            <ellipse cx="124" cy="172" rx="20" ry="12" fill="#F97316" />

            {/* Dark Navy Body with White Belly */}
            <ellipse cx="100" cy="124" rx="55" ry="48" fill="#0F172A" />
            <ellipse cx="100" cy="126" rx="38" ry="38" fill="#F8FAFC" />
            {renderStitches()}

            {/* Head */}
            <ellipse cx="100" cy="76" rx="46" ry="42" fill="#0F172A" />
            {/* White face heart patch */}
            <path
              d="M100 68 C80 40 60 70 75 92 C85 102 100 108 100 108 C100 108 115 102 125 92 C140 70 120 40 100 68 Z"
              fill="#FFFFFF"
            />

            {/* Orange Beak */}
            <polygon points="94,80 106,80 100,88" fill="#F97316" />

            {/* Eyes */}
            <circle cx="82" cy="74" r="5" fill="#0F172A" />
            <circle cx="80" cy="72" r="2" fill="#FFFFFF" />
            <circle cx="118" cy="74" r="5" fill="#0F172A" />
            <circle cx="116" cy="72" r="2" fill="#FFFFFF" />

            {/* Cheeks */}
            <circle cx="70" cy="86" r="6" fill="#FB7185" fillOpacity="0.4" />
            <circle cx="130" cy="86" r="6" fill="#FB7185" fillOpacity="0.4" />

            {/* Striped Winter Scarf */}
            <path d="M72 96 Q100 108 128 96" stroke="#0284C7" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M112 102 L112 125" stroke="#0284C7" strokeWidth="8" strokeLinecap="round" />
            <circle cx="112" cy="128" r="4" fill="#38BDF8" />
          </g>
        );

      // 8. SƯ TỬ NHÍ (Royal Lion Cub)
      case 'plush_lion_cub':
        return (
          <g>
            {/* Fluffy Golden Mane */}
            <circle cx="100" cy="80" r="56" fill="#D97706" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x = 100 + 52 * Math.cos(angle);
              const y = 80 + 52 * Math.sin(angle);
              return <circle key={i} cx={x} cy={y} r="14" fill="#B45309" />;
            })}

            {/* Ears */}
            <circle cx="62" cy="46" r="18" fill="#F59E0B" />
            <circle cx="62" cy="46" r="10" fill="#FEF3C7" />
            <circle cx="138" cy="46" r="18" fill="#F59E0B" />
            <circle cx="138" cy="46" r="10" fill="#FEF3C7" />

            {/* Paws */}
            <ellipse cx="48" cy="124" rx="15" ry="22" fill="#F59E0B" transform="rotate(15 48 124)" />
            <ellipse cx="152" cy="124" rx="15" ry="22" fill="#F59E0B" transform="rotate(-15 152 124)" />
            <ellipse cx="76" cy="172" rx="19" ry="13" fill="#D97706" />
            <ellipse cx="124" cy="172" rx="19" ry="13" fill="#D97706" />

            {/* Body */}
            <ellipse cx="100" cy="126" rx="52" ry="46" fill="#F59E0B" />
            <ellipse cx="100" cy="130" rx="34" ry="30" fill="#FEF3C7" />
            {renderStitches()}

            {/* Head */}
            <ellipse cx="100" cy="80" rx="44" ry="40" fill="#FBBF24" />

            {/* Snout */}
            <ellipse cx="100" cy="88" rx="20" ry="14" fill="#FEF3C7" />
            <polygon points="95,82 105,82 100,88" fill="#92400E" />
            <path d="M100 88 Q100 95 94 95 M100 88 Q100 95 106 95" stroke="#92400E" strokeWidth="2" fill="none" />

            {/* Eyes */}
            <circle cx="82" cy="74" r="5.5" fill="#78350F" />
            <circle cx="80" cy="72" r="2.2" fill="#FFFFFF" />
            <circle cx="118" cy="74" r="5.5" fill="#78350F" />
            <circle cx="116" cy="72" r="2.2" fill="#FFFFFF" />

            {/* Cheeks */}
            <circle cx="70" cy="88" r="6" fill="#F59E0B" fillOpacity="0.4" />
            <circle cx="130" cy="88" r="6" fill="#F59E0B" fillOpacity="0.4" />

            {/* Royal Golden Crown */}
            <g transform="translate(82, 24)">
              <polygon points="0,20 6,8 18,15 30,8 36,20" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="6" cy="8" r="2.5" fill="#EF4444" />
              <circle cx="18" cy="15" r="2.5" fill="#3B82F6" />
              <circle cx="30" cy="8" r="2.5" fill="#10B981" />
            </g>
          </g>
        );

      // 9. VOI BÔNG (Gentle Blue Elephant)
      case 'plush_elephant':
        return (
          <g>
            {/* Big Rounded Elephant Ears */}
            <ellipse cx="44" cy="76" rx="24" ry="34" fill="#818CF8" transform="rotate(-15 44 76)" />
            <ellipse cx="44" cy="76" rx="15" ry="24" fill="#C7D2FE" transform="rotate(-15 44 76)" />
            <ellipse cx="156" cy="76" rx="24" ry="34" fill="#818CF8" transform="rotate(15 156 76)" />
            <ellipse cx="156" cy="76" rx="15" ry="24" fill="#C7D2FE" transform="rotate(15 156 76)" />

            {/* Paws */}
            <ellipse cx="50" cy="124" rx="16" ry="22" fill="#6366F1" transform="rotate(15 50 124)" />
            <ellipse cx="150" cy="124" rx="16" ry="22" fill="#6366F1" transform="rotate(-15 150 124)" />
            <ellipse cx="76" cy="172" rx="20" ry="14" fill="#4F46E5" />
            <ellipse cx="124" cy="172" rx="20" ry="14" fill="#4F46E5" />

            {/* Body */}
            <ellipse cx="100" cy="126" rx="55" ry="48" fill="#818CF8" />
            <ellipse cx="100" cy="130" rx="36" ry="32" fill="#E0E7FF" />
            {renderStitches()}

            {/* Head */}
            <ellipse cx="100" cy="80" rx="46" ry="42" fill="#818CF8" />

            {/* Cute trunk curling up */}
            <path
              d="M100 84 Q100 102 92 106 Q84 108 85 98"
              stroke="#6366F1"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />

            {/* Eyes */}
            <circle cx="80" cy="72" r="5" fill="#1E1B4B" />
            <circle cx="78" cy="70" r="2" fill="#FFFFFF" />
            <circle cx="120" cy="72" r="5" fill="#1E1B4B" />
            <circle cx="118" cy="70" r="2" fill="#FFFFFF" />

            {/* Cheeks */}
            <circle cx="68" cy="85" r="7" fill="#F472B6" fillOpacity="0.4" />
            <circle cx="132" cy="85" r="7" fill="#F472B6" fillOpacity="0.4" />

            {/* Star badge on belly */}
            <g transform="translate(90, 126) scale(0.65)">
              <polygon
                points="15,0 19,10 30,11 22,19 25,30 15,24 5,30 8,19 0,11 11,10"
                fill="#FBBF24"
                stroke="#D97706"
                strokeWidth="1.5"
              />
            </g>
          </g>
        );

      // 10. KỲ LÂN CẦU VỒNG (Rainbow Unicorn - Grand Finale Plush!)
      case 'plush_unicorn_rainbow':
      default:
        return (
          <g>
            {/* Rainbow Mane */}
            <path d="M70 42 Q85 10 100 30" stroke="#F43F5E" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M78 48 Q95 18 110 35" stroke="#FBBF24" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M86 54 Q105 26 120 40" stroke="#10B981" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M94 60 Q115 34 130 46" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M102 66 Q125 42 138 52" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" fill="none" />

            {/* Ears */}
            <polygon points="62,60 74,28 90,52" fill="#EDE9FE" />
            <polygon points="66,58 74,34 86,52" fill="#FCE7F3" />
            <polygon points="138,60 126,28 110,52" fill="#EDE9FE" />
            <polygon points="134,58 126,34 114,52" fill="#FCE7F3" />

            {/* Golden Magic Horn */}
            <polygon points="94,40 106,40 100,6" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
            <line x1="97" y1="30" x2="103" y2="30" stroke="#CA8A04" strokeWidth="1.5" />
            <line x1="98" y1="20" x2="102" y2="20" stroke="#CA8A04" strokeWidth="1.5" />
            <circle cx="100" cy="5" r="3" fill="#FDE047" className="animate-ping" />

            {/* Wings */}
            <path d="M45 110 Q20 90 40 75 Q55 85 52 110" fill="#E0E7FF" stroke="#C7D2FE" strokeWidth="1.5" />
            <path d="M155 110 Q180 90 160 75 Q145 85 148 110" fill="#E0E7FF" stroke="#C7D2FE" strokeWidth="1.5" />

            {/* Paws / Hooves */}
            <ellipse cx="50" cy="124" rx="14" ry="22" fill="#EDE9FE" transform="rotate(15 50 124)" />
            <ellipse cx="150" cy="124" rx="14" ry="22" fill="#EDE9FE" transform="rotate(-15 150 124)" />
            <ellipse cx="76" cy="172" rx="19" ry="13" fill="#C4B5FD" />
            <ellipse cx="124" cy="172" rx="19" ry="13" fill="#C4B5FD" />

            {/* Body */}
            <ellipse cx="100" cy="126" rx="52" ry="46" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
            <ellipse cx="100" cy="130" rx="34" ry="30" fill="#FDF4FF" />
            {renderStitches()}

            {/* Head */}
            <ellipse cx="100" cy="80" rx="46" ry="40" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />

            {/* Snout */}
            <ellipse cx="100" cy="88" rx="18" ry="12" fill="#FDF4FF" />
            <circle cx="95" cy="86" r="2" fill="#EC4899" />
            <circle cx="105" cy="86" r="2" fill="#EC4899" />
            <path d="M96 92 Q100 96 104 92" stroke="#EC4899" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Eyes (Sparkly Stars) */}
            <circle cx="82" cy="74" r="5.5" fill="#6B21A8" />
            <circle cx="80" cy="72" r="2.2" fill="#FFFFFF" />
            <circle cx="118" cy="74" r="5.5" fill="#6B21A8" />
            <circle cx="116" cy="72" r="2.2" fill="#FFFFFF" />

            {/* Cheeks */}
            <circle cx="70" cy="86" r="6" fill="#F472B6" fillOpacity="0.4" />
            <circle cx="130" cy="86" r="6" fill="#F472B6" fillOpacity="0.4" />

            {/* Rainbow Star Chest Jewel */}
            <g transform="translate(88, 120) scale(0.8)">
              <polygon
                points="15,0 19,10 30,11 22,19 25,30 15,24 5,30 8,19 0,11 11,10"
                fill="url(#rainbowGradient)"
              />
            </g>

            <defs>
              <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="25%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="75%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </g>
        );
    }
  };

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 ${animClass} ${className}`}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft studio lighting shadow at feet */}
        <ellipse cx="100" cy="184" rx="60" ry="12" fill="#000000" fillOpacity="0.12" />

        {/* The 3D plush character */}
        {renderPlushContent()}
      </svg>
    </div>
  );
};
