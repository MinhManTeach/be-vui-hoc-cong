import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Volume2, Flame } from 'lucide-react';
import { Question, UserProgress, WorldId } from '../types/math';
import { generateQuestion } from '../utils/questionGenerator';
import { recordAnswerResult } from '../utils/storage';
import { sound } from '../utils/sound';
import { mathExpressionToSpeech } from '../utils/speechService';
import { HeroCharacter } from '../components/HeroCharacter';
import { VisualCounters } from '../components/VisualCounters';
import { TenFrame } from '../components/TenFrame';
import { SuccessModal } from '../components/SuccessModal';

interface ChallengeScreenProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onBack: () => void;
  onGoHome: () => void;
}

const CHALLENGE_WORLDS: WorldId[] = [
  'world_1_counting',
  'world_2_merge',
  'world_3_add_10',
  'world_4_make_10',
  'world_5_split',
  'world_6_over_10',
];

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
  progress,
  onUpdateProgress,
  onBack,
  onGoHome,
}) => {
  const TOTAL_QUESTIONS = 10;
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [starsWonInRun, setStarsWonInRun] = useState<number>(0);
  const speechCancelRef = useRef<(() => void) | null>(null);
  
  // Current question generator
  const [question, setQuestion] = useState<Question>(() => {
    const randomWorld = CHALLENGE_WORLDS[Math.floor(Math.random() * CHALLENGE_WORLDS.length)];
    return generateQuestion(randomWorld);
  });

  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [bunnySpeech, setBunnySpeech] = useState<string>('Thử thách 10 câu bắt đầu! Con hãy làm thật cẩn thận nhé!');
  const [bunnyMood, setHeroMood] = useState<'idle' | 'happy' | 'cheer' | 'thinking'>('idle');
  const [showDoneModal, setShowDoneModal] = useState<boolean>(false);

  // Auto speak question when loaded
  useEffect(() => {
    sound.cancelSpeech();
    if (speechCancelRef.current) speechCancelRef.current();

    speechCancelRef.current = sound.speakQuestion(question.prompt, 400, {
      questionId: `challenge-${question.id}`,
    });

    return () => {
      sound.cancelSpeech();
      if (speechCancelRef.current) speechCancelRef.current();
    };
  }, [question.id, question.prompt]);

  const handleReRead = () => {
    sound.playTap();
    sound.speak(mathExpressionToSpeech(question.prompt), {
      eventType: 'REPLAY',
      questionId: `challenge-${question.id}`,
      forceReplay: true,
    });
  };

  const nextChallengeQuestion = () => {
    const nextIndex = currentIdx + 1;
    if (nextIndex >= TOTAL_QUESTIONS) {
      // Completed challenge!
      setShowDoneModal(true);
      return;
    }

    setCurrentIdx(nextIndex);
    setSelectedChoice(null);
    setHeroMood('idle');
    const randomWorld = CHALLENGE_WORLDS[Math.floor(Math.random() * CHALLENGE_WORLDS.length)];
    const nextQ = generateQuestion(randomWorld);
    setQuestion(nextQ);
    setBunnySpeech(`Câu số ${nextIndex + 1}! Con chọn đáp án nào nè?`);
  };

  const handleSelectAnswer = (choice: number) => {
    if (selectedChoice !== null) return; // Prevent double taps
    sound.playTap();
    setSelectedChoice(choice);

    const isCorrect = choice === question.answer;

    if (isCorrect) {
      sound.playSuccess();
      setHeroMood('cheer');
      const praise = sound.speakRandomPraise({
        questionId: `challenge-${question.id}`,
      });
      setBunnySpeech(praise);

      const result = recordAnswerResult(progress, question.worldId, true);
      onUpdateProgress(result.updatedProgress);
      setCorrectCount((prev) => prev + 1);
      setStarsWonInRun((prev) => prev + result.starsEarned);

      setTimeout(() => {
        nextChallengeQuestion();
      }, 1200);
    } else {
      sound.playGentleRetry();
      setHeroMood('thinking');
      const gentle = sound.speakGentleRetry({
        questionId: `challenge-${question.id}`,
      });
      setBunnySpeech(gentle);

      recordAnswerResult(progress, question.worldId, false);

      setTimeout(() => {
        nextChallengeQuestion();
      }, 1200);
    }
  };

  const handleRestartChallenge = () => {
    setShowDoneModal(false);
    setCurrentIdx(0);
    setCorrectCount(0);
    setStarsWonInRun(0);
    setSelectedChoice(null);
    const randomWorld = CHALLENGE_WORLDS[Math.floor(Math.random() * CHALLENGE_WORLDS.length)];
    setQuestion(generateQuestion(randomWorld));
    setBunnySpeech('Lượt thử thách mới bắt đầu!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-amber-50 to-orange-50 flex flex-col justify-between p-4 max-w-2xl mx-auto select-none">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              sound.cancelSpeech();
              sound.playTap();
              onBack();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 font-black rounded-2xl border-2 border-slate-200 shadow-[0_3px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-rose-500" />
            <span>Thoát</span>
          </button>

          {/* Progress Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500 text-white rounded-2xl font-black text-sm shadow-[0_3px_0_#be123c]">
              <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Câu {currentIdx + 1}/{TOTAL_QUESTIONS}</span>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 border-2 border-amber-500 rounded-2xl font-black text-amber-950 text-sm shadow-[0_3px_0_#d97706]">
              <Sparkles className="w-4 h-4 fill-amber-100" />
              <span>+{starsWonInRun} ⭐</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-white/80 rounded-full border-2 border-rose-200 overflow-hidden shadow-inner mb-4">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIdx + 1) / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        <HeroCharacter
          mood={bunnyMood}
          speechText={bunnySpeech}
          size="md"
          hat={progress.equippedAccessories.hat}
          glasses={progress.equippedAccessories.glasses}
          className="mb-2"
        />

        {/* Question Board */}
        <div className="w-full bg-white rounded-3xl p-5 border-3 border-rose-300 shadow-xl flex flex-col items-center relative">
          <div className="flex items-center justify-center gap-2 mb-3 w-full">
            <span className="text-xl sm:text-2xl font-black text-slate-800 text-center">
              {question.prompt}
            </span>
            <button
              onClick={handleReRead}
              className="p-2.5 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 shadow-sm transition active:scale-95 cursor-pointer"
              title="Đọc lại câu hỏi"
              aria-label="Đọc lại câu hỏi"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* Visual representations */}
          {question.type === 'count' && (
            <VisualCounters count={question.operandA} theme={question.itemTheme} size="md" />
          )}

          {(question.type === 'add_basic' || question.type === 'merge') && (
            <div className="flex items-center gap-3 text-3xl font-black text-slate-800 my-2">
              <span className="text-rose-600">{question.operandA}</span>
              <span className="text-amber-500">+</span>
              <span className="text-blue-600">{question.operandB}</span>
              <span>=</span>
              <span className="w-12 h-12 rounded-xl bg-amber-100 border-2 border-dashed border-amber-400 flex items-center justify-center text-amber-800">
                ?
              </span>
            </div>
          )}

          {question.type === 'make_10' && (
            <TenFrame filledCountA={question.operandA} itemAIcon="🍎" size="md" label="Cần thêm để đủ 10" />
          )}

          {question.type === 'over_10' && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl font-black text-purple-700">
                {question.operandA} + {question.operandB} = ?
              </div>
              <TenFrame filledCountA={question.operandA} itemAIcon="🔴" size="sm" label="Tạo 10 trước nhé" />
            </div>
          )}

          {/* Choices */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-w-sm mt-4">
            {question.choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleSelectAnswer(choice)}
                className={`py-3.5 px-2 rounded-2xl font-black text-2xl transition-all shadow-[0_5px_0_#be123c] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center ${
                  selectedChoice === choice
                    ? 'bg-amber-400 text-amber-950 scale-105'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}
              >
                <span>{choice}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Done Celebration Modal */}
      <SuccessModal
        isOpen={showDoneModal}
        starsEarned={starsWonInRun}
        totalCorrect={correctCount}
        totalQuestions={TOTAL_QUESTIONS}
        message="HOÀN THÀNH THỬ THÁCH! Con làm rất tốt!"
        onNext={handleRestartChallenge}
        onReplay={handleRestartChallenge}
        onGoHome={() => {
          sound.cancelSpeech();
          onGoHome();
        }}
      />

      <div className="text-center text-xs font-bold text-rose-800/70 pb-1">
        Cố gắng trả lời thật nhiều câu đúng để nhận thật nhiều Sao nhé!
      </div>
    </div>
  );
};
