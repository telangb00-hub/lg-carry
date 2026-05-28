import { useEffect, useMemo, useState, type ComponentType } from "react";
import { BedDouble, DoorOpen, Home, Mic, Search, Sofa, UtensilsCrossed } from "lucide-react";
import { CarryProductVisual } from "../components/CarryProductVisual";
import { useCarry, type CarryMode, type ItemData } from "../context/CarryContext";
import { readModeShortcuts, type ModeShortcut, type ShortcutIcon } from "../lib/modeShortcuts";
import { fetchHomeShortcuts } from "../services/carryCommandBridge";

const iconMap: Record<ShortcutIcon, ComponentType<{ size?: number }>> = {
  bed: BedDouble,
  kitchen: UtensilsCrossed,
  sofa: Sofa,
  outing: DoorOpen,
  home: Home,
};

export function Dashboard() {
  const { itemDatabase, callCarry, callShortcutMode, returnToHome, isBusy } = useCarry();
  const [query, setQuery] = useState("비닐장갑");
  const [shortcuts] = useState<ModeShortcut[]>(() => readModeShortcuts());
  const [dbShortcuts, setDbShortcuts] = useState<ModeShortcut[]>([]);
  const matchedItem = useMemo(() => findItem(query, itemDatabase), [itemDatabase, query]);
  const visibleShortcuts = dbShortcuts.length ? dbShortcuts : shortcuts;

  useEffect(() => {
    void fetchHomeShortcuts().then((items) =>
      setDbShortcuts(
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

  const callBySearch = () => {
    if (matchedItem) callCarry(getModeForItem(matchedItem), matchedItem);
  };

  const runShortcut = (shortcut: ModeShortcut) => {
    if (shortcut.mode === "home") {
      returnToHome();
      return;
    }
    callShortcutMode(shortcut.mode, shortcut);
  };

  return (
    <div className="carry-page simple-home-page">
      <section className="simple-station-card">
        <CarryProductVisual />
      </section>

      <section className="simple-search-card">
        <div className="simple-search-input">
          <Search size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") callBySearch();
            }}
            placeholder="물품명 검색"
          />
          <Mic size={19} />
        </div>
        <button onClick={callBySearch} disabled={!matchedItem || isBusy}>
          {isBusy ? "CARRY 이동 중" : matchedItem ? `${matchedItem.name} 호출` : "물품을 찾을 수 없어요"}
        </button>
      </section>

      <section className="simple-mode-grid">
        {visibleShortcuts.map((shortcut) => {
          const Icon = iconMap[shortcut.icon];
          return (
            <div key={shortcut.id}>
              <ModeButton icon={Icon} label={shortcut.label} onClick={() => runShortcut(shortcut)} disabled={isBusy} />
            </div>
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

function ModeButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="simple-mode-button" onClick={onClick} disabled={disabled}>
      <Icon size={22} />
      <span>{label}</span>
    </button>
  );
}

function findItem(command: string, items: ItemData[]) {
  const normalized = command.replace(/\s/g, "").toLowerCase();
  return items.find((item) => normalized.includes(item.name.replace(/\s/g, "").toLowerCase()));
}

function getModeForItem(item: ItemData): CarryMode {
  if (item.drawer === 1) return "sleep";
  if (item.drawer === 2) return "kitchen";
  if (item.location === "외출") return "outing";
  return "living";
}
