import {DECOR,placementType,type PlacementType,type RoomZone} from '../../data/decor';
import type {UserProgress} from '../../types/math';
export interface DecorPlacement {id:string;x:number;y:number;type:PlacementType}
export function decorSize(id:string){return id==='decor_rug'?{width:.30,height:.18}:{width:.18,height:.22};}
export function validPlacement(p:DecorPlacement){
 const decor=DECOR.find(d=>d.id===p.id);if(!decor||p.type!==placementType(decor)||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 const {width,height}=decorSize(p.id),left=p.x-width/2,right=p.x+width/2,top=p.y-height/2,bottom=p.y+height/2;
 if(left<.02||right>.98||top<.02||bottom>.98)return false;
 return p.type==='FLOOR'?top>=.57:p.type==='WALL'?bottom<=.55:p.type==='SURFACE'?left>=.09&&right<=.92&&top>=.20&&bottom<=.58:true;
}
export const COMPANION_RESERVED={x:.62,y:.63,width:.31,height:.33};
const overlap=(a:{x:number;y:number;width:number;height:number},b:{x:number;y:number;width:number;height:number})=>Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
export function suggestPlacement(id:string,placed:readonly DecorPlacement[]=[]):DecorPlacement|undefined {
 const decor=DECOR.find(d=>d.id===id);if(!decor)return;
 const type=placementType(decor),size=decorSize(id);
 let best:DecorPlacement|undefined,bestScore=Infinity;
 for(let yi=2;yi<=17;yi++)for(let xi=3;xi<=17;xi++){
  const p={id,x:xi/20,y:yi/20,type};if(!validPlacement(p))continue;
  const box={x:p.x-size.width/2,y:p.y-size.height/2,...size};
  if(overlap(box,COMPANION_RESERVED)>0)continue;
  const furniture=[{x:.05,y:.49,width:.30,height:.32},{x:.41,y:.55,width:.25,height:.17},{x:.73,y:.51,width:.22,height:.16}];
  if(furniture.some(f=>overlap(box,f)>.004))continue;
  let score=Math.abs(p.x-(type==='FLOOR'?.4:.5))+Math.abs(p.y-(type==='FLOOR'?.82:type==='WALL'?.3:.4));
  for(const other of placed.filter(d=>d.id!==id)){const z=decorSize(other.id);score+=overlap(box,{x:other.x-z.width/2,y:other.y-z.height/2,...z})*100;}
  if(score<bestScore){best=p;bestScore=score;}
 }
 return best;
}
/** Presence of placements (including []) is authoritative; legacy slots migrate only once. */
export function sanitizePlacements(raw:unknown,legacy:Partial<Record<RoomZone,string>>,owned:readonly string[]):DecorPlacement[]{
 const result:DecorPlacement[]=[];
 const defaults:Record<RoomZone,{x:number;y:number}>={FLOOR:{x:.33,y:.81},WALL:{x:.22,y:.23},SHELF:{x:.53,y:.40},WINDOW:{x:.83,y:.38}};
 const candidates=Array.isArray(raw)?raw:Object.entries(legacy).map(([zone,id])=>({id,...defaults[zone as RoomZone]}));
 for(const value of candidates){if(!value||typeof value!=='object')continue;const d=DECOR.find(d=>d.id===value.id);if(!d||!owned.includes(d.id)||result.some(p=>p.id===d.id))continue;
  const p={id:d.id,x:value.x,y:value.y,type:placementType(d)};
  const safe=validPlacement(p)?p:suggestPlacement(d.id,result);if(safe)result.push(safe);
 }
 return result;
}
export function moveDecor(progress:UserProgress,placement:DecorPlacement):UserProgress{
 if(!progress.room?.ownedIds.includes(placement.id)||!validPlacement(placement))return progress;
 const current=progress.room.placements??sanitizePlacements(undefined,progress.room.layout,progress.room.ownedIds);
 if(current.some(p=>p.id===placement.id&&p.x===placement.x&&p.y===placement.y&&p.type===placement.type))return progress;
 return {...progress,room:{...progress.room,placements:[...current.filter(p=>p.id!==placement.id),placement]}};
}
export function putAwayDecor(progress:UserProgress,id:string):UserProgress{
 if(!progress.room)return progress;const placed=progress.room.placements??sanitizePlacements(undefined,progress.room.layout,progress.room.ownedIds);
 if(!placed.some(p=>p.id===id))return progress;
 return {...progress,room:{...progress.room,placements:placed.filter(p=>p.id!==id)}};
}
