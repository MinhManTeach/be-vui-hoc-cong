import React from 'react';
import { WorldId } from '../types/math';

export interface WorldThemeConfig {
  id: WorldId;
  name: string;
  adventureName: string;
  themeColor: string;
  skyGradient: string;
  pathColor: string;
  pathBorderColor: string;
  groundColor: string;
  blockStyle: 'flower' | 'basket' | 'coin' | 'magic_block' | 'wooden_tile' | 'crystal';
  visualItem: 'apple' | 'flower' | 'star' | 'gem' | 'carrot' | 'balloon';
  hintText: string;
  description: string;
}

export const WORLD_THEMES: Record<WorldId, WorldThemeConfig> = {
  world_1_counting: {
    id: 'world_1_counting',
    name: 'Bé Tập Đếm',
    adventureName: 'Khu Vườn Đếm Số',
    themeColor: '#10B981',
    skyGradient: 'from-sky-300 via-emerald-100 to-green-200',
    pathColor: '#FDE68A',
    pathBorderColor: '#D97706',
    groundColor: '#4ADE80',
    blockStyle: 'flower',
    visualItem: 'flower',
    hintText: 'Bé hãy chạm vào từng bông hoa xinh đẹp để đếm nhé!',
    description: 'Cối xay gió quay tít, hoa cỏ rực rỡ, bướm vàng bay lượn quanh những viên đá bước chân.',
  },
  world_2_merge: {
    id: 'world_2_merge',
    name: 'Gộp Hai Nhóm',
    adventureName: 'Rừng Gộp Nhóm',
    themeColor: '#F59E0B',
    skyGradient: 'from-amber-200 via-orange-100 to-emerald-200',
    pathColor: '#FDBA74',
    pathBorderColor: '#C2410C',
    groundColor: '#84CC16',
    blockStyle: 'basket',
    visualItem: 'apple',
    hintText: 'Cùng gộp hai nhóm quả táo vào chung một giỏ gỗ nào!',
    description: 'Cây cổ thụ tỏa bóng mát, nấm đốm rực rỡ bên dòng suối nhỏ róc rách.',
  },
  world_3_add_10: {
    id: 'world_3_add_10',
    name: 'Cộng Trong Phạm Vi 10',
    adventureName: 'Đảo Phép Cộng',
    themeColor: '#0EA5E9',
    skyGradient: 'from-sky-400 via-cyan-100 to-amber-100',
    pathColor: '#FEF08A',
    pathBorderColor: '#CA8A04',
    groundColor: '#FDE047',
    blockStyle: 'coin',
    visualItem: 'star',
    hintText: 'Giải phép tính để tìm ra đồng tiền vàng của kho báu!',
    description: 'Bờ biển cát vàng ấm áp, rặng dừa xanh đung đưa và thuyền buồm ngoài xa khơi.',
  },
  world_4_make_10: {
    id: 'world_4_make_10',
    name: 'Ngôi Nhà Số 10',
    adventureName: 'Vương Quốc Số 10',
    themeColor: '#8B5CF6',
    skyGradient: 'from-indigo-400 via-purple-200 to-pink-100',
    pathColor: '#DDD6FE',
    pathBorderColor: '#7C3AED',
    groundColor: '#A78BFA',
    blockStyle: 'magic_block',
    visualItem: 'gem',
    hintText: 'Tìm người bạn ghép cặp để thắp sáng cánh cổng số 10 huyền bí!',
    description: 'Tòa lâu đài cổ tích nguy nga, những ngọn cờ hoàng gia bay phấp phới trong nắng hoàng hôn.',
  },
  world_5_split: {
    id: 'world_5_split',
    name: 'Tách Số Thông Minh',
    adventureName: 'Thung Lũng Tách Số',
    themeColor: '#EC4899',
    skyGradient: 'from-rose-300 via-pink-100 to-teal-100',
    pathColor: '#FED7AA',
    pathBorderColor: '#EA580C',
    groundColor: '#34D399',
    blockStyle: 'wooden_tile',
    visualItem: 'carrot',
    hintText: 'Chia những củ cà rốt ngon lành vào hai chiếc giỏ thần kỳ.',
    description: 'Dòng sông chia hai nhánh nhỏ uốn quanh thung lũng, cầu vồng bắc ngang chân trời.',
  },
  world_6_over_10: {
    id: 'world_6_over_10',
    name: 'Cộng Vượt 10',
    adventureName: 'Hành Tinh Vượt 10',
    themeColor: '#6366F1',
    skyGradient: 'from-slate-900 via-indigo-950 to-purple-900',
    pathColor: '#67E8F9',
    pathBorderColor: '#0891B2',
    groundColor: '#1E1B4B',
    blockStyle: 'crystal',
    visualItem: 'star',
    hintText: 'Tạo 10 trước rồi nạp năng lượng đưa tên lửa vút bay tới các vì sao!',
    description: 'Vũ trụ huyền ảo lấp lánh tinh vân, các trạm không gian và vệ tinh đang chờ đón bé.',
  },
};

// Vector Scenery Artworks for depth (Background, Midground, Foreground)

export const CastleScenerySVG: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 800 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Mountains in far distance */}
    <path d="M0 320 L150 180 L300 320 Z" fill="#C4B5FD" opacity="0.6" />
    <path d="M220 320 L400 140 L580 320 Z" fill="#A78BFA" opacity="0.7" />
    <path d="M500 320 L650 200 L800 320 Z" fill="#C4B5FD" opacity="0.6" />
    {/* Rolling Hills midground */}
    <path d="M-50 360 Q200 240 450 340 T900 320 L900 400 L-50 400 Z" fill="#86EFAC" />
    <path d="M-50 380 Q300 280 600 360 T900 350 L900 400 L-50 400 Z" fill="#4ADE80" />
    {/* Majestic Cartoon Castle Centerpiece */}
    <g transform="translate(280, 110)">
      {/* Main Castle Body */}
      <rect x="50" y="90" width="140" height="130" rx="10" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="5" />
      {/* Castle Gate */}
      <path d="M95 220 V155 Q120 135 145 155 V220 Z" fill="#64748B" stroke="#334155" strokeWidth="4" />
      <circle cx="120" cy="170" r="14" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />
      <text x="113" y="176" fontSize="16" fontWeight="900" fill="#78350F">10</text>
      {/* Left Tower */}
      <rect x="20" y="50" width="46" height="170" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="4" />
      <polygon points="12,50 43,0 74,50" fill="#A855F7" stroke="#7E22CE" strokeWidth="3" />
      <circle cx="43" cy="90" r="7" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
      {/* Right Tower */}
      <rect x="174" y="50" width="46" height="170" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="4" />
      <polygon points="166,50 197,0 228,50" fill="#A855F7" stroke="#7E22CE" strokeWidth="3" />
      <circle cx="197" cy="90" r="7" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
      {/* Center Tower */}
      <rect x="85" y="40" width="70" height="70" rx="6" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="4" />
      <polygon points="75,40 120,-20 165,40" fill="#EC4899" stroke="#BE185D" strokeWidth="3" />
      {/* Flags waving */}
      <path d="M120 -20 H150 L140 -8 L150 4 H120 Z" fill="#FBBF24" />
      <path d="M43 0 H65 L58 8 L65 16 H43 Z" fill="#38BDF8" />
      <path d="M197 0 H219 L212 8 L219 16 H197 Z" fill="#38BDF8" />
    </g>
    {/* Fluffy clouds */}
    <g fill="#FFFFFF" opacity="0.85">
      <path d="M60 90 Q80 60 110 75 Q140 50 160 80 Q190 90 170 120 Q120 130 60 110 Z" />
      <path d="M620 70 Q640 40 670 55 Q700 30 720 60 Q750 70 730 100 Q680 110 620 90 Z" />
    </g>
  </svg>
);

export const GardenScenerySVG: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 800 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Rainbow arch */}
    <path d="M100 380 Q400 40 700 380" stroke="#FDA4AF" strokeWidth="16" fill="none" opacity="0.4" />
    <path d="M100 380 Q400 56 700 380" stroke="#FDE047" strokeWidth="16" fill="none" opacity="0.4" />
    <path d="M100 380 Q400 72 700 380" stroke="#86EFAC" strokeWidth="16" fill="none" opacity="0.4" />
    <path d="M100 380 Q400 88 700 380" stroke="#93C5FD" strokeWidth="16" fill="none" opacity="0.4" />
    {/* Rolling Green Hills */}
    <path d="M-50 340 Q150 200 420 300 T900 280 L900 400 L-50 400 Z" fill="#86EFAC" />
    <path d="M-50 370 Q250 260 550 340 T900 330 L900 400 L-50 400 Z" fill="#4ADE80" />
    {/* Cute Windmill */}
    <g transform="translate(140, 160)">
      <polygon points="20,150 35,40 65,40 80,150" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="3" />
      <polygon points="30,40 50,15 70,40" fill="#EF4444" />
      <circle cx="50" cy="50" r="8" fill="#F59E0B" />
      {/* Mill Blades */}
      <line x1="50" y1="50" x2="10" y2="10" stroke="#B45309" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="50" x2="90" y2="90" stroke="#B45309" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="50" x2="90" y2="10" stroke="#B45309" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="50" x2="10" y2="90" stroke="#B45309" strokeWidth="5" strokeLinecap="round" />
    </g>
    {/* Trees & Flowers */}
    <g transform="translate(620, 180)">
      <rect x="25" y="80" width="16" height="70" rx="5" fill="#78350F" />
      <circle cx="33" cy="65" r="42" fill="#22C55E" />
      <circle cx="20" cy="45" r="28" fill="#4ADE80" />
      <circle cx="50" cy="50" r="30" fill="#16A34A" />
      <circle cx="28" cy="58" r="6" fill="#EF4444" />
      <circle cx="45" cy="72" r="5" fill="#EF4444" />
    </g>
  </svg>
);

export const ForestScenerySVG: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 800 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Deep Woods Trees */}
    <path d="M-50 360 Q200 260 450 340 T900 320 L900 400 L-50 400 Z" fill="#65A30D" />
    <path d="M-50 380 Q300 300 600 360 T900 360 L900 400 L-50 400 Z" fill="#4D7C0F" />
    {/* Big Mushroom left */}
    <g transform="translate(100, 220)">
      <rect x="25" y="55" width="26" height="65" rx="10" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="3" />
      <path d="M5 60 C5 0 70 0 70 60 Z" fill="#EF4444" />
      <circle cx="25" cy="30" r="7" fill="#FFFFFF" />
      <circle cx="50" cy="40" r="6" fill="#FFFFFF" />
      <circle cx="38" cy="18" r="5" fill="#FFFFFF" />
    </g>
    {/* Big Mushroom right */}
    <g transform="translate(640, 240)">
      <rect x="20" y="45" width="20" height="50" rx="8" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2.5" />
      <path d="M5 50 C5 5 55 5 55 50 Z" fill="#F59E0B" />
      <circle cx="22" cy="25" r="5" fill="#FFFFFF" />
      <circle cx="38" cy="32" r="4" fill="#FFFFFF" />
    </g>
  </svg>
);

export const IslandScenerySVG: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 800 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Blue Ocean waves */}
    <path d="M0 240 C150 220 250 260 400 240 C550 220 650 260 800 240 L800 400 L0 400 Z" fill="#38BDF8" />
    <path d="M0 280 C120 260 280 300 450 270 C600 250 720 290 800 275 L800 400 L0 400 Z" fill="#0284C7" />
    {/* Golden Sand Island */}
    <ellipse cx="400" cy="360" rx="360" ry="100" fill="#FDE047" stroke="#EAB308" strokeWidth="6" />
    {/* Palm Tree */}
    <g transform="translate(180, 150)">
      <path d="M40 160 Q20 80 50 20" stroke="#92400E" strokeWidth="18" strokeLinecap="round" fill="none" />
      {/* Palm Fronds */}
      <path d="M50 20 Q-20 0 -40 30" stroke="#16A34A" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M50 20 Q10 -40 30 -50" stroke="#22C55E" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M50 20 Q100 -30 120 0" stroke="#16A34A" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M50 20 Q110 30 130 60" stroke="#22C55E" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* Coconuts */}
      <circle cx="45" cy="24" r="8" fill="#78350F" />
      <circle cx="56" cy="28" r="8" fill="#78350F" />
    </g>
    {/* Pirate Treasure Chest in sand */}
    <g transform="translate(560, 270)">
      <rect x="0" y="20" width="60" height="38" rx="6" fill="#B45309" stroke="#78350F" strokeWidth="3" />
      <path d="M0 20 Q30 -10 60 20 Z" fill="#D97706" stroke="#78350F" strokeWidth="3" />
      <rect x="25" y="16" width="10" height="14" rx="2" fill="#FBBF24" stroke="#78350F" strokeWidth="2" />
    </g>
  </svg>
);

export const SpaceScenerySVG: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 800 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Nebula glow */}
    <ellipse cx="250" cy="180" rx="200" ry="120" fill="#7C3AED" opacity="0.35" filter="blur(30px)" />
    <ellipse cx="600" cy="220" rx="180" ry="100" fill="#0284C7" opacity="0.35" filter="blur(30px)" />
    {/* Ringed Planet */}
    <g transform="translate(620, 100)">
      <circle cx="60" cy="60" r="38" fill="#F59E0B" />
      <ellipse cx="60" cy="60" rx="75" ry="18" stroke="#FDE68A" strokeWidth="8" transform="rotate(-25 60 60)" fill="none" />
    </g>
    {/* Friendly Moon */}
    <g transform="translate(100, 90)">
      <circle cx="50" cy="50" r="35" fill="#E2E8F0" />
      <circle cx="40" cy="40" r="7" fill="#CBD5E1" />
      <circle cx="62" cy="55" r="9" fill="#CBD5E1" />
      <circle cx="48" cy="68" r="5" fill="#CBD5E1" />
    </g>
    {/* Tiny stars */}
    <g>
      {[
        [50, 40], [180, 50], [290, 80], [420, 40], [530, 80], [720, 50],
        [80, 240], [220, 270], [360, 230], [520, 260], [750, 220],
      ].map(([x, y], idx) => (
        <circle key={idx} cx={x} cy={y} r={idx % 2 === 0 ? 3 : 2} fill="#FFFFFF" opacity={idx % 3 === 0 ? 0.9 : 0.6} />
      ))}
    </g>
  </svg>
);

export const ValleyScenerySVG: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 800 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Crystal Mountain Peaks */}
    <path d="M-50 360 L180 160 L380 360 Z" fill="#F472B6" opacity="0.6" />
    <path d="M220 360 L450 120 L680 360 Z" fill="#EC4899" opacity="0.7" />
    <path d="M500 360 L700 180 L900 360 Z" fill="#F472B6" opacity="0.6" />
    {/* Rolling Rainbow Valley hills */}
    <path d="M-50 360 Q200 250 450 340 T900 320 L900 400 L-50 400 Z" fill="#A7F3D0" />
    <path d="M-50 380 Q300 290 600 360 T900 350 L900 400 L-50 400 Z" fill="#6EE7B7" />
    {/* Waterfall dividing into two branches */}
    <g transform="translate(410, 160)">
      <path d="M40 0 Q40 100 0 200" stroke="#38BDF8" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M40 0 Q40 100 80 200" stroke="#60A5FA" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.8" />
      <circle cx="40" cy="190" r="16" fill="#BAE6FD" />
    </g>
    {/* Giant Crystal Gems */}
    <g transform="translate(180, 260)">
      <polygon points="20,0 35,25 28,60 12,60 5,25" fill="#C084FC" stroke="#9333EA" strokeWidth="3" />
      <polygon points="12,25 20,0 28,25 20,60" fill="#E9D5FF" />
    </g>
    <g transform="translate(620, 280)">
      <polygon points="18,0 32,22 25,50 11,50 4,22" fill="#F472B6" stroke="#DB2777" strokeWidth="2.5" />
      <polygon points="11,22 18,0 25,22 18,50" fill="#FCE7F3" />
    </g>
  </svg>
);
