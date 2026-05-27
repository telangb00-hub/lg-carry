import { useState } from "react";
import { BedDouble, DoorOpen, GripVertical, Home, Plus, Sofa, Trash2, UtensilsCrossed } from "lucide-react";
import type { CarryMode } from "../context/CarryContext";
import { readModeShortcuts, saveModeShortcuts, type ModeShortcut, type ShortcutIcon } from "../lib/modeShortcuts";

const iconMap = {
  bed: BedDouble,
  kitchen: UtensilsCrossed,
  sofa: Sofa,
  outing: DoorOpen,
  home: Home,
};

export function ModeBuilder() {
  const [shortcuts, setShortcuts] = useState<ModeShortcut[]>(() => readModeShortcuts());
  const [label, setLabel] = useState("");
  const [mode, setMode] = useState<CarryMode | "home">("living");
  const [icon, setIcon] = useState<ShortcutIcon>("sofa");

  const updateShortcuts = (next: ModeShortcut[]) => {
    setShortcuts(next);
    saveModeShortcuts(next);
  };

  const addShortcut = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    updateShortcuts([{ id: Date.now().toString(), label: trimmed, mode, icon }, ...shortcuts]);
    setLabel("");
  };

  return (
    <div className="carry-page mode-builder-page">
      <section className="mode-preview-strip">
        {shortcuts.map((shortcut) => {
          const Icon = iconMap[shortcut.icon];
          return (
            <button className="simple-mode-button" key={shortcut.id}>
              <Icon size={22} />
              <span>{shortcut.label}</span>
            </button>
          );
        })}
      </section>

      <section className="alarm-create-card">
        <div className="setting-section-head">
          <div>
            <span>Home Button</span>
            <h2>모드 추가</h2>
          </div>
          <Plus size={22} />
        </div>
        <div className="routine-form-grid">
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="예: 약 챙기기" />
          <select value={mode} onChange={(event) => setMode(event.target.value as CarryMode | "home")}>
            <option value="sleep">취침 동작</option>
            <option value="kitchen">주방 동작</option>
            <option value="living">거실 동작</option>
            <option value="outing">외출 동작</option>
            <option value="home">홈으로</option>
          </select>
          <select value={icon} onChange={(event) => setIcon(event.target.value as ShortcutIcon)}>
            <option value="bed">침대 아이콘</option>
            <option value="kitchen">주방 아이콘</option>
            <option value="sofa">거실 아이콘</option>
            <option value="outing">문 아이콘</option>
            <option value="home">홈 아이콘</option>
          </select>
          <button onClick={addShortcut}>
            <Plus size={18} />
            홈에 추가
          </button>
        </div>
      </section>

      <section className="mode-manage-list">
        {shortcuts.map((shortcut) => {
          const Icon = iconMap[shortcut.icon];
          return (
            <article className="mode-manage-card" key={shortcut.id}>
              <GripVertical size={18} />
              <Icon size={21} />
              <div>
                <strong>{shortcut.label}</strong>
                <span>{getModeLabel(shortcut.mode)}</span>
              </div>
              <button onClick={() => updateShortcuts(shortcuts.filter((item) => item.id !== shortcut.id))}>
                <Trash2 size={16} />
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function getModeLabel(mode: CarryMode | "home") {
  if (mode === "sleep") return "취침 동작";
  if (mode === "kitchen") return "주방 동작";
  if (mode === "outing") return "외출 동작";
  if (mode === "home") return "홈으로 복귀";
  return "거실 동작";
}
