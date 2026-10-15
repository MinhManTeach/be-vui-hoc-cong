import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ALL_PLUSH_FRIENDS} from '../src/data/plushFriends';
import {homeCompanionCopy,resolveCompanion} from '../src/utils/companion';
import {INITIAL_PROGRESS} from '../src/utils/storage';
import {SplashScreen} from '../src/pages/SplashScreen';
for(const friend of ALL_PLUSH_FRIENDS) test('Home identifies mascot and selected '+friend.name,()=>{
 const p={...structuredClone(INITIAL_PROGRESS),unlockedPlushFriends:[friend.id],selectedCompanionId:friend.id};
 const id=resolveCompanion(p),copy=homeCompanionCopy(id);
 assert.equal(copy.greeting,'Chào con! '+friend.name+' đang chờ con cùng phiêu lưu!');
 const html=renderToStaticMarkup(createElement(SplashScreen,{companionId:id,onStartAdventure:()=>{}}));
 assert(html.includes(copy.greeting));assert(html.includes(copy.instruction));assert(html.includes('data-companion-id="'+friend.id+'"'));assert(html.includes('Chạm vào bạn nhỏ nhé!'));
});
for(const id of [null,'bunny','missing'])test('Home fallback is natural without duplicate mascot: '+id,()=>{
 const copy=homeCompanionCopy(id);assert.equal(copy.greeting,'Chào con! Mình cùng đi phiêu lưu nhé!');assert.equal(copy.companionId,null);
 const html=renderToStaticMarkup(createElement(SplashScreen,{companionId:id,onStartAdventure:()=>{}}));assert(!html.includes('data-companion-id='));assert(html.includes(copy.greeting));assert(html.includes(copy.instruction));
});
test('unowned selection cannot appear in Home copy',()=>{const p={...structuredClone(INITIAL_PROGRESS),selectedCompanionId:ALL_PLUSH_FRIENDS[0].id};assert.equal(homeCompanionCopy(resolveCompanion(p)).companionId,null);});
