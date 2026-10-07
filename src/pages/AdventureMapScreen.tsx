import {ChildAvatar} from '../components/ChildAvatar';
import React, { useEffect, useRef, useState } from 'react';
import './dailyAdventure.css';
import { deviceClock } from '../domain/retention/clock';
import { Lock, Star, Sparkles, Volume2, VolumeX, Play, Compass, Award } from 'lucide-react';
import { UserProgress, WorldId } from '../types/math';
import { ALL_WORLDS, getPlayerLevelInfo } from '../utils/storage';
import { sound } from '../utils/sound';
import { BunnyCharacter } from '../components/BunnyCharacter';
import { CompanionRenderer } from '../components/plush/CompanionRenderer';
import { PlushFriendRenderer } from '../components/plush/PlushFriendRenderer';
import { ALL_PLUSH_FRIENDS } from '../data/plushFriends';
import {
  CastleScenerySVG,
  GardenScenerySVG,
  ForestScenerySVG,
  IslandScenerySVG,
  SpaceScenerySVG,
  ValleyScenerySVG,
} from '../utils/worldAssets';

interface AdventureMapScreenProps {
  progress: UserProgress;
  onSelectWorld: (worldId: WorldId) => void;
  onOpenWardrobe: () => void;
  onOpenPlushHouse: () => void;
  onOpenMiniGames: () => void;
  onOpenChallenge: () => void;
  onOpenParents: () => void;
  onOpenProfile: () => void;
  onToggleSound: () => void;
  onOpenDaily: () => void;
  onOpenRoom: () => void;
}

export const AdventureMapScreen: React.FC<AdventureMapScreenProps> = ({
  progress,
  onSelectWorld,
  onOpenWardrobe,
  onOpenPlushHouse,
  onOpenMiniGames,
  onOpenChallenge,
  onOpenParents,
  onOpenProfile,
  onToggleSound,
  onOpenDaily,
  onOpenRoom,
}) => {
  const levelInfo = getPlayerLevelInfo(progress.xp || 0);
  const daily = progress.retention?.dailyAdventure;
  const currentDaily = daily && (daily.status !== 'claimed' || daily.createdDay >= deviceClock.day());
  const dailyLabel = currentDaily && daily.status === 'claimed'
    ? 'Hôm nay con đã hoàn thành!'
    : currentDaily && (daily.taskProgress.learn > 0 || progress.retention?.miniGameSession)
      ? 'Tiếp tục chuyến đi'
      : 'Đi phiêu lưu!';
  const activeNodeRef = useRef<HTMLDivElement | null>(null);
  const [hoppingWorldId, setHoppingWorldId] = useState<WorldId | null>(null);

  // The daily invitation is the first destination on map entry.
  useEffect(() => {
    // Keep the daily invitation visible on entry; world selection still scrolls normally.
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Determine current active world
  const currentActiveWorldId =
    ALL_WORLDS.find((w) => !progress.unlockedWorlds.includes(w.id))?.id ||
    progress.unlockedWorlds[progress.unlockedWorlds.length - 1] ||
    'world_1_counting';

  const handleWorldClick = (worldId: WorldId, isUnlocked: boolean, minStars: number) => {
    sound.playTap();
    if (isUnlocked || progress.allUnlockedOverride) {
      sound.playStar();
      setHoppingWorldId(worldId);
      const worldConfig = ALL_WORLDS.find((w) => w.id === worldId);
      sound.speak(
        `Tuyệt vời! Chúng mình cùng đến ${worldConfig?.adventureName || 'Thế Giới Mới'} nào!`,
        { eventType: 'UI_CLICK', forceReplay: true }
      );

      // Smooth hop animation before navigating
      setTimeout(() => {
        onSelectWorld(worldId);
      }, 550);
    } else {
      sound.playGentleRetry();
      sound.speak(
        `Vùng đất này cần ${minStars} ngôi sao để mở khóa. Con hãy hoàn thành các màn chơi trước nhé!`,
        { eventType: 'UI_CLICK', forceReplay: true }
      );
    }
  };

  const handleCheckpointClick = (friend: typeof ALL_PLUSH_FRIENDS[0], isUnlocked: boolean) => {
    if (isUnlocked) {
      sound.playStar();
      sound.speak(
        `Bạn ${friend.name} đã về Ngôi Nhà Bạn Nhỏ rồi! Cùng tiếp tục phiêu lưu để đón thêm nhiều bạn nhé!`,
        { eventType: 'UI_CLICK', forceReplay: true }
      );
    } else {
      sound.playTap();
      sound.speak(
        `Bạn nhỏ đang chờ con ở ${friend.worldName}! Hãy hoàn thành chặng để mở hộp quà bí ẩn đón bạn về nhà nhé!`,
        { eventType: 'UI_CLICK', forceReplay: true }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#38BDF8] via-[#86EFAC] to-[#FDE047] text-slate-800 flex flex-col justify-between pb-28 select-none relative overflow-x-hidden">
      {/* 1. FLOATING TOP GAME HUD (Clean, Child-Friendly, Zero Website Slop) */}
      <header className="fixed top-3 inset-x-3 sm:inset-x-6 z-40 flex items-center justify-between pointer-events-none">
        {/* Child Profile Floating Pill */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenProfile();
          }}
          className="pointer-events-auto flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-white/95 backdrop-blur-md border-3 border-amber-400 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-200 border-2 border-amber-500 flex items-center justify-center text-2xl shadow-inner">
            <ChildAvatar config={progress.avatar} />
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-slate-900 leading-tight">
              Nhân vật của con
            </div>
            <div className="text-[10px] font-extrabold text-amber-700">
              {levelInfo.title}
            </div>
          </div>
        </button>

        {/* Center: XP Level Floating Indicator */}
        <div className="pointer-events-auto hidden sm:flex flex-col items-center bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-2xl border-3 border-amber-400 shadow-xl">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
            <span>⭐ Cấp {levelInfo.level}</span>
            <span className="text-slate-500 font-extrabold">• {progress.xp} XP</span>
          </div>
          <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden border border-amber-300 mt-1">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500 rounded-full"
              style={{ width: `${levelInfo.percent}%` }}
            />
          </div>
        </div>

        {/* Right: Golden Stars Counter & Sound Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border-3 border-amber-400 px-3.5 py-1.5 rounded-full shadow-xl">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400 animate-spin-slow" />
            <span className="font-black text-base sm:text-lg text-amber-950">
              {progress.totalStars}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onToggleSound();
            }}
            className={`p-2.5 rounded-full border-3 transition-transform active:scale-90 shadow-xl cursor-pointer ${
              progress.soundEffectsEnabled ?? progress.soundEnabled
                ? 'bg-emerald-400 border-emerald-600 text-white'
                : 'bg-slate-200 border-slate-400 text-slate-500'
            }`}
            title="Âm thanh"
            aria-label="Bật tắt âm thanh"
          >
            {progress.soundEffectsEnabled ?? progress.soundEnabled ? (
              <Volume2 className="w-5 h-5 fill-current" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* 2. FULL-SCREEN WINDING ADVENTURE REALM CANVAS */}
      <main className="w-full pt-20 flex flex-col items-center relative overflow-hidden">
        {/* Parallax Clouds floating across map */}
        <div className="absolute top-10 left-10 w-40 h-16 bg-white/60 rounded-full blur-[1px] pointer-events-none animate-float-slow z-0" />
        <div className="absolute top-48 right-8 w-48 h-18 bg-white/50 rounded-full blur-[1px] pointer-events-none animate-float z-0" />
        <div className="absolute top-[40%] left-6 w-36 h-14 bg-white/50 rounded-full blur-[1px] pointer-events-none animate-float-slow z-0" />
        <div className="absolute top-[70%] right-12 w-44 h-16 bg-white/40 rounded-full blur-[1px] pointer-events-none animate-float z-0" />

        {/* Continuous Adventure Canvas Container */}
        <div className="w-full max-w-4xl relative flex flex-col items-center px-4 py-6">
          <section className="daily-entry" aria-label="Chuyến Phiêu Lưu Hôm Nay">
            <Sparkles size={48} color="#b58021" />
            <div>
              <h2>Chuyến Phiêu Lưu Hôm Nay</h2>
              <p>Học một chút · Chơi một chút · Giúp bạn nhỏ</p>
            </div>
            <button onClick={onOpenDaily}>{dailyLabel}</button>
          </section>
          <button onClick={onOpenRoom} className="min-h-12 px-6 py-3 mb-5 bg-amber-100 border-3 border-amber-700 rounded-3xl text-lg font-black text-amber-950 shadow-md">🏡 Phòng Của Bé</button>
          {/* MAP TITLE BANNER */}
          <div className="text-center mb-6 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/90 border-2 border-amber-400 text-amber-950 font-black text-xs sm:text-sm shadow-md mb-1 animate-bounce-subtle">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>BẢN ĐỒ PHIÊU LƯU TOÁN HỌC</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            </div>
            <p className="text-xs sm:text-sm font-black text-amber-950 drop-shadow-xs">
              Chạm vào vùng đất để cùng Thỏ Bông tiếp tục hành trình nhé!
            </p>
          </div>

          {/* S-CURVE CONTINUOUS REALM PATH */}
          <div className="w-full relative flex flex-col items-center">
            {ALL_WORLDS.map((world, idx) => {
              const isUnlocked = progress.unlockedWorlds.includes(world.id) || progress.allUnlockedOverride;
              const isCurrent = world.id === currentActiveWorldId;
              const worldData = progress.worldLevelsProgress?.[world.id];
              const completedCount = worldData?.completedLevels?.length || 0;
              const isFinished = completedCount >= world.totalLevels;
              const isHopping = hoppingWorldId === world.id;

              // Checkpoint plush friends for this world
              const worldPlushies = ALL_PLUSH_FRIENDS.filter((f) => f.worldId === world.id);

              // Alternating S-curve alignment on map
              const curveAlign =
                idx % 2 === 0
                  ? 'items-center sm:-translate-x-16 md:-translate-x-24'
                  : 'items-center sm:translate-x-16 md:translate-x-24';

              // Biome Scenery background illustration
              const renderSceneryBackdrop = () => {
                switch (world.id) {
                  case 'world_1_counting':
                    return <GardenScenerySVG className="w-full max-w-lg opacity-90 drop-shadow-md pointer-events-none" />;
                  case 'world_2_merge':
                    return <ForestScenerySVG className="w-full max-w-lg opacity-90 drop-shadow-md pointer-events-none" />;
                  case 'world_3_add_10':
                    return <IslandScenerySVG className="w-full max-w-lg opacity-90 drop-shadow-md pointer-events-none" />;
                  case 'world_4_make_10':
                    return <CastleScenerySVG className="w-full max-w-lg opacity-90 drop-shadow-md pointer-events-none" />;
                  case 'world_5_split':
                    return <ValleyScenerySVG className="w-full max-w-lg opacity-90 drop-shadow-md pointer-events-none" />;
                  case 'world_6_over_10':
                    return <SpaceScenerySVG className="w-full max-w-lg opacity-90 drop-shadow-md pointer-events-none" />;
                  default:
                    return null;
                }
              };

              return (
                <div
                  key={world.id}
                  ref={isCurrent ? activeNodeRef : null}
                  className={`w-full flex flex-col ${curveAlign} relative my-6 sm:my-8 transition-transform duration-300`}
                >
                  {/* Decorative Winding Cobblestone Road Segment leading from previous node */}
                  {idx > 0 && (
                    <div className="flex flex-col items-center my-1 pointer-events-none z-0">
                      {/* Cobblestones path dots */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-amber-400 shadow-sm flex items-center justify-center text-[10px] font-black text-amber-800">
                          🐾
                        </div>
                        <div className="w-5 h-5 rounded-full bg-amber-100 border-2 border-amber-300" />
                        <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-amber-400 shadow-sm flex items-center justify-center text-[10px] font-black text-amber-800">
                          🐾
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Biome Scenery backdrop if present */}
                  <div className="w-full flex justify-center -mb-16 -z-10 overflow-hidden">
                    {renderSceneryBackdrop()}
                  </div>

                  {/* INTERACTIVE BIOME REALM NODE CONTAINER */}
                  <div className="relative group flex flex-col items-center z-10">
                    {/* Thỏ Bông & Active Companion Standing on the Current Active Realm */}
                    {isCurrent && (
                      <div
                        className={`absolute -top-28 sm:-top-32 -left-20 sm:-left-28 z-30 pointer-events-none flex items-end gap-1 ${
                          isHopping ? 'animate-bounce' : 'animate-bounce-subtle'
                        }`}
                      >
                        <BunnyCharacter
                          mood={isHopping ? 'jump' : 'wave'}
                          size="md"
                          speechText="Vào đây phiêu lưu nào!"
                          hat={progress.equippedAccessories.hat}
                          glasses={progress.equippedAccessories.glasses}
                          shirt={progress.equippedAccessories.shirt}
                          backpack={progress.equippedAccessories.backpack}
                          item={progress.equippedAccessories.item}
                        />

                        {progress.selectedCompanionId && (
                          <div className="scale-90 -translate-x-3 pointer-events-auto">
                            <CompanionRenderer
                              companionId={progress.selectedCompanionId}
                              size={58}
                              showBadge={true}
                              canSpeakOnClick={true}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* MAIN 3D REALM PORTAL BUTTON (Touch Target >= 72px) */}
                    <button
                      onClick={() => handleWorldClick(world.id, !!isUnlocked, world.minStarsToUnlock)}
                      className={`relative p-5 sm:p-6 rounded-[2.5rem] border-4 shadow-2xl transition-all duration-300 transform active:scale-95 text-left max-w-sm sm:max-w-md w-full cursor-pointer overflow-hidden ${
                        isUnlocked
                          ? `bg-gradient-to-br ${world.bgGradient} border-white text-white hover:scale-105 hover:-translate-y-1 shadow-[0_10px_0_rgba(0,0,0,0.18)]`
                          : 'bg-slate-300/90 border-slate-400 text-slate-600 opacity-85 shadow-md cursor-not-allowed'
                      }`}
                    >
                      {/* Glossy top highlight */}
                      <div className="absolute top-2 inset-x-6 h-4 bg-white/30 rounded-full pointer-events-none" />

                      <div className="flex items-center gap-4 relative z-10">
                        {/* Biome Icon in 3D circular frame */}
                        <div
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-lg border-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isUnlocked
                              ? 'bg-white/95 border-amber-300 text-slate-800'
                              : 'bg-slate-400 border-slate-500 text-slate-300'
                          }`}
                        >
                          {isUnlocked ? world.icon : <Lock className="w-10 h-10 text-slate-500" />}
                        </div>

                        {/* Realm Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-black/25 text-white">
                              Vùng Đất {idx + 1}
                            </span>
                            {isFinished && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                <span>HOÀN THÀNH</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl sm:text-2xl font-black mt-1 leading-tight tracking-tight drop-shadow-md truncate">
                            {world.adventureName}
                          </h3>
                          <p className="text-xs font-extrabold opacity-95 mt-0.5 line-clamp-1">
                            {world.subtitle}
                          </p>

                          {/* Progress Meter or Star Lock */}
                          {isUnlocked ? (
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="flex-1 h-3 bg-black/30 rounded-full overflow-hidden border border-white/60">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(100, (completedCount / world.totalLevels) * 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-black text-white shrink-0 drop-shadow-xs">
                                {completedCount}/{world.totalLevels} màn
                              </span>
                            </div>
                          ) : (
                            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-950 text-xs font-black shadow-xs">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Cần {world.minStarsToUnlock} ⭐ để mở</span>
                            </div>
                          )}

                          {/* Plush Friends Awaiting in this Realm */}
                          {worldPlushies.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-white/25 flex items-center gap-2">
                              <span className="text-[10px] font-black text-amber-100 shrink-0">
                                🧸 Bạn nhỏ:
                              </span>
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                {worldPlushies.map((f) => {
                                  const isGot = (progress.unlockedPlushFriends || []).includes(f.id);
                                  return (
                                    <div
                                      key={f.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCheckpointClick(f, isGot);
                                      }}
                                      title={
                                        isGot
                                          ? `${f.name} - Đã về nhà!`
                                          : `${f.name} - Chặng màn ${f.requiredLevel}`
                                      }
                                      className={`w-7 h-7 rounded-xl flex items-center justify-center overflow-hidden border-2 cursor-pointer transition-transform hover:scale-115 active:scale-95 shadow-xs ${
                                        isGot
                                          ? 'bg-amber-300 border-white'
                                          : 'bg-black/30 border-white/50 opacity-80'
                                      }`}
                                    >
                                      <PlushFriendRenderer
                                        plushId={f.id}
                                        size={24}
                                        isSilhouette={!isGot}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Play Arrow Indicator */}
                        {isUnlocked && (
                          <div className="w-11 h-11 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 group-hover:rotate-6 transition">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. DESTINATION SUMMIT: LÂU ĐÀI TOÁN HỌC */}
          <div className="w-full relative pt-8 pb-12 text-center">
            <CastleScenerySVG className="w-full max-w-xl mx-auto drop-shadow-xl" />

            <div className="mt-4 inline-flex flex-col items-center p-4 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 border-4 border-amber-500 rounded-3xl shadow-2xl max-w-sm text-center">
              <span className="text-4xl animate-bounce">🏰👑</span>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                LÂU ĐÀI TOÁN HỌC
              </h3>
              <p className="text-xs font-extrabold text-amber-900 mt-1">
                Đích đến vinh quang của mọi nhà thám hiểm nhí tài ba!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 4. GAME-STYLE FLOATING BOTTOM DOCK NAVIGATION (Big, Chunky, Touch-Friendly) */}
      <nav className="fixed bottom-3 inset-x-3 sm:inset-x-6 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl border-3 border-amber-400 shadow-2xl px-3 py-2 flex items-center justify-around">
        {/* Map (Active) */}
        <button
          onClick={() => {
            sound.playTap();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-amber-900 active:scale-90 transition cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-200 border-2 border-amber-500 flex items-center justify-center text-2xl shadow-sm">
            🗺️
          </div>
          <span className="text-[10px] font-black">Bản Đồ</span>
        </button>

        {/* Plush House (Ngôi Nhà Bạn Nhỏ) */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenPlushHouse();
          }}
          className="flex flex-col items-center gap-0.5 text-purple-700 hover:text-purple-900 active:scale-90 transition relative cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 hover:border-purple-400 flex items-center justify-center text-2xl shadow-sm">
            🧸
          </div>
          <span className="text-[10px] font-black text-purple-900">Nhà Bạn</span>
          {(progress.unlockedPlushFriends || []).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-400 border border-white text-amber-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {(progress.unlockedPlushFriends || []).length}
            </span>
          )}
        </button>

        {/* Wardrobe */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenWardrobe();
          }}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-amber-600 active:scale-90 transition cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-amber-100 border-2 border-slate-300 hover:border-amber-400 flex items-center justify-center text-2xl shadow-sm">
            🎒
          </div>
          <span className="text-[10px] font-extrabold">Tủ Đồ</span>
        </button>

        {/* Mini-Games */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenMiniGames();
          }}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-amber-600 active:scale-90 transition cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-amber-100 border-2 border-slate-300 hover:border-amber-400 flex items-center justify-center text-2xl shadow-sm">
            🎮
          </div>
          <span className="text-[10px] font-extrabold">Trò Chơi</span>
        </button>

        {/* Challenge */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenChallenge();
          }}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-amber-600 active:scale-90 transition cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-amber-100 border-2 border-slate-300 hover:border-amber-400 flex items-center justify-center text-2xl shadow-sm">
            ⭐
          </div>
          <span className="text-[10px] font-extrabold">Thử Thách</span>
        </button>

        {/* Parents */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenParents();
          }}
          className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-amber-600 active:scale-90 transition cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-amber-100 border-2 border-slate-300 hover:border-amber-400 flex items-center justify-center text-2xl shadow-sm">
            👨‍👩‍👧
          </div>
          <span className="text-[10px] font-extrabold">Phụ Huynh</span>
        </button>
      </nav>
    </div>
  );
};
