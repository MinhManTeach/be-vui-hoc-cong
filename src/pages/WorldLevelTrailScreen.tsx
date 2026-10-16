import React from 'react';
import { ArrowLeft, Lock, Star, Sparkles, Trophy, Play } from 'lucide-react';
import { UserProgress, WorldId } from '../types/math';
import { ALL_WORLDS, WorldConfig } from '../utils/storage';
import { sound } from '../utils/sound';
import { HeroCharacter } from '../components/HeroCharacter';
import { ALL_PLUSH_FRIENDS } from '../data/plushFriends';
import { PlushFriendRenderer } from '../components/plush/PlushFriendRenderer';
import { CompanionRenderer } from '../components/plush/CompanionRenderer';

interface WorldLevelTrailScreenProps {
  worldId: WorldId;
  progress: UserProgress;
  onSelectLevel: (levelNumber: number) => void;
  onOpenChest: (chestId: string) => void;
  onStartBossChallenge: () => void;
  onBackToMap: () => void;
}

export const WorldLevelTrailScreen: React.FC<WorldLevelTrailScreenProps> = ({
  worldId,
  progress,
  onSelectLevel,
  onOpenChest,
  onStartBossChallenge,
  onBackToMap,
}) => {
  const worldConfig: WorldConfig = ALL_WORLDS.find((w) => w.id === worldId) || ALL_WORLDS[0];
  const worldData = progress.worldLevelsProgress?.[worldId] || { completedLevels: [], levelStars: {} };
  const completedLevels = worldData.completedLevels || [];

  // Determine current active level
  let currentActiveLevel = 1;
  for (let l = 1; l <= worldConfig.totalLevels; l++) {
    if (!completedLevels.includes(l)) {
      currentActiveLevel = l;
      break;
    }
    if (l === worldConfig.totalLevels) {
      currentActiveLevel = worldConfig.totalLevels;
    }
  }

  const handleNodeClick = (levelNumber: number, isChest: boolean, isBoss: boolean, isUnlocked: boolean) => {
    sound.playTap();
    if (!isUnlocked && !progress.allUnlockedOverride) {
      sound.playGentleRetry();
      sound.speak(`Con cần hoàn thành màn ${levelNumber - 1} trước nhé!`);
      return;
    }

    if (isChest) {
      const chestId = `chest_${worldId}_lvl_${levelNumber}`;
      onOpenChest(chestId);
    } else if (isBoss) {
      onStartBossChallenge();
    } else {
      sound.speak(`Màn ${levelNumber}, bắt đầu thôi nào!`);
      onSelectLevel(levelNumber);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${worldConfig.bgGradient} text-slate-800 flex flex-col justify-between pb-12 select-none relative overflow-x-hidden`}
    >
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-4 border-amber-300 px-4 sm:px-6 py-3 shadow-md flex items-center justify-between">
        <button
          onClick={() => {
            sound.playTap();
            onBackToMap();
          }}
          className="p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-900 font-extrabold text-sm flex items-center gap-1.5 active:scale-95 transition shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Bản đồ</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">{worldConfig.icon}</span>
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black text-slate-800 leading-tight">
              {worldConfig.adventureName}
            </h2>
            <p className="text-[11px] font-bold text-amber-800">{worldConfig.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-100 border-2 border-amber-300 px-3 py-1.5 rounded-2xl font-black text-amber-900 shadow-sm">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span>{progress.totalStars}</span>
        </div>
      </header>

      {/* World Narrative Subheader */}
      <div className="max-w-md mx-auto w-full px-4 pt-4 text-center">
        <div className="p-3 bg-white/80 backdrop-blur-sm border-2 border-white rounded-2xl shadow-sm">
          <p className="text-xs sm:text-sm font-extrabold text-slate-700">
            {worldConfig.description}
          </p>
        </div>
      </div>

      {/* Level Path Trail */}
      <main className="max-w-md mx-auto w-full px-4 py-8 flex flex-col items-center">
        {Array.from({ length: worldConfig.totalLevels }).map((_, idx) => {
          const levelNum = idx + 1;
          const isBoss = levelNum === worldConfig.totalLevels;
          const isChest = levelNum === 3 || levelNum === 6;
          const isCompleted = completedLevels.includes(levelNum);
          const isCurrent = levelNum === currentActiveLevel && !isCompleted;
          const isUnlocked = isCompleted || isCurrent || progress.allUnlockedOverride;
          const starsEarned = worldData.levelStars[levelNum] || 0;
          const chestId = `chest_${worldId}_lvl_${levelNum}`;
          const isChestOpened = progress.openedChests?.includes(chestId);

          // Check if this level is a Plush Friend Checkpoint
          const checkpointFriend = ALL_PLUSH_FRIENDS.find(
            (f) => f.worldId === worldId && f.requiredLevel === levelNum
          );
          const isFriendUnlocked = checkpointFriend && (progress.unlockedPlushFriends || []).includes(checkpointFriend.id);

          // Alternating horizontal offset for natural winding trail
          const offsetClass =
            idx % 4 === 1
              ? 'translate-x-8 sm:translate-x-12'
              : idx % 4 === 3
              ? '-translate-x-8 sm:-translate-x-12'
              : 'translate-x-0';

          return (
            <div key={levelNum} className="flex flex-col items-center relative my-1">
              {/* Connector line between nodes */}
              {idx > 0 && (
                <div
                  className={`w-2 h-8 border-l-4 border-dashed rounded-full ${
                    isUnlocked ? 'border-amber-400' : 'border-white/50'
                  }`}
                />
              )}

              {/* Node item container with mascot indicator */}
              <div className={`relative flex items-center ${offsetClass}`}>
                {/* Cheering Mascot & Companion beside current level */}
                {isCurrent && (
                  <div className="absolute -left-28 sm:-left-36 bottom-0 animate-bounce-subtle pointer-events-none flex items-end gap-1 z-30">
                    <HeroCharacter
                      mood="happy"
                      size="sm"
                      showSpeechBubble={false}
                      hat={progress.equippedAccessories.hat}
                      glasses={progress.equippedAccessories.glasses}
                      shirt={progress.equippedAccessories.shirt}
                      backpack={progress.equippedAccessories.backpack}
                      item={progress.equippedAccessories.item}
                    />
                    {progress.selectedCompanionId && (
                      <div className="scale-90 -translate-x-2">
                        <CompanionRenderer
                          companionId={progress.selectedCompanionId}
                          size={48}
                          showBadge={false}
                          canSpeakOnClick={false}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Level Node Button */}
                <button
                  onClick={() => handleNodeClick(levelNum, isChest, isBoss, !!isUnlocked)}
                  className={`relative flex flex-col items-center justify-center transition-all duration-300 transform active:scale-90 ${
                    isUnlocked ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-75'
                  }`}
                >
                  {/* Outer circle */}
                  <div
                    className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-xl relative ${
                      isBoss
                        ? isCompleted
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 border-white text-purple-950'
                          : isCurrent
                          ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 border-amber-300 text-white animate-pulse ring-4 ring-amber-300'
                          : 'bg-purple-950/70 border-purple-400 text-purple-300'
                        : isChest
                        ? isChestOpened
                          ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : 'bg-gradient-to-tr from-amber-400 to-orange-400 border-white text-white animate-bounce-subtle'
                        : isCompleted
                        ? 'bg-gradient-to-tr from-emerald-400 to-teal-500 border-white text-white'
                        : isCurrent
                        ? 'bg-gradient-to-tr from-amber-400 to-yellow-400 border-white text-amber-950 ring-4 ring-amber-300 animate-pulse'
                        : 'bg-white/60 border-slate-300 text-slate-400'
                    }`}
                  >
                    {/* Node icon & label */}
                    {isChest ? (
                      <span className="text-3xl">{isChestOpened ? '✨' : '🎁'}</span>
                    ) : isBoss ? (
                      <span className="text-3xl">👑</span>
                    ) : isUnlocked ? (
                      <span className="text-2xl font-black">{levelNum}</span>
                    ) : (
                      <Lock className="w-6 h-6 text-slate-400" />
                    )}

                    {/* Stars below node if completed */}
                    {!isChest && isCompleted && (
                      <div className="absolute -bottom-2.5 flex items-center gap-0.5 bg-white/95 px-2 py-0.5 rounded-full border border-amber-300 shadow-sm">
                        {Array.from({ length: 3 }).map((_, sIdx) => (
                          <Star
                            key={sIdx}
                            className={`w-3.5 h-3.5 ${
                              sIdx < starsEarned
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 fill-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Level text label */}
                  <span className="mt-1 text-xs font-black text-slate-800 drop-shadow-sm bg-white/70 px-2 py-0.5 rounded-full">
                    {isBoss ? 'Thử Thách Cuối' : isChest ? 'Rương Quà' : `Màn ${levelNum}`}
                  </span>
                </button>

                {/* Plush Checkpoint Marker */}
                {checkpointFriend && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isFriendUnlocked) {
                        sound.playStar();
                        sound.speak(
                          `Bạn ${checkpointFriend.name} đã về Ngôi Nhà Bạn Nhỏ rồi! Cùng tiếp tục phiêu lưu nhé!`,
                          { eventType: 'UI_CLICK', forceReplay: true }
                        );
                      } else {
                        sound.playTap();
                        sound.speak(
                          `Bạn nhỏ đang chờ con! Hãy hoàn thành màn ${levelNum} để mở hộp quà đón bạn về nhà nhé!`,
                          { eventType: 'UI_CLICK', forceReplay: true }
                        );
                      }
                    }}
                    className="absolute -right-28 sm:-right-34 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 pr-2.5 rounded-2xl border-2 border-purple-300 shadow-md z-20 hover:scale-105 active:scale-95 transition cursor-pointer text-left"
                    title={isFriendUnlocked ? checkpointFriend.name : 'Bạn nhỏ đang chờ con!'}
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center overflow-hidden shrink-0">
                      <PlushFriendRenderer
                        plushId={checkpointFriend.id}
                        size={32}
                        isSilhouette={!isFriendUnlocked}
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] font-black text-purple-900 leading-tight">
                        {isFriendUnlocked ? checkpointFriend.name : '🎁 Chặng Bạn Nhỏ'}
                      </div>
                      <div className="text-[8px] font-extrabold text-amber-700">
                        {isFriendUnlocked ? '⭐ Đã về nhà!' : 'Đang chờ con!'}
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};
