import { useState } from "react";
import { AlarmClock, BedDouble, Plus, Trash2 } from "lucide-react";
import { useCarry, type CarryMode } from "../context/CarryContext";

interface RoutineAlarm {
  id: string;
  name: string;
  time: string;
  days: string;
  mode: CarryMode;
  enabled: boolean;
}

const storageKey = "carry-routine-alarms";
const defaultAlarms: RoutineAlarm[] = [
  { id: "night", name: "취침 준비", time: "23:00", days: "매일", mode: "sleep", enabled: true },
  { id: "morning", name: "아침 주방", time: "07:30", days: "평일", mode: "kitchen", enabled: false },
];

export function RoutineAlarms() {
  const { callCarry, addLogEntry } = useCarry();
  const [alarms, setAlarms] = useState<RoutineAlarm[]>(() => readAlarms());
  const [name, setName] = useState("");
  const [time, setTime] = useState("20:30");
  const [days, setDays] = useState("매일");
  const [mode, setMode] = useState<CarryMode>("living");

  const updateAlarms = (next: RoutineAlarm[]) => {
    setAlarms(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const addAlarm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateAlarms([{ id: Date.now().toString(), name: trimmed, time, days, mode, enabled: true }, ...alarms]);
    addLogEntry(`${trimmed} 루틴을 만들었어요`);
    setName("");
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
          <select value={mode} onChange={(event) => setMode(event.target.value as CarryMode)}>
            <option value="sleep">취침 모드</option>
            <option value="kitchen">주방 모드</option>
            <option value="living">거실 모드</option>
            <option value="outing">외출 모드</option>
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
              <p>{alarm.days} · {getModeLabel(alarm.mode)}</p>
            </div>
            <button className="alarm-run" onClick={() => callCarry(alarm.mode)}>
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

function getModeLabel(mode: CarryMode) {
  if (mode === "sleep") return "취침";
  if (mode === "kitchen") return "주방";
  if (mode === "outing") return "외출";
  return "거실";
}
