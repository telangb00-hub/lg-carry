import { useEffect, useState } from "react";
import {
  BedDouble,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  Eye,
  EyeOff,
  GripVertical,
  Home,
  Pencil,
  Plus,
  Sofa,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("");
  const [comment, setComment] = useState("");
  const [mode, setMode] = useState<CarryMode | "home">("living");
  const [drawer, setDrawer] = useState<1 | 2 | 3>(3);
  const { lightPresets, songPresets } = useCarry();
  const [lightId, setLightId] = useState("");
  const [songName, setSongName] = useState("없음");

  const selectedLight = lightPresets.find((light) => light.id === lightId) ?? lightPresets[0];

  useEffect(() => {
    void fetchHomeShortcuts().then((items) => {
      if (items.length === 0) return;
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
          comment: item.comment,
          emoji: item.emoji,
          visibleOnHome: item.visibleOnHome,
        })),
      );
    });
  }, []);

  useEffect(() => {
    if (!lightId && lightPresets[0]) setLightId(lightPresets[0].id);
  }, [lightId, lightPresets]);

  const updateShortcuts = (next: ModeShortcut[]) => {
    const ordered = next.map((shortcut, index) => ({ ...shortcut, sortOrder: index + 1 }) as ModeShortcut);
    setShortcuts(ordered);
    saveModeShortcuts(ordered);
    ordered.forEach((shortcut, index) => void persistShortcut(shortcut, index + 1));
  };

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setEmoji("");
    setComment("");
    setMode("living");
    setDrawer(3);
    setSongName("없음");
  };

  const saveShortcut = () => {
    const trimmed = label.trim();
    if (!trimmed || !selectedLight) return;

    const previous = shortcuts.find((item) => item.id === editingId);
    const shortcut: ModeShortcut = {
      id: previous?.id ?? Date.now().toString(),
      label: trimmed,
      mode,
      icon: getIconForMode(mode),
      drawer: mode === "home" ? null : drawer,
      lightName: selectedLight.name,
      lightColor: selectedLight.color,
      songName,
      comment: comment.trim() || getDefaultComment(mode),
      emoji: emoji.trim() || getDefaultEmoji(mode),
      visibleOnHome: previous?.visibleOnHome ?? true,
    };

    const next = previous
      ? shortcuts.map((item) => (item.id === previous.id ? shortcut : item))
      : [...shortcuts, shortcut];

    updateShortcuts(next);
    resetForm();
  };

  const editShortcut = (shortcut: ModeShortcut) => {
    setEditingId(shortcut.id);
    setLabel(shortcut.label);
    setEmoji(shortcut.emoji ?? "");
    setComment(shortcut.comment ?? "");
    setMode(shortcut.mode);
    setDrawer(shortcut.drawer ?? 3);
    const light = lightPresets.find((preset) => preset.name === shortcut.lightName || preset.color === shortcut.lightColor) ?? lightPresets[0];
    setLightId(light?.id ?? "");
    setSongName(shortcut.songName ?? "없음");
  };

  const deleteShortcut = (id: string) => {
    updateShortcuts(shortcuts.filter((item) => item.id !== id));
    void deleteHomeShortcut(id);
    if (editingId === id) resetForm();
  };

  const toggleHomeVisible = (shortcut: ModeShortcut) => {
    updateShortcuts(shortcuts.map((item) => (item.id === shortcut.id ? { ...item, visibleOnHome: item.visibleOnHome === false } : item)));
  };

  const moveShortcut = (id: string, direction: -1 | 1) => {
    const index = shortcuts.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= shortcuts.length) return;
    const next = [...shortcuts];
    [next[index], next[target]] = [next[target], next[index]];
    updateShortcuts(next);
  };

  return (
    <div className="carry-page mode-builder-page">
      <section className="mode-preview-strip">
        {shortcuts
          .filter((shortcut) => shortcut.visibleOnHome !== false)
          .map((shortcut) => {
            const Icon = iconMap[shortcut.icon];
            return (
              <button className="simple-mode-button" key={shortcut.id}>
                {shortcut.emoji ? <span className="shortcut-emoji">{shortcut.emoji}</span> : <Icon size={22} />}
                <span>{shortcut.label}</span>
              </button>
            );
          })}
      </section>

      <section className="alarm-create-card">
        <div className="setting-section-head">
          <div>
            <span>Home Button</span>
            <h2>{editingId ? "모드 수정" : "모드 추가"}</h2>
          </div>
          {editingId ? <Pencil size={22} /> : <Plus size={22} />}
        </div>
        <div className="routine-form-grid">
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="예: 약 챙기기" />
          <input value={emoji} onChange={(event) => setEmoji(event.target.value)} placeholder="이모티콘 예: 💊" maxLength={4} />
          <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="완료 코멘트 예: 약 챙겼어요" />
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
          <button onClick={saveShortcut}>
            <Plus size={18} />
            {editingId ? "수정 저장" : "홈에 추가"}
          </button>
          {editingId && (
            <button className="secondary-form-button" onClick={resetForm}>
              <X size={18} />
              수정 취소
            </button>
          )}
        </div>
      </section>

      <section className="mode-manage-list">
        {shortcuts.map((shortcut, index) => {
          const Icon = iconMap[shortcut.icon];
          return (
            <article className={`mode-manage-card${shortcut.visibleOnHome === false ? " hidden-home" : ""}`} key={shortcut.id}>
              <GripVertical size={18} />
              {shortcut.emoji ? <span className="mode-manage-emoji">{shortcut.emoji}</span> : <Icon size={21} />}
              <div>
                <strong>{shortcut.label}</strong>
                <span>
                  {getModeLabel(shortcut.mode)}
                  {shortcut.drawer ? ` · ${shortcut.drawer}번 칸` : ""}
                </span>
                <span>
                  {shortcut.lightName ?? "끄기"} · {shortcut.songName ?? "없음"}
                </span>
                <span>{shortcut.comment ?? getDefaultComment(shortcut.mode)}</span>
              </div>
              <div className="mode-manage-actions">
                <button onClick={() => moveShortcut(shortcut.id, -1)} disabled={index === 0} aria-label="위로 이동">
                  <ChevronUp size={15} />
                </button>
                <button onClick={() => moveShortcut(shortcut.id, 1)} disabled={index === shortcuts.length - 1} aria-label="아래로 이동">
                  <ChevronDown size={15} />
                </button>
                <button onClick={() => toggleHomeVisible(shortcut)} aria-label="홈 표시 전환">
                  {shortcut.visibleOnHome === false ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={() => editShortcut(shortcut)} aria-label="수정">
                  <Pencil size={15} />
                </button>
                <button onClick={() => deleteShortcut(shortcut.id)} aria-label="삭제">
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function persistShortcut(shortcut: ModeShortcut, sortOrder: number) {
  return saveHomeShortcut({
    id: shortcut.id,
    label: shortcut.label,
    actionMode: shortcut.mode,
    drawerNumber: shortcut.drawer,
    lightName: shortcut.lightName,
    lightColor: shortcut.lightColor,
    music: shortcut.songName,
    comment: shortcut.comment,
    emoji: shortcut.emoji,
    visibleOnHome: shortcut.visibleOnHome !== false,
    sortOrder,
  });
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

function getDefaultComment(mode: CarryMode | "home") {
  if (mode === "sleep") return "안녕히 주무세요";
  if (mode === "kitchen") return "맛있는 냄새가 나요!";
  if (mode === "outing") return "잘 다녀오세요";
  if (mode === "home") return "홈으로 돌아왔어요";
  return "편하게 쉬어가세요";
}

function getDefaultEmoji(mode: CarryMode | "home") {
  if (mode === "sleep") return "🛏️";
  if (mode === "kitchen") return "🍳";
  if (mode === "outing") return "🚪";
  if (mode === "home") return "🏠";
  return "🛋️";
}
