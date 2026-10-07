import React from 'react';
import {AVATAR_OPTIONS,normalizeAvatar} from '../domain/avatar/avatar';

/** All parts share a 200×260 canvas: feet y=240, shoulders y=146, head (100,87).
 * Layer order: rear hair, body, bottom, top, shoes, face, front hair. */
export function ChildAvatar({config,className='',label='Nhân vật của con'}:{config?:unknown;className?:string;label?:string}) {
 const a=normalizeAvatar(config);
 const hair=AVATAR_OPTIONS.hairColor.find(o=>o.id===a.hairColor)!.color;
 const top=AVATAR_OPTIONS.top.find(o=>o.id===a.top)!.color;
 const bottom=AVATAR_OPTIONS.bottom.find(o=>o.id===a.bottom)!.color;
 const shoes=AVATAR_OPTIONS.shoes.find(o=>o.id===a.shoes)!.color;
 const skin='#efbf96',line='#644a46';
 return <svg className={'child-avatar '+className} viewBox="0 0 200 260" role="img" aria-label={label} data-character-role="child" data-avatar-base={a.base}>
 <ellipse cx="100" cy="244" rx="48" ry="7" fill="#795548" opacity=".15"/>
 <g data-layer="hair-back" fill={hair}>{['bob','pigtails'].includes(a.hairStyle)&&<path d="M48 77Q40 118 49 142Q100 157 151 142Q161 100 151 77Z"/>}{a.hairStyle==='pigtails'&&<><ellipse cx="41" cy="112" rx="19" ry="34"/><ellipse cx="159" cy="112" rx="19" ry="34"/></>}{a.hairStyle==='bun'&&<circle cx="100" cy="30" r="23"/>}</g>
 <g data-layer="body" fill={skin} stroke={line} strokeWidth="2.5"><path d="M87 125V147H113V125"/><rect x="73" y="191" width="21" height="44" rx="9"/><rect x="106" y="191" width="21" height="44" rx="9"/><path d="M67 151Q53 158 48 186Q45 198 55 200Q65 201 68 187L79 163M133 151Q147 158 152 186Q155 198 145 200Q135 201 132 187L121 163"/></g>
 <g data-layer="bottom" fill={bottom} stroke={line} strokeWidth="2.5">{a.bottom==='skirt'?<path d="M73 184H127L140 216Q100 228 60 216Z"/>:<><path d={`M73 184H127V${a.bottom==='trousers'?229:211}H105V199H95V${a.bottom==='trousers'?229:211}H73Z`}/><path d="M80 191H120" opacity=".3"/></>}</g>
 <g data-layer="top" fill={top} stroke={line} strokeWidth="2.5"><path d="M85 140Q100 150 115 140L139 153L131 171L123 167L128 192Q100 199 72 192L77 167L69 171L61 153Z"/><path d="M87 142Q100 160 113 142" fill="none" stroke="#fff" strokeWidth="5"/>
 {a.top==='sky'?<path d="M87 170Q84 161 93 162Q99 153 105 162Q116 161 114 170Z" fill="white" stroke="none"/>:a.top==='sun'?<circle cx="100" cy="172" r="10" fill="#fff3ba" stroke="none"/>:a.top==='mint'?<path d="M100 183Q79 169 106 161Q116 175 100 183Z" fill="#fff" stroke="none"/>:a.top==='lilac'?<g fill="#fff" stroke="none">{[0,72,144,216,288].map(r=><ellipse key={r} cx="100" cy="166" rx="4" ry="7" transform={`rotate(${r} 100 174)`}/>)}<circle cx="100" cy="174" r="4" fill="#f6ca59"/></g>:<path d="M90 164Q100 159 110 164L100 183Z" fill="#fff" stroke="none"/>}</g>
 <g data-layer="shoes" fill={shoes} stroke={line} strokeWidth="2.5"><path d="M74 229H94V241H65Q63 232 74 229ZM106 229H126Q137 232 135 241H106Z"/><path d="M73 235H88M112 235H127" stroke="white" strokeWidth="3" strokeLinecap="round"/></g>
 <g data-layer="face"><g fill={skin} stroke={line} strokeWidth="2.5"><circle cx="48" cy="94" r="10"/><circle cx="152" cy="94" r="10"/><path d="M48 80Q48 37 100 37Q152 37 152 80V100Q150 139 100 140Q50 139 48 100Z"/></g><g fill="#413441"><ellipse cx="78" cy="94" rx="5" ry="7"/><ellipse cx="122" cy="94" rx="5" ry="7"/></g><g fill="white"><circle cx="79" cy="92" r="1.8"/><circle cx="123" cy="92" r="1.8"/></g><g fill="#ef9e99" opacity=".7"><ellipse cx="67" cy="109" rx="10" ry="5"/><ellipse cx="133" cy="109" rx="10" ry="5"/></g><path d="M91 115Q100 125 109 115" fill="none" stroke={line} strokeWidth="3" strokeLinecap="round"/></g>
 <g data-layer="hair-front" fill={hair}><path d={a.hairStyle==='sweep'?'M47 89Q36 33 96 32Q155 25 155 89L143 72Q115 76 112 48Q90 80 47 89Z':a.hairStyle==='crop'?'M47 84Q38 32 100 32Q159 32 153 85L137 65L123 72L105 57L85 72L66 65Z':'M47 86Q37 31 100 32Q163 31 153 86L139 69L121 76L100 64L79 76L61 69Z'}/><path d="M67 49Q85 38 103 41" fill="none" stroke="white" strokeOpacity=".18" strokeWidth="5" strokeLinecap="round"/></g>
 {a.base==='girl'&&<g fill="#f2a0b7" stroke="#b96988" strokeWidth="1.5" data-layer="base-detail"><path d="M135 55L145 49V66L135 61L125 67V50Z"/><circle cx="135" cy="58" r="3"/></g>}
 </svg>;
}
