import { DECOR, ROOM_ZONES, type RoomZone } from '../../data/decor';
import {sanitizePlacements, type DecorPlacement} from './placement';
import type { UserProgress } from '../../types/math';
export interface RoomProgress { version: 1; ownedIds: string[]; receipts: string[]; layout: Partial<Record<RoomZone,string>>; revealedIds: string[]; placements?: DecorPlacement[]; }
const record=(value:unknown):Record<string,unknown> => value && typeof value==='object' && !Array.isArray(value) ? value as Record<string,unknown> : {};
const ids=(value:unknown):string[] => Array.isArray(value) ? [...new Set(value.filter((id):id is string=>typeof id==='string'))] : [];
export const decorReceipt = (id:string) => 'decor:'+id;
export function createRoom(): RoomProgress {
 const starter=DECOR.filter(d=>d.unlock.kind==='starter');
 return {version:1,ownedIds:starter.map(d=>d.id),receipts:starter.map(d=>decorReceipt(d.id)),layout:{FLOOR:"decor_rug"},placements:[{id:'decor_rug',x:.33,y:.81,type:'FLOOR'}],revealedIds:starter.map(d=>d.id)};
}
/** Reconcile from confirmed learning records; never accepts a UI unlock command. */
export function reconcileRoom(progress:UserProgress, raw:unknown=progress.room):UserProgress {
 const data=record(raw), hadRoom=raw!==undefined && raw!==null;
 const priorReceipts=ids(data.receipts);
 const earned=DECOR.filter(d=> {
  if(d.unlock.kind==='starter')return true;
  if(priorReceipts.includes(decorReceipt(d.id)))return true;
  if(d.unlock.kind==='days')return new Set(progress.retention?.adventureDays??[]).size>=d.unlock.count;
  return progress.claimedCheckpointRewards.includes(d.unlock.receipt) && progress.worldLevelsProgress[d.unlock.world].completedLevels.includes(d.unlock.level);
 });
 const ownedIds=earned.map(d=>d.id), receipts=ownedIds.map(decorReceipt);
 const rawLayout=record(data.layout), layout:RoomProgress['layout']=hadRoom?{}:createRoom().layout;
 for(const zone of ROOM_ZONES){const id=rawLayout[zone];if(typeof id==='string'&&ownedIds.includes(id)&&DECOR.some(d=>d.id===id&&d.zone===zone))layout[zone]=id;}
 const revealedIds=ownedIds.filter(id=>DECOR.some(d=>d.id===id&&d.unlock.kind==='starter') || ids(data.revealedIds).includes(id));
 const room:RoomProgress={version:1,ownedIds,receipts,layout,revealedIds,placements:sanitizePlacements(data.placements,layout,ownedIds)};
 return JSON.stringify(progress.room)===JSON.stringify(room) ? progress : {...progress,room};
}
export function placeDecor(progress:UserProgress,id:string,zone:RoomZone):UserProgress {
 const decor=DECOR.find(d=>d.id===id);
 if(!decor||decor.zone!==zone||!progress.room?.ownedIds.includes(id)||progress.room.layout[zone]===id)return progress;
 return {...progress,room:{...progress.room,layout:{...progress.room.layout,[zone]:id}}};
}
export function acknowledgeDecor(progress:UserProgress,id:string):UserProgress {
 if(!progress.room?.ownedIds.includes(id)||progress.room.revealedIds.includes(id))return progress;
 return {...progress,room:{...progress.room,revealedIds:[...progress.room.revealedIds,id]}};
}
export const pendingDecor = (progress:UserProgress) => DECOR.find(d=>progress.room?.ownedIds.includes(d.id)&&!progress.room.revealedIds.includes(d.id));
