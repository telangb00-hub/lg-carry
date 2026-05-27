import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

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
  feedbackMessage: string | null;
  notify: (message: string) => void;
  executionLog: ExecutionLogEntry[];
  addLogEntry: (message: string, options?: { silent?: boolean }) => void;
  itemDatabase: ItemData[];
  addItem: (item: Omit<ItemData, "id">) => void;
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
  returnToHome: () => void;
}

const CarryContext = createContext<CarryContextType | undefined>(undefined);

const initialItems: ItemData[] = [
  { id: "1", name: "수면안대", location: "침실", drawer: 1, recommendedCallLocation: "침대 옆" },
  { id: "2", name: "귀마개", location: "침실", drawer: 1, recommendedCallLocation: "침대 옆" },
  { id: "3", name: "비닐장갑", location: "주방", drawer: 2, recommendedCallLocation: "주방" },
  { id: "4", name: "주방타이머", location: "주방", drawer: 2, recommendedCallLocation: "주방" },
  { id: "5", name: "리모컨", location: "거실", drawer: 3, recommendedCallLocation: "쇼파 옆" },
  { id: "6", name: "담요", location: "거실", drawer: 3, recommendedCallLocation: "쇼파 옆" },
  { id: "7", name: "마스크", location: "현관", drawer: 3, recommendedCallLocation: "현관" },
  { id: "8", name: "우산", location: "현관", drawer: 3, recommendedCallLocation: "현관" },
];

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
  const [battery] = useState(86);
  const [isUnityConnected] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const actionTimersRef = useRef<number[]>([]);
  const [executionLog, setExecutionLog] = useState<ExecutionLogEntry[]>([
    { id: "1", time: "14:15", message: "CARRY 시스템 시작" },
    { id: "2", time: "14:16", message: "거실 위치로 복귀 완료" },
  ]);
  const [itemDatabase, setItemDatabase] = useState<ItemData[]>(initialItems);
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

  const addLogEntry = (message: string, options?: { silent?: boolean }) => {
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
    setExecutionLog((prev) => [{ id: Date.now().toString(), time, message }, ...prev]);
    if (!options?.silent) notify(message);
  };

  const addItem = (item: Omit<ItemData, "id">) => {
    const newItem: ItemData = { ...item, id: Date.now().toString() };
    setItemDatabase((prev) => [newItem, ...prev]);
    addLogEntry(`${item.name} 등록했어요`);
  };

  const addLightPreset = (preset: Omit<LightPreset, "id">) => {
    setLightPresets((prev) => [{ ...preset, id: Date.now().toString() }, ...prev]);
    addLogEntry(`${preset.name} 불빛을 저장했어요`);
  };

  const deleteLightPreset = (id: string) => {
    if (lightPresets.length <= 1) return;
    setLightPresets((prev) => prev.filter((preset) => preset.id !== id));
    addLogEntry("불빛 설정을 삭제했어요");
  };

  const addSongPreset = (song: string) => {
    const name = song.trim();
    if (!name) return;
    setSongPresets((prev) => [name, ...prev]);
    addLogEntry(`${name} 음악을 저장했어요`);
  };

  const deleteSongPreset = (song: string) => {
    if (songPresets.length <= 1) return;
    setSongPresets((prev) => prev.filter((item) => item !== song));
    addLogEntry("노래 설정을 삭제했어요");
  };

  const getActiveCustomizationForDrawer = (drawer: 1 | 2 | 3) =>
    drawerCustomizations.find((customization) => Number(customization.drawer) === drawer && customization.isActive) ??
    drawerCustomizations.find((customization) => Number(customization.drawer) === drawer);

  const getCustomizationForMode = (targetMode: CarryMode) => {
    const drawer = getDrawerForMode(targetMode);
    return drawer ? getActiveCustomizationForDrawer(drawer) : undefined;
  };

  const addDrawerCustomization = (customization: Omit<DrawerCustomization, "id" | "isActive">) => {
    const newCustomization: DrawerCustomization = { ...customization, id: Date.now().toString(), isActive: true };
    setDrawerCustomizations((prev) => [
      newCustomization,
      ...prev.map((item) => (Number(item.drawer) === Number(customization.drawer) ? { ...item, isActive: false } : item)),
    ]);
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
    setDefaultCallSettingsState(settings);
    addLogEntry("기본값을 저장했어요");
  };

  const closeAllDrawers = () => {
    setDrawer1("closed");
    setDrawer2("closed");
    setDrawer3("closed");
  };

  const callCarry = (targetMode: CarryMode, item?: ItemData) => {
    if (isBusy) {
      addLogEntry("CARRY가 이미 이동 중이에요");
      return;
    }

    clearActionTimers();
    setIsBusy(true);
    closeAllDrawers();
    const customization = getCustomizationForMode(targetMode);

    if (item) {
      addLogEntry(`"${item.name}"을 찾았어요`);
      addLogEntry(`${item.drawer}번 칸으로 준비할게요`, { silent: true });
    }

    if (customization) {
      const lightText = customization.lightName === "끄기" ? "불빛 끄기" : `불빛 ${customization.lightName}`;
      const songText = customization.songName === "없음" ? "노래 없음" : `노래 ${customization.songName}`;
      addLogEntry(`${lightText}, ${songText} 준비 중`, { silent: true });
    }
    addLogEntry("이동을 시작했어요");

    scheduleAction(() => {
      const locationMap: Record<CarryMode, Location> = {
        idle: "idle",
        sleep: "bedroom",
        kitchen: "kitchen",
        living: "living",
        outing: "entrance",
        returning: "living",
      };
      const labelMap: Record<Location, string> = {
        idle: "대기 위치",
        bedroom: "침실",
        kitchen: "주방",
        living: "거실",
        entrance: "현관",
      };

      const newLocation = locationMap[targetMode];
      setCurrentLocation(newLocation);
      addLogEntry(`${labelMap[newLocation]}로 이동 중`, { silent: true });

      scheduleAction(() => {
        setMode(targetMode);

        if (targetMode === "sleep") {
          setDrawer1("opening");
          scheduleAction(() => {
            setDrawer1("open");
            setIsBusy(false);
            addLogEntry("안녕히 주무세요");
          }, 500);
        } else if (targetMode === "kitchen") {
          setDrawer2("opening");
          scheduleAction(() => {
            setDrawer2("open");
            setIsBusy(false);
            addLogEntry("맛있는 냄새가 나요!");
          }, 500);
        } else if (targetMode === "living") {
          setDrawer3("opening");
          scheduleAction(() => {
            setDrawer3("open");
            setIsBusy(false);
            addLogEntry("편하게 쉬어가세요");
          }, 500);
        } else if (targetMode === "outing") {
          setDrawer3("opening");
          scheduleAction(() => {
            setDrawer3("open");
            setIsBusy(false);
            addLogEntry("잘 다녀오세요!");
          }, 500);
        }
      }, 1000);
    }, 500);
  };

  const returnToHome = () => {
    if (isBusy) {
      addLogEntry("CARRY가 이미 이동 중이에요");
      return;
    }

    clearActionTimers();
    setIsBusy(true);
    addLogEntry("복귀를 시작했어요");
    setMode("returning");
    setDrawer1("closing");
    setDrawer2("closing");
    setDrawer3("closing");

    scheduleAction(() => {
      closeAllDrawers();
      setCurrentLocation("living");
      scheduleAction(() => {
        setMode("idle");
        setIsBusy(false);
        addLogEntry("원래 자리로 복귀했어요");
      }, 1000);
    }, 500);
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
        feedbackMessage,
        notify,
        executionLog,
        addLogEntry,
        itemDatabase,
        addItem,
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
        returnToHome,
      }}
    >
      {children}
    </CarryContext.Provider>
  );
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
