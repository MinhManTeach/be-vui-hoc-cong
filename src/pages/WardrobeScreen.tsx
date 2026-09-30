import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Check, Lock, Star } from 'lucide-react';
import { AccessoryType, BunnyAccessory, UserProgress } from '../types/math';
import { REWARDS_CATALOG } from '../utils/rewards';
import { BunnyCharacter } from '../components/BunnyCharacter';
import { sound } from '../utils/sound';

interface WardrobeScreenProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onBack: () => void;
}

export const WardrobeScreen: React.FC<WardrobeScreenProps> = ({
  progress,
  onUpdateProgress,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<AccessoryType>('hat');

  const tabs: { type: AccessoryType; label: string; icon: string }[] = [
    { type: 'hat', label: 'MŨ', icon: '🧢' },
    { type: 'glasses', label: 'KÍNH', icon: '🕶️' },
    { type: 'shirt', label: 'ÁO', icon: '👕' },
    { type: 'backpack', label: 'BA LÔ', icon: '🎒' },
    { type: 'item', label: 'PHỤ KIỆN', icon: '🥕' },
    { type: 'badge', label: 'HUY HIỆU', icon: '🏅' },
  ];

  const itemsForTab = REWARDS_CATALOG.filter((item) => item.type === activeTab);

  const handleEquip = (item: BunnyAccessory) => {
    sound.playTap();
    const isUnlocked = progress.unlockedAccessories.includes(item.id) || progress.allUnlockedOverride;

    if (!isUnlocked) {
      sound.playGentleRetry();
      sound.speak(`Cần ${item.unlockStars} ngôi sao để mở khóa món đồ này. Bé cố gắng học thêm nhé!`);
      return;
    }

    sound.playStar();
    sound.speak(`Đẹp quá! Thỏ Bông mặc ${item.name} trông rất tuyệt!`);

    const updated = {
      ...progress,
      equippedAccessories: {
        ...progress.equippedAccessories,
        [item.type]: progress.equippedAccessories[item.type] === item.id ? undefined : item.id,
      },
    };
    onUpdateProgress(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200 text-slate-800 flex flex-col justify-between pb-12 select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-4 border-amber-300 px-4 sm:px-6 py-3 shadow-md flex items-center justify-between">
        <button
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-900 font-extrabold text-sm flex items-center gap-1.5 active:scale-95 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">🎒</span>
          <h2 className="text-lg sm:text-xl font-black text-slate-800">TỦ ĐỒ THỎ BÔNG</h2>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-100 border-2 border-amber-300 px-3 py-1.5 rounded-2xl font-black text-amber-900 shadow-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span>{progress.totalStars}</span>
        </div>
      </header>

      {/* Main Wardrobe Workspace */}
      <main className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col items-center">
        {/* Live 3D Bunny Dressing Preview */}
        <div className="w-full bg-white/90 backdrop-blur-sm border-4 border-amber-300 rounded-3xl p-6 shadow-xl flex flex-col items-center mb-6 relative overflow-hidden">
          <div className="absolute top-2 left-3 text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
            ✨ PHÒNG THỬ ĐỒ
          </div>

          <div className="my-2">
            <BunnyCharacter
              mood="happy"
              size="lg"
              showSpeechBubble={false}
              hat={progress.equippedAccessories.hat}
              glasses={progress.equippedAccessories.glasses}
              shirt={progress.equippedAccessories.shirt}
              backpack={progress.equippedAccessories.backpack}
              item={progress.equippedAccessories.item}
              badge={progress.equippedAccessories.badge}
            />
          </div>

          <p className="text-xs font-bold text-slate-500 mt-1">
            Chạm vào món đồ bên dưới để thay trang phục cho Thỏ Bông nhé!
          </p>
        </div>

        {/* Category Tabs */}
        <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => {
                  sound.playTap();
                  setActiveTab(tab.type);
                }}
                className={`py-2 px-3.5 sm:px-4 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5 transition active:scale-95 shadow-sm border-2 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 border-amber-500 text-amber-950 scale-105'
                    : 'bg-white border-amber-200 text-slate-600 hover:bg-amber-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Items Grid for Current Category */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
          {itemsForTab.map((item) => {
            const isUnlocked = progress.unlockedAccessories.includes(item.id) || progress.allUnlockedOverride;
            const isEquipped = progress.equippedAccessories[item.type] === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleEquip(item)}
                className={`p-4 rounded-3xl border-3 shadow-md flex flex-col items-center justify-between transition-all transform active:scale-95 relative cursor-pointer ${
                  isEquipped
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500 scale-102'
                    : isUnlocked
                    ? 'bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50/50'
                    : 'bg-slate-100 border-slate-200 opacity-75'
                }`}
              >
                {/* Equipped Check Badge */}
                {isEquipped && (
                  <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-white shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Emoji Icon */}
                <div className="text-4xl sm:text-5xl my-1">{item.emoji}</div>

                <div className="text-center mt-1">
                  <h4 className="font-black text-xs sm:text-sm text-slate-800 leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>

                {/* Unlock status */}
                <div className="mt-2.5 w-full">
                  {isUnlocked ? (
                    <span
                      className={`block py-1 px-2 rounded-xl text-[10px] font-black text-center ${
                        isEquipped
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isEquipped ? 'Đang mặc' : 'Mặc thử'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1 py-1 px-2 rounded-xl bg-slate-200 text-slate-600 text-[10px] font-black">
                      <Lock className="w-3 h-3" />
                      <span>{item.unlockStars} ⭐</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
