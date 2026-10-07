import {ChildAvatar} from '../components/ChildAvatar';
import { useRef, useState } from 'react';
import type { UserProgress } from '../types/math';
import { DECOR } from '../data/decor';
import { RoomController } from '../domain/room/controller';
import { CompanionRenderer } from '../components/plush/CompanionRenderer';
import { resolveCompanion } from '../utils/companion';
import { DecorArt } from '../components/room/DecorArt';
import {DraggableDecor} from '../components/room/DraggableDecor';
import {suggestPlacement,type DecorPlacement} from '../domain/room/placement';
import './myRoom.css';
export default function MyRoomScreen({progress,onSaved,onExit,onOpenAvatar,initialDecorId}:{progress:UserProgress;onSaved:(p:UserProgress)=>void;onExit:()=>void;onOpenAvatar:()=>void;initialDecorId?:string}) {
 const [controller]=useState(()=>new RoomController(progress,onSaved));
 const sceneRef = useRef<HTMLDivElement>(null);
 const [selected,setSelected]=useState<string|null>(initialDecorId??null);
 const [tray,setTray]=useState(!!initialDecorId);
 const [message,setMessage]=useState(initialDecorId?'Chọn chỗ sáng để đặt đồ nhé!':'Một căn phòng ấm áp cho con và bạn nhỏ!');
 const [dragging,setDragging]=useState(false);
 const [happy,setHappy]=useState(false);
 const [error,setError]=useState('');
 const [snapshot,setSnapshot]=useState(progress);
 const decor=DECOR.find(d=>d.id===selected);
 const move=(placement:DecorPlacement)=>{
  try {const next=controller.move(placement);setSnapshot(next);setHappy(true);setMessage('Đẹp quá!');}
  catch {setError('Chưa lưu được căn phòng. Con quay lại bản đồ rồi thử lại nhé!');}
 };
 const suggest=(id:string)=>{const p=suggestPlacement(id,snapshot.room?.placements);if(p)move(p);};
 const choose=(id:string)=>{setSelected(id);setHappy(false);setTray(false);setMessage('Kéo đồ đến chỗ con thích nhé!');if(!snapshot.room?.placements?.some(p=>p.id===id))suggest(id);setMessage('Kéo đồ đến chỗ con thích nhé!');sceneRef.current?.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 const putAway=()=>{if(!selected)return;try{setSnapshot(controller.putAway(selected));setSelected(null);setHappy(false);setMessage('Đã cất vào Đồ của con!');}catch{setError('Chưa lưu được căn phòng. Con thử lại nhé!');}};
 return <div className="my-room"><header><button onClick={onExit} aria-label="Về bản đồ">←</button><h1>Phòng Của Bé</h1><button onClick={()=>setTray(v=>!v)} aria-expanded={tray}>🎒 Đồ của con</button></header>
 <main><div ref={sceneRef} className="room-scene" aria-label="Căn phòng của con">
 <div className="room-side-wall" aria-hidden="true"/><div className="room-floor" aria-hidden="true"/>
 <div className="room-window" aria-hidden="true"><span className="room-sun"/><span className="room-cloud"/><span className="room-window-cross"/></div>
 <div className="room-curtain room-curtain-left" aria-hidden="true"/><div className="room-curtain room-curtain-right" aria-hidden="true"/>
 <div className="room-sunlight" aria-hidden="true"/>
 <svg className="room-cozy-seat" viewBox="0 0 180 150" aria-hidden="true"><ellipse cx="90" cy="133" rx="73" ry="10" fill="#78350f" opacity=".16"/><path d="M23 96 Q10 39 60 28 Q105 3 151 49 Q173 82 148 119 Q91 145 30 116 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="4"/><path d="M35 90 Q87 54 145 91 Q150 116 93 123 Q38 126 35 90Z" fill="#fdba74"/><path d="M49 46 Q89 25 123 46" fill="none" stroke="#fed7aa" strokeWidth="6" strokeLinecap="round"/><rect x="56" y="53" width="61" height="43" rx="16" fill="#fef3c7" transform="rotate(-8 86 74)"/><path d="M80 60 L90 72 L80 84" fill="none" stroke="#fbbf24" strokeWidth="5"/></svg>
 <div className="room-table" aria-hidden="true"><span className="room-table-top"/><span className="room-table-leg room-table-leg-left"/><span className="room-table-leg room-table-leg-right"/></div>
 <div className="room-window-cabinet" aria-hidden="true"><span/><i/><i/></div>
 <div className="room-wall-shelf" aria-hidden="true"/><div className="room-companion-shadow" aria-hidden="true"/>
 {dragging&&decor&&<div className={'room-soft-zone zone-'+(decor.zone==='FLOOR'?'floor':decor.zone==='WALL'?'wall':decor.zone==='SHELF'?'surface':'flexible')} aria-hidden="true"><span>{decor.zone==='FLOOR'?'Sàn':decor.zone==='WALL'?'Tường':decor.zone==='SHELF'?'Bàn / Kệ':'Chỗ con thích'}</span></div>}
 {snapshot.room?.placements?.map(p=><DraggableDecor key={p.id} placement={p} sceneRef={sceneRef} selected={selected===p.id} onSelect={()=>{setSelected(p.id);setHappy(false);}} onDragging={setDragging} onDrop={move}/>)}
 <div className="room-child"><ChildAvatar config={snapshot.avatar}/></div>
 <div className="room-companion"><CompanionRenderer companionId={resolveCompanion(snapshot)} size={130} reaction={happy?'HAPPY':'IDLE'} canSpeakOnClick={false} showBadge={false}/></div>
 </div>{selected&&<div className="room-decor-actions"><button disabled={!!error} onClick={()=>suggest(selected)}>✨ Gợi ý chỗ đẹp</button><button disabled={!!error} onClick={putAway}>🎒 Cất đi</button><button onClick={()=>setSelected(null)}>Xong ✓</button></div>}<p className="room-feedback" role="status">{error||message}</p>
 {tray&&<section className="room-tray" aria-label="Đồ của con"><h2>Chạm món đồ con muốn đặt</h2><div className="room-inventory">{DECOR.map(item=>{const owned=snapshot.room?.ownedIds.includes(item.id);return <button key={item.id} disabled={!owned||!!error} aria-pressed={selected===item.id} aria-label={item.displayName+(owned?'':', '+item.unlockLabel)} onClick={()=>choose(item.id)}>
 <div className={owned?'':'decor-locked'}><DecorArt art={item.art}/></div><strong>{item.displayName}</strong>{!owned&&<small>🔒 {item.unlockLabel}</small>}</button>})}</div></section>}
 <button className="room-avatar-cta" onClick={onOpenAvatar}>✨ Tạo nhân vật của con</button></main></div>;
}
