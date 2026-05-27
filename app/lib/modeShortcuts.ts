import type { CarryMode } from "../context/CarryContext";

export type ShortcutIcon = "bed" | "kitchen" | "sofa" | "outing" | "home";

export interface ModeShortcut {
  id: string;
  label: string;
  mode: CarryMode | "home";
  icon: ShortcutIcon;
}

export const defaultModeShortcuts: ModeShortcut[] = [
  { id: "sleep", label: "취침", mode: "sleep", icon: "bed" },
  { id: "kitchen", label: "주방", mode: "kitchen", icon: "kitchen" },
  { id: "living", label: "거실", mode: "living", icon: "sofa" },
  { id: "outing", label: "외출", mode: "outing", icon: "outing" },
  { id: "home", label: "홈", mode: "home", icon: "home" },
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
