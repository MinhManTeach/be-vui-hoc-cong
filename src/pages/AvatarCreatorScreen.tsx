import {useState} from 'react';
import type {UserProgress} from '../types/math';
import {AVATAR_OPTIONS,chooseAvatar,normalizeAvatar,randomAvatar,updateAvatar,type AvatarCategory,type AvatarConfig} from '../domain/avatar/avatar';
import {commitRetentionUpdate} from '../utils/storage';
import {ChildAvatar} from '../components/ChildAvatar';
import './avatarCreator.css';

const CATEGORIES: {id:AvatarCategory;label:string;icon:string}[] = [
 {id:'base',label:'Bạn nhỏ',icon:'☺'},{id:'hairStyle',label:'Tóc',icon:'✂'},
 {id:'hairColor',label:'Màu tóc',icon:'◕'},{id:'top',label:'Áo',icon:'♧'},
 {id:'bottom',label:'Quần / váy',icon:'♢'},{id:'shoes',label:'Giày',icon:'♧'},
];
export default function AvatarCreatorScreen({progress,onSaved,onExit}:{progress:UserProgress;onSaved:(p:UserProgress)=>void;onExit:()=>void}) {
 const [snapshot,setSnapshot]=useState(progress);
 const [category,setCategory]=useState<AvatarCategory>('base');
 const [revision,setRevision]=useState(0);
 const [error,setError]=useState('');
 const config=normalizeAvatar(snapshot.avatar);
 const select=(next:AvatarConfig)=>{
  try {
   const saved=commitRetentionUpdate(snapshot,p=>updateAvatar(p,next));
   setSnapshot(saved);onSaved(saved);setRevision(n=>n+1);setError('');
  } catch {setError('Chưa lưu được. Con quay lại rồi thử lại nhé!');}
 };
 return <div className="avatar-creator"><header><button onClick={onExit} aria-label="Quay lại">← Quay lại</button><h1>Nhân vật của con</h1><button onClick={onExit}>Xong ✓</button></header>
 <main><section className="avatar-stage" aria-label="Xem nhân vật của con"><div className="avatar-stage-stars" aria-hidden="true">✦ ☁ ✦</div><div key={revision} className="avatar-preview"><ChildAvatar config={config}/></div><div className="avatar-pedestal" aria-hidden="true"/><button className="avatar-random" onClick={()=>select(randomAvatar())}>🎲 Chọn giúp con</button></section>
 <section className="avatar-picker" aria-label="Chọn đồ cho nhân vật"><nav aria-label="Các phần của nhân vật">{CATEGORIES.map(c=><button key={c.id} aria-pressed={category===c.id} onClick={()=>setCategory(c.id)}><span aria-hidden="true">{c.icon}</span>{c.label}</button>)}</nav>
 <h2>{category==='base'?'Chọn bạn nhỏ của con':CATEGORIES.find(c=>c.id===category)!.label}</h2>
 <div className="avatar-options">{AVATAR_OPTIONS[category].map(option=><button key={option.id} aria-label={option.label} aria-pressed={config[category]===option.id} onClick={()=>select(chooseAvatar(config,category,option.id))}>
 <ChildAvatar config={chooseAvatar(config,category,option.id)} label={option.label}/><span>{option.label}</span>{config[category]===option.id&&<b className="avatar-check" aria-hidden="true">✓</b>}
 </button>)}</div><p className="avatar-save-status" role="status">{error||'✓ Đã lưu trên máy này'}</p></section></main></div>;
}
