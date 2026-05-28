import { useEffect, useState } from "react";
import { BedDouble, DoorOpen, GripVertical, Home, Plus, Sofa, Trash2, UtensilsCrossed } from "lucide-react";
import { useCarry, type CarryMode } from "../context/CarryContext";
import { readModeShortcuts, saveModeShortcuts, type ModeShortcut, type ShortcutIcon } from "../lib/modeShortcuts";
import { deleteHomeShortcut, fetchHomeShortcuts, saveHomeShortcut } from "../services/carryCommandBridge";

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
  const [drawer, setDrawer] = useState<1 | 2 | 3>(3);
  const { lightPresets, songPresets } = useCarry();
  const [lightId, setLightId] = useState("");
  const [songName, setSongName] = useState("없음");

  const selectedLight = lightPresets.find((light) => light.id === lightId) ?? lightPresets[0];

  useEffect(() => {
    void fetchHomeShortcuts().then((items) =>
      setShortcuts(
        items.map((item) => ({
          id: item.id,
          label: item.label,
          mode: item.actionMode,
          icon: getIconForMode(item.actionMode),
          drawer: normalizeDrawer(item.drawerNumber),
          lightName: item.lightName,
          lightColor: item.lightColor,
          songName: item.music,
        })),
      ),
    );
  }, []);

  useEffect(() => {
    if (!lightId && lightPresets[0]) setLightId(lightPresets[0].id);
  }, [lightId, lightPresets]);

  const updateShortcuts = (next: ModeShortcut[]) => {
    setShortcuts(next);
    saveModeShortcuts(next);
  };

  const addShortcut = () => {
    const trimmed = label.trim();
    if (!trimmed || !selectedLight) return;
    const shortcut: ModeShortcut = {
      id: Date.now().toString(),
      label: trimmed,
      mode,
      icon: getIconForMode(mode),
      drawer: mode === "home" ? null : drawer,
      lightName: selectedLight.name,
      lightColor: selectedLight.color,
      songName,
    };
    updateShortcuts([...shortcuts, shortcut]);
    void saveHomeShortcut({
      id: shortcut.id,
      label: shortcut.label,
      actionMode: shortcut.mode,
      drawerNumber: shortcut.drawer,
      lightName: shortcut.lightName,
      lightColor: shortcut.lightColor,
      music: shortcut.songName,
      sortOrder: shortcuts.length + 1,
    });
    setLabel("");
  };

  const deleteShortcut = (id: string) => {
    updateShortcuts(shortcuts.filter((item) => item.id !== id));
    void deleteHomeShortcut(id);
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
          {mode !== "home" && (
            <select value={drawer} onChange={(event) => setDrawer(Number(event.target.value) as 1 | 2 | 3)}>
              <option value={1}>1번 칸 열기</option>
              <option value={2}>2번 칸 열기</option>
              <option value={3}>3번 칸 열기</option>
            </select>
          )}
          <select value={lightId} onChange={(event) => setLightId(event.target.value)}>
            {lightPresets.map((light) => (
              <option key={light.id} value={light.id}>
                조명: {light.name}
              </option>
            ))}
          </select>
          <select value={songName} onChange={(event) => setSongName(event.target.value)}>
            {songPresets.map((song) => (
              <option key={song} value={song}>
                음악: {song}
              </option>
            ))}
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
                <span>
                  {getModeLabel(shortcut.mode)}
                  {shortcut.drawer ? ` · ${shortcut.drawer}번 칸` : ""}
                </span>
                <span>
                  {shortcut.lightName ?? "끄기"} · {shortcut.songName ?? "없음"}
                </span>
              </div>
              <button onClick={() => deleteShortcut(shortcut.id)}>
                <Trash2 size={16} />
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
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

function getModeLabel(mode: CarryMode | "home") {
  if (mode === "sleep") return "취침 동작";
  if (mode === "kitchen") return "주방 동작";
  if (mode === "outing") return "외출 동작";
  if (mode === "home") return "홈으로 복귀";
  return "거실 동작";
}
