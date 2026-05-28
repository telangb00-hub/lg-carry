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
  comment?: string;
  emoji?: string;
  visibleOnHome?: boolean;
}

export const defaultModeShortcuts: ModeShortcut[] = [
  { id: "sleep", label: "취침", mode: "sleep", icon: "bed", drawer: 1, lightName: "따뜻한 오렌지", lightColor: "#F0B66D", songName: "없음", comment: "안녕히 주무세요", emoji: "🛏️", visibleOnHome: true },
  { id: "kitchen", label: "주방", mode: "kitchen", icon: "kitchen", drawer: 2, lightName: "상쾌한 그린", lightColor: "#9BD67D", songName: "없음", comment: "맛있는 냄새가 나요!", emoji: "🍳", visibleOnHome: true },
  { id: "living", label: "거실", mode: "living", icon: "sofa", drawer: 3, lightName: "따뜻한 오렌지", lightColor: "#F0B66D", songName: "없음", comment: "편하게 쉬어가세요", emoji: "🛋️", visibleOnHome: true },
  { id: "outing", label: "외출", mode: "outing", icon: "outing", drawer: 3, lightName: "상쾌한 그린", lightColor: "#9BD67D", songName: "없음", comment: "잘 다녀오세요", emoji: "🚪", visibleOnHome: true },
  { id: "home", label: "홈", mode: "home", icon: "home", drawer: null, lightName: "끄기", lightColor: "#000000", songName: "없음", comment: "홈으로 돌아왔어요", emoji: "🏠", visibleOnHome: true },
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
