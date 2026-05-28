import type { CarryMode } from "../context/CarryContext";

export type ShortcutIcon = "bed" | "kitchen" | "sofa" | "outing" | "home";

export interface ModeShortcut {
  id: string;
  label: string;
  mode: CarryMode | "home";
  icon: ShortcutIcon;
  drawer?: 1 | 2 | 3 | null;
  lightName?: string;
  lightColor?: string;
  songName?: string;
}

export const defaultModeShortcuts: ModeShortcut[] = [
  { id: "sleep", label: "취침", mode: "sleep", icon: "bed", drawer: 1, lightName: "따뜻한 오렌지", lightColor: "#F0B66D", songName: "없음" },
  { id: "kitchen", label: "주방", mode: "kitchen", icon: "kitchen", drawer: 2, lightName: "상쾌한 그린", lightColor: "#9BD67D", songName: "없음" },
  { id: "living", label: "거실", mode: "living", icon: "sofa", drawer: 3, lightName: "따뜻한 오렌지", lightColor: "#F0B66D", songName: "없음" },
  { id: "outing", label: "외출", mode: "outing", icon: "outing", drawer: 3, lightName: "상쾌한 그린", lightColor: "#9BD67D", songName: "없음" },
  { id: "home", label: "홈", mode: "home", icon: "home", drawer: null, lightName: "끄기", lightColor: "#000000", songName: "없음" },
];

const storageKey = "carry-mode-shortcuts";

export function readModeShortcuts() {
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return defaultModeShortcuts;
  try {
    const parsed = JSON.parse(saved) as ModeShortcut[];
    return parsed.length ? parsed : defaultModeShortcuts;
  } catch {
    return defaultModeShortcuts;
  }
}

export function saveModeShortcuts(shortcuts: ModeShortcut[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(shortcuts));
}
