import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Gift,
  HelpCircle,
  Heart,
  Map,
  Play,
  Rocket,
  Sparkles,
  TrainFront,
  Volume2,
} from "lucide-react";
import type { Question, UserProgress } from "../types/math";
import type { TaskId } from "../domain/retention/types";
import { DailyController } from "../domain/retention/dailyController";
import { STICKERS } from "../data/stickers";
import { ALL_PLUSH_FRIENDS } from "../data/plushFriends";
import { CompanionRenderer } from "../components/plush/CompanionRenderer";
import { resolveCompanion, type CompanionReaction } from "../utils/companion";

import { ItemVisual } from "../components/ItemVisual";
import { VisualCounters } from "../components/VisualCounters";
import { GardenScenerySVG } from "../utils/worldAssets";
import { sound } from "../utils/sound";
import { useSpeechAvailability } from '../services/speech/useSpeechAvailability';
import "./dailyAdventure.css";

const tasks = [
  { id: "learn", name: "Học một chút", Icon: BookOpen },
  { id: "play", name: "Chơi một chút", Icon: TrainFront },
  { id: "help", name: "Giúp bạn nhỏ", Icon: Heart },
] as const;
function Friend({id,happy=false,reaction}:{id:string;happy?:boolean;reaction?:CompanionReaction}){return <CompanionRenderer companionId={id} size={140} showBadge={false} canSpeakOnClick={false} reaction={reaction??(happy?'CELEBRATE':'IDLE')}/>;}
export function StickerArt({ id }: { id: string }) {
  if (id === "sticker_rainbow")
    return (
      <svg viewBox="0 0 120 100" aria-hidden="true">
        <path
          d="M15 80a45 45 0 0 1 90 0"
          fill="none"
          stroke="#fb7185"
          strokeWidth="14"
        />
        <path
          d="M29 80a31 31 0 0 1 62 0"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="14"
        />
        <path
          d="M43 80a17 17 0 0 1 34 0"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="14"
        />
        <ellipse cx="20" cy="82" rx="18" ry="11" fill="white" />
        <ellipse cx="100" cy="82" rx="18" ry="11" fill="white" />
      </svg>
    );
  if (id === "sticker_rocket")
    return (
      <Rocket size={90} fill="#bae6fd" color="#0369a1" strokeWidth={1.5} />
    );
  return (
    <ItemVisual
      theme={
        id === "sticker_bunny"
          ? "rabbit"
          : id === "sticker_flower"
            ? "flower"
            : id === "sticker_train"
              ? "train"
              : "apple"
      }
      size="xl"
    />
  );
}
function Dots({ count, total }: { count: number; total: number }) {
  return (
    <div className="daily-dots" aria-label={`${count} trên ${total} đã xong`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < count ? "done" : ""}>
          {i < count ? <Check size={18} /> : i + 1}
        </span>
      ))}
    </div>
  );
}
function Pictures({ q }: { q: Question }) {
  if (q.type === "count")
    return (
      <VisualCounters
        key={q.id}
        count={q.operandA}
        theme={q.itemTheme}
        size="md"
      />
    );
  const a = q.type === "split" ? q.splitA! : q.operandA;
  const b =
    q.type === "make_10"
      ? 10 - q.operandA
      : q.type === "split"
        ? q.targetSplit! - a
        : q.operandB!;
  return (
    <div className="daily-groups">
      <div>
        <VisualCounters
          key={`${q.id}:a`}
          count={a}
          theme={q.itemTheme}
          size="sm"
        />
        <strong>{a}</strong>
      </div>
      <b>{q.type === "split" ? "+" : "+"}</b>
      <div>
        <VisualCounters
          key={`${q.id}:b`}
          count={b}
          theme={q.itemTheme}
          size="sm"
        />
        <strong>{q.type === "make_10" || q.type === "split" ? "?" : b}</strong>
      </div>
      <b>
        = {q.type === "make_10" ? 10 : q.type === "split" ? q.targetSplit : "?"}
      </b>
    </div>
  );
}

export default function DailyAdventureScreen({
  progress,
  onSaved,
  onExit,
}: {
  progress: UserProgress;
  onSaved: (p: UserProgress) => void;
  onExit: () => void;
}) {
  const [controller] = useState(() => new DailyController(progress, onSaved));
  const voiceAvailability = useSpeechAvailability(progress.speechEnabled);
  const [view, setView] = useState<
    "map" | "task" | "chest" | "reveal" | "finish" | "stickers"
  >("map");
  const [, refresh] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hint, setHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const safe = (work: () => void) => {
    try {
      work();
      refresh((n) => n + 1);
      return true;
    } catch {
      setError(
        "Chuyến đi chưa lưu được. Con hãy nhờ người lớn tải lại trang nhé.",
      );
      return false;
    }
  };
  useEffect(() => {
    safe(() => {
      controller.enter();
      setReady(true);
      if (controller.adventure.status === "claimed") setView("finish");
      else if (!controller.task) setView("chest");
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      sound.cancelSpeech();
    };
  }, [controller]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) {
        if (!controller.progress.retention?.dailyAdventure) return;
        sound.cancelSpeech();
        if (timer.current) clearTimeout(timer.current);
        locked.current = false;
        setBusy(false);
        safe(() => controller.pause());
        setView(
          controller.adventure.status === "claimed"
            ? "finish"
            : controller.task
              ? "map"
              : "chest",
        );
      }
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, [controller]);
  const displayed = useRef<{ q: Question | null; task: TaskId | null }>({
    q: null,
    task: null,
  });
  if (!busy)
    displayed.current = {
      q: ready && view === "task" ? controller.question() : null,
      task: ready ? controller.task : null,
    };
  const { q, task } = displayed.current;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view, q?.id]);
  const friendId = ready ? resolveCompanion(controller.progress,controller.adventure.companionId) : "bunny";
  const friendName =
    ALL_PLUSH_FRIENDS.find((f) => f.id === friendId)?.name ?? "Bạn nhỏ";
  const story =
    task === "help"
      ? `Bạn ${friendName} đang chuẩn bị giỏ quà. Con giúp bạn nhé!`
      : task === "play"
        ? "Chọn toa tàu đúng để đưa quà về ga!"
        : "Chúng mình cùng khám phá nhé!";
  useEffect(() => {
    if (!q || busy) return;
    setFeedback("");
    setHint(false);
    return sound.speakQuestion(`${story} ${q.prompt}`, 350, {
      questionId: q.id,
    });
  }, [q?.id, view]);
  const open = (id: TaskId) =>
    safe(() => {
      if (controller.open(id)) {
        sound.initCtx();
        sound.cancelSpeech();
        locked.current = false;
        setBusy(false);
        setView("task");
      }
    });
  const answer = (value: number) => {
    if (!q || locked.current || error) return;
    locked.current = true;
    safe(() => {
      const result = controller.answer(q.id, value);
      if (result === "retry") {
        locked.current = false;
        setFeedback("Mình cùng thử lại nhé!");
        setHint(true);
        sound.playGentleRetry();
        sound.speak("Mình cùng thử lại nhé!", {
          eventType: "ANSWER_WRONG",
          questionId: q.id,
        });
        return;
      }
      if (result === "ignored") {
        locked.current = false;
        return;
      }
      setFeedback("Đúng rồi! Con giỏi quá!");
      setBusy(true);
      sound.playSuccess();
      sound.speak("Đúng rồi! Con giỏi quá!", {
        eventType: "ANSWER_CORRECT",
        questionId: q.id,
      });
      timer.current = setTimeout(() => {
        locked.current = false;
        setBusy(false);
        if (controller.task !== task)
          setView(controller.task ? "map" : "chest");
        refresh((n) => n + 1);
      }, 1100);
    });
  };
  const exit = () => {
    if (timer.current) clearTimeout(timer.current);
    sound.cancelSpeech();
    if (safe(() => controller.pause())) onExit();
  };
  const claim = () => {
    if (locked.current || error) return;
    locked.current = true;
    if (safe(() => controller.claim())) {
      setView("reveal");
      setBusy(true);
      sound.cancelSpeech();
      timer.current = setTimeout(() => {
        setBusy(false);
        sound.playChestOpen();
        sound.speak("Một sticker dành cho chuyến đi của con!", {
          eventType: "UI_CLICK",
        });
      }, 700);
    }
  };
  if (!ready)
    return (
      <div className="daily-adventure">
        <p role="alert">{error || "Đang chuẩn bị chuyến đi…"}</p>
        <button onClick={onExit}>Về bản đồ</button>
      </div>
    );
  const a = controller.adventure;
  const sticker = STICKERS.find((s) => s.id === a.rewardStickerId)!;
  const partial =
    a.taskProgress.learn > 0 ||
    a.taskProgress.help > 0 ||
    !!controller.progress.retention!.miniGameSession;
  return (
    <div className="daily-adventure">
      <div className="daily-scenery" aria-hidden="true">
        <GardenScenerySVG />
      </div>
      <header className="daily-header">
        <button onClick={exit} aria-label="Về bản đồ">
          <ArrowLeft size={24} />
        </button>
        <span>Chuyến Phiêu Lưu Hôm Nay</span>
        <span aria-hidden="true">
          <Sparkles />
        </span>
      </header>
      {error && (
        <p className="daily-error" role="alert">
          {error}
        </p>
      )}
      <main className="daily-panel">
        {view === "map" && (
          <>
            <div className="daily-intro">
              <Friend id={friendId} happy={partial} />
              <div>
                <p className="daily-eyebrow">MỘT CHUYẾN ĐI NHỎ · 5–10 PHÚT</p>
                <h1>{partial ? "Mình đi tiếp nhé!" : "Cùng bạn khám phá!"}</h1>
                <p>Học một chút, chơi một chút, giúp bạn nhỏ.</p>
              </div>
            </div>
            <div className="daily-path" aria-label="Đường phiêu lưu">
              {tasks.map(({ id, name, Icon }, i) => {
                const done = a.completedTaskIds.includes(id);
                const active = task === id;
                return (
                  <div className="daily-stop" key={id}>
                    <button
                      disabled={!active || !!error}
                      onClick={() => open(id)}
                      className={`daily-node ${done ? "done" : active ? "active" : "waiting"}`}
                      aria-label={`${name}${done ? ", đã xong" : active ? ", bắt đầu" : ", sau chặng trước"}`}
                    >
                      <Icon size={38} />
                      {done && (
                        <span className="daily-check">
                          <Check size={22} />
                        </span>
                      )}
                    </button>
                    <strong>{name}</strong>
                    <small>
                      {done
                        ? "Đã xong"
                        : active
                          ? "Con đang ở đây"
                          : `Sau chặng ${i}`}
                    </small>
                    {active && (
                      <div className="daily-friend-marker">
                        <Friend id={friendId} />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="daily-stop">
                <div className="daily-node waiting">
                  <Gift size={40} />
                </div>
                <strong>Sticker của con</strong>
                <small>{sticker.name}</small>
              </div>
            </div>
            <button
              className="daily-primary"
              disabled={!!error}
              onClick={() => task && open(task)}
            >
              <Play size={24} />
              {partial ? "Tiếp tục chuyến đi" : "Đi phiêu lưu!"}
            </button>
          </>
        )}
        {view === "task" && q && (
          <>
            <div className="daily-task-top">
              <button
                onClick={() => {
                  if (timer.current) clearTimeout(timer.current);
                  locked.current = false;
                  setBusy(false);
                  sound.cancelSpeech();
                  if (safe(() => controller.pause()))
                    setView(controller.task ? "map" : "chest");
                }}
              >
                <Map size={22} />
                Chuyến đi
              </button>
              <Dots
                count={
                  task === "play"
                    ? controller.progress.retention!.miniGameSession!
                        .completedRounds.length
                    : a.taskProgress[task!]
                }
                total={task === "learn" ? 5 : task === "play" ? 3 : 2}
              />
              <button
                aria-label={voiceAvailability.canRead ? 'Nghe lại câu hỏi' : voiceAvailability.message}
                title={voiceAvailability.canRead ? 'Nghe lại câu hỏi' : voiceAvailability.message}
                disabled={busy || !voiceAvailability.canRead}
                onClick={() =>
                  sound.replayQuestion(`${story} ${q.prompt}`, q.id)
                }
              >
                <Volume2 />
              </button>
            </div>
            {!voiceAvailability.canRead && <p role="status" className="daily-help">{voiceAvailability.message}</p>}
            <div className="daily-task-scene">
              <Friend key={q?.id} id={friendId} reaction={busy ? (controller.task !== task ? "CELEBRATE" : "HAPPY") : feedback ? "ENCOURAGE" : hint ? "THINKING" : "IDLE"} />
              <div>
                <p className="daily-eyebrow">
                  {tasks.find((t) => t.id === task)?.name}
                </p>
                <p>{story}</p>
                <h1>{q.prompt}</h1>
              </div>
              {task === "play" && (
                <TrainFront className="daily-train" size={68} />
              )}
            </div>
            <div className="daily-pictures">
              <Pictures q={q} />
            </div>
            <div className="daily-answers">
              {q.choices.map((value) => (
                <button
                  key={`${q.id}:${value}`}
                  disabled={busy || !!error}
                  onClick={() => answer(value)}
                  aria-label={`Chọn ${value}`}
                >
                  {task === "play" && <TrainFront size={30} />}
                  <span>{value}</span>
                </button>
              ))}
            </div>
            <p className="daily-feedback" role="status">
              {feedback || "Chạm vào câu trả lời của con."}
            </p>
            <button
              className="daily-hint"
              disabled={busy}
              onClick={() => {
                setFeedback("");
                setHint(true);
                sound.speak(
                  q.hintExplanation ?? "Con chạm từng hình để đếm nhé!",
                  {
                    eventType: "UI_CLICK",
                    questionId: q.id,
                    forceReplay: true,
                  },
                );
              }}
            >
              <HelpCircle size={22} />
              Bạn giúp con
            </button>
            {hint && <p className="daily-help">{q.hintExplanation}</p>}
          </>
        )}
        {(view === "chest" || view === "reveal") && (
          <div className="daily-celebration">
            <Friend id={friendId} happy />
            <h1>Con đã giúp bạn rồi!</h1>
            <p>
              Trong rương có sticker <strong>{sticker.name}</strong> dành cho
              con.
            </p>
            {view === "chest" || busy ? (
              <div className={`daily-chest ${busy ? "anticipation" : ""}`}>
                <Gift size={116} strokeWidth={1.6} />
              </div>
            ) : (
              <div className="daily-sticker-reveal">
                <span className="daily-sparkles" aria-hidden="true">
                  ✦ · ✧ · ✦
                </span>
                <StickerArt id={sticker.id} />
                <h2>{sticker.name}</h2>
                <p>{sticker.description}</p>
              </div>
            )}
            {view === "chest" ? (
              <button
                className="daily-primary"
                disabled={!!error}
                onClick={claim}
              >
                Mở rương sticker
              </button>
            ) : (
              <button
                className="daily-primary"
                disabled={busy}
                onClick={() => {
                  sound.cancelSpeech();
                  setView("finish");
                }}
              >
                Xong!
              </button>
            )}
          </div>
        )}
        {view === "finish" && (
          <div className="daily-celebration">
            <Friend id={friendId} happy />
            <h1>Hôm nay con đã hoàn thành!</h1>
            <p>Con đã học, chơi và giúp bạn nhỏ.</p>
            <div className="daily-summary">
              {tasks.map(({ id, name, Icon }) => (
                <span key={id}>
                  <Icon />
                  <Check size={18} />
                  {name}
                </span>
              ))}
            </div>
            <div className="daily-earned">
              <StickerArt id={sticker.id} />
              <strong>{sticker.name}</strong>
            </div>
            <p>
              Con đã khám phá trong{" "}
              {controller.progress.retention!.adventureDays.length} ngày.
            </p>
            <p className="daily-rest">
              Giờ con có thể nghỉ ngơi. Bạn nhỏ vui vì được chơi cùng con!
            </p>
            <button className="daily-primary" onClick={exit}>
              Về bản đồ
            </button>
            <button
              className="daily-secondary"
              onClick={() => setView("stickers")}
            >
              Xem sticker
            </button>
          </div>
        )}
        {view === "stickers" && (
          <div className="daily-celebration">
            <h1>Sticker của con</h1>
            <div className="daily-sticker-grid">
              {STICKERS.filter((s) =>
                controller.progress.retention!.stickers.includes(s.id),
              ).map((s) => (
                <article key={s.id}>
                  <StickerArt id={s.id} />
                  <h2>{s.name}</h2>
                  <p>{s.description}</p>
                </article>
              ))}
            </div>
            <button className="daily-primary" onClick={() => setView("finish")}>
              Xong
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
