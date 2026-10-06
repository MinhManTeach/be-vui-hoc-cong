import type { UserProgress } from '../../types/math';
import type { RoomZone } from '../../data/decor';
import { commitRetentionUpdate } from '../../utils/storage';
import {moveDecor,putAwayDecor,type DecorPlacement} from './placement';
import { placeDecor, acknowledgeDecor } from './room';
/** Reuse the existing durable save/conflict check before publishing any room feedback. */
export class RoomController {
 constructor(public progress:UserProgress,private publish:(p:UserProgress)=>void){}
 private commit(update:(p:UserProgress)=>UserProgress){const next=commitRetentionUpdate(this.progress,update);this.progress=next;this.publish(next);return next;}
 place(id:string,zone:RoomZone){return this.commit(p=>placeDecor(p,id,zone));}
 move(placement:DecorPlacement){return this.commit(p=>moveDecor(p,placement));}
 putAway(id:string){return this.commit(p=>putAwayDecor(p,id));}
 acknowledge(id:string){return this.commit(p=>acknowledgeDecor(p,id));}
}
