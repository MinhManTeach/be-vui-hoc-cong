import {useEffect,useRef} from 'react';
import type {PointerEvent,RefObject} from 'react';
import {DECOR} from '../../data/decor';
import {decorSize,validPlacement,type DecorPlacement} from '../../domain/room/placement';
import {DecorArt} from './DecorArt';
export function DraggableDecor({placement,sceneRef,selected,onSelect,onDragging,onDrop}:{placement:DecorPlacement;sceneRef:RefObject<HTMLDivElement|null>;selected:boolean;onSelect:()=>void;onDragging:(active:boolean)=>void;onDrop:(p:DecorPlacement)=>void}){
 const ref=useRef<HTMLButtonElement>(null);
 const drag=useRef<{pointer:number;startX:number;startY:number;origin:DecorPlacement;width:number;height:number;moved:boolean;candidate:DecorPlacement}|null>(null);
 const size=decorSize(placement.id),decor=DECOR.find(d=>d.id===placement.id)!;
 const display=(p:DecorPlacement)=>{if(ref.current){ref.current.style.left=p.x*100+'%';ref.current.style.top=p.y*100+'%';}};
 useEffect(()=>{display(placement);ref.current?.classList.remove('decor-pop');void ref.current?.offsetWidth;ref.current?.classList.add('decor-pop');},[placement.x,placement.y]);
 const start=(e:PointerEvent<HTMLButtonElement>)=>{
  if(!e.isPrimary||e.button!==0||drag.current)return;const bounds=sceneRef.current?.getBoundingClientRect();if(!bounds)return;
  onSelect();onDragging(true);e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.remove('decor-return');
  drag.current={pointer:e.pointerId,startX:e.clientX,startY:e.clientY,origin:placement,width:bounds.width,height:bounds.height,moved:false,candidate:placement};
 };
 const move=(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d||d.pointer!==e.pointerId)return;
  d.candidate={...d.origin,x:d.origin.x+(e.clientX-d.startX)/d.width,y:d.origin.y+(e.clientY-d.startY)/d.height};
  d.moved ||= Math.abs(e.clientX-d.startX)+Math.abs(e.clientY-d.startY)>4;
  // Only this element changes during drag; no React room rerender per pointermove.
  display({...d.candidate,x:Math.max(size.width/2+.02,Math.min(.98-size.width/2,d.candidate.x)),y:Math.max(size.height/2+.02,Math.min(.98-size.height/2,d.candidate.y))});
 };
 const finish=(e:PointerEvent<HTMLButtonElement>,cancelled=false)=>{const d=drag.current;if(!d||d.pointer!==e.pointerId)return;drag.current=null;onDragging(false);
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  if(cancelled||!validPlacement(d.candidate))e.currentTarget.classList.add('decor-return');
  display(d.origin);
  if(!cancelled&&d.moved&&validPlacement(d.candidate)){onDrop(d.candidate);}else if(d.moved){e.currentTarget.classList.add('decor-return');}
 };
 return <button ref={ref} className={'room-free-decor'+(selected?' decor-selected':'')} style={{left:placement.x*100+'%',top:placement.y*100+'%',width:size.width*100+'%',height:size.height*100+'%'}} aria-label={decor.displayName+', kéo để di chuyển'} aria-pressed={selected} data-placement-type={placement.type} onClick={onSelect} onPointerDown={start} onPointerMove={move} onPointerUp={e=>finish(e)} onPointerCancel={e=>finish(e,true)} onLostPointerCapture={e=>{if(drag.current)finish(e,true);}}><DecorArt art={decor.art} stretch={decor.art==='rug'}/></button>;
}
