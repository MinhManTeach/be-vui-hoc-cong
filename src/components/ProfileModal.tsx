import React, { useState } from 'react';
import { X, Check, Star, Flame, Trophy, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';
import { UserProgress } from '../types/math';
import { getPlayerLevelInfo } from '../utils/storage';

interface ProfileModalProps {
  isOpen: boolean;
  progress: UserProgress;
  onClose: () => void;
  onSaveProfile: (nickname: string, avatar: string) => void;
}

const AVATARS = ['🐰', '🐻', '🐱', '🐶', '🦁', '🐼', '🦊', '🐨'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  progress,
  onClose,
  onSaveProfile,
}) => {
  const [nickname, setNickname] = useState<string>(progress.childNickname || 'Bé Yêu');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(progress.childAvatar || '🐰');
  const levelInfo = getPlayerLevelInfo(progress.xp || 0);

  if (!isOpen) return null;

  const handleSave = () => {
    sound.playTap();
    onSaveProfile(nickname.trim() || 'Bé Yêu', selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white border-4 border-amber-300 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-slate-800 mb-1">HỒ SƠ BÉ YÊU</h2>
        <p className="text-xs font-bold text-slate-500 mb-4">Chọn hình đại diện và tên gọi dễ thương</p>

        {/* Selected Avatar Large */}
        <div className="my-2 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-4xl shadow-md">
            {selectedAvatar}
          </div>
          <span className="mt-1 text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {levelInfo.title}
          </span>
        </div>

        {/* Avatar Picker */}
        <div className="grid grid-cols-4 gap-2 my-3 p-2 bg-slate-50 rounded-2xl border border-slate-200">
          {AVATARS.map((av) => (
            <button
              key={av}
              onClick={() => {
                sound.playTap();
                setSelectedAvatar(av);
              }}
              className={`p-2 rounded-xl text-2xl transition transform active:scale-95 ${
                selectedAvatar === av
                  ? 'bg-amber-300 ring-2 ring-amber-500 scale-110 shadow-sm'
                  : 'hover:bg-white'
              }`}
            >
              {av}
            </button>
          ))}
        </div>

        {/* Nickname Input */}
        <div className="my-4 text-left">
          <label className="block text-xs font-black text-slate-700 mb-1">TÊN HOẶC BIỆT DANH CỦA BÉ:</label>
          <input
            type="text"
            value={nickname}
            maxLength={15}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ví dụ: Bé Minh"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-300 focus:outline-none focus:border-amber-500 font-extrabold text-slate-800 text-center"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 my-4 text-center">
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="text-lg font-black text-amber-600 flex items-center justify-center gap-0.5">
              <span>⭐</span> {progress.totalStars}
            </div>
            <div className="text-[10px] font-bold text-slate-500">Tổng Sao</div>
          </div>

          <div className="p-2 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="text-lg font-black text-orange-600 flex items-center justify-center gap-0.5">
              <Flame className="w-4 h-4 fill-orange-500" /> {progress.stats?.bestStreak || 0}
            </div>
            <div className="text-[10px] font-bold text-slate-500">Combo Tốt</div>
          </div>

          <div className="p-2 bg-sky-50 border border-sky-200 rounded-xl">
            <div className="text-lg font-black text-sky-600 flex items-center justify-center gap-0.5">
              <Sparkles className="w-4 h-4 fill-sky-500" /> {progress.xp || 0}
            </div>
            <div className="text-[10px] font-bold text-slate-500">Điểm XP</div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base shadow-md active:scale-95 transition flex items-center justify-center gap-2 border-b-4 border-emerald-700"
        >
          <Check className="w-5 h-5" />
          <span>LƯU HỒ SƠ</span>
        </button>
      </div>
    </div>
  );
};
