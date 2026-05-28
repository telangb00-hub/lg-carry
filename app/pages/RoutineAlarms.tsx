import { useEffect, useState } from "react";
import { AlarmClock, BedDouble, Plus, Trash2 } from "lucide-react";
import { useCarry, type CarryMode } from "../context/CarryContext";
import { defaultModeShortcuts, type ModeShortcut, type ShortcutIcon } from "../lib/modeShortcuts";
import { fetchHomeShortcuts } from "../services/carryCommandBridge";

interface RoutineAlarm {
  id: string;
  name: string;
  time: string;
  days: string;
  mode: CarryMode;
  shortcutId?: string;
  enabled: boolean;
}

const storageKey = "carry-routine-alarms";
const defaultAlarms: RoutineAlarm[] = [
  { id: "night", name: "취침 준비", time: "23:00", days: "매일", mode: "sleep", shortcutId: "sleep", enabled: true },
  { id: "morning", name: "아침 주방", time: "07:30", days: "평일", mode: "kitchen", shortcutId: "kitchen", enabled: false },
];

export function RoutineAlarms() {
  const { callCarry, callShortcutMode, addLogEntry } = useCarry();
  const [alarms, setAlarms] = useState<RoutineAlarm[]>(() => readAlarms());
  const [modeShortcuts, setModeShortcuts] = useState<ModeShortcut[]>(defaultModeShortcuts.filter((item) => item.mode !== "home"));
  const [name, setName] = useState("");
  const [time, setTime] = useState("20:30");
  const [days, setDays] = useState("매일");
  const [shortcutId, setShortcutId] = useState("living");

  useEffect(() => {
    void fetchHomeShortcuts().then((items) => {
      const next = items
        .filter((item) => item.actionMode !== "home")
        .map((item) => ({
          id: item.id,
          label: item.label,
          mode: item.actionMode,
          icon: getIconForMode(item.actionMode),
          drawer: normalizeDrawer(item.drawerNumber),
          lightName: item.lightName,
          lightColor: item.lightColor,
          songName: item.music,
          comment: item.comment,
          emoji: item.emoji,
          visibleOnHome: item.visibleOnHome,
        }));
      if (next.length > 0) {
        setModeShortcuts(next);
        setShortcutId((current) => (next.some((item) => item.id === current) ? current : next[0].id));
      }
    });
  }, []);

  const updateAlarms = (next: RoutineAlarm[]) => {
    setAlarms(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const addAlarm = () => {
    const trimmed = name.trim();
    const shortcut = modeShortcuts.find((item) => item.id === shortcutId) ?? modeShortcuts[0];
    if (!trimmed || !shortcut || shortcut.mode === "home") return;
    updateAlarms([{ id: Date.now().toString(), name: trimmed, time, days, mode: shortcut.mode, shortcutId: shortcut.id, enabled: true }, ...alarms]);
    addLogEntry(`${trimmed} 루틴을 만들었어요`);
    setName("");
  };

  const runAlarm = (alarm: RoutineAlarm) => {
    const shortcut = modeShortcuts.find((item) => item.id === alarm.shortcutId);
    if (shortcut && shortcut.mode !== "home") {
      callShortcutMode(shortcut.mode, shortcut);
      return;
    }
    callCarry(alarm.mode);
  };

  return (
    <div className="carry-page alarm-page">
      <section className="alarm-create-card">
        <div className="setting-section-head">
          <div>
            <span>Alarm Style</span>
            <h2>새 루틴</h2>
          </div>
          <AlarmClock size={22} />
        </div>
        <div className="routine-form-grid">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="예: 퇴근 후 휴식" />
          <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          <select value={days} onChange={(event) => setDays(event.target.value)}>
            <option>매일</option>
            <option>평일</option>
            <option>주말</option>
            <option>월 · 수 · 금</option>
          </select>
          <select value={shortcutId} onChange={(event) => setShortcutId(event.target.value)}>
            {modeShortcuts.map((shortcut) => (
              <option key={shortcut.id} value={shortcut.id}>
                {shortcut.label}
              </option>
            ))}
          </select>
          <button onClick={addAlarm}>
            <Plus size={18} />
            루틴 추가
          </button>
        </div>
      </section>

      <section className="alarm-list">
        {alarms.map((alarm) => (
          <article className={`alarm-card${alarm.enabled ? " enabled" : ""}`} key={alarm.id}>
            <button
              className="alarm-toggle"
              onClick={() =>
                updateAlarms(alarms.map((item) => (item.id === alarm.id ? { ...item, enabled: !item.enabled } : item)))
              }
              aria-label="루틴 켜기 끄기"
            >
              <span />
            </button>
            <div>
              <strong>{alarm.time}</strong>
              <span>{alarm.name}</span>
              <p>
                {alarm.days} · {getAlarmShortcutLabel(alarm, modeShortcuts)}
              </p>
            </div>
            <button className="alarm-run" onClick={() => runAlarm(alarm)}>
              <BedDouble size={17} />
            </button>
            <button className="alarm-delete" onClick={() => updateAlarms(alarms.filter((item) => item.id !== alarm.id))}>
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

function readAlarms() {
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return defaultAlarms;
  try {
    return JSON.parse(saved) as RoutineAlarm[];
  } catch {
    return defaultAlarms;
  }
}

function getAlarmShortcutLabel(alarm: RoutineAlarm, shortcuts: ModeShortcut[]) {
  return shortcuts.find((shortcut) => shortcut.id === alarm.shortcutId)?.label ?? getModeLabel(alarm.mode);
}

function getModeLabel(mode: CarryMode) {
  if (mode === "sleep") return "취침";
  if (mode === "kitchen") return "주방";
  if (mode === "outing") return "외출";
  return "거실";
}

function normalizeDrawer(drawer?: number | null): 1 | 2 | 3 | null {
  if (drawer === 1 || drawer === 2 || drawer === 3) return drawer;
  return null;
}

function getIconForMode(mode: CarryMode | "home"): ShortcutIcon {
  if (mode === "sleep") return "bed";
  if (mode === "kitchen") return "kitchen";
  if (mode === "outing") return "outing";
  if (mode === "home") return "home";
  return "sofa";
}
