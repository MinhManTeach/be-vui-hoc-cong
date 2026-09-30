import React from 'react';
import { ArrowLeft, Lock, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProgress, WorldId } from '../types/math';
import { ALL_WORLDS } from '../utils/storage';
import { sound } from '../utils/sound';

interface WorldSelectScreenProps {
  progress: UserProgress;
  onSelectWorld: (worldId: WorldId) => void;
  onBack: () => void;
}

export const WorldSelectScreen: React.FC<WorldSelectScreenProps> = ({
  progress,
  onSelectWorld,
  onBack,
}) => {
  const isWorldUnlocked = (worldId: WorldId) => {
    if (progress.allUnlockedOverride) return true;
    return progress.unlockedWorlds.includes(worldId);
  };

  const colors = [
    'from-emerald-400 to-teal-500 border-emerald-600 shadow-[0_6px_0_#0d9488]',
    'from-sky-400 to-blue-500 border-sky-600 shadow-[0_6px_0_#0284c7]',
    'from-indigo-400 to-purple-500 border-indigo-600 shadow-[0_6px_0_#4f46e5]',
    'from-amber-400 to-orange-500 border-amber-600 shadow-[0_6px_0_#d97706]',
    'from-rose-400 to-pink-500 border-rose-600 shadow-[0_6px_0_#e11d48]',
    'from-fuchsia-400 to-violet-600 border-fuchsia-700 shadow-[0_6px_0_#9333ea]',
  ];

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto flex flex-col select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="flex items-center gap-1 px-4 py-2 bg-white text-slate-800 font-black rounded-2xl border-2 border-slate-200 shadow-[0_3px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-amber-500" />
          <span>Quay Lại</span>
        </button>

        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 border-2 border-amber-500 rounded-2xl font-black text-amber-950 text-base shadow-[0_3px_0_#d97706]">
          <Star className="w-5 h-5 fill-amber-100 text-amber-100" />
          <span>{progress.totalStars} Sao</span>
        </div>
      </div>

      {/* Header title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-amber-600 drop-shadow-xs">
          🗺️ LỘ TRÌNH 6 THẾ GIỚI
        </h2>
        <p className="text-sm font-bold text-slate-600 mt-1">
          Học theo từng bước từ đếm hình đến cộng vượt 10 nhé!
        </p>
      </div>

      {/* Worlds List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
        {ALL_WORLDS.map((world, index) => {
          const unlocked = isWorldUnlocked(world.id);
          const accuracy = progress.stats.categoryAccuracy[world.id];
          const hasPlayed = accuracy && accuracy.answered > 0;

          return (
            <button
              key={world.id}
              disabled={!unlocked}
              onClick={() => {
                sound.playTap();
                onSelectWorld(world.id);
              }}
              className={`relative p-5 rounded-3xl border-3 text-left transition-all flex flex-col justify-between overflow-hidden cursor-pointer ${
                unlocked
                  ? `bg-gradient-to-br ${colors[index]} text-white hover:scale-[1.02] active:translate-y-1 active:shadow-none`
                  : 'bg-slate-200/90 border-slate-300 text-slate-400 shadow-[0_4px_0_#cbd5e1] opacity-75 cursor-not-allowed'
              }`}
            >
              {/* World number badge */}
              <div className="flex items-center justify-between w-full mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  unlocked ? 'bg-black/20 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  Thế Giới {index + 1}
                </span>

                {unlocked ? (
                  hasPlayed ? (
                    <div className="flex items-center gap-1 bg-white/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-black">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{accuracy.correct} đúng</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mới mở</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1 bg-slate-300 px-2.5 py-1 rounded-full text-xs font-black text-slate-600">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Cần {world.minStarsToUnlock} ⭐</span>
                  </div>
                )}
              </div>

              {/* Title & Icon */}
              <div className="flex items-center gap-3 my-2">
                <span className="text-4xl sm:text-5xl filter drop-shadow-sm select-none">{world.icon}</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black leading-tight">
                    {world.name}
                  </h3>
                  <p className={`text-xs font-bold mt-1 ${unlocked ? 'text-white/90' : 'text-slate-500'}`}>
                    {world.subtitle}
                  </p>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-xs font-black">
                {unlocked ? (
                  <>
                    <span>Bấm vào để chơi ngay!</span>
                    <span className="text-base">▶</span>
                  </>
                ) : (
                  <span>Tích lũy thêm sao để mở khóa nhé</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
