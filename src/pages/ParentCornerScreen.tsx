import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  BarChart3,
  Unlock,
  RotateCcw,
  ShieldCheck,
  HeartHandshake,
  Volume2,
  Sparkles,
  GraduationCap,
  Play,
  VolumeX,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { UserProgress, WorldId } from '../types/math';
import { ALL_WORLDS, resetGameProgress, resetProgress, saveProgress } from '../utils/storage';
import { sound } from '../utils/sound';
import { speechService } from '../utils/speechService';
import { useSpeechAvailability } from '../services/speech/useSpeechAvailability';
import { verifyMake10Strategy } from '../utils/questionGenerator';
import { LopsoAppsCard } from '../components/LopsoAppsCard';
import { LIMIT_OPTIONS, setDailyLimit, today } from '../domain/playtime/playtime';
import { deviceClock } from '../domain/retention/clock';

interface ParentCornerScreenProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onBack: () => void;
  onSelectDirectWorld?: (worldId: WorldId) => void;
}

export const ParentCornerScreen: React.FC<ParentCornerScreenProps> = ({
  progress,
  onUpdateProgress,
  onBack,
  onSelectDirectWorld,
}) => {
  // Parental Gate state (e.g. 6 x 4 = 24)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [gateAnswer, setGateAnswer] = useState<string>('');
  const [gateError, setGateError] = useState<string | null>(null);
  const [testSpeechPlaying, setTestSpeechPlaying] = useState<boolean>(false);
  const [activeTeacherTab, setActiveTeacherTab] = useState<'settings' | 'teacher_mode'>('settings');
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState<boolean>(false);
  const [resetToastMessage, setResetToastMessage] = useState<string | null>(null);
  // Hooks must run on every render, so this sits above the parent-gate early return.
  const voiceAvailability = useSpeechAvailability(progress.speechEnabled);

  // Simple math challenge for parent
  const [gateChallenge] = useState(() => {
    const a = Math.floor(Math.random() * 4) + 6; // 6 to 9
    const b = Math.floor(Math.random() * 4) + 3; // 3 to 6
    return { a, b, answer: a * b };
  });

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateAnswer, 10) === gateChallenge.answer) {
      sound.playSuccess();
      setIsAuthenticated(true);
      setGateError(null);
    } else {
      sound.playGentleRetry();
      setGateError('Kết quả chưa đúng, vui lòng nhập lại phép nhân trên.');
    }
  };

  // Toggle all worlds unlock override
  const handleToggleUnlockAll = () => {
    sound.playTap();
    const updated: UserProgress = {
      ...progress,
      allUnlockedOverride: !progress.allUnlockedOverride,
    };
    onUpdateProgress(updated);
    saveProgress(updated);
  };

  // Toggle Sound FX
  const handleToggleSoundFX = () => {
    sound.playTap();
    const currentVal = progress.soundEffectsEnabled !== undefined ? progress.soundEffectsEnabled : progress.soundEnabled;
    const updated: UserProgress = {
      ...progress,
      soundEnabled: !currentVal,
      soundEffectsEnabled: !currentVal,
    };
    sound.setSoundEffectsEnabled(!currentVal);
    onUpdateProgress(updated);
    saveProgress(updated);
  };

  // Toggle Speech
  const handleToggleSpeech = () => {
    sound.playTap();
    const updated: UserProgress = {
      ...progress,
      speechEnabled: !progress.speechEnabled,
    };
    sound.setSpeechEnabled(!progress.speechEnabled);
    onUpdateProgress(updated);
    saveProgress(updated);
  };

  // Test Speech
  const handleTestSpeech = () => {
    setTestSpeechPlaying(true);
    sound.cancelSpeech();
    speechService.speak('Xin chào! Chúng mình cùng học toán nhé!', {
      onEnd: () => setTestSpeechPlaying(false),
    });
    setTimeout(() => setTestSpeechPlaying(false), 3000);
  };

  // Open reset modal
  const handleOpenResetModal = () => {
    sound.playTap();
    setIsResetConfirmModalOpen(true);
  };

  // Perform full game progress reset
  const handleConfirmReset = () => {
    sound.playTap();
    const resetData = resetGameProgress(true);
    onUpdateProgress(resetData);
    setIsResetConfirmModalOpen(false);
    setResetToastMessage('Đã đặt lại hành trình!');
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  // If not yet passed gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 select-none">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-slate-200 shadow-xl text-center">
          <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-2">
            GÓC DÀNH CHO PHỤ HUYNH
          </h2>
          <p className="text-sm text-slate-600 font-bold mb-6">
            Để vào góc phụ huynh, vui lòng hoàn thành phép tính bảo vệ:
          </p>

          <form onSubmit={handleVerifyGate} className="flex flex-col gap-4">
            <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 text-2xl font-black text-purple-900">
              {gateChallenge.a} × {gateChallenge.b} = ?
            </div>

            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={gateAnswer}
              onChange={(e) => setGateAnswer(e.target.value)}
              placeholder="Nhập kết quả..."
              className="py-3 px-4 border-2 border-slate-300 rounded-2xl text-center text-xl font-bold focus:outline-hidden focus:border-purple-500"
              autoFocus
            />

            {gateError && (
              <p className="text-xs font-bold text-rose-500">{gateError}</p>
            )}

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  sound.cancelSpeech();
                  sound.playTap();
                  onBack();
                }}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-2xl transition cursor-pointer"
              >
                Quay Lại
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl transition shadow-md cursor-pointer"
              >
                Xác Nhận
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalAnswered = progress.stats.totalAnswered;
  const totalCorrect = progress.stats.totalCorrect;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 100;

  // Find area needing improvement
  let lowestAccuracyWorld = ALL_WORLDS[0];
  let lowestAccuracyRatio = 1;
  ALL_WORLDS.forEach((world) => {
    const cat = progress.stats.categoryAccuracy[world.id];
    if (cat && cat.answered >= 2) {
      const ratio = cat.correct / cat.answered;
      if (ratio < lowestAccuracyRatio) {
        lowestAccuracyRatio = ratio;
        lowestAccuracyWorld = world;
      }
    }
  });

  const hasVietnameseVoice = speechService.hasVietnameseVoice();
  const detectedVoiceName = speechService.getDetectedVoiceName();

  // Test cases for math verification in Teacher Mode
  const mathTestCases = [
    { a: 9, b: 2 },
    { a: 9, b: 5 },
    { a: 8, b: 3 },
    { a: 8, b: 5 },
    { a: 7, b: 4 },
    { a: 7, b: 6 },
    { a: 6, b: 5 },
    { a: 6, b: 7 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 max-w-3xl mx-auto flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              sound.cancelSpeech();
              sound.playTap();
              onBack();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 font-bold rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
            <span>Về Màn Hình Trẻ Em</span>
          </button>

          {/* Navigation tab switch */}
          <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTeacherTab('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTeacherTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tiến Độ & Cài Đặt
            </button>
            <button
              onClick={() => setActiveTeacherTab('teacher_mode')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                activeTeacherTab === 'teacher_mode'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Chế Độ Giáo Viên</span>
            </button>
          </div>
        </div>

        {activeTeacherTab === 'settings' ? (
          <>
            {/* Title */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Báo Cáo Tiến Độ Học Của Bé
              </h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                Theo dõi sự tiến bộ, thời gian học và kỹ năng toán học mầm non của trẻ.
              </p>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Clock className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-bold">Thời gian hôm nay</span>
                </div>
                <span className="text-2xl font-black text-slate-800">
                  {today(progress, deviceClock.day()).minutes} phút
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold">Số câu đã làm</span>
                </div>
                <span className="text-2xl font-black text-slate-800">
                  {totalAnswered} câu
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold">Tỉ lệ đúng</span>
                </div>
                <span className="text-2xl font-black text-emerald-600">
                  {overallAccuracy}%
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <span className="text-sm">⭐</span>
                  <span className="text-xs font-bold">Tổng sao tích lũy</span>
                </div>
                <span className="text-2xl font-black text-amber-500">
                  {progress.totalStars} ⭐
                </span>
              </div>
            </div>

            {/* Detailed Skill Breakdown */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs mb-6">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <span>📊 Đánh Giá Theo Từng Kỹ Năng</span>
              </h3>

              <div className="space-y-4">
                {ALL_WORLDS.map((world) => {
                  const cat = progress.stats.categoryAccuracy[world.id] || { answered: 0, correct: 0 };
                  const percent = cat.answered > 0 ? Math.round((cat.correct / cat.answered) * 100) : 0;

                  return (
                    <div key={world.id}>
                      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span>{world.icon}</span>
                          <span>{world.name}</span>
                        </span>
                        <span className="text-slate-500">
                          {cat.answered > 0 ? `${cat.correct}/${cat.answered} (${percent}%)` : 'Chưa làm'}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent >= 80 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-400' : 'bg-purple-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pedagogical Suggestions */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 mb-6">
              <div className="flex items-center gap-2 text-amber-900 font-black text-base mb-2">
                <HeartHandshake className="w-5 h-5 text-amber-600" />
                <span>Lời Khuyên Dành Cho Phụ Huynh</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed mb-3">
                {totalAnswered < 5
                  ? 'Bé đang bắt đầu làm quen với ứng dụng. Hãy cùng bé trải nghiệm từ Thế giới 1 (Bé tập đếm) để khơi gợi niềm vui và sự tự tin.'
                  : lowestAccuracyRatio < 0.75
                  ? `Bé nên luyện thêm kỹ năng "${lowestAccuracyWorld.name}". Ở nhà, phụ huynh có thể dùng các đồ vật thực tế như bánh kẹo, hoa quả hoặc khối lego để bé trực tiếp tách - gộp nhóm số.`
                  : 'Bé đang thể hiện sự tiến bộ rất đồng đều ở các dạng toán! Hãy tiếp tục động viên bé duy trì thói quen 10-15 phút mỗi ngày.'}
              </p>
              <div className="text-xs font-bold text-amber-800/80 italic">
                * Nguyên tắc mầm non: Không ép trẻ học thuộc vẹt hay nhớ máy móc. Hãy để trẻ chạm, đếm và nhìn thấy số lượng cụ thể.
              </div>
            </div>

            <LopsoAppsCard />

            {/* Daily play-time limit */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-500" />
                <span>Giới hạn thời gian chơi mỗi ngày</span>
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1 mb-3">
                Hết giờ, app sẽ nhắc bé nghỉ mắt. Chỉ người lớn mới cho chơi thêm được. Trẻ 4–6 tuổi nên chơi khoảng 15–30 phút mỗi ngày.
              </p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Giới hạn thời gian">
                {LIMIT_OPTIONS.map((minutes) => {
                  const active = today(progress, deviceClock.day()).limitMinutes === minutes;
                  return (
                    <button
                      key={minutes}
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        sound.playTap();
                        onUpdateProgress(setDailyLimit(progress, deviceClock.day(), minutes));
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-black border-2 transition cursor-pointer ${
                        active ? 'bg-sky-500 border-sky-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300'
                      }`}
                    >
                      {minutes === 0 ? 'Không giới hạn' : `${minutes} phút`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio & Speech Settings */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-600" />
                <span>🔊 Cài Đặt Âm Thanh & Giọng Đọc Tiếng Việt</span>
              </h3>

              {/* Speech Voice Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <span className="text-sm font-black text-slate-800 block">
                    Giọng đọc tiếng Việt tự động
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Đọc to câu hỏi và lời khích lệ cho trẻ 4–6 tuổi
                  </span>
                </div>
                <button
                  onClick={handleToggleSpeech}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    progress.speechEnabled
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {progress.speechEnabled ? 'Đang Bật' : 'Đang Tắt'}
                </button>
              </div>

              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div>
                  <span className="text-sm font-black text-slate-800 block">
                    Hiệu ứng âm thanh & nhạc trò chơi
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Tiếng ting ting, còi tàu, pháo hoa khi trẻ làm đúng
                  </span>
                </div>
                <button
                  onClick={handleToggleSoundFX}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    (progress.soundEffectsEnabled ?? progress.soundEnabled)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {(progress.soundEffectsEnabled ?? progress.soundEnabled) ? 'Đang Bật' : 'Đang Tắt'}
                </button>
              </div>

              {/* Test Voice Button */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    Giọng đọc phát hiện: {detectedVoiceName || 'Chưa có giọng tiếng Việt trên thiết bị'}
                  </span>
                  {!hasVietnameseVoice && (
                    <span className="text-[11px] text-amber-700 font-bold block mt-1">
                      ⚠️ Thiết bị này chưa có giọng đọc tiếng Việt. Một số thiết bị hoặc trình duyệt có thể cần cài thêm giọng tiếng Việt.
                    </span>
                  )}
                </div>

                <button
                  onClick={handleTestSpeech}
                  disabled={testSpeechPlaying || !voiceAvailability.canRead}
                  title={voiceAvailability.canRead ? 'Thử giọng tiếng Việt' : voiceAvailability.message}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl transition flex items-center gap-2 self-start sm:self-auto shadow-sm cursor-pointer"
                >
                  <Volume2 className={`w-4 h-4 ${testSpeechPlaying ? 'animate-bounce' : ''}`} />
                  <span>{testSpeechPlaying ? 'Đang Đọc...' : '🔊 Thử Giọng Đọc'}</span>
                </button>
              </div>
            </div>

            {/* Management & Testing Tools */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
              <h3 className="text-base font-black text-slate-800 mb-3">
                ⚙️ Cài Đặt Khóa Bài Học
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
                <div>
                  <span className="text-sm font-black text-slate-800 block">
                    Mở khóa tất cả bài học để kiểm thử
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Cho phép vào thẳng các thế giới và trò chơi mà không cần đủ sao
                  </span>
                </div>
                <button
                  onClick={handleToggleUnlockAll}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer ${
                    progress.allUnlockedOverride
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>{progress.allUnlockedOverride ? 'Đang Mở Khóa Tất Cả' : 'Mở Khóa'}</span>
                </button>
              </div>
            </div>

            {/* DỮ LIỆU HỌC TẬP (PHỤ HUYNH) */}
            <div className="bg-white rounded-3xl p-5 border-2 border-rose-200 shadow-xs mb-6">
              <h3 className="text-base font-black text-rose-900 mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <span>💾 DỮ LIỆU HỌC TẬP</span>
              </h3>
              <p className="text-xs text-slate-600 font-semibold mb-4 leading-relaxed">
                Quản lý tiến trình học tập của bé. Khi cần bắt đầu một hành trình mới hoàn toàn, bạn có thể xóa toàn bộ dữ liệu học tập đã lưu.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-rose-100">
                <div>
                  <span className="text-sm font-black text-rose-800 block">
                    Xóa toàn bộ tiến độ học tập
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Đưa sao, XP, cấp độ và lịch sử màn chơi về trạng thái ban đầu (0 sao, Thế giới 1)
                  </span>
                </div>
                <button
                  onClick={handleOpenResetModal}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-black transition flex items-center gap-2 self-start sm:self-auto shadow-sm hover:shadow-md cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>🗑️ XÓA TOÀN BỘ TIẾN ĐỘ</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* TEACHER MODE PANEL */
          <div className="space-y-6 animate-fade-in">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 text-purple-900 font-black text-lg mb-1">
                <GraduationCap className="w-6 h-6 text-purple-700" />
                <span>Chế Độ Giáo Viên & Kiểm Thử Sư Phạm</span>
              </div>
              <p className="text-xs font-semibold text-purple-800 leading-relaxed">
                Công cụ dành cho giáo viên mầm non và phụ huynh kiểm tra thuật toán toán học, nghe thử giọng đọc và vào thẳng bất kỳ bài giảng nào.
              </p>
            </div>

            {/* VOICE STATUS (Bảng điều khiển & gỡ lỗi giọng nói tiếng Việt) */}
            <div className="bg-white rounded-3xl p-5 border-2 border-purple-300 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-black text-purple-900 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                  <span>🔊 BẢNG ĐIỀU KHIỂN & VOICE STATUS</span>
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
                  Locale: vi-VN
                </span>
              </div>

              {/* Status Details & Debug Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-xs font-bold text-slate-700 bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Current Provider:</span>
                  <span className="font-black text-purple-900 text-sm">
                    {speechService.getStatus().activeEngine}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Current Speech ID:</span>
                  <span className="font-black text-indigo-700 text-xs truncate block" title={speechService.getStatus().currentSpeechId || 'None'}>
                    {speechService.getStatus().currentSpeechId || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Current Generation:</span>
                  <span className="font-black text-indigo-900 text-sm">
                    #{speechService.getStatus().currentGeneration}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">isSpeaking:</span>
                  <span className={`font-black text-sm ${speechService.getStatus().isSpeaking ? 'text-amber-600 animate-pulse' : 'text-slate-600'}`}>
                    {speechService.getStatus().isSpeaking ? '🔊 Đang phát (true)' : 'Đang nghỉ (false)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Speech Requests:</span>
                  <span className="font-black text-slate-800 text-sm">
                    {speechService.getStatus().requestCount} lần
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Speech Plays:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {speechService.getStatus().playCount} lần
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Deduped Requests:</span>
                  <span className="font-black text-amber-700 text-sm">
                    {speechService.getStatus().dedupedCount} lần
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Cancelled Requests:</span>
                  <span className="font-black text-rose-700 text-sm">
                    {speechService.getStatus().cancelledCount} lần
                  </span>
                </div>
              </div>

              {/* 5 Required Voice Tests */}
              <div className="mb-4">
                <div className="text-xs font-black text-slate-800 mb-2">
                  🎯 5 BÀI TEST PHÁT ÂM TIẾNG VIỆT CHUẨN:
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 1, label: 'TEST 1', text: 'Xin chào! Chúng mình cùng học toán nhé.' },
                    { id: 2, label: 'TEST 2', text: 'Một cộng hai bằng ba.' },
                    { id: 3, label: 'TEST 3', text: 'Tám cộng năm bằng bao nhiêu?' },
                    { id: 4, label: 'TEST 4', text: 'Bạn số một cần thêm mấy để tạo thành mười?' },
                    { id: 5, label: 'TEST 5', text: 'Chính xác! Con giỏi lắm!' },
                  ].map((testItem) => (
                    <button
                      key={testItem.id}
                      onClick={() => {
                        sound.playTap();
                        speechService.speakVietnamese(testItem.text);
                      }}
                      className="p-3 bg-white hover:bg-purple-50 active:scale-98 border-2 border-slate-200 hover:border-purple-300 rounded-2xl text-left transition flex items-center justify-between shadow-xs cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-900 text-xs font-black shrink-0">
                          {testItem.label}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                          “{testItem.text}”
                        </span>
                      </div>
                      <Volume2 className="w-4 h-4 text-purple-600 group-hover:scale-110 transition shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Instructions for Parent / Teacher */}
              <p className="text-[11px] text-slate-500 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                💡 Ứng dụng đọc bằng giọng tiếng Việt có sẵn trên thiết bị, không cần mạng và không tốn phí. Nếu không nghe thấy, hãy cài giọng tiếng Việt trong phần Cài đặt của máy (iPad: Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Việt).
              </p>
            </div>

            {/* DỮ LIỆU HỌC TẬP & KIỂM THỬ (TEACHER RESET TEST DATA) */}
            <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-black text-amber-900 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  <span>💾 DỮ LIỆU HỌC TẬP & KIỂM THỬ</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black">
                  Teacher Mode
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold mb-4 leading-relaxed">
                Cho phép giáo viên nhanh chóng đưa ứng dụng về trạng thái mặc định: Thế giới 1, Level 1, 0 XP, 0 Sao để bắt đầu kiểm thử lại quy trình từ đầu.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-100">
                <span className="text-xs font-bold text-slate-700">
                  Đặt lại toàn bộ tiến độ chơi thử của thiết bị này:
                </span>
                <button
                  onClick={handleOpenResetModal}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>🗑️ RESET TEST DATA</span>
                </button>
              </div>
            </div>

            {/* Direct Level Jumper */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                <span>🚀 Vào Trực Tiếp Từng Thế Giới Bài Học</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ALL_WORLDS.map((w, idx) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      sound.playTap();
                      if (onSelectDirectWorld) {
                        onSelectDirectWorld(w.id);
                      }
                    }}
                    className="p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-2xl text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="text-xs text-purple-700 font-black block">
                        Level {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 block">
                        {w.name}
                      </span>
                    </div>
                    <Play className="w-4 h-4 text-purple-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Math Logic Verification: Phép cộng vượt 10 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-base font-black text-slate-800 mb-2 flex items-center gap-2">
                <span>📐 Kiểm Tra Chiến Lược: Tạo 10 Trước</span>
              </h3>
              <p className="text-xs text-slate-500 font-bold mb-4">
                Bảng phân tích bước giải toán bản chất (Tách số bù 10 + số dư = kết quả) cho các cặp số chuẩn:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mathTestCases.map(({ a, b }) => {
                  const verified = verifyMake10Strategy(a, b);
                  return (
                    <div
                      key={`${a}+${b}`}
                      className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-black text-slate-900 block">
                          {a} + {b} = {verified.answer}
                        </span>
                        <span className="text-[11px] font-bold text-amber-800 block">
                          Tách {b} thành {verified.needToMake10} và {verified.remainder} ➡️ 10 + {verified.remainder} = {verified.answer}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          sound.speak(
                            `Số ${a} cần thêm ${verified.needToMake10} để thành mười. Tách ${b} thành ${verified.needToMake10} và ${verified.remainder}. Ta có mười cộng ${verified.remainder} bằng ${verified.answer}!`
                          );
                        }}
                        className="p-2 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl transition cursor-pointer"
                        title="Nghe câu giải thích"
                        aria-label="Nghe giải thích"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audio Effects Tester */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-base font-black text-slate-800 mb-3">
                🎵 Kiểm Tra Hiệu Ứng Âm Thanh Web Audio API
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => sound.playSuccess()}
                  className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  🎉 Tiếng Đúng (Arpeggio)
                </button>
                <button
                  onClick={() => sound.playGentleRetry()}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  🎈 Tiếng Thử Lại (Boing)
                </button>
                <button
                  onClick={() => sound.playStar()}
                  className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  ⭐ Tiếng Sao (Chime)
                </button>
                <button
                  onClick={() => sound.playPop()}
                  className="px-3 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  🫧 Tiếng Bong Bóng Nổ
                </button>
                <button
                  onClick={() => sound.playChomp()}
                  className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  🥕 Tiếng Nhai Cà Rốt
                </button>
                <button
                  onClick={() => sound.playTrainToot()}
                  className="px-3 py-2 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  🚂 Tiếng Còi Tàu
                </button>
                <button
                  onClick={() => sound.playFanfare()}
                  className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  🎺 Tiếng Khúc Khải Hoàn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs font-bold text-slate-400 py-2">
        Bé Vui Học Cộng • Bản quyền ứng dụng toán mầm non
      </div>

      {/* CONFIRMATION MODAL CHO XÓA TIẾN ĐỘ */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border-2 border-rose-300 shadow-2xl text-center transform transition-all">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-rose-200 shadow-xs">
              <Trash2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 leading-tight">
              Bạn có chắc muốn xóa toàn bộ tiến độ học tập?
            </h3>
            
            <p className="text-sm font-bold text-slate-600 mb-4 leading-relaxed">
              Hành động này sẽ đưa trò chơi về trạng thái ban đầu.
            </p>

            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 mb-6 text-left text-xs font-bold text-slate-700 space-y-1.5">
              <div className="text-rose-900 font-black mb-1">Dữ liệu sẽ được thiết lập lại:</div>
              <div className="flex items-center gap-2 text-rose-800">
                <span>•</span>
                <span>Điểm sao & kinh nghiệm: <strong>0 ⭐ & 0 XP</strong></span>
              </div>
              <div className="flex items-center gap-2 text-rose-800">
                <span>•</span>
                <span>Vị trí của bé: <strong>Thế giới 1 – Bài 1</strong></span>
              </div>
              <div className="flex items-center gap-2 text-rose-800">
                <span>•</span>
                <span>Lịch sử màn chơi, rương kho báu và bộ sưu tập đã mở</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-2 font-semibold border-t border-rose-100">
                ✓ Cài đặt âm thanh và giọng đọc tiếng Việt của bạn vẫn được giữ nguyên.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setIsResetConfirmModalOpen(false);
                }}
                className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl transition cursor-pointer text-sm"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black rounded-2xl transition shadow-md hover:shadow-lg cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>XÓA VÀ CHƠI LẠI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO RESET THÀNH CÔNG */}
      {resetToastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border-2 border-white">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>{resetToastMessage}</span>
        </div>
      )}
    </div>
  );
};
