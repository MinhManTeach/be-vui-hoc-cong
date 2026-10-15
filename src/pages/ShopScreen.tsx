import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Lock, Volume2 } from 'lucide-react';
import { AccessoryType, BunnyAccessory, UserProgress } from '../types/math';
import { REWARDS_CATALOG } from '../utils/rewards';
import { ALL_WORLDS } from '../utils/storage';
import { HeroCharacter } from '../components/HeroCharacter';
import { WearableIcon } from '../components/wardrobe/WearableArt';
import { availableStars, buyItem, isOwned, nextGoal, toggleWearable } from '../domain/shop/shop';
import { sound } from '../utils/sound';

interface ShopScreenProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onBack: () => void;
}

const TABS: { type: AccessoryType; label: string; icon: string }[] = [
  { type: 'hat', label: 'Mũ', icon: 'hat_crown' },
  { type: 'glasses', label: 'Kính', icon: 'glasses_heart' },
  { type: 'shirt', label: 'Áo', icon: 'shirt_dress' },
  { type: 'backpack', label: 'Ba lô', icon: 'backpack_yellow' },
  { type: 'item', label: 'Đồ chơi', icon: 'item_balloon' },
  { type: 'badge', label: 'Huy hiệu', icon: 'badge_counting_star' },
];

const StarRow: React.FC<{ count: number; faded?: number; label: string }> = ({ count, faded = 0, label }) => (
  <div className="flex flex-wrap justify-center gap-0.5 max-w-[15rem]" aria-label={label}>
    {Array.from({ length: Math.min(count, 30) }, (_, i) => (
      <span key={i} className={`text-lg leading-none transition ${i >= count - faded ? 'opacity-25 grayscale' : ''}`} aria-hidden="true">⭐</span>
    ))}
    {count > 30 && <span className="text-sm font-black text-amber-800 self-center">+{count - 30}</span>}
  </div>
);

function badgeHint(item: BunnyAccessory): string {
  if (item.earnedBy === 'all') return 'Thắng boss ở cả 6 vùng đất để nhận';
  const world = ALL_WORLDS.find(w => w.id === item.earnedBy);
  return `Thắng boss ở vùng đất "${world?.name ?? ''}" để nhận`;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ progress, onUpdateProgress, onBack }) => {
  const [activeTab, setActiveTab] = useState<AccessoryType>('hat');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<BunnyAccessory | null>(null);
  const [justBought, setJustBought] = useState<string | null>(null);

  const wallet = availableStars(progress);
  const goal = nextGoal(progress);
  const selected = REWARDS_CATALOG.find(item => item.id === selectedId) ?? null;
  const items = REWARDS_CATALOG.filter(item => item.type === activeTab);

  useEffect(() => () => sound.cancelSpeech(), []);

  // Tapping any item shows it on the hero straight away, owned or not.
  const outfit = { ...progress.equippedAccessories };
  if (selected && !isOwned(progress, selected)) outfit[selected.type] = selected.id;

  const pick = (item: BunnyAccessory) => {
    sound.playTap();
    setSelectedId(item.id);
    setJustBought(null);
    if (item.type === 'badge' && !isOwned(progress, item)) {
      sound.speak(`${item.name}. ${badgeHint(item)} nhé!`);
      return;
    }
    if (isOwned(progress, item)) {
      onUpdateProgress({ ...progress, equippedAccessories: toggleWearable(progress.equippedAccessories, item) });
      sound.playStar();
      sound.speak(progress.equippedAccessories[item.type] === item.id ? 'Đã cất vào tủ!' : `Con mặc ${item.name} đẹp quá!`);
    } else if (wallet >= item.price) {
      sound.speak(`${item.name}. Giá ${item.price} ngôi sao. Con có muốn đổi không?`);
    } else {
      sound.speak(`${item.name}. Con cần thêm ${item.price - wallet} ngôi sao nữa nhé!`);
    }
  };

  const confirmBuy = () => {
    if (!confirming) return;
    const result = buyItem(progress, confirming.id);
    setConfirming(null);
    if (!result.ok) {
      sound.playGentleRetry();
      return;
    }
    onUpdateProgress(result.progress);
    setJustBought(result.item.id);
    sound.playChestOpen();
    sound.speak(`Hoan hô! Con có ${result.item.name} rồi!`);
    try {
      confetti({ particleCount: 70, spread: 75, origin: { y: 0.35 }, colors: ['#FCD34D', '#F472B6', '#60A5FA', '#34D399'] });
    } catch { /* confetti is decoration only */ }
  };

  const selectedOwned = selected ? isOwned(progress, selected) : false;
  const selectedWorn = selected ? progress.equippedAccessories[selected.type] === selected.id : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-50 to-amber-100 text-slate-800 select-none pb-10">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b-4 border-amber-300 px-3 sm:px-6 py-2.5 shadow-sm flex items-center justify-between gap-2">
        <button
          onClick={() => { sound.playTap(); onBack(); }}
          className="p-2.5 sm:px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-900 font-black flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="hidden sm:inline">Quay lại</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-['Fredoka',sans-serif]">Cửa Hàng Đồ Chơi</h2>
        <div className="flex items-center gap-1.5 bg-amber-300 border-2 border-amber-500 px-3.5 py-1.5 rounded-2xl font-black text-amber-950 text-xl shadow-[0_3px_0_#d97706]" aria-label={`Con có ${wallet} ngôi sao`}>
          <span aria-hidden="true">⭐</span>
          <span>{wallet}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 grid md:grid-cols-[minmax(0,20rem)_1fr] gap-4">
        {/* Stage: the hero wears whatever the child taps */}
        <section className="sticky top-[4.25rem] z-30 md:top-20 self-start bg-white/95 border-4 border-amber-300 rounded-[2rem] p-2.5 md:p-4 shadow-lg flex flex-row md:flex-col items-center gap-3 md:gap-0">
          <div className="relative w-32 md:w-full shrink-0 flex justify-center rounded-3xl bg-gradient-to-b from-sky-100 to-emerald-100 pt-2 md:pt-3 pb-1 overflow-hidden">
            <div className="absolute bottom-0 inset-x-0 h-8 bg-emerald-200/70 rounded-t-[50%]" />
            {justBought && <div className="absolute top-2 right-3 text-3xl animate-bounce" aria-hidden="true">✨</div>}
            <HeroCharacter
              mood={justBought ? 'celebrate' : 'happy'}
              size="md"
              className="md:scale-125 md:my-6"
              showSpeechBubble={false}
              {...outfit}
            />
          </div>

          {selected ? (
            <div className="w-full md:mt-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{selected.name}</h3>
                <button
                  onClick={() => sound.speak(`${selected.name}. ${selected.description}`)}
                  className="p-1.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer"
                  aria-label="Nghe tên món đồ"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-bold text-slate-500 mt-0.5">{selected.type === 'badge' && !selectedOwned ? badgeHint(selected) : selected.description}</p>

              {selected.type === 'badge' ? (
                <p className={`mt-3 py-2.5 rounded-2xl font-black ${selectedOwned ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                  {selectedOwned ? (selectedWorn ? '✓ Đang đeo' : 'Chạm thẻ để đeo') : '🔒 Chưa nhận được'}
                </p>
              ) : selectedOwned ? (
                <p className="mt-3 py-2.5 rounded-2xl bg-emerald-100 text-emerald-800 font-black">
                  {selectedWorn ? '✓ Con đang mặc' : 'Đã cất trong tủ'}
                </p>
              ) : wallet >= selected.price ? (
                <button
                  onClick={() => { sound.playTap(); setConfirming(selected); }}
                  className="mt-3 w-full py-3 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-400 border-2 border-amber-500 text-amber-950 font-black text-xl shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-none transition cursor-pointer"
                >
                  Đổi {selected.price} ⭐
                </button>
              ) : (
                <div className="mt-3">
                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-300">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.round((wallet / selected.price) * 100)}%` }} />
                  </div>
                  <p className="mt-1.5 font-black text-slate-600">Còn thiếu {selected.price - wallet} ⭐ — học thêm nhé!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full md:mt-3 text-center">
              <p className="font-black text-slate-700 text-sm md:text-base">Chạm vào món đồ để mặc thử nhé!</p>
              {goal && (
                <div className="mt-3 flex items-center gap-2 bg-amber-50 border-2 border-amber-200 rounded-2xl p-2">
                  <WearableIcon id={goal.item.id} className="w-12 h-12 shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="text-xs font-black text-amber-900">Mục tiêu: {goal.item.name}</p>
                    <div className="h-3 mt-1 bg-white rounded-full overflow-hidden border border-amber-300">
                      <div className="h-full bg-amber-400" style={{ width: `${Math.round((wallet / goal.item.price) * 100)}%` }} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">Còn {goal.missing} ⭐ nữa</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <nav className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3" aria-label="Loại đồ">
            {TABS.map(tab => {
              const active = tab.type === activeTab;
              return (
                <button
                  key={tab.type}
                  onClick={() => { sound.playTap(); setActiveTab(tab.type); setSelectedId(null); setJustBought(null); }}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-2xl border-3 font-black text-sm transition active:scale-95 cursor-pointer ${
                    active ? 'bg-amber-300 border-amber-500 text-amber-950 shadow-[0_4px_0_#d97706]' : 'bg-white border-amber-200 text-slate-600 hover:bg-amber-50'
                  }`}
                >
                  <WearableIcon id={tab.icon} className="w-10 h-10" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map(item => {
              const owned = isOwned(progress, item);
              const worn = progress.equippedAccessories[item.type] === item.id;
              const affordable = !owned && item.type !== 'badge' && wallet >= item.price;
              const isSelected = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  onClick={() => pick(item)}
                  aria-label={item.name}
                  className={`relative flex flex-col items-center rounded-3xl border-4 p-2.5 pb-3 transition active:scale-95 cursor-pointer ${
                    isSelected ? 'border-sky-400 ring-4 ring-sky-200 bg-white' : worn ? 'border-emerald-400 bg-emerald-50' : owned || affordable ? 'border-amber-200 bg-white hover:border-amber-400' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {worn && (
                    <span className="absolute top-1.5 right-1.5 p-1 rounded-full bg-emerald-500 text-white shadow">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                  {affordable && (
                    <span className="absolute top-1.5 left-1.5 text-lg animate-bounce-subtle" aria-hidden="true">✨</span>
                  )}
                  <div className={`w-full aspect-square rounded-2xl flex items-center justify-center ${owned ? 'bg-amber-50' : affordable ? 'bg-yellow-50' : 'bg-slate-100'}`}>
                    <WearableIcon id={item.id} className={`w-[85%] h-[85%] ${!owned && !affordable ? 'opacity-60' : ''}`} />
                  </div>
                  <span className="mt-1.5 text-sm font-black leading-tight text-slate-800 text-center">{item.name}</span>
                  <span
                    className={`mt-1.5 w-full py-1 rounded-xl text-sm font-black flex items-center justify-center gap-1 ${
                      worn ? 'bg-emerald-200 text-emerald-900' : owned ? 'bg-emerald-100 text-emerald-800' : item.type === 'badge' ? 'bg-slate-200 text-slate-500' : affordable ? 'bg-amber-300 text-amber-950' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {worn ? (item.type === 'badge' ? 'Đang đeo' : 'Đang mặc') : owned ? 'Của con' : item.type === 'badge' ? <><Lock className="w-3.5 h-3.5" /> Thắng boss</> : <>{!affordable && <Lock className="w-3.5 h-3.5" />}{item.price} ⭐</>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Đổi ${confirming.name}`}>
          <div className="bg-white rounded-[2rem] border-4 border-amber-300 p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl">
            <WearableIcon id={confirming.id} className="w-28 h-28 mx-auto" />
            <h3 className="text-xl font-black text-slate-900 mt-1">Đổi {confirming.name}?</h3>
            <div className="mt-3 rounded-2xl bg-amber-50 border-2 border-amber-200 p-3 flex flex-col items-center gap-2">
              <StarRow count={wallet} faded={confirming.price} label={`Con có ${wallet} sao, dùng ${confirming.price} sao`} />
              <p className="text-2xl font-black text-amber-900 font-['Fredoka',sans-serif]" aria-live="polite">
                {wallet} − {confirming.price} = {wallet - confirming.price} ⭐
              </p>
              <p className="text-xs font-bold text-slate-500">Con còn lại {wallet - confirming.price} ngôi sao</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => { sound.playTap(); setConfirming(null); }}
                className="py-3 rounded-2xl bg-slate-100 border-2 border-slate-300 font-black text-slate-700 text-lg active:scale-95 cursor-pointer"
              >
                Để sau
              </button>
              <button
                onClick={confirmBuy}
                className="py-3 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-500 border-2 border-emerald-600 font-black text-white text-lg shadow-[0_4px_0_#047857] active:translate-y-1 active:shadow-none cursor-pointer"
              >
                Đổi luôn!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
