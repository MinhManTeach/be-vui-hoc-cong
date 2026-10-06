import React from 'react';
import {AccessoryType, UserProgress} from '../../types/math';
import {REWARDS_CATALOG} from '../../utils/rewards';

export const WEARABLE_ANCHORS = {
  hat: {name:'HEAD', x:50,y:30,width:100,height:60,layer:'HEADWEAR'},
  glasses: {name:'FACE',x:60,y:99,width:80,height:30,layer:'GLASSES'},
  shirt: {name:'BODY',x:48,y:149,width:104,height:57,layer:'CLOTHING'},
  backpack: {name:'BACK',x:135,y:133,width:53,height:67,layer:'BACK'},
  item: {name:'HAND',x:120,y:141,width:57,height:60,layer:'ACCESSORY'},
  badge: {name:'BADGE',x:85,y:176,width:23,height:25,layer:'BADGE'},
} as const;

export const WEARABLE_LAYER_ORDER = ['BACK','BODY','CLOTHING','FACE','GLASSES','HEADWEAR','ACCESSORY','BADGE'] as const;
const STAR='50,10 61,36 90,38 68,57 76,85 50,69 24,85 32,57 10,38 39,36';
const star=(color='#FBBF24')=><polygon points={STAR} fill={color} stroke="#B45309" strokeWidth="3"/>;
const carrot= <><path d="M30 32 Q50 20 70 32 L50 92 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="4"/><path d="M50 30 Q19 8 31 4 Q46 8 50 30 Q52 3 68 5 Q74 14 50 30" fill="#22C55E" stroke="#15803D" strokeWidth="3"/><path d="M36 45 L51 49 M43 64 L55 68" stroke="#C2410C" strokeWidth="3"/></>;
const artworks:Record<string,React.ReactNode>={
  hat_cap:<><path d="M13 69 V48 Q13 10 49 10 Q81 10 84 49 V69 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="4"/><path d="M49 12 Q62 36 60 68 M16 68 H81" fill="none" stroke="#EA580C" strokeWidth="3"/><ellipse cx="48" cy="10" rx="6" ry="4" fill="#C2410C"/><path d="M12 68 Q59 56 95 76 Q97 88 73 88 L13 78 Z" fill="#F97316" stroke="#9A3412" strokeWidth="4"/><path d="M20 72 Q57 65 83 77" stroke="#FED7AA" strokeWidth="3"/></>,
  hat_party:<><path d="M50 12 L20 87 Q50 97 80 87 Z" fill="#EC4899" stroke="#9D174D" strokeWidth="4"/><path d="M31 59 L69 59 M39 38 L61 38" stroke="#FDE047" strokeWidth="8"/><circle cx="50" cy="10" r="8" fill="#FBBF24"/><circle cx="42" cy="76" r="4" fill="#67E8F9"/><circle cx="61" cy="75" r="4" fill="#67E8F9"/></>,
  hat_chef:<><path d="M24 65 C0 58 5 27 25 24 C25 0 60 0 65 21 C94 13 106 52 78 65 L78 84 H24 Z" fill="#FFF" stroke="#94A3B8" strokeWidth="4"/><path d="M25 64 H78 M37 37 V60 M62 37 V60" stroke="#CBD5E1" strokeWidth="3"/><rect x="23" y="65" width="56" height="23" rx="5" fill="#FFF" stroke="#94A3B8" strokeWidth="4"/></>,
  hat_pirate:<><path d="M8 70 L13 25 L33 39 Q50 7 67 39 L87 25 L92 70 Q50 95 8 70 Z" fill="#334155" stroke="#0F172A" strokeWidth="4"/><path d="M13 29 L31 47 Q50 23 69 47 L87 29 M11 69 Q50 87 89 69" fill="none" stroke="#FBBF24" strokeWidth="4"/><path d="M42 56 L59 71 M59 56 L42 71" stroke="#FFF" strokeWidth="4" strokeLinecap="round"/><circle cx="50" cy="52" r="10" fill="#FFF"/><circle cx="47" cy="51" r="2" fill="#0F172A"/><circle cx="54" cy="51" r="2" fill="#0F172A"/><rect x="46" y="58" width="9" height="6" rx="2" fill="#FFF"/></>,
  hat_crown:<><path d="M13 79 L8 27 L30 45 L50 12 L70 45 L92 27 L87 79 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="4"/><rect x="13" y="70" width="74" height="18" rx="5" fill="#F59E0B" stroke="#B45309" strokeWidth="4"/><path d="M50 45 L58 57 L50 69 L42 57 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="2"/><circle cx="27" cy="64" r="5" fill="#F43F5E"/><circle cx="73" cy="64" r="5" fill="#10B981"/></>,
  hat_astronaut:<><path d="M50 5 C9 5 9 35 9 55 Q9 88 50 90 Q91 88 91 55 C91 35 91 5 50 5 Z M50 19 C22 19 19 38 19 55 Q19 76 50 77 Q81 76 81 55 C81 38 78 19 50 19 Z" fill="#F8FAFC" fillRule="evenodd" stroke="#64748B" strokeWidth="3"/><path d="M22 34 Q50 11 78 34" stroke="#BAE6FD" strokeWidth="5"/><path d="M25 39 Q22 48 24 58" stroke="#E0F2FE" strokeWidth="4" strokeLinecap="round"/><rect x="3" y="43" width="12" height="27" rx="5" fill="#38BDF8" stroke="#0369A1" strokeWidth="3"/><rect x="85" y="43" width="12" height="27" rx="5" fill="#38BDF8" stroke="#0369A1" strokeWidth="3"/><rect x="21" y="82" width="58" height="13" rx="5" fill="#E2E8F0" stroke="#64748B" strokeWidth="3"/><circle cx="70" cy="88" r="3" fill="#F97316"/></>,
};

// All cards and equipped graphics use these same SVG nodes, never platform emoji.
for(const id of ['shirt_sky','shirt_stripe','shirt_hero','shirt_space']){
 const color=id==='shirt_space'?'#E2E8F0':id==='shirt_stripe'?'#FFF':'#38BDF8';
 artworks[id]=<><path d="M30 9 L40 5 Q50 17 60 5 L70 9 L95 31 L80 48 L73 39 L77 93 H23 L27 39 L20 48 L5 31 Z" fill={color} stroke={id==='shirt_space'?'#64748B':'#0369A1'} strokeWidth="4"/>{id==='shirt_stripe'?<path d="M26 47 H74 M25 64 H75 M25 81 H75" stroke="#0284C7" strokeWidth="7"/>:id==='shirt_hero'?<g transform="translate(29 35) scale(.42)">{star()}</g>:id==='shirt_space'?<><rect x="35" y="47" width="30" height="24" rx="5" fill="#0EA5E9"/><circle cx="43" cy="59" r="4" fill="#EF4444"/><circle cx="57" cy="59" r="4" fill="#22C55E"/></>:<rect x="34" y="45" width="17" height="23" rx="3" fill="#0284C7"/>}</>;
}
for(const [id,color] of [['backpack_yellow','#FDE047'],['backpack_carrot','#FED7AA'],['backpack_star','#C4B5FD'],['backpack_rocket','#EF4444']]){
 artworks[id]=<><path d="M35 19 V12 Q50 1 65 12 V19" stroke="#475569" strokeWidth="6"/><rect x="15" y="18" width="70" height="74" rx="19" fill={color} stroke="#475569" strokeWidth="4"/><rect x="24" y="56" width="52" height="29" rx="9" fill="#FFF" fillOpacity=".35" stroke="#475569" strokeWidth="3"/><path d="M24 37 H76" stroke="#475569" strokeWidth="3"/>{id==='backpack_carrot'?<g transform="translate(31 35) scale(.38)">{carrot}</g>:id==='backpack_star'?<g transform="translate(30 36) scale(.4)">{star()}</g>:id==='backpack_rocket'?<><path d="M40 70 V48 L50 36 L60 48 V70 Z" fill="#FFF" stroke="#991B1B" strokeWidth="2"/><circle cx="50" cy="52" r="5" fill="#38BDF8"/><path d="M44 71 L50 82 L56 71" fill="#FBBF24"/></>:<circle cx="50" cy="70" r="7" fill="#FDE047" stroke="#CA8A04" strokeWidth="2"/>}</>;
}
for(const id of ['glasses_cool','glasses_star','glasses_heart','glasses_smart']){
 const frame=id==='glasses_smart'?'#2563EB':id==='glasses_star'?'#D97706':id==='glasses_heart'?'#DB2777':'#0F172A';
 const lens=id==='glasses_cool'?'#334155':id==='glasses_heart'?'#FBCFE8':'#E0F2FE';
 const eye=(x:number)=><g transform={`translate(${x} 0)`}>{id==='glasses_star'?<polygon points="22,5 28,16 42,18 32,28 34,42 22,35 10,42 12,28 2,18 16,16" fill={lens} stroke={frame} strokeWidth="4"/>:id==='glasses_heart'?<path d="M22 40 C-10 17 10 -1 22 14 C35 -1 55 17 22 40 Z" fill={lens} stroke={frame} strokeWidth="4"/>:id==='glasses_smart'?<circle cx="22" cy="24" r="19" fill={lens} fillOpacity=".22" stroke={frame} strokeWidth="4"/>:<rect x="3" y="9" width="38" height="30" rx="7" fill={lens} stroke={frame} strokeWidth="4"/>}<path d="M11 17 L18 13" stroke="#FFF" strokeWidth="3" strokeLinecap="round"/></g>;
 artworks[id]=<>{eye(3)}{eye(53)}<path d="M44 22 Q50 17 56 22 M2 14 L7 18 M93 18 L98 14" stroke={frame} strokeWidth="4"/></>;
}
artworks.item_carrot=carrot;
artworks.item_balloon=<><path d="M20 54 L50 94 L81 52 M50 61 V94" stroke="#64748B" strokeWidth="2"/>{[[20,28,'#F43F5E'],[50,19,'#FBBF24'],[80,28,'#38BDF8']].map(([x,y,c])=><g key={String(x)}><ellipse cx={x} cy={y} rx="17" ry="23" fill={String(c)} stroke="#475569" strokeWidth="2"/><path d={`M${Number(x)-6} ${Number(y)-11} l-2 8`} stroke="#FFF" strokeWidth="3" strokeLinecap="round"/></g>)}</>;
artworks.item_flower=<><path d="M50 45 V94 M50 80 Q17 58 21 82 Q30 95 50 87" fill="#22C55E" stroke="#15803D" strokeWidth="4"/>{Array.from({length:8},(_,i)=><ellipse key={i} cx="50" cy="17" rx="10" ry="17" fill="#FBBF24" stroke="#D97706" strokeWidth="2" transform={`rotate(${i*45} 50 35)`}/>)}<circle cx="50" cy="35" r="17" fill="#92400E"/><circle cx="45" cy="30" r="3" fill="#FDE68A"/></>;
artworks.item_magic_wand=<><path d="M44 48 L24 91" stroke="#7E22CE" strokeWidth="10" strokeLinecap="round"/><g transform="translate(15 -2) scale(.73)">{star()}</g><path d="M84 62 v12 M78 68 h12" stroke="#C084FC" strokeWidth="4"/></>;
for(const id of ['badge_counting_star','badge_super_addition','badge_master_10','badge_mental_master','badge_cosmic']){
 artworks[id]=<><path d="M24 5 L50 14 L76 5 L68 47 H32 Z" fill="#F43F5E" stroke="#BE123C" strokeWidth="3"/><circle cx="50" cy="58" r="34" fill="#FDE68A" stroke="#B45309" strokeWidth="4"/>{id==='badge_counting_star'?<g transform="translate(27 33) scale(.46)">{star()}</g>:id==='badge_super_addition'?<path d="M50 39 V77 M31 58 H69" stroke="#D97706" strokeWidth="10" strokeLinecap="round"/>:id==='badge_master_10'?<text x="50" y="69" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#92400E">10</text>:id==='badge_mental_master'?<path d="M50 32 L71 53 L50 80 L29 53 Z M29 53 H71 M50 32 L42 53 L50 80 L58 53 Z" fill="#67E8F9" stroke="#0891B2" strokeWidth="3"/>:<><circle cx="50" cy="58" r="18" fill="#818CF8"/><ellipse cx="50" cy="58" rx="27" ry="8" transform="rotate(-25 50 58)" stroke="#6D28D9" strokeWidth="4"/></>}</>;
}
const heroCape=<path d="M5 10 Q-20 75 -8 130 Q50 110 108 130 Q120 75 95 10 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="3"/>;
export function WearableRear({id}:{id:string|undefined}){
 const def=getWearableDefinition(id,'shirt');if(!def?.rearArtwork)return null;
 const a=def.anchor;return <g data-layer="BACK" transform={`translate(${a.x} ${a.y}) scale(${a.width/100} ${a.height/100})`}>{def.rearArtwork}</g>;
}
export function getWearableDefinition(id:string|undefined,type?:AccessoryType){
 const catalog=REWARDS_CATALOG.find(item=>item.id===id && (!type||item.type===type));
 if(!catalog || !artworks[catalog.id])return undefined;
 const anchor=WEARABLE_ANCHORS[catalog.type];
 return {catalog,artwork:artworks[catalog.id],anchor,rearArtwork:catalog.id==='shirt_hero'?heroCape:undefined,viewBox:catalog.id==='shirt_hero'?'-15 0 130 135':catalog.type==='glasses'?'0 0 100 50':'0 0 100 100'};
}
export function WearableIcon({id,className=''}:{id:string;className?:string}){
 const def=getWearableDefinition(id); if(!def)return null;
 return <svg viewBox={def.viewBox} className={className} role="img" aria-label={def.catalog.name} data-wearable-icon={id}><g fill="none" strokeLinejoin="round" strokeLinecap="round">{def.rearArtwork}{def.artwork}</g></svg>;
}
export function EquippedWearable({id,type}:{id:string|undefined;type:AccessoryType}){
 const def=getWearableDefinition(id,type); if(!def)return null;
 const a=def.anchor;
 const helmet=id==='hat_astronaut';
 const x=helmet?34:a.x,y=helmet?53:a.y,w=helmet?132:a.width,h=helmet?130:a.height;
 return <g data-wearable-id={id} data-anchor={a.name} data-layer={a.layer} strokeLinejoin="round" strokeLinecap="round" transform={`translate(${x} ${y}) scale(${w/100} ${h/(type==='glasses'?50:100)})`}>{def.artwork}</g>;
}

/** Preserve wardrobe toggle semantics; exactly one id per category. */
export function toggleWearable(equipped:UserProgress['equippedAccessories'], item:{type:AccessoryType;id:string}) {
  return {...equipped,[item.type]:equipped[item.type]===item.id?undefined:item.id};
}
