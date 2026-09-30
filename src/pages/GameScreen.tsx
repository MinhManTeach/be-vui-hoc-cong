import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, Lightbulb, Sparkles } from 'lucide-react';
import { BunnyAccessory, Question, UserProgress, WorldId } from '../types/math';
import { PlushFriend } from '../types/plush';
import { QuestionSession } from '../utils/questionSession';
import { generateQuestion } from '../utils/questionGenerator';
import { ALL_WORLDS, recordAnswerResult, recordLevelCompletion, WorldConfig } from '../utils/storage';
import { sound } from '../utils/sound';
import { mathExpressionToSpeech, speechService } from '../utils/speechService';
import { BunnyCharacter } from '../components/BunnyCharacter';
import { VisualCounters } from '../components/VisualCounters';
import { InteractiveToyTenFrame } from '../components/InteractiveToyTenFrame';
import { ToyAnswerBlock } from '../components/ToyAnswerBlock';
import { VictoryScreen } from '../components/VictoryScreen';
import { HintModal } from '../components/HintModal';
import { GameHUD } from '../components/GameHUD';
import { PauseMenu } from '../components/PauseMenu';
import {
  CastleScenerySVG,
  GardenScenerySVG,
  ForestScenerySVG,
  IslandScenerySVG,
  SpaceScenerySVG,
} from '../utils/worldAssets';

interface GameScreenProps {
  worldId: WorldId;
  levelNumber?: number;
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onGoToMap: () => void;
  onNextLevel: (nextLevel: number) => void;
  onToggleSound: () => void;
  onPlushUnlocked?: (friend: PlushFriend) => void;
}

const QUESTIONS_PER_LEVEL = 5;

export const GameScreen: React.FC<GameScreenProps> = ({
  worldId,
  levelNumber = 1,
  progress,
  onUpdateProgress,
  onGoToMap,
  onNextLevel,
  onToggleSound,
  onPlushUnlocked,
}) => {
  const worldConfig: WorldConfig = ALL_WORLDS.find((w) => w.id === worldId) || ALL_WORLDS[0];

  const [question, setQuestion] = useState<Question>(() => generateQuestion(worldId));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [bunnySpeech, setBunnySpeech] = useState<string>('Con hãy quan sát và chọn đáp án nhé!');
  const [bunnyMood, setBunnyMood] = useState<'idle' | 'happy' | 'celebrate' | 'thinking' | 'wave' | 'pointing'>('thinking');
  const sessionRef = useRef(new QuestionSession());
  const session = sessionRef.current;

  // Level session counters
  const [levelQuestionIndex, setLevelQuestionIndex] = useState<number>(1);
  const [levelCorrectCount, setLevelCorrectCount] = useState<number>(0);
  const [levelXpEarned, setLevelXpEarned] = useState<number>(0);
  const [maxComboInLevel, setMaxComboInLevel] = useState<number>(0);
  const [currentLevelStars, setCurrentLevelStars] = useState<number>(0);

  // Micro-animation triggers
  const [showXpPop, setShowXpPop] = useState<boolean>(false);
  const [isWobbling, setIsWobbling] = useState<boolean>(false);
  const [isFillingTenFrame, setIsFillingTenFrame] = useState<boolean>(false);
  const [isHighlightingEmptySlots, setIsHighlightingEmptySlots] = useState<boolean>(false);

  // Interactive World 2 Merge state
  const [isMerged, setIsMerged] = useState<boolean>(false);

  // Interactive World 6 Steps
  const [over10Step, setOver10Step] = useState<1 | 2 | 3>(1);

  // Modals & Screens
  const [showVictoryScreen, setShowVictoryScreen] = useState<boolean>(false);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [newlyWonReward, setNewlyWonReward] = useState<BunnyAccessory | null>(null);

  // Initialize question
  const initQuestion = useCallback((wId: WorldId) => {
    session.begin();

    const nextQ = generateQuestion(wId);
    setQuestion(nextQ);
    setSelectedAnswer(null);
    setWrongAttempts(0);
    setIsMerged(false);
    setOver10Step(1);
    setBunnyMood('thinking');
    setShowXpPop(false);
    setIsWobbling(false);
    setIsFillingTenFrame(false);
    setIsHighlightingEmptySlots(false);

    let initialSpeech = 'Con hãy đếm và chọn đáp án đúng nhé!';
    if (wId === 'world_2_merge') initialSpeech = 'Hãy bấm "Gộp Lại" để xem có tất cả bao nhiêu nhé!';
    if (wId === 'world_4_make_10') initialSpeech = `Bạn số ${nextQ.operandA} cần thêm mấy để tạo thành 10?`;
    if (wId === 'world_5_split') initialSpeech = `Tách ${nextQ.operandA} vào hai giỏ nhé!`;
    if (wId === 'world_6_over_10') initialSpeech = `Bước 1: ${nextQ.operandA} cần thêm mấy để tạo thành 10?`;

    setBunnySpeech(initialSpeech);

    // Auto-read question in Vietnamese after 400ms delay for preschoolers
    session.once('QUESTION_CHANGED', () => {
      session.ownSpeech(sound.speakQuestion(nextQ.prompt, 400, {
        questionId: `${wId}-${nextQ.id}`,
      }));
    });
  }, [session]);

  useEffect(() => {
    initQuestion(worldId);
    setLevelQuestionIndex(1);
    setLevelCorrectCount(0);
    setLevelXpEarned(0);
    setMaxComboInLevel(0);
    setCurrentLevelStars(0);
    setShowVictoryScreen(false);

    return () => {
      session.dispose();
    };
  }, [worldId, levelNumber, initQuestion]);

  const speakEvent = (event: string, text: string) => {
    session.once(event, () => session.ownSpeech(sound.speak(text, {
      questionId: `${worldId}-${question.id}`,
      eventType: event === 'ANSWER_CORRECT' ? 'ANSWER_CORRECT'
        : event.startsWith('ANSWER_WRONG') ? 'ANSWER_WRONG' : 'SYSTEM',
    })));
  };

  const handleReReadQuestion = () => {
    sound.playTap();
    session.ownSpeech(sound.speak(mathExpressionToSpeech(question.prompt), {
      eventType: 'REPLAY',
      questionId: `${worldId}-${question.id}`,
      forceReplay: true,
    }));
  };

  const handleTriggerVisualHint = () => {
    sound.playTap();
    setIsHighlightingEmptySlots(true);
    setBunnyMood('pointing');
    setBunnySpeech('Con thử đếm những ô còn trống nhấp nháy nhé!');
    speakEvent('HINT', 'Con thử đếm những ô còn trống nhấp nháy nhé!');
  };

  // Handle Answer Selection
  const handleSelectChoice = (choice: number) => {
    if (isPaused || showVictoryScreen || !session.tryAnswer()) return;
    sound.playTap();
    setSelectedAnswer(choice);

    // For World 6 Multi-step
    if (worldId === 'world_6_over_10') {
      if (over10Step === 1) {
        if (choice === question.needToMake10) {
          sound.playSuccess();
          sound.playXp();
          setBunnyMood('happy');
          setBunnySpeech(`Chính xác! ${question.operandA} + ${choice} = 10! Giờ tách ${question.operandB} nhé!`);
          speakEvent('MAKE_TEN_CORRECT', `Chính xác! ${question.operandA} cộng ${choice} bằng mười! Giờ tách số ${question.operandB} nhé!`);
          session.schedule(() => {
            setOver10Step(2);
            setSelectedAnswer(null);
            session.releaseAnswer();
          }, 1300);
        } else {
          sound.playGentleRetry();
          setBunnyMood('thinking');
          setIsWobbling(true);
          const attempts = wrongAttempts + 1;
          setWrongAttempts(attempts);
          const gentleText = speechService.getRandomGentlePhrase();
          speakEvent(`MAKE_TEN_WRONG_${attempts}`, gentleText);
          setBunnySpeech(gentleText);
          session.schedule(() => {
            setIsWobbling(false);
            setSelectedAnswer(null);
            session.releaseAnswer();
          }, 700);

          if (attempts >= 2) {
            session.schedule(() => {
              handleTriggerVisualHint();
            }, 800);
          }
        }
        return;
      }
    }

    // Standard checking
    const isCorrect = choice === question.answer;

    if (isCorrect) {
      sound.playSuccess();
      sound.playStar();
      sound.playXp();
      setBunnyMood('celebrate');
      setShowXpPop(true);
      setIsFillingTenFrame(true);

      const reinforcementText =
        worldId === 'world_4_make_10'
          ? `Đúng rồi! ${question.operandA} thêm ${choice} bằng mười!`
          : speechService.getRandomPraisePhrase();

      setBunnySpeech(reinforcementText);
      speakEvent('ANSWER_CORRECT', reinforcementText);

      // Record answer result
      const result = recordAnswerResult(progress, worldId, true);
      onUpdateProgress(result.updatedProgress);

      const newCorrect = levelCorrectCount + 1;
      setLevelCorrectCount(newCorrect);
      setLevelXpEarned((prev) => prev + result.xpEarned);

      const currentStreak = result.updatedProgress.stats.streak;
      if (currentStreak > maxComboInLevel) {
        setMaxComboInLevel(currentStreak);
      }

      // Check star threshold during session
      const calculatedStars = newCorrect >= 5 ? 3 : newCorrect >= 4 ? 2 : newCorrect >= 1 ? 1 : 0;
      setCurrentLevelStars(calculatedStars);

      // Check if level session (5 questions) is completed
      if (levelQuestionIndex >= QUESTIONS_PER_LEVEL) {
        const earnedFinalStars = Math.max(1, calculatedStars);
        const compResult = recordLevelCompletion(
          result.updatedProgress,
          worldId,
          levelNumber,
          earnedFinalStars
        );
        onUpdateProgress(compResult.updatedProgress);

        if (compResult.newlyUnlockedPlush) {
          onPlushUnlocked?.(compResult.newlyUnlockedPlush);
        }

        session.schedule(() => {
          setShowVictoryScreen(true);
        }, 1300);
      } else {
        // Advance to next question automatically after 1100ms
        session.schedule(() => {
          setLevelQuestionIndex((prev) => prev + 1);
          initQuestion(worldId);
        }, 1200);
      }
    } else {
      sound.playGentleRetry();
      setBunnyMood('thinking');
      setIsWobbling(true);

      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);

      const gentle = speechService.getRandomGentlePhrase();
      speakEvent(`ANSWER_WRONG_${newAttempts}`, gentle);
      setBunnySpeech(gentle);

      const result = recordAnswerResult(progress, worldId, false);
      onUpdateProgress(result.updatedProgress);

      session.schedule(() => {
        setIsWobbling(false);
        setSelectedAnswer(null);
        session.releaseAnswer();
      }, 700);

      // After 2 incorrect attempts, automatically activate visual hint!
      if (newAttempts >= 2) {
        session.schedule(() => {
          handleTriggerVisualHint();
        }, 800);
      }
    }
  };

  const handleNextLevelClick = () => {
    setShowVictoryScreen(false);
    const nextLvl = levelNumber < worldConfig.totalLevels ? levelNumber + 1 : 1;
    onNextLevel(nextLvl);
  };

  const handleReplayClick = () => {
    setShowVictoryScreen(false);
    setIsPaused(false);
    setLevelQuestionIndex(1);
    setLevelCorrectCount(0);
    setLevelXpEarned(0);
    setCurrentLevelStars(0);
    initQuestion(worldId);
  };

  // Render thematic scenery backdrop
  const renderSceneryBackground = () => {
    switch (worldId) {
      case 'world_1_counting':
        return <GardenScenerySVG className="w-full max-w-3xl opacity-75 pointer-events-none" />;
      case 'world_2_merge':
        return <ForestScenerySVG className="w-full max-w-3xl opacity-75 pointer-events-none" />;
      case 'world_3_add_10':
        return <IslandScenerySVG className="w-full max-w-3xl opacity-75 pointer-events-none" />;
      case 'world_4_make_10':
        return <CastleScenerySVG className="w-full max-w-3xl opacity-85 pointer-events-none" />;
      case 'world_6_over_10':
        return <SpaceScenerySVG className="w-full max-w-3xl opacity-85 pointer-events-none" />;
      default:
        return <CastleScenerySVG className="w-full max-w-3xl opacity-75 pointer-events-none" />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between bg-gradient-to-b ${worldConfig.bgGradient} select-none relative overflow-hidden pb-4`}
    >
      {/* Floating HUD at Top */}
      <GameHUD
        levelNumber={levelNumber}
        worldName={worldConfig.adventureName}
        worldIcon={worldConfig.icon}
        currentStars={currentLevelStars}
        xp={progress.xp}
        soundEnabled={progress.soundEffectsEnabled ?? progress.soundEnabled}
        onToggleSound={onToggleSound}
        onPause={() => setIsPaused(true)}
        streak={progress.stats.streak}
      />

      {/* GAME SCENE PLAY AREA (Zero white card form!) */}
      <main className="max-w-3xl w-full mx-auto px-4 flex flex-col items-center flex-1 justify-between pt-1 pb-2 relative z-10">
        {/* Scenery backdrop artwork */}
        <div className="absolute top-0 inset-x-0 flex justify-center -z-10 overflow-hidden">
          {renderSceneryBackground()}
        </div>

        {/* Floating +10 XP Popup Animation */}
        {showXpPop && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-xl px-5 py-2 rounded-full shadow-2xl border-3 border-white animate-bounce">
            ⭐ +10 XP!
          </div>
        )}

        {/* Top Floating Board: Question Counter & Audio & Hint */}
        <div className="w-full flex items-center justify-between mt-1 mb-2 max-w-xl">
          <span className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border-3 border-amber-400 shadow-md text-amber-950 font-black text-xs sm:text-sm">
            Nhiệm vụ {levelQuestionIndex}/{QUESTIONS_PER_LEVEL}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReReadQuestion}
              className="p-2 sm:px-3 sm:py-2 bg-white/95 hover:bg-amber-100 text-amber-950 rounded-2xl shadow-md border-3 border-amber-400 active:scale-95 transition flex items-center gap-1 font-black text-xs cursor-pointer"
              title="Đọc lại câu hỏi"
            >
              <Volume2 className="w-4 h-4 text-amber-900 fill-amber-500" />
              <span className="hidden sm:inline">Đọc lại</span>
            </button>

            <button
              onClick={handleTriggerVisualHint}
              className="p-2 sm:px-3 sm:py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-2xl shadow-md border-3 border-amber-600 active:scale-95 transition flex items-center gap-1 font-black text-xs cursor-pointer animate-pulse"
              title="Xem gợi ý trực quan"
            >
              <Lightbulb className="w-4 h-4 text-amber-950 fill-amber-300" />
              <span className="hidden sm:inline">Gợi ý</span>
            </button>
          </div>
        </div>

        {/* Center Game Stage: Question Banner & Visual Toy */}
        <div className="w-full max-w-xl flex flex-col items-center my-auto">
          {/* Wooden Toy Question Banner */}
          <div className="relative px-6 py-3.5 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-4 border-amber-600 rounded-3xl shadow-[0_6px_0_#92400e] text-center mb-4">
            <div className="text-3xl sm:text-5xl font-black text-slate-800 tracking-wider font-['Nunito',sans-serif] drop-shadow-sm flex items-center justify-center gap-2">
              {worldId === 'world_4_make_10' ? (
                <>
                  <span className="text-amber-700">{question.operandA}</span>
                  <span>+</span>
                  <span className="px-3 py-0.5 rounded-2xl bg-amber-200 border-3 border-amber-500 text-purple-700 animate-pulse">
                    ?
                  </span>
                  <span>=</span>
                  <span className="text-emerald-700">10</span>
                </>
              ) : worldId === 'world_3_add_10' ? (
                <>
                  <span className="text-blue-700">{question.operandA}</span>
                  <span>+</span>
                  <span className="text-blue-700">{question.operandB}</span>
                  <span>=</span>
                  <span className="text-amber-600">?</span>
                </>
              ) : (
                <span>{question.prompt}</span>
              )}
            </div>
          </div>

          {/* WORLD-SPECIFIC INTERACTIVE TOY VISUALS */}

          {/* WORLD 4: VƯƠNG QUỐC SỐ 10 (Interactive 3D Toy Ten-Frame) */}
          {worldId === 'world_4_make_10' && (
            <div className="w-full flex justify-center my-2">
              <InteractiveToyTenFrame
                initialCountA={question.operandA}
                targetTotal={10}
                highlightEmptySlots={isHighlightingEmptySlots}
                isAnimatingFill={isFillingTenFrame}
                itemIcon="🍎"
                fillItemIcon="⭐"
                className="w-full max-w-md"
              />
            </div>
          )}

          {/* WORLD 3: CỘNG TRONG PHẠM VI 10 (Interactive Ten Frame) */}
          {worldId === 'world_3_add_10' && (
            <div className="w-full flex justify-center my-2">
              <InteractiveToyTenFrame
                initialCountA={question.operandA}
                targetTotal={10}
                itemIcon="⭐"
                fillItemIcon="💎"
                className="w-full max-w-md"
              />
            </div>
          )}

          {/* WORLD 1: BÉ TẬP ĐẾM */}
          {worldId === 'world_1_counting' && (
            <div className="my-2 p-5 bg-white/95 rounded-3xl border-4 border-emerald-400 shadow-xl w-full flex justify-center">
              <VisualCounters
                count={question.operandA}
                theme={question.itemTheme}
                interactiveTapCount={true}
                size="lg"
              />
            </div>
          )}

          {/* WORLD 2: GỘP HAI NHÓM */}
          {worldId === 'world_2_merge' && (
            <div className="my-2 p-4 bg-white/95 rounded-3xl border-4 border-amber-400 shadow-xl w-full flex flex-col items-center">
              {!isMerged ? (
                <div className="flex items-center justify-around w-full">
                  <div className="flex flex-col items-center p-3 bg-amber-50 rounded-2xl border-2 border-amber-300">
                    <span className="text-xs font-bold text-amber-800 mb-1">
                      Nhóm 1 ({question.operandA})
                    </span>
                    <VisualCounters count={question.operandA} theme={question.itemTheme} size="md" />
                  </div>

                  <span className="text-3xl font-black text-amber-600">+</span>

                  <div className="flex flex-col items-center p-3 bg-amber-50 rounded-2xl border-2 border-amber-300">
                    <span className="text-xs font-bold text-amber-800 mb-1">
                      Nhóm 2 ({question.operandB})
                    </span>
                    <VisualCounters count={question.operandB || 1} theme={question.itemTheme} size="md" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-2xl border-3 border-emerald-500 w-full animate-scale-up">
                  <span className="text-xs font-black text-emerald-800 mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 fill-emerald-500" />
                    ĐÃ GỘP TẤT CẢ VÀO MỘT NHÓM
                  </span>
                  <VisualCounters
                    count={(question.operandA || 0) + (question.operandB || 0)}
                    theme={question.itemTheme}
                    interactiveTapCount={true}
                    size="lg"
                  />
                </div>
              )}

              {!isMerged && (
                <button
                  onClick={() => {
                    sound.playTap();
                    setIsMerged(true);
                    sound.playStar();
                    speakEvent('MERGE', `Đã gộp lại! Có ${question.operandA} thêm ${question.operandB}. Có tất cả bao nhiêu?`);
                  }}
                  className="mt-3 py-2.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-black text-base shadow-md active:scale-95 transition flex items-center gap-2 border-b-4 border-amber-600 cursor-pointer"
                >
                  <span>🧺 BẤM ĐỂ GỘP LẠI</span>
                </button>
              )}
            </div>
          )}

          {/* WORLD 5: TÁCH SỐ */}
          {worldId === 'world_5_split' && (
            <div className="my-2 p-4 bg-white/95 rounded-3xl border-4 border-rose-400 shadow-xl w-full flex items-center justify-around">
              <div className="flex flex-col items-center p-3 bg-rose-50 rounded-2xl border-2 border-rose-300 w-36">
                <span className="text-2xl mb-1">🧺</span>
                <span className="text-xs font-black text-slate-700">Giỏ 1: {question.splitA}</span>
                <VisualCounters count={question.splitA || 1} theme={question.itemTheme} size="sm" />
              </div>

              <span className="text-2xl font-black text-rose-500">+</span>

              <div className="flex flex-col items-center p-3 bg-rose-50 rounded-2xl border-2 border-dashed border-rose-400 w-36">
                <span className="text-2xl mb-1">🧺</span>
                <span className="text-xs font-black text-rose-700">Giỏ 2: ?</span>
                <span className="text-3xl font-black text-rose-600 my-2 animate-bounce">?</span>
              </div>
            </div>
          )}

          {/* WORLD 6: CỘNG VƯỢT 10 */}
          {worldId === 'world_6_over_10' && (
            <div className="my-2 p-4 bg-white/95 rounded-3xl border-4 border-indigo-400 shadow-xl w-full flex flex-col items-center">
              {over10Step === 1 && (
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-900 rounded-full font-black text-xs mb-2">
                    BƯỚC 1: TẠO THÀNH 10
                  </span>
                  <p className="font-extrabold text-sm text-slate-800">
                    {question.operandA} cần thêm mấy để đủ 10?
                  </p>
                  <div className="my-2">
                    <InteractiveToyTenFrame
                      initialCountA={question.operandA}
                      targetTotal={10}
                      className="w-full max-w-sm"
                    />
                  </div>
                </div>
              )}

              {over10Step === 2 && (
                <div className="text-center animate-fade-in">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full font-black text-xs mb-2">
                    BƯỚC 2: TÁCH PHẦN CÒN LẠI
                  </span>
                  <p className="font-extrabold text-sm text-slate-800">
                    Lấy {question.needToMake10} từ {question.operandB}, còn lại {question.remainder}.
                  </p>
                  <div className="mt-2 text-xl font-black text-indigo-900">
                    10 + {question.remainder} = ?
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mascot & Speech Bubble Section */}
        <div className="w-full max-w-xl flex items-center justify-center gap-3 my-2">
          {/* Prominent Sized Thỏ Bông Mascot */}
          <div className="shrink-0 transform transition-transform hover:scale-105">
            <BunnyCharacter
              mood={bunnyMood}
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

          {/* Speech Bubble right beside Thỏ Bông */}
          <div className="flex-1 bg-white/95 backdrop-blur-md border-3 border-amber-400 rounded-3xl p-3.5 shadow-xl relative animate-bounce-subtle">
            {/* Bubble Tail pointing to Bunny */}
            <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-white" />
            <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-0 h-0 border-y-9 border-y-transparent border-r-9 border-r-amber-400 -z-10" />

            <p className="text-xs sm:text-sm font-black text-slate-800 leading-tight">
              {bunnySpeech}
            </p>
          </div>
        </div>

        {/* 3D TACTILE TOY ANSWER BLOCKS (Zero HTML button feel!) */}
        <div className="w-full max-w-xl my-2">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
            {(worldId === 'world_6_over_10' && over10Step === 1
              ? [1, 2, 3, 4]
              : question.choices
            ).map((choice) => {
              const isSelected = selectedAnswer === choice;
              const isCorrect =
                worldId === 'world_6_over_10' && over10Step === 1
                  ? choice === question.needToMake10
                  : choice === question.answer;

              return (
                <ToyAnswerBlock
                  key={choice}
                  value={choice}
                  worldId={worldId}
                  isSelected={isSelected}
                  isCorrect={isCorrect}
                  isWobbling={isWobbling && isSelected}
                  disabled={selectedAnswer !== null || isPaused || showVictoryScreen}
                  onClick={() => handleSelectChoice(choice)}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Pause Menu Modal */}
      <PauseMenu
        isOpen={isPaused}
        soundEnabled={progress.soundEffectsEnabled ?? progress.soundEnabled}
        speechEnabled={progress.speechEnabled}
        onResume={() => setIsPaused(false)}
        onRestart={handleReplayClick}
        onGoToMap={() => {
          setIsPaused(false);
          sound.cancelSpeech();
          onGoToMap();
        }}
        onToggleSound={onToggleSound}
        onToggleSpeech={() => {
          sound.playTap();
          const nextVal = !progress.speechEnabled;
          onUpdateProgress({ ...progress, speechEnabled: nextVal });
          sound.setSpeechEnabled(nextVal);
        }}
      />

      {/* Visual Hint Modal */}
      <HintModal
        isOpen={showHintModal}
        question={question}
        onClose={() => setShowHintModal(false)}
        hat={progress.equippedAccessories.hat}
        glasses={progress.equippedAccessories.glasses}
        shirt={progress.equippedAccessories.shirt}
        backpack={progress.equippedAccessories.backpack}
        item={progress.equippedAccessories.item}
      />

      {/* Victory Screen on Level Complete */}
      {showVictoryScreen && (
        <VictoryScreen
          stars={currentLevelStars || 3}
          xpEarned={levelXpEarned}
          bestCombo={maxComboInLevel}
          newReward={newlyWonReward}
          levelNumber={levelNumber}
          worldName={worldConfig.adventureName}
          onNextLevel={handleNextLevelClick}
          onReplay={handleReplayClick}
          onGoToMap={() => {
            sound.cancelSpeech();
            onGoToMap();
          }}
          companionId={progress.selectedCompanionId}
          hat={progress.equippedAccessories.hat}
          glasses={progress.equippedAccessories.glasses}
          shirt={progress.equippedAccessories.shirt}
          backpack={progress.equippedAccessories.backpack}
          item={progress.equippedAccessories.item}
        />
      )}
    </div>
  );
};
