import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Heart,
  Star,
  Check,
  BookOpen,
  Trophy,
  PartyPopper,
  Compass,
} from 'lucide-react';
import { UserProgress } from '../types/math';
import { ALL_PLUSH_FRIENDS, PLUSH_COLLECTION_SETS } from '../data/plushFriends';
import { PlushFriend } from '../types/plush';
import { PlushFriendRenderer } from '../components/plush/PlushFriendRenderer';
import { sound } from '../utils/sound';

interface PlushHouseScreenProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onBack: () => void;
}

export const PlushHouseScreen: React.FC<PlushHouseScreenProps> = ({
  progress,
  onUpdateProgress,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'album'>('room');
  const [selectedFriend, setSelectedFriend] = useState<PlushFriend | null>(null);
  const [miniInteractionDone, setMiniInteractionDone] = useState<boolean>(false);

  const unlockedList = progress.unlockedPlushFriends || [];
  const selectedCompanionId = progress.selectedCompanionId;

  // Check if a plush friend is unlocked
  const isPlushUnlocked = (friend: PlushFriend) => {
    if (progress.allUnlockedOverride) return true;
    return unlockedList.includes(friend.id);
  };

  const unlockedCount = ALL_PLUSH_FRIENDS.filter((f) => isPlushUnlocked(f)).length;
  const isGrandCollectionComplete = unlockedCount === ALL_PLUSH_FRIENDS.length;

  // Handle clicking a plush toy in room or album
  const handlePlushClick = (friend: PlushFriend) => {
    sound.playTap();
    const unlocked = isPlushUnlocked(friend);

    if (unlocked) {
      setSelectedFriend(friend);
      setMiniInteractionDone(false);
      // Speak unique greeting in Vietnamese (Single SpeechManager, never overlap)
      sound.speak(friend.greeting, {
        eventType: 'UI_CLICK',
        forceReplay: true,
      });
    } else {
      sound.playGentleRetry();
      sound.speak(
        `Bạn ${friend.name} đang ở ${friend.worldName}. Bé hãy vượt qua chặng để đón bạn về nhà nhé!`,
        {
          eventType: 'UI_CLICK',
          forceReplay: true,
        }
      );
    }
  };

  // Set as Companion
  const handleSelectCompanion = (friend: PlushFriend) => {
    sound.playSuccess();
    sound.playStar();

    const isCurrent = selectedCompanionId === friend.id;
    const newCompanionId = isCurrent ? null : friend.id;

    const updated: UserProgress = {
      ...progress,
      selectedCompanionId: newCompanionId,
    };
    onUpdateProgress(updated);

    if (newCompanionId) {
      sound.speak(
        `Tuyệt vời! ${friend.name} sẽ là bạn đồng hành cùng con trong mọi chuyến phiêu lưu!`,
        {
          eventType: 'UI_CLICK',
          forceReplay: true,
        }
      );
    }
  };

  // Mini Play Interaction with plush friend
  const handlePlayMiniInteraction = (friend: PlushFriend) => {
    sound.playStar();
    setMiniInteractionDone(true);

    const cheers = [
      `Cảm ơn con nhiều lắm! ${friend.name} vui ơi là vui! ❤️`,
      `${friend.name} cảm thấy thật hạnh phúc khi được chơi cùng con! ✨`,
    ];
    const cheer = cheers[Math.floor(Math.random() * cheers.length)];
    sound.speak(cheer, {
      eventType: 'UI_CLICK',
      forceReplay: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-pink-100 text-slate-800 flex flex-col justify-between pb-8 select-none relative overflow-x-hidden">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-4 border-amber-300 px-4 sm:px-6 py-3 shadow-md flex items-center justify-between">
        <button
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-900 font-extrabold text-sm flex items-center gap-1.5 active:scale-95 transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Trở về</span>
        </button>

        {/* Center Title & Tab Selector */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-200/80 p-1 rounded-2xl border border-slate-300">
            <button
              onClick={() => {
                sound.playTap();
                setActiveTab('room');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer ${
                activeTab === 'room'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛋️ Căn Phòng Ấm Áp
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setActiveTab('album');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'album'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 Album Bạn Nhỏ</span>
            </button>
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-1.5 bg-purple-100 border-2 border-purple-300 px-3 py-1.5 rounded-2xl font-black text-purple-900 text-xs sm:text-sm shadow-sm">
          <span>🧸</span>
          <span>
            {unlockedCount}/{ALL_PLUSH_FRIENDS.length}
          </span>
        </div>
      </header>

      {/* 2. GRAND FINALE CELEBRATION BANNER (If all 10 unlocked) */}
      {isGrandCollectionComplete && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-3">
          <div className="bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500 p-3 rounded-3xl text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-between border-2 border-white">
            <div className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 animate-bounce" />
              <span>🌟 ĐẠI TIỆC THÚ BÔNG! Con đã tìm thấy tất cả 10 người bạn nhỏ!</span>
            </div>
            <span className="text-xl">🦄👑</span>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT: TAB 1 - CĂN PHÒNG ẤM ÁP */}
      {activeTab === 'room' && (
        <main className="max-w-5xl mx-auto w-full p-4 flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              🏡 Ngôi Nhà Của Những Người Bạn
            </h1>
            <p className="text-xs font-bold text-amber-800">
              Chạm vào bất kỳ bạn thú bông nào để nghe bạn chào và chọn bạn đồng hành nhé!
            </p>
          </div>

          {/* 3D Playroom Scene Canvas */}
          <div className="relative w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9] min-h-[380px] bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A] rounded-3xl border-4 border-amber-300 shadow-2xl overflow-hidden p-4">
            {/* Playroom Wall Decor */}
            {/* Bunting flags banner at top */}
            <div className="absolute top-2 inset-x-4 flex justify-between pointer-events-none opacity-80">
              {['🚩', '🎈', '⭐', '🚩', '🎈', '⭐', '🚩', '🎈'].map((item, idx) => (
                <span key={idx} className="text-lg sm:text-xl">
                  {item}
                </span>
              ))}
            </div>

            {/* Sunny bay window on left wall */}
            <div className="absolute top-10 left-6 sm:left-12 w-28 sm:w-36 h-28 sm:h-36 rounded-t-full bg-sky-200 border-4 border-white shadow-inner flex items-center justify-center overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-300 rounded-full animate-pulse" />
              <div className="w-12 h-6 bg-white/70 rounded-full translate-x-3 -translate-y-2" />
              <div className="absolute inset-0 border-t-2 border-white/60 flex items-center justify-center">
                <div className="w-0.5 h-full bg-white/80" />
                <div className="h-0.5 w-full bg-white/80" />
              </div>
            </div>

            {/* Cozy storybook shelf on right wall */}
            <div className="absolute top-14 right-6 sm:right-12 w-24 sm:w-32 bg-amber-800/80 rounded-xl p-2 border-2 border-amber-900 shadow-md">
              <div className="flex gap-1 justify-center mb-1">
                <div className="w-3 h-8 bg-rose-400 rounded-sm" />
                <div className="w-3 h-9 bg-blue-400 rounded-sm" />
                <div className="w-3 h-7 bg-emerald-400 rounded-sm" />
                <div className="w-3 h-8 bg-purple-400 rounded-sm" />
              </div>
              <div className="h-1 bg-amber-950 rounded-full" />
            </div>

            {/* Warm Wooden Floor */}
            <div className="absolute bottom-0 inset-x-0 h-[48%] bg-gradient-to-b from-[#F59E0B]/30 via-[#D97706]/40 to-[#B45309]/50 border-t-4 border-amber-400">
              {/* Floorboard lines */}
              <div className="w-full h-full opacity-20 flex flex-col justify-around">
                <div className="h-px bg-amber-950 w-full" />
                <div className="h-px bg-amber-950 w-full" />
                <div className="h-px bg-amber-950 w-full" />
              </div>
            </div>

            {/* Star Rug in center */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-28 sm:h-36 bg-amber-200/80 border-3 border-dashed border-amber-400 rounded-full shadow-inner flex items-center justify-center pointer-events-none">
              <span className="text-4xl opacity-40">⭐</span>
            </div>

            {/* Placed Plush Friends around the Room */}
            {ALL_PLUSH_FRIENDS.map((friend) => {
              const unlocked = isPlushUnlocked(friend);
              const isSelectedCompanion = selectedCompanionId === friend.id;

              return (
                <div
                  key={friend.id}
                  style={{
                    left: `${friend.roomSlot.x}%`,
                    top: `${friend.roomSlot.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                >
                  <div
                    onClick={() => handlePlushClick(friend)}
                    className="relative cursor-pointer transition-all transform hover:scale-110 active:scale-95"
                  >
                    {/* Active Companion Crown halo */}
                    {isSelectedCompanion && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md border border-white flex items-center gap-0.5 animate-bounce z-30 whitespace-nowrap">
                        <span>⭐</span>
                        <span>Đồng hành</span>
                      </div>
                    )}

                    {/* Plush Renderer */}
                    <PlushFriendRenderer
                      plushId={friend.id}
                      size={unlocked ? 95 : 80}
                      isSilhouette={!unlocked}
                      animationState={isSelectedCompanion ? 'happy' : 'idle'}
                    />

                    {/* Name tag on hover/tap */}
                    <div className="mt-1 px-2 py-0.5 rounded-full bg-white/95 border border-slate-200 shadow-xs text-[10px] font-black text-slate-800 text-center whitespace-nowrap">
                      {unlocked ? friend.name : '🔒 Bạn Nhỏ'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* 4. MAIN CONTENT: TAB 2 - ALBUM BẠN NHỎ */}
      {activeTab === 'album' && (
        <main className="max-w-4xl mx-auto w-full p-4 flex-1">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              📖 Sổ Tay Bộ Sưu Tập Bạn Nhỏ
            </h1>
            <p className="text-xs font-bold text-slate-600">
              Tất cả những người bạn thú bông con đã đồng hành và những bạn đang chờ con ở phía trước.
            </p>
          </div>

          {/* Collection Sets Section */}
          <div className="space-y-6 mb-8">
            {PLUSH_COLLECTION_SETS.map((set) => {
              const setFriends = ALL_PLUSH_FRIENDS.filter((f) => set.plushIds.includes(f.id));
              const setUnlockedCount = setFriends.filter((f) => isPlushUnlocked(f)).length;
              const isSetComplete = setUnlockedCount === setFriends.length;

              return (
                <div
                  key={set.id}
                  className={`rounded-3xl p-5 border-3 transition-all ${
                    isSetComplete
                      ? 'bg-gradient-to-r from-amber-50 to-pink-50 border-amber-400 shadow-md'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-xl shadow-xs">
                        {set.badgeIcon}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-800">{set.name}</h3>
                        <p className="text-xs font-bold text-slate-500">{set.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        {setUnlockedCount} / {setFriends.length} bạn
                      </span>
                      {isSetComplete && (
                        <span className="flex items-center gap-1 bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-1 rounded-full shadow-xs">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Hoàn thành!</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cards inside set */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {setFriends.map((friend) => {
                      const unlocked = isPlushUnlocked(friend);
                      const isCompanion = selectedCompanionId === friend.id;

                      return (
                        <div
                          key={friend.id}
                          onClick={() => handlePlushClick(friend)}
                          className={`relative rounded-2xl p-3 flex flex-col items-center text-center border-2 transition-all cursor-pointer ${
                            unlocked
                              ? 'bg-amber-50/60 hover:bg-amber-100/70 border-amber-300 hover:scale-105 shadow-sm'
                              : 'bg-slate-50 border-dashed border-slate-300 opacity-80'
                          }`}
                        >
                          {isCompanion && (
                            <div className="absolute top-2 right-2 bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                              ⭐ Đi cùng
                            </div>
                          )}

                          <PlushFriendRenderer
                            plushId={friend.id}
                            size={100}
                            isSilhouette={!unlocked}
                            animationState={unlocked ? 'idle' : 'sleep'}
                          />

                          <div className="mt-2 font-black text-xs text-slate-800">
                            {unlocked ? friend.name : 'Bạn Bí Ẩn'}
                          </div>
                          <div className="text-[10px] font-extrabold text-amber-800">
                            {friend.worldName}
                          </div>

                          {!unlocked && (
                            <div className="text-[9px] font-bold text-slate-500 mt-1">
                              Chặng: Màn {friend.requiredLevel}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* 5. MODAL / BOTTOM SHEET: PLUSH DETAIL & COMPANION SELECTION */}
      {selectedFriend && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border-4 border-amber-300 shadow-2xl text-center relative animate-fade-in">
            {/* Close button */}
            <button
              onClick={() => setSelectedFriend(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center cursor-pointer transition"
            >
              ✕
            </button>

            {/* Big Plush Display */}
            <div className="flex justify-center mb-2">
              <PlushFriendRenderer
                plushId={selectedFriend.id}
                size={160}
                animationState="happy"
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {selectedFriend.name}
            </h3>
            <div className="text-xs font-black text-purple-700 mb-1">
              {selectedFriend.title} • {selectedFriend.worldName}
            </div>
            <p className="text-xs font-bold text-slate-600 mb-3 px-2">
              {selectedFriend.personality}
            </p>

            {/* Favorite Item & Spot Info */}
            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs font-bold text-slate-700 space-y-1 mb-4 text-left">
              <div>
                <span className="text-amber-900 font-black">Món yêu thích:</span>{' '}
                {selectedFriend.favoriteFoodOrToy}
              </div>
              <div>
                <span className="text-amber-900 font-black">Vị trí trong nhà:</span>{' '}
                {selectedFriend.roomSlot.spotName}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Play / Feed Mini Interaction Button */}
              <button
                onClick={() => handlePlayMiniInteraction(selectedFriend)}
                className="flex-1 py-3 px-3 bg-pink-100 hover:bg-pink-200 text-pink-900 font-black rounded-2xl transition border-2 border-pink-300 flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm active:scale-95"
              >
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                <span>{miniInteractionDone ? 'Đã chơi vui vẻ! ❤️' : 'Chơi Cùng Bạn 🍯'}</span>
              </button>

              {/* Set as Companion Button */}
              <button
                onClick={() => handleSelectCompanion(selectedFriend)}
                className={`flex-1 py-3 px-3 font-black rounded-2xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm active:scale-95 ${
                  selectedCompanionId === selectedFriend.id
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>
                  {selectedCompanionId === selectedFriend.id
                    ? '✓ Đang Đồng Hành'
                    : '🌟 ĐI CÙNG MÌNH'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
