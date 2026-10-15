import type { UserProgress } from '../../types/math';

/** The child picks who they play as; clothes come from the shop, so only the person is chosen here. */
export const AVATAR_OPTIONS = {
  base: [{id:'boy',label:'Bé trai'},{id:'girl',label:'Bé gái'}],
  hairStyle: [{id:'crop',label:'Tóc ngắn'},{id:'sweep',label:'Tóc mái nghiêng'},{id:'bob',label:'Tóc ngang vai'},{id:'pigtails',label:'Tóc hai bên'},{id:'bun',label:'Tóc búi'}],
  hairColor: [{id:'ink',label:'Đen',color:'#302a35'},{id:'brown',label:'Nâu',color:'#684334'},{id:'chestnut',label:'Nâu hạt dẻ',color:'#9b5838'},{id:'honey',label:'Vàng mật ong',color:'#cf9a48'}],
  skin: [{id:'light',label:'Da sáng',color:'#FFDCC5'},{id:'warm',label:'Da hồng hào',color:'#F6C7A4'},{id:'tan',label:'Da bánh mật',color:'#D9A17C'}],
} as const;
/** A boy starts with short hair and a girl with pigtails; either can change it after. */
export const HAIR_FOR_BASE = {boy:'crop',girl:'pigtails'} as const;
export type AvatarCategory = keyof typeof AVATAR_OPTIONS;
export type AvatarConfig = {version:1} & {[K in AvatarCategory]: (typeof AVATAR_OPTIONS)[K][number]['id']};
export const DEFAULT_AVATAR: AvatarConfig = {version:1,base:'boy',hairStyle:'crop',hairColor:'ink',skin:'light'};
export function normalizeAvatar(value:unknown):AvatarConfig {
  const raw = value && typeof value==='object' && !Array.isArray(value) ? value as Record<string,unknown> : {};
  const next = {...DEFAULT_AVATAR};
  for(const key of Object.keys(AVATAR_OPTIONS) as AvatarCategory[]) {
    if(AVATAR_OPTIONS[key].some(option=>option.id===raw[key])) Object.assign(next,{[key]:raw[key]});
  }
  return next;
}
export function chooseAvatar(config:unknown,key:AvatarCategory,id:string):AvatarConfig {
  const current=normalizeAvatar(config);
  if(key==='base'&&id!==current.base&&id in HAIR_FOR_BASE) return normalizeAvatar({...current,base:id,hairStyle:HAIR_FOR_BASE[id as keyof typeof HAIR_FOR_BASE]});
  return normalizeAvatar({...current,[key]:id});
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
