import React, {useState} from 'react';
import { ALL_PLUSH_FRIENDS } from '../../data/plushFriends';
import { PlushFriendRenderer } from './PlushFriendRenderer';
import { HeroCharacter } from '../HeroCharacter';
import type { CompanionReaction } from '../../utils/companion';
interface Props {companionId:string|null;size?:number;showBadge?:boolean;canSpeakOnClick?:boolean;className?:string;reaction?:CompanionReaction;accessories?:React.ComponentProps<typeof HeroCharacter>}
/** Visual chatter only; question/hint/replay retain ownership of speech. */
export const CompanionRenderer:React.FC<Props>=({companionId,size=56,showBadge=true,canSpeakOnClick=true,className='',reaction='IDLE',accessories})=>{
 const friend=ALL_PLUSH_FRIENDS.find(f=>f.id===companionId);
 const [bubble,setBubble]=useState(false);
 const character=friend?<PlushFriendRenderer plushId={friend.id} size={size} animationState="idle"/>:<HeroCharacter {...accessories} size="md" mood="idle" showSpeechBubble={false}/>;
 return <div className={'companion '+className} data-companion-id={friend?.id??'bunny'} data-reaction={reaction} aria-label={(friend?.name??'Bạn nhỏ')+' — bạn đồng hành'}>
 <div className="companion-motion">{canSpeakOnClick?<button className="companion-touch" aria-label="Chào bạn đồng hành" onClick={()=>setBubble(v=>!v)}>{character}</button>:character}</div>
 {showBadge&&<span className="companion-badge">Đang đồng hành</span>}
 {reaction==='THINKING'&&<span aria-hidden="true">💡</span>}{reaction==='ENCOURAGE'&&<span aria-hidden="true">♥</span>}
 {bubble&&<p className="companion-bubble">{friend?.encouragements[0]??'Cùng mình thử nhé!'}</p>}</div>;
};
