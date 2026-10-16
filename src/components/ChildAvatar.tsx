import React from 'react';
import {normalizeAvatar} from '../domain/avatar/avatar';
import {HeroArt, type HeroOutfit} from './HeroCharacter';

/** The child's chibi boy or girl as a still picture. `face` crops to the head for small badges. */
export function ChildAvatar({config,className='',label='Nhân vật của con',face=false,outfit}:{config?:unknown;className?:string;label?:string;face?:boolean;outfit?:HeroOutfit}) {
 const a=normalizeAvatar(config);
 return <svg className={'child-avatar '+className} viewBox={face?'14 26 172 164':'0 -24 200 264'} role="img" aria-label={label} data-avatar-base={a.base} style={face?{overflow:'hidden'}:undefined}>
 <HeroArt avatar={a} outfit={outfit}/>
 </svg>;
}
