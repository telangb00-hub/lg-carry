import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  buildCarryCommand,
  buildReturnHomeCommand,
  fetchCarryItems,
  fetchCarryStatus,
  fetchDefaultSettings,
  fetchLightSettings,
  fetchMusicSettings,
  fetchModeSettings,
  saveDefaultSettings,
  saveCarryItem,
  saveLightSetting,
  saveMusicSetting,
  saveModeSetting,
  deleteLightSetting,
  deleteMusicSetting,
  deleteCarryItem,
  deleteModeSetting,
  sendCarryCommand,
  increaseCarryItemCallCount,
  type CarryItemResponse,
  type CarryStatus,
} from "../services/carryCommandBridge";

export type CarryMode = "idle" | "sleep" | "kitchen" | "living" | "outing" | "returning";
export type DrawerState = "closed" | "opening" | "open" | "closing";
export type Location = "idle" | "bedroom" | "kitchen" | "living" | "entrance";

export interface ExecutionLogEntry {
  id: string;
  time: string;
  message: string;
}

export interface ItemData {
  id: string;
  name: string;
  location: string;
  drawer: number;
  recommendedCallLocation: string;
  callCount?: number;
}

export interface LightPreset {
  id: string;
  name: string;
  color: string;
}

export interface DrawerCustomization {
  id: string;
  drawer: 1 | 2 | 3;
  modeName: string;
  lightName: string;
  lightColor: string;
  songName: string;
  comment?: string;
  isActive: boolean;
}

export interface DefaultCallSettings {
  place: string;
  lightName: string;
  lightColor: string;
  songName: string;
}

interface CarryContextType {
  mode: CarryMode;
  setMode: (mode: CarryMode) => void;
  currentLocation: Location;
  setCurrentLocation: (location: Location) => void;
  drawer1: DrawerState;
  drawer2: DrawerState;
  drawer3: DrawerState;
  setDrawer1: (state: DrawerState) => void;
  setDrawer2: (state: DrawerState) => void;
  setDrawer3: (state: DrawerState) => void;
  battery: number;
  isUnityConnected: boolean;
  isBusy: boolean;
  stationLightOn: boolean;
  stationMusicOn: boolean;
  collisionCount: number;
  errorCode: string;
  moveSpeed: number;
  stationRunning: boolean;
  setMoveSpeed: (speed: number) => void;
  setStationRunning: (running: boolean) => void;
  feedbackMessage: string | null;
  notify: (message: string) => void;
  executionLog: ExecutionLogEntry[];
  addLogEntry: (message: string, options?: { silent?: boolean }) => void;
  itemDatabase: ItemData[];
  addItem: (item: Omit<ItemData, "id">) => void;
  deleteItem: (id: string) => void;
  lightPresets: LightPreset[];
  addLightPreset: (preset: Omit<LightPreset, "id">) => void;
  deleteLightPreset: (id: string) => void;
  songPresets: string[];
  addSongPreset: (song: string) => void;
  deleteSongPreset: (song: string) => void;
  drawerCustomizations: DrawerCustomization[];
  addDrawerCustomization: (customization: Omit<DrawerCustomization, "id" | "isActive">) => void;
  deleteDrawerCustomization: (id: string) => void;
  activateDrawerCustomization: (id: string) => void;
  getCustomizationForMode: (mode: CarryMode) => DrawerCustomization | undefined;
  getActiveCustomizationForDrawer: (drawer: 1 | 2 | 3) => DrawerCustomization | undefined;
  defaultCallSettings: DefaultCallSettings;
  setDefaultCallSettings: (settings: DefaultCallSettings) => void;
  callCarry: (mode: CarryMode, item?: ItemData) => void;
  callShortcutMode: (mode: CarryMode, shortcut: { id?: string; label?: string; drawer?: 1 | 2 | 3 | null; lightName?: string; lightColor?: string; songName?: string; comment?: string }) => void;
  returnToHome: () => void;
}

const CarryContext = createContext<CarryContextType | undefined>(undefined);

const initialLights: LightPreset[] = [
  { id: "off", name: "끄기", color: "#F8F5EE" },
  { id: "warm", name: "따뜻한 오렌지", color: "#E9A35B" },
  { id: "kitchen", name: "주방 블루", color: "#7ED7E8" },
  { id: "rest", name: "휴식 그린", color: "#9BD27A" },
  { id: "outing", name: "외출 오렌지", color: "#FF9B4A" },
];

const initialSongs = ["없음", "부드러운 알림음", "주방 리듬", "취침 무드 사운드", "무음"];

const initialCustomizations: DrawerCustomization[] = [
  {
    id: "drawer-1-sleep",
    drawer: 1,
    modeName: "취침 모드",
    lightName: "따뜻한 오렌지",
    lightColor: "#E9A35B",
    songName: "취침 무드 사운드",
    isActive: true,
  },
  {
    id: "drawer-2-kitchen",
    drawer: 2,
    modeName: "주방 모드",
    lightName: "주방 블루",
    lightColor: "#7ED7E8",
    songName: "주방 리듬",
    isActive: true,
  },
  {
    id: "drawer-3-living",
    drawer: 3,
    modeName: "거실/외출 모드",
    lightName: "휴식 그린",
    lightColor: "#9BD27A",
    songName: "부드러운 알림음",
    isActive: true,
  },
];

const initialDefaultCall: DefaultCallSettings = {
  place: "내 위치",
  lightName: "따뜻한 오렌지",
  lightColor: "#E9A35B",
  songName: "부드러운 알림음",
};

function readSaved<T>(key: string, fallback: T): T {
  const saved = window.localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function mergeLightDefaults(saved: LightPreset[]) {
  const ids = new Set(saved.map((preset) => preset.id));
  return [...initialLights.filter((preset) => !ids.has(preset.id)), ...saved];
}

function mergeSongDefaults(saved: string[]) {
  return ["없음", ...saved.filter((song) => song !== "없음")];
}

export function CarryProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CarryMode>("idle");
  const [currentLocation, setCurrentLocation] = useState<Location>("living");
  const [drawer1, setDrawer1] = useState<DrawerState>("closed");
  const [drawer2, setDrawer2] = useState<DrawerState>("closed");
  const [drawer3, setDrawer3] = useState<DrawerState>("closed");
  const [battery, setBattery] = useState(86);
  const [isUnityConnected, setIsUnityConnected] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [stationLightOn, setStationLightOn] = useState(false);
  const [stationMusicOn, setStationMusicOn] = useState(false);
  const [collisionCount, setCollisionCount] = useState(0);
  const [errorCode, setErrorCode] = useState("C-00");
  const [moveSpeed, setMoveSpeedState] = useState(1.2);
  const [stationRunning, setStationRunningState] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const actionTimersRef = useRef<number[]>([]);
  const lastUnityMessageRef = useRef<string | null>(null);
  const hasPendingUnityCommandRef = useRef(false);
  const pendingCommandStartedAtRef = useRef(0);
  const staleUnityMessageRef = useRef<string | null>(null);
  const pendingCommandSawBusyRef = useRef(false);
  const [executionLog, setExecutionLog] = useState<ExecutionLogEntry[]>([
    { id: "1", time: "14:15", message: "CARRY 시스템 시작" },
    { id: "2", time: "14:16", message: "거실 위치로 복귀 완료" },
  ]);
  const [itemDatabase, setItemDatabase] = useState<ItemData[]>([]);
  const [lightPresets, setLightPresets] = useState<LightPreset[]>(() =>
    mergeLightDefaults(readSaved("carry-light-presets", initialLights)),
  );
  const [songPresets, setSongPresets] = useState<string[]>(() =>
    mergeSongDefaults(readSaved("carry-song-presets", initialSongs)),
  );
  const [drawerCustomizations, setDrawerCustomizations] = useState<DrawerCustomization[]>(() =>
    readSaved("carry-drawer-customizations", initialCustomizations),
  );
  const [defaultCallSettings, setDefaultCallSettingsState] = useState<DefaultCallSettings>(() =>
    readSaved("carry-default-call", initialDefaultCall),
  );

  useEffect(() => {
    window.localStorage.setItem("carry-light-presets", JSON.stringify(lightPresets));
  }, [lightPresets]);

  useEffect(() => {
    window.localStorage.setItem("carry-song-presets", JSON.stringify(songPresets));
  }, [songPresets]);

  useEffect(() => {
    window.localStorage.setItem("carry-drawer-customizations", JSON.stringify(drawerCustomizations));
  }, [drawerCustomizations]);

  useEffect(() => {
    window.localStorage.setItem("carry-default-call", JSON.stringify(defaultCallSettings));
  }, [defaultCallSettings]);

  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = window.setTimeout(() => setFeedbackMessage(null), 1800);
    return () => window.clearTimeout(timer);
  }, [feedbackMessage]);

  useEffect(() => () => clearActionTimers(), []);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      const status = await fetchCarryStatus();
      if (!status?.message) {
        setIsUnityConnected(false);
        return;
      }
      setIsUnityConnected(true);
      if (shouldIgnoreStalePendingStatus(status)) return;
      if (hasPendingUnityCommandRef.current && status.busy) {
        pendingCommandSawBusyRef.current = true;
      }
      applyUnityStatus(status);
      setExecutionLog((prev) => {
        if (prev[0]?.message === status.message || lastUnityMessageRef.current === status.message) return prev;
        lastUnityMessageRef.current = status.message;
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
        return [{ id: `unity-${status.timestamp}`, time, message: status.message }, ...prev];
      });
      const toastMessage = getFinalUnityToastMessage(status.message);
      if (!status.busy && hasPendingUnityCommandRef.current && pendingCommandSawBusyRef.current && toastMessage) {
        notify(toastMessage);
        hasPendingUnityCommandRef.current = false;
        pendingCommandSawBusyRef.current = false;
      }
    }, 1500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void refreshServerBackedState();
  }, []);

  const refreshServerBackedState = async () => {
    await Promise.all([refreshItemsFromDatabase(), refreshLightsFromDatabase(), refreshMusicFromDatabase(), refreshDefaultsFromDatabase()]);
    await refreshModeSettingsFromDatabase();
  };

  const notify = (message: string) => setFeedbackMessage(message);

  const clearActionTimers = () => {
    actionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    actionTimersRef.current = [];
  };

  const scheduleAction = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      actionTimersRef.current = actionTimersRef.current.filter((item) => item !== timer);
      callback();
    }, delay);
    actionTimersRef.current.push(timer);
  };

  const beginPendingUnityCommand = () => {
    hasPendingUnityCommandRef.current = true;
    pendingCommandStartedAtRef.current = Date.now();
    staleUnityMessageRef.current = lastUnityMessageRef.current;
    pendingCommandSawBusyRef.current = false;
  };

  const shouldIgnoreStalePendingStatus = (status: CarryStatus) => {
    if (!hasPendingUnityCommandRef.current || status.busy || pendingCommandSawBusyRef.current) return false;
    if (Date.now() - pendingCommandStartedAtRef.current < 1800) return true;
    return Boolean(staleUnityMessageRef.current && status.message === staleUnityMessageRef.current);
  };

  const addLogEntry = (message: string, options?: { silent?: boolean }) => {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
    setExecutionLog((prev) => [{ id: Date.now().toString(), time, message }, ...prev]);
    if (!options?.silent) notify(message);
  };

  const refreshItemsFromDatabase = async () => {
    const items = await fetchCarryItems();
    setItemDatabase(items.map(mapCarryItemResponse));
  };

  const refreshLightsFromDatabase = async () => {
    const lights = await fetchLightSettings();
    if (lights.length > 0) {
      setLightPresets(lights.map((light) => ({ id: String(light.id), name: light.name === "없음" ? "끄기" : light.name, color: light.colorHex })));
    }
  };

  const refreshMusicFromDatabase = async () => {
    const songs = await fetchMusicSettings();
    if (songs.length > 0) {
      setSongPresets(songs.map((song) => song.name));
    }
  };

  const refreshDefaultsFromDatabase = async () => {
    const defaults = await fetchDefaultSettings();
    if (!defaults) return;
    setMoveSpeedState(defaults.moveSpeed);
    setStationRunningState(defaults.stationRunning);
    setDefaultCallSettingsState({
      place: "내 위치",
      lightName: defaults.lightName,
      lightColor: defaults.lightColor,
      songName: defaults.music,
    });
  };

  const refreshModeSettingsFromDatabase = async () => {
    const modes = await fetchModeSettings();
    if (modes.length === 0) return;
    setDrawerCustomizations(
      modes.map((mode) => ({
        id: mode.mode,
        drawer: normalizeDrawer(mode.drawerNumber),
        modeName: mode.label,
        lightName: mode.lightName,
        lightColor: mode.lightColor,
        songName: mode.music,
        isActive: true,
      })),
    );
  };

  const addItem = (item: Omit<ItemData, "id">) => {
    void (async () => {
      const saved = await saveCarryItem({
        name: item.name,
        drawerNumber: item.drawer,
        targetLocation: getTargetLocationFromItem(item),
        category: item.location,
        memo: item.recommendedCallLocation,
      });

      if (!saved) {
        addLogEntry("DB 저장에 실패했어요");
        return;
      }

      setItemDatabase((prev) => [mapCarryItemResponse(saved), ...prev.filter((entry) => entry.name !== saved.name)]);
      addLogEntry(`${item.name} 등록했어요`);
    })();
  };

  const deleteItem = (id: string) => {
    void (async () => {
      await deleteCarryItem(id);
      setItemDatabase((prev) => prev.filter((item) => item.id !== id));
      addLogEntry("물품을 삭제했어요");
    })();
  };

  const addLightPreset = (preset: Omit<LightPreset, "id">) => {
    void (async () => {
      const saved = await saveLightSetting({ name: preset.name, colorHex: preset.color });
      if (!saved) {
        addLogEntry("불빛 저장에 실패했어요");
        return;
      }
      setLightPresets((prev) => [{ id: String(saved.id), name: saved.name, color: saved.colorHex }, ...prev]);
      addLogEntry(`${preset.name} 불빛을 저장했어요`);
    })();
  };

  const deleteLightPreset = (id: string) => {
    if (lightPresets.length <= 1) return;
    if (["끄기", "없음"].includes(lightPresets.find((preset) => preset.id === id)?.name ?? "")) return;
    void (async () => {
      await deleteLightSetting(id);
      setLightPresets((prev) => prev.filter((preset) => preset.id !== id));
      addLogEntry("불빛 설정을 삭제했어요");
    })();
  };

  const addSongPreset = (song: string) => {
    const name = song.trim();
    if (!name) return;
    void (async () => {
      const saved = await saveMusicSetting({ name, description: "사용자 추가 음악" });
      if (!saved) {
        addLogEntry("노래 저장에 실패했어요");
        return;
      }
      setSongPresets((prev) => [saved.name, ...prev.filter((item) => item !== saved.name)]);
      addLogEntry(`${name} 음악을 저장했어요`);
    })();
  };

  const deleteSongPreset = (song: string) => {
    if (songPresets.length <= 1) return;
    if (song === "없음") return;
    void (async () => {
      const songs = await fetchMusicSettings();
      const target = songs.find((item) => item.name === song);
      if (target) await deleteMusicSetting(String(target.id));
      setSongPresets((prev) => prev.filter((item) => item !== song));
      addLogEntry("노래 설정을 삭제했어요");
    })();
  };

  const getActiveCustomizationForDrawer = (drawer: 1 | 2 | 3) =>
    drawerCustomizations.find((customization) => Number(customization.drawer) === drawer && customization.isActive) ??
    drawerCustomizations.find((customization) => Number(customization.drawer) === drawer);

  const getCustomizationForMode = (targetMode: CarryMode) => {
    const drawer = getDrawerForMode(targetMode);
    return drawer ? getActiveCustomizationForDrawer(drawer) : undefined;
  };

  const addDrawerCustomization = (customization: Omit<DrawerCustomization, "id" | "isActive">) => {
    const newCustomization: DrawerCustomization = { ...customization, id: `custom-${Date.now()}`, isActive: true };
    setDrawerCustomizations((prev) => [
      newCustomization,
      ...prev.map((item) => (Number(item.drawer) === Number(customization.drawer) ? { ...item, isActive: false } : item)),
    ]);
    void saveModeSetting({
      mode: newCustomization.id,
      label: newCustomization.modeName,
      drawerNumber: newCustomization.drawer,
      targetLocation: getTargetLocationFromDrawer(newCustomization.drawer),
      lightName: newCustomization.lightName,
      lightColor: newCustomization.lightColor,
      music: newCustomization.songName,
    });
    addLogEntry(`${customization.modeName} 루틴을 저장했어요`);
  };

  const deleteDrawerCustomization = (id: string) => {
    setDrawerCustomizations((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) return prev;
      const remained = prev.filter((item) => item.id !== id);
      if (target.isActive && !remained.some((item) => Number(item.drawer) === Number(target.drawer) && item.isActive)) {
        const firstSameDrawer = remained.find((item) => Number(item.drawer) === Number(target.drawer));
        return remained.map((item) => (item.id === firstSameDrawer?.id ? { ...item, isActive: true } : item));
      }
      return remained;
    });
    void deleteModeSetting(id);
    addLogEntry("커스터마이징을 삭제했어요");
  };

  const activateDrawerCustomization = (id: string) => {
    const target = drawerCustomizations.find((item) => item.id === id);
    if (!target) return;
    setDrawerCustomizations((prev) =>
      prev.map((item) => (Number(item.drawer) === Number(target.drawer) ? { ...item, isActive: item.id === id } : item)),
    );
    addLogEntry(`${target.modeName}을 적용했어요`);
  };

  const setDefaultCallSettings = (settings: DefaultCallSettings) => {
    void (async () => {
      const saved = await saveDefaultSettings({
        lightName: settings.lightName,
        lightColor: settings.lightColor,
        music: settings.songName,
      });
      if (saved) {
        setDefaultCallSettingsState(settings);
        addLogEntry("기본값을 저장했어요");
      }
    })();
  };

  const setMoveSpeed = (speed: number) => {
    const nextSpeed = Number(speed.toFixed(2));
    setMoveSpeedState(nextSpeed);
    void saveDefaultSettings({ moveSpeed: nextSpeed });
  };

  const setStationRunning = (running: boolean) => {
    setStationRunningState(running);
    void saveDefaultSettings({ stationRunning: running });
    addLogEntry(running ? "스테이션 시작" : "스테이션 종료");
  };

  const closeAllDrawers = () => {
    setDrawer1("closed");
    setDrawer2("closed");
    setDrawer3("closed");
  };

  const openOnlyDrawer = (drawerNumber: number) => {
    setDrawer1(drawerNumber === 1 ? "open" : "closed");
    setDrawer2(drawerNumber === 2 ? "open" : "closed");
    setDrawer3(drawerNumber === 3 ? "open" : "closed");
  };

  const openOnlyDrawerAsOpening = (drawerNumber: number) => {
    setDrawer1(drawerNumber === 1 ? "opening" : "closed");
    setDrawer2(drawerNumber === 2 ? "opening" : "closed");
    setDrawer3(drawerNumber === 3 ? "opening" : "closed");
  };

  const applyTemporaryCustomization = (
    targetMode: CarryMode,
    shortcut: { id?: string; label?: string; drawer?: 1 | 2 | 3 | null; lightName?: string; lightColor?: string; songName?: string; comment?: string },
  ) => {
    const drawer = shortcut.drawer ?? getDrawerForMode(targetMode);
    if (!drawer) return undefined;

    const nextCustomization: DrawerCustomization = {
      id: shortcut.id ? `shortcut-${shortcut.id}` : `shortcut-${targetMode}`,
      drawer,
      modeName: shortcut.label ?? getDefaultModeName(targetMode),
      lightName: shortcut.lightName ?? "끄기",
      lightColor: shortcut.lightColor ?? "#000000",
      songName: shortcut.songName ?? "없음",
      comment: shortcut.comment ?? getDefaultCommentForMode(targetMode),
      isActive: true,
    };

    setDrawerCustomizations((prev) => [
      nextCustomization,
      ...prev
        .filter((item) => item.id !== nextCustomization.id)
        .map((item) => (Number(item.drawer) === Number(drawer) ? { ...item, isActive: false } : item)),
    ]);

    return nextCustomization;
  };

  const closeClosingDrawer = (drawerNumber: number) => {
    setDrawer1(drawerNumber === 1 ? "closing" : "closed");
    setDrawer2(drawerNumber === 2 ? "closing" : "closed");
    setDrawer3(drawerNumber === 3 ? "closing" : "closed");
  };

  const applyUnityStatus = (status: CarryStatus) => {
    setIsBusy(status.busy);
    setStationLightOn(Boolean(status.lightOn));
    setStationMusicOn(Boolean(status.musicOn));
    setBattery(status.battery);
    setCollisionCount(status.collisionCount ?? 0);
    setErrorCode(status.errorCode || "C-00");
    const drawerState = status.drawerState ?? inferDrawerStateFromMessage(status.message, status.openedDrawer);
    const isMoving =
      status.message.includes("인식 중") ||
      status.message.includes("이동 준비 중") ||
      status.message.includes("이동 중") ||
      status.message.includes("복귀 중");

    if (status.message.includes("침대") || status.message.includes("취침") || status.message.includes("주무세요")) {
      setMode("sleep");
      setCurrentLocation("bedroom");
    } else if (status.message.includes("주방") || status.message.includes("냄새")) {
      setMode("kitchen");
      setCurrentLocation("kitchen");
    } else if (status.message.includes("쇼파") || status.message.includes("거실") || status.message.includes("쉬어가세요")) {
      setMode("living");
      setCurrentLocation("living");
    } else if (status.message.includes("현관") || status.message.includes("외출") || status.message.includes("다녀오세요")) {
      setMode("outing");
      setCurrentLocation("entrance");
    } else if (status.message.includes("복귀") || status.message.includes("대기 중")) {
      setMode(status.busy ? "returning" : "idle");
      setCurrentLocation("living");
    }

    if (drawerState === "opening" && status.openedDrawer > 0) {
      openOnlyDrawerAsOpening(status.openedDrawer);
    } else if (drawerState === "open" && status.openedDrawer > 0) {
      openOnlyDrawer(status.openedDrawer);
    } else if (drawerState === "closing") {
      closeClosingDrawer(status.openedDrawer);
    } else if (drawerState === "closed" || isMoving) {
      closeAllDrawers();
    }
  };

  const callCarry = (targetMode: CarryMode, item?: ItemData) => {
    if (isBusy) {
      addLogEntry("CARRY가 이미 이동 중이에요");
      return;
    }

    clearActionTimers();
    beginPendingUnityCommand();
    setIsBusy(true);
    setStationLightOn(false);
    setStationMusicOn(false);
    setMode("idle");
    closeAllDrawers();
    const customization = item
      ? applyTemporaryCustomization(targetMode, {
          id: `item-${item.id}`,
          label: item.name,
          drawer: normalizeDrawer(item.drawer),
          lightName: defaultCallSettings.lightName,
          lightColor: defaultCallSettings.lightColor,
          songName: defaultCallSettings.songName,
          comment: `${item.name} 준비했어요`,
        })
      : getCustomizationForMode(targetMode);
    void sendCarryCommand(buildCarryCommand(targetMode, item, customization));

    if (item) {
      void increaseCarryItemCallCount(item.id).then((saved) => {
        if (!saved) return;
        setItemDatabase((prev) => prev.map((entry) => (entry.id === String(saved.id) ? mapCarryItemResponse(saved) : entry)));
      });
      addLogEntry(`"${item.name}"을 찾았어요`);
      addLogEntry(`${item.drawer}번 칸으로 준비할게요`, { silent: true });
    }

    if (customization) {
      const lightText = customization.lightName === "끄기" ? "불빛 끄기" : `불빛 ${customization.lightName}`;
      const songText = customization.songName === "없음" ? "노래 없음" : `노래 ${customization.songName}`;
      addLogEntry(`${lightText}, ${songText} 준비 중`, { silent: true });
    }
    addLogEntry("이동을 시작했어요");
  };

  const callShortcutMode = (
    targetMode: CarryMode,
    shortcut: { id?: string; label?: string; drawer?: 1 | 2 | 3 | null; lightName?: string; lightColor?: string; songName?: string; comment?: string },
  ) => {
    if (isBusy) {
      addLogEntry("CARRY가 이미 이동 중이에요");
      return;
    }

    clearActionTimers();
    beginPendingUnityCommand();
    setIsBusy(true);
    setStationLightOn(false);
    setStationMusicOn(false);
    setMode("idle");
    closeAllDrawers();
    const customization = applyTemporaryCustomization(targetMode, shortcut);

    void sendCarryCommand(buildCarryCommand(targetMode, undefined, customization));

    addLogEntry("이동을 시작했어요");
  };

  const returnToHome = () => {
    if (isBusy) {
      addLogEntry("CARRY가 이미 이동 중이에요");
      return;
    }

    clearActionTimers();
    beginPendingUnityCommand();
    setIsBusy(true);
    void sendCarryCommand(buildReturnHomeCommand());
    addLogEntry("복귀를 시작했어요");
    setMode("returning");
    setDrawer1("closing");
    setDrawer2("closing");
    setDrawer3("closing");
  };

  return (
    <CarryContext.Provider
      value={{
        mode,
        setMode,
        currentLocation,
        setCurrentLocation,
        drawer1,
        drawer2,
        drawer3,
        setDrawer1,
        setDrawer2,
        setDrawer3,
        battery,
        isUnityConnected,
        isBusy,
        stationLightOn,
        stationMusicOn,
        collisionCount,
        errorCode,
        moveSpeed,
        stationRunning,
        setMoveSpeed,
        setStationRunning,
        feedbackMessage,
        notify,
        executionLog,
        addLogEntry,
        itemDatabase,
        addItem,
        deleteItem,
        lightPresets,
        addLightPreset,
        deleteLightPreset,
        songPresets,
        addSongPreset,
        deleteSongPreset,
        drawerCustomizations,
        addDrawerCustomization,
        deleteDrawerCustomization,
        activateDrawerCustomization,
        getCustomizationForMode,
        getActiveCustomizationForDrawer,
        defaultCallSettings,
        setDefaultCallSettings,
        callCarry,
        callShortcutMode,
        returnToHome,
      }}
    >
      {children}
    </CarryContext.Provider>
  );
}

function getDefaultCommentForMode(mode: CarryMode) {
  if (mode === "sleep") return "안녕히 주무세요";
  if (mode === "kitchen") return "맛있는 냄새가 나요!";
  if (mode === "outing") return "잘 다녀오세요";
  return "편하게 쉬어가세요";
}

function getDefaultModeName(mode: CarryMode) {
  if (mode === "sleep") return "취침";
  if (mode === "kitchen") return "주방";
  if (mode === "outing") return "외출";
  if (mode === "returning") return "복귀";
  return "거실";
}

export function useCarry() {
  const context = useContext(CarryContext);
  if (!context) throw new Error("useCarry must be used within CarryProvider");
  return context;
}

function getDrawerForMode(mode: CarryMode): 1 | 2 | 3 | null {
  if (mode === "sleep") return 1;
  if (mode === "kitchen") return 2;
  if (mode === "living" || mode === "outing") return 3;
  return null;
}

function getFinalUnityToastMessage(message: string) {
  if (message.includes("주무세요")) return message;
  if (message.includes("냄새")) return message;
  if (message.includes("쉬어가세요")) return message;
  if (message.includes("다녀오세요")) return message;
  if (message.includes("대기 중")) return "홈으로 돌아왔어요";
  return null;
}

function mapCarryItemResponse(item: CarryItemResponse): ItemData {
  return {
    id: String(item.id),
    name: item.name,
    drawer: item.drawerNumber,
    location: getLocationLabel(item.targetLocation, item.category),
    recommendedCallLocation: item.memo || getRecommendedCallLocation(item.targetLocation, item.drawerNumber),
    callCount: item.callCount ?? 0,
  };
}

function getTargetLocationFromItem(item: Omit<ItemData, "id">) {
  if (item.drawer === 1) return "sleep";
  if (item.drawer === 2) return "kitchen";
  if (item.location.includes("현관") || item.location.includes("외출")) return "outing";
  return "living";
}

function getLocationLabel(targetLocation: string, category?: string) {
  if (category) return category;
  if (targetLocation === "sleep") return "침실";
  if (targetLocation === "kitchen") return "주방";
  if (targetLocation === "outing") return "현관";
  return "거실";
}

function getRecommendedCallLocation(targetLocation: string, drawerNumber: number) {
  if (targetLocation === "sleep" || drawerNumber === 1) return "침대 옆";
  if (targetLocation === "kitchen" || drawerNumber === 2) return "주방";
  if (targetLocation === "outing") return "현관";
  return "거실";
}

function inferDrawerStateFromMessage(message: string, openedDrawer: number) {
  if (message.includes("문 여는 중")) return "opening";
  if (message.includes("닫는 중")) return "closing";
  if (openedDrawer > 0) return "open";
  return "closed";
}

function normalizeDrawer(drawerNumber: number): 1 | 2 | 3 {
  if (drawerNumber === 1 || drawerNumber === 2 || drawerNumber === 3) return drawerNumber;
  return 3;
}

function getTargetLocationFromDrawer(drawer: 1 | 2 | 3) {
  if (drawer === 1) return "sleep";
  if (drawer === 2) return "kitchen";
  return "living";
}
