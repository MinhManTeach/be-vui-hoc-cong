import React from 'react';
import { ArrowLeft, Sparkles, Play } from 'lucide-react';
import { MiniGameId, UserProgress } from '../types/math';
import { sound } from '../utils/sound';

interface MiniGamesHubScreenProps {
  progress: UserProgress;
  onSelectGame: (gameId: MiniGameId) => void;
  onBack: () => void;
}

const GAMES_LIST = [
  {
    id: 'game_carrot' as MiniGameId,
    title: 'Cho Thỏ Ăn Cà Rốt',
    desc: 'Bé kéo hoặc chọn củ cà rốt có số đúng cho Thỏ Bông đói bụng nhé!',
    icon: '🥕',
    badge: 'Vui nhộn',
    bg: 'from-orange-400 to-amber-500 shadow-orange-300',
    border: 'border-orange-600',
  },
  {
    id: 'game_bubble' as MiniGameId,
    title: 'Bắn Bong Bóng Số',
    desc: 'Chạm tay làm nổ những quả bóng bay mang đáp án phép cộng!',
    icon: '🎈',
    badge: 'Hấp dẫn',
    bg: 'from-sky-400 to-blue-500 shadow-blue-300',
    border: 'border-blue-600',
  },
  {
    id: 'game_train' as MiniGameId,
    title: 'Đoàn Tàu Số 10',
    desc: 'Nối thêm toa tàu mang số để ghép thành số 10 tròn trĩnh!',
    icon: '🚂',
    badge: 'Chiến thuật',
    bg: 'from-emerald-400 to-teal-500 shadow-emerald-300',
    border: 'border-emerald-600',
  },
  {
    id: 'game_apple_tree' as MiniGameId,
    title: 'Cây Táo Thông Minh',
    desc: 'Hái những quả táo chín mọng trên cây rụng vào giỏ nhé!',
    icon: '🍎',
    badge: 'Khéo léo',
    bg: 'from-rose-400 to-pink-500 shadow-rose-300',
    border: 'border-rose-600',
  },
];

export const MiniGamesHubScreen: React.FC<MiniGamesHubScreenProps> = ({
  progress,
  onSelectGame,
  onBack,
}) => {
  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto flex flex-col justify-between select-none">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              sound.playTap();
              onBack();
            }}
            className="flex items-center gap-1 px-4 py-2 bg-white text-slate-800 font-black rounded-2xl border-2 border-slate-200 shadow-[0_3px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-amber-500" />
            <span>Trở Về</span>
          </button>

          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 border-2 border-amber-500 rounded-2xl font-black text-amber-950 text-base shadow-[0_3px_0_#d97706]">
            <Sparkles className="w-5 h-5 fill-amber-100" />
            <span>{progress.totalStars} Sao</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-amber-600 drop-shadow-xs">
            🎯 KHU VUI CHƠI TOÁN HỌC
          </h2>
          <p className="text-sm font-bold text-slate-600 mt-1">
            Chọn một trò chơi để cùng Thỏ Bông vừa chơi vừa tính toán nhé!
          </p>
        </div>

        {/* 4 Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAMES_LIST.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                sound.playTap();
                onSelectGame(game.id);
              }}
              className={`p-5 rounded-3xl bg-gradient-to-br ${game.bg} text-white border-3 ${game.border} shadow-[0_6px_0_rgba(0,0,0,0.15)] hover:scale-[1.02] active:translate-y-1 active:shadow-none transition-all flex flex-col justify-between text-left cursor-pointer group`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {game.icon}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/20 backdrop-blur-xs">
                  {game.badge}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black mb-1">{game.title}</h3>
                <p className="text-xs font-bold text-white/90 leading-relaxed">
                  {game.desc}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-white/20 flex items-center justify-between text-xs font-black">
                <span>Vào chơi ngay!</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-white" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs font-bold text-slate-500 py-4">
        Vừa học vừa chơi • Tăng khả năng phản xạ và tư duy số học!
      </div>
    </div>
  );
};
