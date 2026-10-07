import type { UserProgress } from '../../types/math';

export const AVATAR_OPTIONS = {
  base: [{id:'boy',label:'Bé trai'},{id:'girl',label:'Bé gái'}],
  hairStyle: [{id:'crop',label:'Tóc ngắn'},{id:'sweep',label:'Tóc mái nghiêng'},{id:'bob',label:'Tóc ngang vai'},{id:'pigtails',label:'Tóc hai bên'},{id:'bun',label:'Tóc búi'}],
  hairColor: [{id:'ink',label:'Đen',color:'#302a35'},{id:'brown',label:'Nâu',color:'#684334'},{id:'chestnut',label:'Nâu hạt dẻ',color:'#9b5838'},{id:'honey',label:'Vàng mật ong',color:'#cf9a48'}],
  top: [{id:'sky',label:'Áo mây xanh',color:'#65bfea'},{id:'peach',label:'Áo đào',color:'#fb9f91'},{id:'mint',label:'Áo lá xanh',color:'#76c9a5'},{id:'sun',label:'Áo mặt trời',color:'#f6ca59'},{id:'lilac',label:'Áo hoa tím',color:'#b4a0e8'}],
  bottom: [{id:'shorts',label:'Quần xanh',color:'#557cae'},{id:'trousers',label:'Quần dài',color:'#64748b'},{id:'skirt',label:'Váy hồng',color:'#e997b4'},{id:'green-shorts',label:'Quần lá',color:'#65a68d'}],
  shoes: [{id:'blue',label:'Giày xanh',color:'#4f91cb'},{id:'red',label:'Giày đỏ',color:'#e8837c'},{id:'cream',label:'Giày kem',color:'#eadab5'},{id:'purple',label:'Giày tím',color:'#a48ac7'}],
} as const;
export type AvatarCategory = keyof typeof AVATAR_OPTIONS;
export type AvatarConfig = {version:1} & {[K in AvatarCategory]: (typeof AVATAR_OPTIONS)[K][number]['id']};
export const DEFAULT_AVATAR: AvatarConfig = {version:1,base:'boy',hairStyle:'crop',hairColor:'brown',top:'sky',bottom:'shorts',shoes:'blue'};
export function normalizeAvatar(value:unknown):AvatarConfig {
  const raw = value && typeof value==='object' && !Array.isArray(value) ? value as Record<string,unknown> : {};
  const next = {...DEFAULT_AVATAR};
  for(const key of Object.keys(AVATAR_OPTIONS) as AvatarCategory[]) {
    if(AVATAR_OPTIONS[key].some(option=>option.id===raw[key])) Object.assign(next,{[key]:raw[key]});
  }
  return next;
}
export function chooseAvatar(config:unknown,key:AvatarCategory,id:string):AvatarConfig {
  return normalizeAvatar({...normalizeAvatar(config),[key]:id});
}
export function randomAvatar(random:()=>number=Math.random):AvatarConfig {
  const result={...DEFAULT_AVATAR};
  for(const key of Object.keys(AVATAR_OPTIONS) as AvatarCategory[]) {
    const choices=AVATAR_OPTIONS[key];
    const value=random();
    const index=Number.isFinite(value)?Math.min(choices.length-1,Math.max(0,Math.floor(value*choices.length))):0;
    Object.assign(result,{[key]:choices[index].id});
  }
  return result;
}
/** Customization changes only identity; learning rewards and companions are untouched. */
export function updateAvatar(progress:UserProgress,config:unknown):UserProgress {
  return {...progress,avatar:normalizeAvatar(config)};
}
