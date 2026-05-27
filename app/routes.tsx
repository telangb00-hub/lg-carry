import { createHashRouter } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { VoiceCommand } from "./pages/VoiceCommand";
import { ItemDatabase } from "./pages/ItemDatabase";
import { ExecutionLog } from "./pages/ExecutionLog";
import { Settings } from "./pages/Settings";
import { Routines } from "./pages/Routines";
import { RoutineSetup } from "./pages/RoutineSetup";
import { DefaultCallSettings } from "./pages/DefaultCallSettings";
import { RoutineAlarms } from "./pages/RoutineAlarms";
import { ModeBuilder } from "./pages/ModeBuilder";
import { LightSettings } from "./pages/LightSettings";
import { SongSettings } from "./pages/SongSettings";
import { ParkingSettings } from "./pages/ParkingSettings";

export const router = createHashRouter([
  {
    path: "/",
    Component: AppShell,
    children: [
      { index: true, Component: Dashboard },
      { path: "voice", Component: VoiceCommand },
      { path: "database", Component: ItemDatabase },
      { path: "routines", Component: Routines },
      { path: "routine-alarms", Component: RoutineAlarms },
      { path: "routine-setup", Component: RoutineSetup },
      { path: "mode-builder", Component: ModeBuilder },
      { path: "log", Component: ExecutionLog },
      { path: "settings", Component: Settings },
      { path: "settings/lights", Component: LightSettings },
      { path: "settings/songs", Component: SongSettings },
      { path: "settings/parking", Component: ParkingSettings },
      { path: "default-call", Component: DefaultCallSettings },
    ],
  },
]);
