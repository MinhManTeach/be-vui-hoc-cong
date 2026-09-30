import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Check, Lock } from 'lucide-react';
import { BunnyAccessory, UserProgress } from '../types/math';
import { REWARDS_CATALOG } from '../utils/rewards';
import { BunnyCharacter } from '../components/BunnyCharacter';
import { saveProgress } from '../utils/storage';
import { sound } from '../utils/sound';

interface CollectionScreenProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onBack: () => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  progress,
  onUpdateProgress,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'hat' | 'glasses' | 'item' | 'badge'>('all');
  const [bunnySpeech, setBunnySpeech] = useState<string>('Bé hãy chọn phụ kiện để làm đẹp cho Thỏ Bông nhé!');

  const isUnlocked = (reward: BunnyAccessory) => {
    if (progress.allUnlockedOverride) return true;
    return progress.unlockedAccessories.includes(reward.id) || progress.totalStars >= reward.unlockStars;
  };

  const handleEquip = (reward: BunnyAccessory) => {
    if (!isUnlocked(reward)) {
      sound.playGentleRetry();
      sound.speak(`Con cần tích lũy thêm ${reward.unlockStars - progress.totalStars} sao nữa để mở khóa nhé!`);
      return;
    }

    sound.playStar();
    const currentEquipped = { ...progress.equippedAccessories };

    if (reward.type === 'hat') {
      currentEquipped.hat = currentEquipped.hat === reward.id ? undefined : reward.id;
    } else if (reward.type === 'glasses') {
      currentEquipped.glasses = currentEquipped.glasses === reward.id ? undefined : reward.id;
    } else if (reward.type === 'item') {
      currentEquipped.item = currentEquipped.item === reward.id ? undefined : reward.id;
    } else if (reward.type === 'badge') {
      currentEquipped.badge = currentEquipped.badge === reward.id ? undefined : reward.id;
    }

    const updated: UserProgress = {
      ...progress,
      equippedAccessories: currentEquipped,
    };
    onUpdateProgress(updated);
    saveProgress(updated);

    const cheers = [
      'Trông Thỏ Bông đẹp trai quá! ✨',
      'Thỏ Bông thích món đồ này lắm! Cảm ơn con! 💖',
      'Oa, phong cách này cực ngầu luôn! 😎',
    ];
    const cheer = cheers[Math.floor(Math.random() * cheers.length)];
    setBunnySpeech(cheer);
    sound.speak(cheer);
  };

  const filteredRewards = activeTab === 'all'
    ? REWARDS_CATALOG
    : REWARDS_CATALOG.filter((r) => r.type === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 p-4 max-w-2xl mx-auto flex flex-col justify-between select-none">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              sound.playTap();
              onBack();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 font-black rounded-2xl border-2 border-slate-200 shadow-[0_3px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-purple-600" />
            <span>Trở Về</span>
          </button>

          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 border-2 border-amber-500 rounded-2xl font-black text-amber-950 text-base shadow-[0_3px_0_#d97706]">
            <Sparkles className="w-5 h-5 fill-amber-100" />
            <span>{progress.totalStars} Sao</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h2 className="text-2xl sm:text-3xl font-black text-purple-700 drop-shadow-xs">
            🎁 PHÒNG THAY ĐỒ THỎ BÔNG
          </h2>
          <p className="text-xs font-bold text-slate-600">
            Dùng sao tích lũy để mở khóa trang phục và huy hiệu danh dự!
          </p>
        </div>

        {/* Bunny Dress Up Preview */}
        <div className="bg-white/90 border-3 border-purple-200 rounded-3xl p-4 shadow-lg mb-4 flex flex-col items-center">
          <BunnyCharacter
            mood="happy"
            size="md"
            speechText={bunnySpeech}
            hat={progress.equippedAccessories.hat}
            glasses={progress.equippedAccessories.glasses}
            item={progress.equippedAccessories.item}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-1.5 mb-4 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'hat', label: '🧢 Mũ' },
            { id: 'glasses', label: '🕶️ Kính' },
            { id: 'item', label: '🥕 Đồ chơi' },
            { id: 'badge', label: '🏅 Huy hiệu' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTap();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredRewards.map((reward) => {
            const unlocked = isUnlocked(reward);
            const isEquipped =
              progress.equippedAccessories.hat === reward.id ||
              progress.equippedAccessories.glasses === reward.id ||
              progress.equippedAccessories.item === reward.id ||
              progress.equippedAccessories.badge === reward.id;

            return (
              <button
                key={reward.id}
                onClick={() => handleEquip(reward)}
                className={`p-3 rounded-2xl border-3 text-left transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                  unlocked
                    ? isEquipped
                      ? 'bg-purple-100 border-purple-500 shadow-md ring-3 ring-purple-300'
                      : 'bg-white hover:bg-purple-50 border-purple-200 shadow-sm'
                    : 'bg-slate-100 border-slate-300 opacity-60'
                }`}
              >
                {/* Top Badge: Equipped check or Star requirement */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-3xl">{reward.emoji}</span>
                  {unlocked ? (
                    isEquipped ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Đang mặc
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700">
                        Đã mở
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-600 flex items-center gap-0.5">
                      <Lock className="w-3 h-3" /> {reward.unlockStars} ⭐
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-tight">
                    {reward.name}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5 leading-snug">
                    {reward.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs font-bold text-purple-900/70 pt-4 pb-2">
        Học toán thật chăm chỉ để thu thập trọn bộ phụ kiện cho Thỏ Bông nhé!
      </div>
    </div>
  );
};
