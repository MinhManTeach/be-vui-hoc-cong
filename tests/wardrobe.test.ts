import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {REWARDS_CATALOG} from '../src/utils/rewards';
import {HeroCharacter} from '../src/components/HeroCharacter';
import {getWearableDefinition,toggleWearable,WearableIcon,WEARABLE_ANCHORS,WEARABLE_LAYER_ORDER} from '../src/components/wardrobe/WearableArt';
import {INITIAL_PROGRESS,saveProgress,loadProgress,migrateProgress} from '../src/utils/storage';
import {ShopScreen} from '../src/pages/ShopScreen';
const render=(props={})=>renderToStaticMarkup(createElement(HeroCharacter,{showSpeechBubble:false,...props}));
for(const item of REWARDS_CATALOG)test('shared artwork and correct anchor: '+item.id,()=>{
 const def=getWearableDefinition(item.id,item.type)!;
 assert.equal(def.catalog,item);assert.equal(def.anchor,WEARABLE_ANCHORS[item.type]);
 const icon=renderToStaticMarkup(createElement(WearableIcon,{id:item.id}));
 const equipped=render({[item.type]:item.id});
 assert(icon.includes('data-wearable-icon="'+item.id+'"'));
 assert(equipped.includes('data-wearable-id="'+item.id+'"'));
 assert.equal((equipped.match(new RegExp('data-wearable-id="'+item.id+'"','g'))??[]).length,1);
 // Both render exactly the same artwork subtree under different size/anchor wrappers.
 const artwork=renderToStaticMarkup(createElement('g',null,def.artwork)).slice(3,-4);
 assert(icon.includes(artwork));assert(equipped.includes(artwork));
});
test('A -> B -> C leaves only the last hat in the character',()=>{
 for(const hat of ['hat_cap','hat_pirate','hat_astronaut']){
  const html=render({hat});assert.equal((html.match(/data-anchor="HEAD"/g)??[]).length,1);
  for(const other of ['hat_cap','hat_pirate','hat_astronaut'].filter(x=>x!==hat))assert(!html.includes('data-wearable-id="'+other+'"'));
 }
});
test('unknown and wrong-category items safely render no accessory',()=>{
 assert.equal(getWearableDefinition('missing'),undefined);assert.equal(getWearableDefinition('hat_cap','glasses'),undefined);
 const html=render({hat:'missing',glasses:'hat_cap',badge:'missing'});
 assert(!html.includes('data-anchor="HEAD"'));assert(!html.includes('data-anchor="FACE"'));assert(!html.includes('data-anchor="BADGE"'));
});
test('render order puts back before clothing and headwear after face/glasses',()=>{
 const html=render({hat:'hat_cap',glasses:'glasses_smart',badge:'badge_cosmic',item:'item_carrot'});
 const layers=['BACK','CLOTHING','GLASSES','HEADWEAR','ACCESSORY','BADGE'];
 let prior=-1;for(const layer of layers){const index=html.indexOf('data-layer="'+layer+'"');assert(index>prior);prior=index;}
 assert.deepEqual(WEARABLE_LAYER_ORDER,['BACK','BODY','CLOTHING','FACE','GLASSES','HEADWEAR','ACCESSORY','BADGE']);
 assert(html.indexOf('data-layer="face"')<html.indexOf('data-layer="GLASSES"'));
 const hero=render({shirt:'shirt_hero'});assert(hero.indexOf('data-layer="BACK" transform=')<hero.indexOf('data-layer="body"'));
});
test('save/reload retains equipped hat and other progression fields',()=>{
 const stored=new Map<string,string>();Object.assign(globalThis,{window:{},localStorage:{getItem:(key:string)=>stored.get(key)??null,setItem:(key:string,v:string)=>stored.set(key,v),removeItem:(key:string)=>stored.delete(key)}});
 const p={...structuredClone(INITIAL_PROGRESS),xp:27,equippedAccessories:{...INITIAL_PROGRESS.equippedAccessories,hat:'hat_astronaut'},unlockedAccessories:[...INITIAL_PROGRESS.unlockedAccessories,'hat_astronaut']};
 assert.equal(saveProgress(p),true);const loaded=loadProgress();assert.equal(loaded.equippedAccessories.hat,'hat_astronaut');assert.equal(loaded.xp,27);assert(render(loaded.equippedAccessories).includes('data-wearable-id="hat_astronaut"'));
});
test('old save retains default outfit and needs no wearable schema migration',()=>{
 const p=migrateProgress({xp:12,totalStars:3});assert.equal(p.xp,12);assert.equal(p.totalStars,3);
 const html=render(p.equippedAccessories);for(const id of ['shirt_sky','backpack_yellow'])assert(html.includes('data-wearable-id="'+id+'"'));
});
test('wardrobe cards use the same rendered SVG definition as selected hat',()=>{
 const p={...structuredClone(INITIAL_PROGRESS),equippedAccessories:{...INITIAL_PROGRESS.equippedAccessories,hat:'hat_pirate'}};
 const html=renderToStaticMarkup(createElement(ShopScreen,{progress:p,onUpdateProgress:()=>{},onBack:()=>{}}));
 assert(html.includes('data-wearable-id="hat_pirate"'));for(const hat of REWARDS_CATALOG.filter(x=>x.type==='hat'))assert(html.includes('data-wearable-icon="'+hat.id+'"'));
});
test('all character sizes keep identical viewBox and accessory anchor transforms',()=>{
 const transforms=new Set<string>();for(const size of ['sm','md','lg','xl'] as const){const html=render({size,hat:'hat_astronaut'});assert(html.includes('viewBox="0 0 200 240"'));transforms.add(html.match(/data-layer="HEADWEAR"[^>]*transform="([^"]+)"/)![1]);}assert.equal(transforms.size,1);
});

test('actual wardrobe toggle replaces A -> B -> C, preserves other categories, and removes selected hat',()=>{
 let equipped=structuredClone(INITIAL_PROGRESS.equippedAccessories);const before={...equipped};
 for(const id of ['hat_cap','hat_pirate','hat_astronaut']){equipped=toggleWearable(equipped,{type:'hat',id});assert.equal(equipped.hat,id);assert.equal((render(equipped).match(/data-anchor="HEAD"/g)??[]).length,1);}
 const {hat: selectedHat,...otherCategories}=equipped;assert.equal(selectedHat,'hat_astronaut');assert.deepEqual(otherCategories,before);
 equipped=toggleWearable(equipped,{type:'hat',id:'hat_astronaut'});assert.equal(equipped.hat,undefined);assert(!render(equipped).includes('data-anchor="HEAD"'));
});
