import React from 'react';
import { Play, RotateCcw, Map, Volume2, VolumeX, Mic, MicOff, X } from 'lucide-react';
import { sound } from '../utils/sound';

interface PauseMenuProps {
  isOpen: boolean;
  soundEnabled: boolean;
  speechEnabled: boolean;
  onResume: () => void;
  onRestart: () => void;
  onGoToMap: () => void;
  onToggleSound: () => void;
  onToggleSpeech: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  soundEnabled,
  speechEnabled,
  onResume,
  onRestart,
  onGoToMap,
  onToggleSound,
  onToggleSpeech,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white border-4 border-amber-300 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center">
        {/* Close X */}
        <button
          onClick={onResume}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-4xl mb-2">⏸️</div>
        <h2 className="text-2xl font-black text-slate-800 mb-1">TẠM DỪNG</h2>
        <p className="text-sm font-bold text-slate-500 mb-6">Bé muốn làm gì tiếp theo nè?</p>

        <div className="flex flex-col gap-3">
          {/* Resume */}
          <button
            onClick={() => {
              sound.playTap();
              onResume();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-lg shadow-lg active:scale-98 transition flex items-center justify-center gap-2 border-b-4 border-emerald-600"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>TIẾP TỤC CHƠI</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sound.playTap();
              onRestart();
            }}
            className="w-full py-3 px-6 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-base shadow-sm active:scale-98 transition flex items-center justify-center gap-2 border-2 border-amber-300"
          >
            <RotateCcw className="w-5 h-5" />
            <span>CHƠI LẠI MÀN NÀY</span>
          </button>

          {/* Go to Map */}
          <button
            onClick={() => {
              sound.playTap();
              onGoToMap();
            }}
            className="w-full py-3 px-6 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-base shadow-sm active:scale-98 transition flex items-center justify-center gap-2 border-2 border-sky-300"
          >
            <Map className="w-5 h-5" />
            <span>VỀ BẢN ĐỒ PHIÊU LƯU</span>
          </button>
        </div>

        {/* Audio Toggles in Pause Menu */}
        <div className="mt-6 pt-5 border-t-2 border-slate-100 flex items-center justify-center gap-3">
          <button
            onClick={onToggleSound}
            className={`flex-1 py-2 px-3 rounded-xl border-2 font-extrabold text-xs flex items-center justify-center gap-1.5 transition ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Âm thanh: {soundEnabled ? 'Bật' : 'Tắt'}</span>
          </button>

          <button
            onClick={onToggleSpeech}
            className={`flex-1 py-2 px-3 rounded-xl border-2 font-extrabold text-xs flex items-center justify-center gap-1.5 transition ${
              speechEnabled
                ? 'bg-sky-50 border-sky-300 text-sky-700'
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
          >
            {speechEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span>Giọng đọc: {speechEnabled ? 'Bật' : 'Tắt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
