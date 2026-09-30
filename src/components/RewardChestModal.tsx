import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';
import { BunnyAccessory } from '../types/math';
import { REWARDS_CATALOG } from '../utils/rewards';

interface RewardChestModalProps {
  isOpen: boolean;
  rewardId: string | null;
  starsBonus?: number;
  xpBonus?: number;
  onClose: () => void;
  onEquipNow?: (accessory: BunnyAccessory) => void;
}

export const RewardChestModal: React.FC<RewardChestModalProps> = ({
  isOpen,
  rewardId,
  starsBonus = 3,
  xpBonus = 50,
  onClose,
  onEquipNow,
}) => {
  const [chestState, setChestState] = useState<'closed' | 'countdown_3' | 'countdown_2' | 'countdown_1' | 'opened'>('closed');

  const rewardItem: BunnyAccessory | undefined = rewardId
    ? REWARDS_CATALOG.find((r) => r.id === rewardId)
    : undefined;

  useEffect(() => {
    if (isOpen) {
      setChestState('closed');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenChest = () => {
    sound.playTap();
    setChestState('countdown_3');
    sound.speak('Ba...');

    setTimeout(() => {
      setChestState('countdown_2');
      sound.speak('Hai...');
    }, 600);

    setTimeout(() => {
      setChestState('countdown_1');
      sound.speak('Một...');
    }, 1200);

    setTimeout(() => {
      setChestState('opened');
      sound.playChestOpen();
      sound.playFanfare();
      sound.speak('Oa! Rương báu đã mở! Con nhận được phần thưởng mới!');

      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
        });
      } catch {}
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden">
        {/* Sparkle background effects */}
        <div className="absolute top-2 left-2 text-2xl animate-spin duration-3000">✨</div>
        <div className="absolute bottom-2 right-2 text-2xl animate-spin duration-3000">✨</div>

        {chestState === 'closed' && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-900 mb-1">🎁 RƯƠNG KHO BÁU!</h2>
            <p className="text-sm font-bold text-amber-700 mb-6">Chạm vào chiếc rương để mở quà kỳ diệu!</p>

            <button
              onClick={handleOpenChest}
              className="group relative my-4 p-6 inline-block rounded-3xl bg-amber-200/60 hover:bg-amber-200 border-4 border-amber-400 shadow-xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <div className="text-7xl sm:text-8xl group-hover:animate-bounce">🎁</div>
              <div className="mt-3 font-black text-amber-900 text-lg flex items-center justify-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-600 fill-amber-500" />
                <span>CHẠM ĐỂ MỞ</span>
              </div>
            </button>
          </div>
        )}

        {(chestState === 'countdown_3' || chestState === 'countdown_2' || chestState === 'countdown_1') && (
          <div className="py-8">
            <div className="text-7xl sm:text-8xl animate-bounce mb-4">🎁</div>
            <div className="text-5xl font-black text-amber-600 animate-ping">
              {chestState === 'countdown_3' && '3'}
              {chestState === 'countdown_2' && '2'}
              {chestState === 'countdown_1' && '1'}
            </div>
            <p className="mt-4 font-extrabold text-amber-800 text-base">Chuẩn bị mở rương...</p>
          </div>
        )}

        {chestState === 'opened' && (
          <div className="animate-scale-up">
            <div className="text-4xl mb-1">🎉</div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-900 mb-2">QUÀ TẶNG BẤT NGỜ!</h2>

            {/* Reward Display */}
            {rewardItem ? (
              <div className="my-4 p-5 bg-white border-3 border-amber-300 rounded-2xl shadow-md">
                <div className="text-6xl mb-2 animate-bounce">{rewardItem.emoji}</div>
                <h3 className="text-lg font-black text-slate-800">{rewardItem.name}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">{rewardItem.description}</p>
                <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                  Loại: {rewardItem.type === 'hat' ? 'Mũ' : rewardItem.type === 'glasses' ? 'Kính' : rewardItem.type === 'shirt' ? 'Áo' : rewardItem.type === 'backpack' ? 'Ba Lô' : rewardItem.type === 'item' ? 'Phụ Kiện' : 'Huy Hiệu'}
                </div>
              </div>
            ) : (
              <div className="my-4 p-5 bg-white border-3 border-amber-300 rounded-2xl shadow-md">
                <div className="text-6xl mb-2 animate-bounce">⭐</div>
                <h3 className="text-lg font-black text-slate-800">Kho Báu Sao Vàng!</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">Con đã nhận thêm nhiều Sao Vàng và Điểm Kinh Nghiệm!</p>
              </div>
            )}

            {/* Bonuses */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="bg-amber-100 border border-amber-300 text-amber-800 font-black text-sm px-3 py-1 rounded-xl">
                ⭐ +{starsBonus} Sao
              </span>
              <span className="bg-sky-100 border border-sky-300 text-sky-800 font-black text-sm px-3 py-1 rounded-xl">
                🌟 +{xpBonus} XP
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5">
              {rewardItem && onEquipNow && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onEquipNow(rewardItem);
                    onClose();
                  }}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base shadow-md active:scale-95 transition flex items-center justify-center gap-2 border-b-4 border-emerald-700"
                >
                  <Check className="w-5 h-5" />
                  <span>TRANG BỊ CHO THỎ BÔNG NGAY!</span>
                </button>
              )}

              <button
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                className="w-full py-3 px-5 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-black text-base shadow-sm active:scale-95 transition flex items-center justify-center gap-2 border-2 border-amber-400"
              >
                <span>TUYỆT VỜI!</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
