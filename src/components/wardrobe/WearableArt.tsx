import React from 'react';
import {AccessoryType, UserProgress} from '../../types/math';
import {REWARDS_CATALOG} from '../../utils/rewards';
import {toggleWearable as toggleShopWearable} from '../../domain/shop/shop';

/**
 * Thỏ Bông's wardrobe art. Every item is drawn once in a 100×100 box in a sticker style
 * (warm brown outline, flat colour, one soft shade, one white shine) and that same drawing is
 * used for the shop card and on the bunny, placed by its slot's box in the bunny's 200×240 space.
 */
type Box = {x: number; y: number; size: number};
type Anchor = Box & {name: string; layer: string};

export const WEARABLE_ANCHORS: Record<AccessoryType, Anchor> = {
  hat: {name: 'HEAD', x: 35, y: -8, size: 130, layer: 'HEADWEAR'},
  glasses: {name: 'FACE', x: 50, y: 89, size: 100, layer: 'GLASSES'},
  shirt: {name: 'BODY', x: 40, y: 128, size: 120, layer: 'CLOTHING'},
  backpack: {name: 'BACK', x: 110, y: 108, size: 86, layer: 'BACK'},
  item: {name: 'HAND', x: 112, y: 88, size: 95, layer: 'ACCESSORY'},
  badge: {name: 'BADGE', x: 86, y: 182, size: 28, layer: 'BADGE'},
};

export const WEARABLE_LAYER_ORDER = ['BACK', 'BODY', 'CLOTHING', 'FACE', 'GLASSES', 'HEADWEAR', 'ACCESSORY', 'BADGE'] as const;

// Visible part of each slot's 100×100 drawing, so shop cards are filled edge to edge.
const ICON_VIEWBOX: Record<AccessoryType, string> = {
  hat: '4 2 92 92',
  glasses: '0 -10 100 70',
  shirt: '-2 14 104 84',
  backpack: '26 2 74 90',
  item: '0 0 100 100',
  badge: '0 0 100 100',
};

const O = '#5B4636'; // outline
const W = 3.5;
const line = {stroke: O, strokeWidth: W, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const shine = (d: string) => <path d={d} stroke="#FFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".7" />;

const starPath = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.48;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
};
const Star = ({cx, cy, r, fill = '#FCD34D'}: {cx: number; cy: number; r: number; fill?: string}) => (
  <path d={starPath(cx, cy, r)} fill={fill} {...line} strokeWidth={W * 0.8} />
);
const Flower = ({cx, cy, r, petal, center = '#FBBF24'}: {cx: number; cy: number; r: number; petal: string; center?: string}) => (
  <g>
    {[0, 72, 144, 216, 288].map(a => (
      <circle key={a} cx={cx + r * 0.62 * Math.cos((a * Math.PI) / 180 - Math.PI / 2)} cy={cy + r * 0.62 * Math.sin((a * Math.PI) / 180 - Math.PI / 2)} r={r * 0.5} fill={petal} {...line} strokeWidth={2.5} />
    ))}
    <circle cx={cx} cy={cy} r={r * 0.38} fill={center} {...line} strokeWidth={2.5} />
  </g>
);

// Body-hugging garment outline in the shirt box (body ellipse centre 50,43 rx48 ry42).
const BODY = 'M5 34 Q8 24 22 23 L78 23 Q92 24 95 34 C97 58 86 84 50 85 C14 84 3 58 5 34 Z';

const artworks: Record<string, React.ReactNode> = {
  /* ───── Mũ ───── */
  hat_bow: (
    <g>
      <path d="M76 50 C62 26 42 30 46 48 C48 62 64 64 76 50 Z" fill="#F472B6" {...line} />
      <path d="M76 50 C90 26 110 30 106 48 C104 62 88 64 76 50 Z" fill="#F472B6" {...line} />
      <path d="M72 53 L62 76 L70 74 L73 82 L78 55 Z M80 53 L90 76 L82 74 L79 82 L74 55 Z" fill="#EC4899" {...line} strokeWidth={2.5} />
      <circle cx="76" cy="50" r="8" fill="#FBCFE8" {...line} />
      {shine('M52 44 Q54 37 61 36')}
      {shine('M100 43 Q98 37 92 36')}
    </g>
  ),
  hat_cap: (
    <g>
      <path d="M26 60 C24 36 36 26 50 26 C64 26 76 36 74 60 Z" fill="#FB923C" {...line} />
      <path d="M50 27 C44 38 44 50 46 60" fill="none" stroke="#EA580C" strokeWidth="2.5" />
      <path d="M50 27 C58 38 58 50 56 60" fill="none" stroke="#EA580C" strokeWidth="2.5" />
      <path d="M18 63 Q50 52 86 62 Q90 70 78 72 Q50 66 22 72 Q12 70 18 63 Z" fill="#F97316" {...line} />
      <circle cx="50" cy="26" r="4" fill="#EA580C" {...line} strokeWidth={2.5} />
      <Star cx={63} cy={44} r={7} fill="#FEF3C7" />
      {shine('M32 50 Q32 38 40 33')}
    </g>
  ),
  hat_flower: (
    <g>
      <path d="M8 86 C18 54 82 54 92 86" fill="none" stroke="#65A30D" strokeWidth="6" strokeLinecap="round" />
      <path d="M8 86 C18 54 82 54 92 86" fill="none" stroke="#A3E635" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 70 q-8 -5 -12 1 q7 5 12 -1 Z M76 70 q8 -5 12 1 q-7 5 -12 -1 Z" fill="#84CC16" {...line} strokeWidth={2} />
      <Flower cx={15} cy={80} r={10} petal="#FDE68A" />
      <Flower cx={31} cy={64} r={11} petal="#FBCFE8" />
      <Flower cx={50} cy={58} r={13} petal="#FFF" />
      <Flower cx={69} cy={64} r={11} petal="#FBCFE8" />
      <Flower cx={85} cy={80} r={10} petal="#FDE68A" />
    </g>
  ),
  hat_party: (
    <g transform="rotate(-8 50 60)">
      <path d="M50 10 L30 62 Q50 70 70 62 Z" fill="#A78BFA" {...line} />
      <path d="M40 36 L60 36 M35 49 L65 49" stroke="#FDE68A" strokeWidth="6" />
      <circle cx="44" cy="58" r="3" fill="#F472B6" />
      <circle cx="57" cy="57" r="3" fill="#34D399" />
      <path d="M28 62 Q50 72 72 62 L72 66 Q50 77 28 66 Z" fill="#F472B6" {...line} strokeWidth={2.5} />
      <circle cx="50" cy="10" r="7" fill="#FCD34D" {...line} />
      {shine('M44 24 L39 38')}
    </g>
  ),
  hat_chef: (
    <g>
      <path d="M30 50 C14 48 14 26 30 26 C30 10 48 6 54 16 C62 6 82 12 76 28 C90 30 88 50 70 50 Z" fill="#FFF" {...line} />
      <path d="M40 34 Q41 42 40 50 M60 34 Q59 42 60 50" fill="none" stroke="#CBD5E1" strokeWidth="2.5" />
      <rect x="29" y="48" width="42" height="16" rx="5" fill="#F8FAFC" {...line} />
      <path d="M35 56 H65" stroke="#FDA4AF" strokeWidth="3" strokeLinecap="round" />
      {shine('M24 36 Q24 30 30 29')}
    </g>
  ),
  hat_pirate: (
    <g>
      <path d="M12 62 C14 40 30 46 34 40 C40 24 60 24 66 40 C70 46 86 40 88 62 Q50 50 12 62 Z" fill="#1E3A8A" {...line} />
      <path d="M12 62 Q50 50 88 62 Q88 70 80 70 Q50 60 20 70 Q12 70 12 62 Z" fill="#1E40AF" {...line} />
      <path d="M18 63 Q50 53 82 63" fill="none" stroke="#FCD34D" strokeWidth="3" />
      <circle cx="50" cy="40" r="5" fill="none" stroke="#FCD34D" strokeWidth="3" />
      <path d="M50 45 V57 M43 52 Q50 60 57 52 M45 49 H55" fill="none" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" />
      {shine('M38 34 Q44 29 52 29')}
    </g>
  ),
  hat_crown: (
    <g>
      <path d="M24 64 L20 30 L36 44 L50 22 L64 44 L80 30 L76 64 Z" fill="#FCD34D" {...line} />
      <rect x="23" y="58" width="54" height="10" rx="4" fill="#F59E0B" {...line} />
      <circle cx="20" cy="29" r="4" fill="#FDE68A" {...line} strokeWidth={2.5} />
      <circle cx="50" cy="20" r="4.5" fill="#FDE68A" {...line} strokeWidth={2.5} />
      <circle cx="80" cy="29" r="4" fill="#FDE68A" {...line} strokeWidth={2.5} />
      <path d="M50 40 L56 49 L50 58 L44 49 Z" fill="#38BDF8" {...line} strokeWidth={2.5} />
      <circle cx="34" cy="52" r="4" fill="#F43F5E" {...line} strokeWidth={2} />
      <circle cx="66" cy="52" r="4" fill="#34D399" {...line} strokeWidth={2} />
      {shine('M28 52 L26 36')}
    </g>
  ),
  hat_astronaut: (
    <g>
      <circle cx="50" cy="52" r="45" fill="#E0F2FE" fillOpacity=".35" {...line} />
      <path d="M22 30 Q34 14 52 12" fill="none" stroke="#FFF" strokeWidth="6" strokeLinecap="round" opacity=".9" />
      <path d="M18 44 Q18 38 20 34" fill="none" stroke="#FFF" strokeWidth="4" strokeLinecap="round" opacity=".8" />
      <path d="M12 78 Q50 100 88 78 L90 90 Q50 112 10 90 Z" fill="#F1F5F9" {...line} />
      <circle cx="28" cy="91" r="3.5" fill="#F97316" />
      <circle cx="72" cy="91" r="3.5" fill="#22C55E" />
      <path d="M78 18 L88 6" {...line} />
      <circle cx="89" cy="5" r="4.5" fill="#F43F5E" {...line} strokeWidth={2.5} />
    </g>
  ),

  /* ───── Kính (tròng ở 30,25 và 70,25) ───── */
  glasses_heart: (
    <g>
      {[30, 70].map(x => (
        <path key={x} d={`M${x} 40 C${x - 22} 26 ${x - 16} 8 ${x} 18 C${x + 16} 8 ${x + 22} 26 ${x} 40 Z`} fill="#FBCFE8" fillOpacity=".85" stroke="#DB2777" strokeWidth="4" strokeLinejoin="round" />
      ))}
      <path d="M44 22 Q50 18 56 22" fill="none" stroke="#DB2777" strokeWidth="4" strokeLinecap="round" />
      {shine('M20 18 Q22 15 25 15')}
      {shine('M60 18 Q62 15 65 15')}
    </g>
  ),
  glasses_smart: (
    <g>
      {[30, 70].map(x => <circle key={x} cx={x} cy={25} r="14" fill="#E0F2FE" fillOpacity=".35" stroke="#2563EB" strokeWidth="4.5" />)}
      <path d="M44 24 Q50 19 56 24 M16 22 L8 18 M84 22 L92 18" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
      {shine('M22 19 Q24 15 28 15')}
      {shine('M62 19 Q64 15 68 15')}
    </g>
  ),
  glasses_star: (
    <g>
      {[30, 70].map(x => <path key={x} d={starPath(x, 26, 18)} fill="#FEF3C7" fillOpacity=".8" stroke="#F59E0B" strokeWidth="4" strokeLinejoin="round" />)}
      <path d="M44 25 Q50 21 56 25" fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
      {shine('M26 18 L28 16')}
      {shine('M66 18 L68 16')}
    </g>
  ),
  glasses_cool: (
    <g>
      {[30, 70].map(x => <rect key={x} x={x - 16} y="13" width="32" height="24" rx="10" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />)}
      <path d="M46 22 Q50 19 54 22 M14 19 L6 15 M86 19 L94 15" fill="none" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
      <path d="M19 20 L26 28 M59 20 L66 28" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),

  /* ───── Áo (vừa thân Thỏ Bông) ───── */
  shirt_sky: (
    <g>
      <path d={BODY} fill="#FFF" fillOpacity="0" />
      <path d="M8 52 Q8 50 12 50 L88 50 Q92 50 92 52 C90 70 80 85 50 85 C20 85 10 70 8 52 Z" fill="#60A5FA" {...line} />
      <rect x="32" y="30" width="36" height="24" rx="6" fill="#60A5FA" {...line} />
      <path d="M33 31 L22 22 M67 31 L78 22" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
      <circle cx="37" cy="37" r="3" fill="#FDE68A" {...line} strokeWidth={2} />
      <circle cx="63" cy="37" r="3" fill="#FDE68A" {...line} strokeWidth={2} />
      <path d="M43 40 Q50 46 57 40" fill="#FFF" {...line} strokeWidth={2} />
      <path d="M50 54 V80" stroke="#3B82F6" strokeWidth="2.5" />
    </g>
  ),
  shirt_stripe: (
    <g>
      <path d={BODY} fill="#FFF" {...line} />
      <path d="M8 46 H92 M7 60 H93 M12 74 H88" stroke="#3B82F6" strokeWidth="6" />
      <path d={BODY} fill="none" {...line} />
      <path d="M26 23 L50 44 L74 23 Z" fill="#1E3A8A" {...line} />
      <path d="M31 26 L50 41 L69 26" fill="none" stroke="#FFF" strokeWidth="2.5" />
      <path d="M44 40 L50 46 L56 40 L54 56 L50 52 L46 56 Z" fill="#EF4444" {...line} strokeWidth={2.5} />
    </g>
  ),
  shirt_dress: (
    <g>
      <path d="M18 24 L82 24 Q86 40 76 48 Q96 66 100 84 Q50 96 0 84 Q4 66 24 48 Q14 40 18 24 Z" fill="#F9A8D4" {...line} />
      <path d="M24 48 Q50 56 76 48" fill="none" stroke="#EC4899" strokeWidth="6" strokeLinecap="round" />
      <path d="M44 50 l6 -6 l6 6 l-6 6 Z" fill="#FDE68A" {...line} strokeWidth={2} />
      <Flower cx={18} cy={76} r={7} petal="#FFF" />
      <Flower cx={50} cy={78} r={8} petal="#FFF" />
      <Flower cx={82} cy={76} r={7} petal="#FFF" />
      <Flower cx={33} cy={64} r={6} petal="#FDE68A" />
      <Flower cx={67} cy={64} r={6} petal="#FDE68A" />
      <path d="M4 82 Q50 93 96 82" fill="none" stroke="#FFF" strokeWidth="3" strokeDasharray="5 5" />
    </g>
  ),
  shirt_aodai: (
    <g>
      <path d="M6 34 Q8 24 22 23 L78 23 Q92 24 94 34 C96 52 90 66 80 72 L70 72 L66 100 L34 100 L30 72 L20 72 C10 66 4 52 6 34 Z" fill="#EF4444" {...line} />
      <path d="M40 23 L40 31 Q50 35 60 31 L60 23" fill="#DC2626" {...line} strokeWidth={2.5} />
      <path d="M50 33 V100" stroke="#B91C1C" strokeWidth="2" />
      <Flower cx={50} cy={50} r={9} petal="#FCD34D" center="#F97316" />
      <Flower cx={42} cy={80} r={6} petal="#FCD34D" center="#F97316" />
      <Flower cx={58} cy={90} r={5} petal="#FCD34D" center="#F97316" />
      <path d="M22 44 Q28 40 32 46 M68 46 Q72 40 78 44" fill="none" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round" />
      {shine('M14 38 Q14 31 20 29')}
    </g>
  ),
  shirt_hero: (
    <g>
      <path d={BODY} fill="#3B82F6" {...line} />
      <path d="M8 66 Q50 74 92 66 L90 72 Q50 80 10 72 Z" fill="#FCD34D" {...line} strokeWidth={2.5} />
      <path d="M38 34 L62 34 L56 54 L44 54 Z" fill="#FCD34D" {...line} />
      <Star cx={50} cy={42} r={8} fill="#EF4444" />
      <path d="M20 26 L32 28 M80 26 L68 28" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
    </g>
  ),
  shirt_space: (
    <g>
      <path d={BODY} fill="#F8FAFC" {...line} />
      <path d="M8 62 Q50 70 92 62" fill="none" stroke="#94A3B8" strokeWidth="5" />
      <path d="M30 28 Q30 44 28 58 M70 28 Q70 44 72 58" fill="none" stroke="#CBD5E1" strokeWidth="3" />
      <rect x="36" y="34" width="28" height="20" rx="5" fill="#1E293B" {...line} strokeWidth={2.5} />
      <circle cx="43" cy="41" r="3" fill="#F43F5E" />
      <circle cx="50" cy="41" r="3" fill="#FCD34D" />
      <circle cx="57" cy="41" r="3" fill="#22C55E" />
      <rect x="41" y="47" width="18" height="3.5" rx="1.75" fill="#38BDF8" />
      <path d="M14 36 h8 v6 h-8 Z" fill="#EF4444" {...line} strokeWidth={2} />
    </g>
  ),

  /* ───── Ba lô (lộ ra sau lưng bên phải) ───── */
  backpack_yellow: (
    <g>
      <path d="M52 22 Q64 6 78 22" fill="none" {...line} strokeWidth={6} />
      <path d="M52 22 Q64 6 78 22" fill="none" stroke="#FDE68A" strokeWidth="2.5" />
      <rect x="38" y="20" width="56" height="70" rx="18" fill="#FACC15" {...line} />
      <rect x="50" y="52" width="38" height="28" rx="9" fill="#FDE047" {...line} />
      <path d="M52 62 H86" stroke={O} strokeWidth="2" />
      <circle cx="69" cy="62" r="3.5" fill="#F97316" {...line} strokeWidth={2} />
      {shine('M86 30 Q89 36 89 44')}
    </g>
  ),
  backpack_carrot: (
    <g>
      <path d="M62 22 C52 4 58 0 66 14 C66 0 74 0 72 16 C80 4 88 8 76 22" fill="#4ADE80" {...line} />
      <path d="M38 34 Q38 20 66 20 Q94 20 94 34 L74 92 Q66 98 58 92 Z" fill="#FB923C" {...line} />
      <path d="M48 40 L58 42 M76 50 L86 48 M54 62 L64 64 M70 76 L78 74" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
      {shine('M86 32 Q88 38 86 46')}
    </g>
  ),
  backpack_star: (
    <g>
      <path d="M52 22 Q64 6 78 22" fill="none" {...line} strokeWidth={6} />
      <rect x="38" y="20" width="56" height="70" rx="18" fill="#A78BFA" {...line} />
      <Star cx={67} cy={58} r={18} fill="#FDE68A" />
      <circle cx="48" cy="30" r="2.5" fill="#FFF" />
      <circle cx="86" cy="80" r="2.5" fill="#FFF" />
      <circle cx="84" cy="34" r="1.8" fill="#FFF" />
      {shine('M87 30 Q90 36 90 44')}
    </g>
  ),
  backpack_rocket: (
    <g>
      <path d="M66 4 C84 16 90 40 86 76 L46 76 C42 40 48 16 66 4 Z" fill="#F1F5F9" {...line} />
      <path d="M48 52 L36 74 L46 76 Z M84 52 L96 74 L86 76 Z" fill="#EF4444" {...line} />
      <path d="M58 13 Q66 4 74 13 Z" fill="#EF4444" {...line} strokeWidth={2.5} />
      <circle cx="66" cy="36" r="10" fill="#38BDF8" {...line} />
      {shine('M62 32 Q63 29 66 28')}
      <path d="M52 76 Q58 98 66 86 Q74 98 80 76 Z" fill="#FCD34D" {...line} strokeWidth={2.5} />
      <path d="M60 77 Q66 90 72 77 Z" fill="#F97316" />
    </g>
  ),

  /* ───── Đồ cầm tay (tay cầm ở góc dưới trái) ───── */
  item_carrot: (
    <g>
      <path d="M54 22 C44 6 50 2 58 14 C58 0 66 0 64 16 C74 6 80 10 68 22" fill="#4ADE80" {...line} />
      <path d="M46 26 Q60 16 72 28 L28 94 Q22 96 22 90 Z" fill="#FB923C" {...line} />
      <path d="M48 40 L56 44 M42 56 L50 60 M36 72 L43 75" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
      {shine('M58 30 Q62 32 64 36')}
    </g>
  ),
  item_flower: (
    <g>
      <path d="M20 94 Q30 66 52 38" fill="none" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" />
      <path d="M34 66 Q20 56 18 66 Q26 74 34 66 Z" fill="#4ADE80" {...line} strokeWidth={2.5} />
      {Array.from({length: 10}, (_, i) => (
        <ellipse key={i} cx="58" cy="17" rx="7" ry="13" fill="#FCD34D" {...line} strokeWidth={2.2} transform={`rotate(${i * 36} 58 32)`} />
      ))}
      <circle cx="58" cy="32" r="12" fill="#92400E" {...line} />
      <circle cx="54" cy="30" r="1.8" fill="#FDE68A" />
      <circle cx="61" cy="29" r="1.8" fill="#FDE68A" />
      <circle cx="58" cy="36" r="1.8" fill="#FDE68A" />
    </g>
  ),
  item_balloon: (
    <g>
      <path d="M20 94 Q34 76 30 62 Q26 52 44 46" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="56" cy="28" rx="22" ry="26" fill="#F43F5E" {...line} />
      <path d="M50 54 L56 52 L54 58 Z" fill="#E11D48" {...line} strokeWidth={2} />
      {shine('M44 16 Q48 10 54 9')}
      <circle cx="44" cy="26" r="3" fill="#FFF" opacity=".6" />
    </g>
  ),
  item_icecream: (
    <g>
      <path d="M30 52 L66 52 L46 96 Z" fill="#FBBF24" {...line} />
      <path d="M36 60 L58 60 M40 70 L54 70 M44 80 L50 80" stroke="#D97706" strokeWidth="2.5" />
      <circle cx="40" cy="44" r="13" fill="#FBCFE8" {...line} />
      <circle cx="58" cy="44" r="13" fill="#BBF7D0" {...line} />
      <circle cx="49" cy="28" r="14" fill="#FEF3C7" {...line} />
      <circle cx="50" cy="13" r="5" fill="#EF4444" {...line} strokeWidth={2.5} />
      <path d="M50 8 Q54 2 58 4" fill="none" {...line} strokeWidth={2} />
      {shine('M42 22 Q44 18 48 17')}
      <path d="M36 40 l2 1 M60 38 l2 2 M46 30 l2 1" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  item_magic_wand: (
    <g>
      <path d="M20 94 L52 42" stroke={O} strokeWidth="10" strokeLinecap="round" />
      <path d="M20 94 L52 42" stroke="#C084FC" strokeWidth="5" strokeLinecap="round" />
      <path d={starPath(60, 30, 22)} fill="#FCD34D" {...line} />
      {shine('M56 20 L58 17')}
      <path d="M86 52 v10 M81 57 h10 M84 14 v8 M80 18 h8" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
};

/* ───── Huy hiệu ───── */
const medal = (center: React.ReactNode, ring: string) => (
  <g>
    <path d="M28 4 L44 4 L54 36 L40 40 Z" fill="#3B82F6" {...line} />
    <path d="M72 4 L56 4 L46 36 L60 40 Z" fill="#EF4444" {...line} />
    <circle cx="50" cy="62" r="32" fill={ring} {...line} />
    <circle cx="50" cy="62" r="23" fill="#FEF3C7" {...line} strokeWidth={2.5} />
    {center}
  </g>
);
artworks.badge_counting_star = medal(<Star cx={50} cy={63} r={16} />, '#FCD34D');
artworks.badge_super_addition = medal(<path d="M50 48 V78 M35 63 H65" stroke="#F97316" strokeWidth="9" strokeLinecap="round" />, '#FCD34D');
artworks.badge_master_10 = medal(<text x="50" y="73" textAnchor="middle" fontSize="28" fontWeight="900" fill="#B45309" fontFamily="Fredoka, Nunito, sans-serif">10</text>, '#FCD34D');
artworks.badge_mental_master = medal(<path d="M50 46 L64 58 L50 80 L36 58 Z M36 58 H64" fill="#67E8F9" {...line} strokeWidth={2.5} />, '#CBD5E1');
artworks.badge_cosmic = medal(<g><circle cx="50" cy="63" r="11" fill="#818CF8" {...line} strokeWidth={2.5} /><ellipse cx="50" cy="63" rx="20" ry="6" fill="none" stroke="#6D28D9" strokeWidth="3.5" transform="rotate(-20 50 63)" /></g>, '#C4B5FD');

// The superhero cape hangs behind the body.
const heroCape = (
  <path d="M10 22 Q-14 70 -6 112 Q50 98 106 112 Q114 70 90 22 Z" fill="#EF4444" {...line} />
);
// The astronaut helmet is a glass bubble around the whole head, not a hat on top of it.
const SPECIAL_BOX: Record<string, Box> = {hat_astronaut: {x: 46, y: 58, size: 108}};
const ICON_OVERRIDE: Record<string, string> = {shirt_hero: '-16 14 132 104', hat_astronaut: '2 -4 96 112', hat_bow: '40 24 72 64'};

function placement(box: Box) {
  return `translate(${box.x} ${box.y}) scale(${box.size / 100})`;
}

export function getWearableDefinition(id: string | undefined, type?: AccessoryType) {
  const catalog = REWARDS_CATALOG.find(item => item.id === id && (!type || item.type === type));
  if (!catalog || !artworks[catalog.id]) return undefined;
  const anchor = WEARABLE_ANCHORS[catalog.type];
  const rearArtwork = catalog.id === 'shirt_hero' ? heroCape : undefined;
  return {
    catalog,
    artwork: artworks[catalog.id],
    anchor,
    rearArtwork,
    box: SPECIAL_BOX[catalog.id] ?? anchor,
    viewBox: ICON_OVERRIDE[catalog.id] ?? ICON_VIEWBOX[catalog.type],
  };
}

export function WearableRear({id}: {id: string | undefined}) {
  const def = getWearableDefinition(id, 'shirt');
  if (!def?.rearArtwork) return null;
  return <g data-layer="BACK" transform={placement(def.box)}>{def.rearArtwork}</g>;
}

export function WearableIcon({id, className = ''}: {id: string; className?: string}) {
  const def = getWearableDefinition(id);
  if (!def) return null;
  return (
    <svg viewBox={def.viewBox} className={className} role="img" aria-label={def.catalog.name} data-wearable-icon={id}>
      <g fill="none">{def.rearArtwork}{def.artwork}</g>
    </svg>
  );
}

export function EquippedWearable({id, type}: {id: string | undefined; type: AccessoryType}) {
  const def = getWearableDefinition(id, type);
  if (!def) return null;
  const a = def.anchor;
  return <g data-wearable-id={id} data-anchor={a.name} data-layer={a.layer} transform={placement(def.box)}>{def.artwork}</g>;
}

/** Exactly one id per category; tapping the worn item takes it off. */
export const toggleWearable = toggleShopWearable;

export type EquippedAccessories = UserProgress['equippedAccessories'];
