/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BunnyAccessory, MiniGameId, UserProgress, WorldId } from './types/math';
import { ALL_WORLDS, loadProgress, recordChestOpen, recordLevelCompletion, saveProgress } from './utils/storage';
import { sound } from './utils/sound';

// Pages & Screens
import { SplashScreen } from './pages/SplashScreen';
import { AdventureMapScreen } from './pages/AdventureMapScreen';
import { WorldLevelTrailScreen } from './pages/WorldLevelTrailScreen';
import { GameScreen } from './pages/GameScreen';
import { PlushHouseScreen } from './pages/PlushHouseScreen';
import { WardrobeScreen } from './pages/WardrobeScreen';
import { MiniGamesHubScreen } from './pages/MiniGamesHubScreen';
import { ChallengeScreen } from './pages/ChallengeScreen';
import { ParentCornerScreen } from './pages/ParentCornerScreen';

// Mini Games
import { MiniGameRabbitCarrot } from './pages/games/MiniGameRabbitCarrot';
import { MiniGameBubblePop } from './pages/games/MiniGameBubblePop';
import { MiniGameTrain10 } from './pages/games/MiniGameTrain10';
import { MiniGameAppleTree } from './pages/games/MiniGameAppleTree';

// Boss Challenges & Modals
import { BossChallengeGate10 } from './components/BossChallengeGate10';
import { BossChallengeRocket10 } from './components/BossChallengeRocket10';
import { RewardChestModal } from './components/RewardChestModal';
import { WorldCompleteModal } from './components/WorldCompleteModal';
import { ProfileModal } from './components/ProfileModal';
import { PlushRevealModal } from './components/plush/PlushRevealModal';
import { PlushFriend } from './types/plush';
import { ALL_PLUSH_FRIENDS } from './data/plushFriends';
import { resolveCompanion } from './utils/companion';
import { pendingDecor, acknowledgeDecor } from './domain/room/room';
import { commitRetentionUpdate } from './utils/storage';

const DailyAdventureScreen = lazy(() => import('./pages/DailyAdventureScreen'));
const MyRoomScreen = lazy(() => import('./pages/MyRoomScreen'));
const DecorReveal = lazy(() => import('./components/room/DecorReveal'));

type AppScreen =
  | 'splash'
  | 'map'
  | 'daily'
  | 'room'
  | 'world_trail'
  | 'level_play'
  | 'boss_gate_10'
  | 'boss_rocket_10'
  | 'plush_house'
  | 'wardrobe'
  | 'minigames_hub'
  | 'game_carrot'
  | 'game_bubble'
  | 'game_train'
  | 'game_apple_tree'
  | 'challenge'
  | 'parents';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const progressRef = useRef(progress);
  const pendingChestPlush = useRef<PlushFriend | null>(null);
  const chestModalOpenRef = useRef(false);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [roomSelection, setRoomSelection] = useState<string | undefined>();
  const [roomSaveError, setRoomSaveError] = useState('');
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>('world_1_counting');
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(1);

  // Modal States
  const [activeChestModal, setActiveChestModal] = useState<{
    isOpen: boolean;
    rewardId: string | null;
    starsBonus: number;
    xpBonus: number;
  }>({
    isOpen: false,
    rewardId: null,
    starsBonus: 3,
    xpBonus: 50,
  });

  const [activePlushReveal, setActivePlushReveal] = useState<{
    isOpen: boolean;
    plushFriend: PlushFriend | null;
  }>({
    isOpen: false,
    plushFriend: null,
  });

  const [worldCompleteModalData, setWorldCompleteModalData] = useState<{
    isOpen: boolean;
    worldId: WorldId;
    nextWorldName?: string;
  }>({
    isOpen: false,
    worldId: 'world_1_counting',
  });

  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Sync audio settings
  useEffect(() => {
    sound.setSoundEffectsEnabled(progress.soundEffectsEnabled ?? progress.soundEnabled);
    sound.setSpeechEnabled(progress.speechEnabled);
  }, [progress.soundEnabled, progress.soundEffectsEnabled, progress.speechEnabled]);

  const handleUpdateProgress = (updated: UserProgress) => {
    // Publish reward/room state only after the existing save confirms durability.
    if (!saveProgress(updated)) {
      setRoomSaveError('Chưa lưu được tiến độ. Hãy tải lại trước khi tiếp tục nhé!');
      return;
    }
    progressRef.current = updated;
    setProgress(updated);
    setRoomSaveError('');
  };

  const newDecor = pendingDecor(progress);
  const closeDecorReveal = (place: boolean) => {
    if (!newDecor) return;
    try {
      const next = commitRetentionUpdate(progressRef.current, p => acknowledgeDecor(p, newDecor.id));
      handleUpdateProgress(next);
      setRoomSaveError('');
      if (place) { setRoomSelection(newDecor.id); setCurrentScreen('room'); }
    } catch { setRoomSaveError('Chưa lưu được. Hãy thử lại nhé!'); }
  };

  const handleToggleSound = () => {
    const currentVal = progress.soundEffectsEnabled ?? progress.soundEnabled;
    const updated = {
      ...progress,
      soundEnabled: !currentVal,
      soundEffectsEnabled: !currentVal,
    };
    handleUpdateProgress(updated);
    sound.setSoundEffectsEnabled(!currentVal);
  };

  const handleSelectWorld = (worldId: WorldId) => {
    sound.initCtx();
    sound.cancelSpeech();
    setSelectedWorldId(worldId);
    setCurrentScreen('world_trail');
  };

  const handleSelectLevel = (levelNumber: number) => {
    sound.initCtx();
    sound.cancelSpeech();
    setSelectedLevelNumber(levelNumber);

    // If World 4 Boss Level
    if (selectedWorldId === 'world_4_make_10' && levelNumber === 8) {
      setCurrentScreen('boss_gate_10');
      return;
    }
    // If World 6 Boss Level
    if (selectedWorldId === 'world_6_over_10' && levelNumber === 8) {
      setCurrentScreen('boss_rocket_10');
      return;
    }

    setCurrentScreen('level_play');
  };

  const handleOpenChest = (chestId: string) => {
    sound.initCtx();
    if (chestModalOpenRef.current) return;
    chestModalOpenRef.current = true;
    const previous = progressRef.current;
    const res = recordChestOpen(previous, chestId);
    pendingChestPlush.current = ALL_PLUSH_FRIENDS.find(friend =>
      res.updatedProgress.unlockedPlushFriends.includes(friend.id) &&
      !previous.unlockedPlushFriends.includes(friend.id)
    ) || null;
    handleUpdateProgress(res.updatedProgress);
    setActiveChestModal({
      isOpen: true,
      rewardId: res.reward,
      starsBonus: res.starsBonus,
      xpBonus: res.xpBonus,
    });
  };

  const handleStartBossChallenge = () => {
    sound.initCtx();
    sound.cancelSpeech();
    if (selectedWorldId === 'world_4_make_10') {
      setCurrentScreen('boss_gate_10');
    } else if (selectedWorldId === 'world_6_over_10') {
      setCurrentScreen('boss_rocket_10');
    } else {
      setSelectedLevelNumber(8);
      setCurrentScreen('level_play');
    }
  };

  const handleBossChallengeComplete = (earnedStars: number) => {
    const compRes = recordLevelCompletion(progress, selectedWorldId, 8, earnedStars, true);
    handleUpdateProgress(compRes.updatedProgress);

    if (compRes.newlyUnlockedPlush) {
      setActivePlushReveal({
        isOpen: true,
        plushFriend: compRes.newlyUnlockedPlush,
      });
    }

    // Find next world
    const worldIdx = ALL_WORLDS.findIndex((w) => w.id === selectedWorldId);
    const nextWorld = ALL_WORLDS[worldIdx + 1];

    setWorldCompleteModalData({
      isOpen: true,
      worldId: selectedWorldId,
      nextWorldName: nextWorld?.adventureName,
    });
  };

  const handleEquipAccessoryFromChest = (accessory: BunnyAccessory) => {
    const updated = {
      ...progress,
      equippedAccessories: {
        ...progress.equippedAccessories,
        [accessory.type]: accessory.id,
      },
    };
    handleUpdateProgress(updated);
  };

  const handleSaveProfile = (nickname: string, avatar: string) => {
    const updated = {
      ...progress,
      childNickname: nickname,
      childAvatar: avatar,
    };
    handleUpdateProgress(updated);
  };

  const currentWorldConfig = ALL_WORLDS.find((w) => w.id === selectedWorldId) || ALL_WORLDS[0];

  return (
    <div className="min-h-screen bg-amber-50 text-slate-900 font-['Nunito',sans-serif]">
      {/* 1. Splash Screen */}
      {currentScreen === 'splash' && (
        <SplashScreen
          onStartAdventure={() => setCurrentScreen('map')}
          hat={progress.equippedAccessories.hat}
          glasses={progress.equippedAccessories.glasses}
          shirt={progress.equippedAccessories.shirt}
          backpack={progress.equippedAccessories.backpack}
          item={progress.equippedAccessories.item}
          companionId={resolveCompanion(progress)}
          soundEnabled={progress.soundEffectsEnabled ?? progress.soundEnabled}
          onToggleSound={handleToggleSound}
          childAvatar={progress.childAvatar}
          childNickname={progress.childNickname}
        />
      )}

      {/* 2. Adventure Map */}
      {currentScreen === 'map' && (
        <AdventureMapScreen
          progress={progress}
          onSelectWorld={handleSelectWorld}
          onOpenWardrobe={() => setCurrentScreen('wardrobe')}
          onOpenPlushHouse={() => setCurrentScreen('plush_house')}
          onOpenMiniGames={() => setCurrentScreen('minigames_hub')}
          onOpenChallenge={() => setCurrentScreen('challenge')}
          onOpenParents={() => setCurrentScreen('parents')}
          onOpenProfile={() => setShowProfileModal(true)}
          onToggleSound={handleToggleSound}
          onOpenDaily={() => {
            sound.initCtx();
            sound.cancelSpeech();
            setCurrentScreen('daily');
          }}
          onOpenRoom={() => { sound.cancelSpeech(); setRoomSelection(undefined); setCurrentScreen('room'); }}
        />
      )}

      {currentScreen === 'room' && (
        <Suspense fallback={<p className="p-8 text-center">Đang mở căn phòng…</p>}>
          <MyRoomScreen progress={progress} initialDecorId={roomSelection} onSaved={handleUpdateProgress} onExit={() => setCurrentScreen('map')} />
        </Suspense>
      )}
      {currentScreen === 'map' && newDecor && !activePlushReveal.isOpen && !activeChestModal.isOpen && !worldCompleteModalData.isOpen && (
        <Suspense fallback={null}>
          <DecorReveal decor={newDecor} onPlace={() => closeDecorReveal(true)} onLater={() => closeDecorReveal(false)} />
        </Suspense>
      )}

      {roomSaveError && <p role="alert" className="fixed bottom-4 inset-x-4 z-[90] bg-white p-4 text-center">{roomSaveError}</p>}

      {currentScreen === 'daily' && (
        <Suspense fallback={<p className="p-8 text-center">Đang chuẩn bị chuyến đi…</p>}>
          <DailyAdventureScreen
            progress={progress}
            onSaved={updated => {
              progressRef.current = updated;
              setProgress(updated);
            }}
            onExit={() => setCurrentScreen('map')}
          />
        </Suspense>
      )}

      {/* 3. World Level Trail */}
      {currentScreen === 'world_trail' && (
        <WorldLevelTrailScreen
          worldId={selectedWorldId}
          progress={progress}
          onSelectLevel={handleSelectLevel}
          onOpenChest={handleOpenChest}
          onStartBossChallenge={handleStartBossChallenge}
          onBackToMap={() => setCurrentScreen('map')}
        />
      )}

      {/* 4. Level Play (5 questions session with HUD & Victory) */}
      {currentScreen === 'level_play' && (
        <GameScreen
          worldId={selectedWorldId}
          levelNumber={selectedLevelNumber}
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onGoToMap={() => setCurrentScreen('world_trail')}
          onNextLevel={(nextLvl) => {
            if (nextLvl > currentWorldConfig.totalLevels) {
              setCurrentScreen('world_trail');
            } else {
              handleSelectLevel(nextLvl);
            }
          }}
          onToggleSound={handleToggleSound}
          onPlushUnlocked={(friend) => {
            setActivePlushReveal({
              isOpen: true,
              plushFriend: friend,
            });
          }}
        />
      )}

      {/* 4.5. Plush House (Ngôi Nhà Bạn Nhỏ) */}
      {currentScreen === 'plush_house' && (
        <PlushHouseScreen
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onBack={() => setCurrentScreen('map')}
        />
      )}

      {/* 5. Boss Challenge: World 4 Castle Gate of 10 */}
      {currentScreen === 'boss_gate_10' && (
        <BossChallengeGate10
          onComplete={handleBossChallengeComplete}
          onExit={() => setCurrentScreen('world_trail')}
          hat={progress.equippedAccessories.hat}
          glasses={progress.equippedAccessories.glasses}
          shirt={progress.equippedAccessories.shirt}
          backpack={progress.equippedAccessories.backpack}
          item={progress.equippedAccessories.item}
        />
      )}

      {/* 6. Boss Challenge: World 6 Rocket Launch Over 10 */}
      {currentScreen === 'boss_rocket_10' && (
        <BossChallengeRocket10
          onComplete={handleBossChallengeComplete}
          onExit={() => setCurrentScreen('world_trail')}
          hat={progress.equippedAccessories.hat}
          glasses={progress.equippedAccessories.glasses}
          shirt={progress.equippedAccessories.shirt}
          backpack={progress.equippedAccessories.backpack}
          item={progress.equippedAccessories.item}
        />
      )}

      {/* 7. Wardrobe (Tủ đồ Thỏ Bông) */}
      {currentScreen === 'wardrobe' && (
        <WardrobeScreen
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onBack={() => setCurrentScreen('map')}
        />
      )}

      {/* 8. Mini Games Hub & Games */}
      {currentScreen === 'minigames_hub' && (
        <MiniGamesHubScreen
          progress={progress}
          onSelectGame={(gameId) => {
            sound.initCtx();
            setCurrentScreen(gameId);
          }}
          onBack={() => setCurrentScreen('map')}
        />
      )}

      {currentScreen === 'game_carrot' && (
        <MiniGameRabbitCarrot
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onBack={() => setCurrentScreen('minigames_hub')}
        />
      )}

      {currentScreen === 'game_bubble' && (
        <MiniGameBubblePop
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onBack={() => setCurrentScreen('minigames_hub')}
        />
      )}

      {currentScreen === 'game_train' && (
        <MiniGameTrain10
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onBack={() => setCurrentScreen('minigames_hub')}
        />
      )}

      {currentScreen === 'game_apple_tree' && (
        <MiniGameAppleTree
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onBack={() => setCurrentScreen('minigames_hub')}
        />
      )}

      {/* 9. Challenge Screen */}
      {currentScreen === 'challenge' && (
        <ChallengeScreen
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onBack={() => setCurrentScreen('map')}
          onGoHome={() => setCurrentScreen('map')}
        />
      )}

      {/* 10. Parent Corner & Teacher Mode */}
      {currentScreen === 'parents' && (
        <ParentCornerScreen
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onBack={() => setCurrentScreen('map')}
          onSelectDirectWorld={(wId) => {
            setSelectedWorldId(wId);
            setCurrentScreen('level_play');
          }}
        />
      )}

      {/* Modals */}
      {/* Treasure Chest Modal */}
      <RewardChestModal
        isOpen={activeChestModal.isOpen}
        rewardId={activeChestModal.rewardId}
        starsBonus={activeChestModal.starsBonus}
        xpBonus={activeChestModal.xpBonus}
        onClose={() => {
          chestModalOpenRef.current = false;
          setActiveChestModal((prev) => ({ ...prev, isOpen: false }));
          const friend = pendingChestPlush.current;
          pendingChestPlush.current = null;
          if (friend) setActivePlushReveal({ isOpen: true, plushFriend: friend });
        }}
        onEquipNow={handleEquipAccessoryFromChest}
      />

      {/* World Complete Celebration Cinematic Modal */}
      {worldCompleteModalData.isOpen && (
        <WorldCompleteModal
          worldName={currentWorldConfig.name}
          worldAdventureName={currentWorldConfig.adventureName}
          worldIcon={currentWorldConfig.icon}
          nextWorldName={worldCompleteModalData.nextWorldName}
          onContinue={() => {
            setWorldCompleteModalData((prev) => ({ ...prev, isOpen: false }));
            setCurrentScreen('map');
          }}
          hat={progress.equippedAccessories.hat}
          glasses={progress.equippedAccessories.glasses}
          shirt={progress.equippedAccessories.shirt}
          backpack={progress.equippedAccessories.backpack}
          item={progress.equippedAccessories.item}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        progress={progress}
        onClose={() => setShowProfileModal(false)}
        onSaveProfile={handleSaveProfile}
      />

      {/* Plush Friend Checkpoint Reveal Modal */}
      <PlushRevealModal
        isOpen={activePlushReveal.isOpen}
        plushFriend={activePlushReveal.plushFriend}
        onHug={(friend) => {
          const updated = {
            ...progress,
            selectedCompanionId: friend.id,
          };
          handleUpdateProgress(updated);
        }}
        onGoToHouse={() => {
          setActivePlushReveal({ isOpen: false, plushFriend: null });
          setCurrentScreen('plush_house');
        }}
        onClose={() => {
          setActivePlushReveal({ isOpen: false, plushFriend: null });
        }}
        hat={progress.equippedAccessories.hat}
        glasses={progress.equippedAccessories.glasses}
        shirt={progress.equippedAccessories.shirt}
        backpack={progress.equippedAccessories.backpack}
        item={progress.equippedAccessories.item}
      />
    </div>
  );
}
