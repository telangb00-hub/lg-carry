import type { CarryMode, DrawerCustomization, ItemData } from "../context/CarryContext";

export type CarryCommand =
  | {
      type: "CALL_MODE";
      mode: CarryMode;
      drawer: number | null;
      target: string;
      lightName?: string;
      lightColor?: string;
      music?: string;
      comment?: string;
      timestamp: string;
    }
  | {
      type: "CALL_ITEM";
      itemName: string;
      mode: CarryMode;
      drawer: number;
      target: string;
      lightName?: string;
      lightColor?: string;
      music?: string;
      comment?: string;
      timestamp: string;
    }
  | {
      type: "RETURN_HOME";
      target: string;
      timestamp: string;
    };

export interface CarryStatus {
  mode: string;
  location: string;
  openedDrawer: number;
  drawerState?: "closed" | "opening" | "open" | "closing";
  lightOn: boolean;
  musicOn: boolean;
  collisionCount: number;
  errorCode: string;
  busy: boolean;
  battery: number;
  message: string;
  timestamp: string;
}

export interface CarryItemResponse {
  id: number;
  name: string;
  drawerNumber: number;
  targetLocation: string;
  category?: string;
  memo?: string;
  callCount?: number;
}

export interface LightSettingResponse {
  id: number;
  name: string;
  colorHex: string;
}

export interface MusicSettingResponse {
  id: number;
  name: string;
  description?: string;
}

export interface DefaultSettingsResponse {
  id: number;
  lightName: string;
  lightColor: string;
  music: string;
  moveSpeed: number;
  stationRunning: boolean;
}

export interface HomeShortcutResponse {
  id: string;
  label: string;
  actionMode: CarryMode | "home";
  drawerNumber?: number | null;
  lightName?: string;
  lightColor?: string;
  music?: string;
  comment?: string;
  emoji?: string;
  visibleOnHome?: boolean;
  sortOrder: number;
}

export interface ModeSettingResponse {
  mode: string;
  label: string;
  drawerNumber: number;
  targetLocation: string;
  lightName: string;
  lightColor: string;
  music: string;
}

const endpoint = (import.meta.env.VITE_CARRY_API_URL as string | undefined) ?? "http://localhost:8081";

export function buildCarryCommand(mode: CarryMode, item?: ItemData, customization?: DrawerCustomization): CarryCommand {
  const drawer = item?.drawer ?? customization?.drawer ?? getDrawerForMode(mode);
  const common = {
    mode,
    target: getTargetForMode(mode),
    lightName: customization?.lightName,
    lightColor: customization?.lightColor,
    music: customization?.songName,
    comment: customization?.comment ?? customization?.modeName,
    timestamp: new Date().toISOString(),
  };

  if (item) {
    return {
      type: "CALL_ITEM",
      itemName: item.name,
      drawer: item.drawer,
      ...common,
    };
  }

  return {
    type: "CALL_MODE",
    drawer,
    ...common,
  };
}

export function buildReturnHomeCommand(): CarryCommand {
  return {
    type: "RETURN_HOME",
    target: "StationHomePoint",
    timestamp: new Date().toISOString(),
  };
}

export async function sendCarryCommand(command: CarryCommand) {
  if (!endpoint) {
    window.localStorage.setItem("carry-last-command", JSON.stringify(command));
    return;
  }

  try {
    await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/commands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
  } catch {
    window.localStorage.setItem("carry-last-command", JSON.stringify(command));
  }
}

export async function fetchCarryStatus(): Promise<CarryStatus | null> {
  if (!endpoint) return null;

  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/status`);
    if (!response.ok) return null;
    return (await response.json()) as CarryStatus;
  } catch {
    return null;
  }
}

export async function fetchCarryItems(): Promise<CarryItemResponse[]> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/items`);
    if (!response.ok) return [];
    return (await response.json()) as CarryItemResponse[];
  } catch {
    return [];
  }
}

export async function saveCarryItem(item: Omit<CarryItemResponse, "id">): Promise<CarryItemResponse | null> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!response.ok) return null;
    return (await response.json()) as CarryItemResponse;
  } catch {
    return null;
  }
}

export async function deleteCarryItem(id: string) {
  await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/items/${id}`, { method: "DELETE" });
}

export async function increaseCarryItemCallCount(id: string): Promise<CarryItemResponse | null> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/items/${id}/call`, { method: "POST" });
    if (!response.ok) return null;
    return (await response.json()) as CarryItemResponse;
  } catch {
    return null;
  }
}

export async function fetchLightSettings(): Promise<LightSettingResponse[]> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/lights`);
    if (!response.ok) return [];
    return (await response.json()) as LightSettingResponse[];
  } catch {
    return [];
  }
}

export async function saveLightSetting(setting: Omit<LightSettingResponse, "id">): Promise<LightSettingResponse | null> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/lights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(setting),
    });
    if (!response.ok) return null;
    return (await response.json()) as LightSettingResponse;
  } catch {
    return null;
  }
}

export async function deleteLightSetting(id: string) {
  await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/lights/${id}`, { method: "DELETE" });
}

export async function fetchMusicSettings(): Promise<MusicSettingResponse[]> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/music`);
    if (!response.ok) return [];
    return (await response.json()) as MusicSettingResponse[];
  } catch {
    return [];
  }
}

export async function saveMusicSetting(setting: Omit<MusicSettingResponse, "id">): Promise<MusicSettingResponse | null> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/music`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(setting),
    });
    if (!response.ok) return null;
    return (await response.json()) as MusicSettingResponse;
  } catch {
    return null;
  }
}

export async function deleteMusicSetting(id: string) {
  await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/music/${id}`, { method: "DELETE" });
}

export async function fetchDefaultSettings(): Promise<DefaultSettingsResponse | null> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/defaults`);
    if (!response.ok) return null;
    return (await response.json()) as DefaultSettingsResponse;
  } catch {
    return null;
  }
}

export async function saveDefaultSettings(settings: Partial<DefaultSettingsResponse>): Promise<DefaultSettingsResponse | null> {
  const current = await fetchDefaultSettings();
  const body: DefaultSettingsResponse = {
    id: 1,
    lightName: "없음",
    lightColor: "#FFFFFF",
    music: "없음",
    moveSpeed: 1.2,
    stationRunning: true,
    ...current,
    ...settings,
  };

  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/defaults`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    return (await response.json()) as DefaultSettingsResponse;
  } catch {
    return null;
  }
}

export async function fetchHomeShortcuts(): Promise<HomeShortcutResponse[]> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/shortcuts`);
    if (!response.ok) return [];
    return (await response.json()) as HomeShortcutResponse[];
  } catch {
    return [];
  }
}

export async function saveHomeShortcut(shortcut: HomeShortcutResponse): Promise<HomeShortcutResponse | null> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/shortcuts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shortcut),
    });
    if (!response.ok) return null;
    return (await response.json()) as HomeShortcutResponse;
  } catch {
    return null;
  }
}

export async function deleteHomeShortcut(id: string) {
  await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/shortcuts/${id}`, { method: "DELETE" });
}

export async function fetchModeSettings(): Promise<ModeSettingResponse[]> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/modes`);
    if (!response.ok) return [];
    return (await response.json()) as ModeSettingResponse[];
  } catch {
    return [];
  }
}

export async function saveModeSetting(setting: ModeSettingResponse): Promise<ModeSettingResponse | null> {
  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/modes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(setting),
    });
    if (!response.ok) return null;
    return (await response.json()) as ModeSettingResponse;
  } catch {
    return null;
  }
}

export async function deleteModeSetting(mode: string) {
  await fetch(`${endpoint.replace(/\/$/, "")}/api/carry/settings/modes/${mode}`, { method: "DELETE" });
}

function getDrawerForMode(mode: CarryMode) {
  if (mode === "sleep") return 1;
  if (mode === "kitchen") return 2;
  if (mode === "living" || mode === "outing") return 3;
  return null;
}

function getTargetForMode(mode: CarryMode) {
  if (mode === "sleep") return "SleepModeTarget";
  if (mode === "kitchen") return "KitchenTarget";
  if (mode === "living") return "LivingRoomTarget";
  if (mode === "outing") return "EntranceTarget";
  return "StationHomePoint";
}
