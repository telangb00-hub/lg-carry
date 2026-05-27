import { useMemo, useState, type ComponentType } from "react";
import { BedDouble, DoorOpen, Home, Mic, Search, Sofa, UtensilsCrossed } from "lucide-react";
import { CarryProductVisual } from "../components/CarryProductVisual";
import { useCarry, type CarryMode, type ItemData } from "../context/CarryContext";
import { readModeShortcuts, type ModeShortcut, type ShortcutIcon } from "../lib/modeShortcuts";

const iconMap: Record<ShortcutIcon, ComponentType<{ size?: number }>> = {
  bed: BedDouble,
  kitchen: UtensilsCrossed,
  sofa: Sofa,
  outing: DoorOpen,
  home: Home,
};

export function Dashboard() {
  const { itemDatabase, callCarry, returnToHome } = useCarry();
  const [query, setQuery] = useState("비닐장갑");
  const [shortcuts] = useState<ModeShortcut[]>(() => readModeShortcuts());
  const matchedItem = useMemo(() => findItem(query, itemDatabase), [itemDatabase, query]);

  const callBySearch = () => {
    if (matchedItem) callCarry(getModeForItem(matchedItem), matchedItem);
  };

  const runShortcut = (shortcut: ModeShortcut) => {
    if (shortcut.mode === "home") {
      returnToHome();
      return;
    }
    callCarry(shortcut.mode);
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
        <button onClick={callBySearch} disabled={!matchedItem}>
          {matchedItem ? `${matchedItem.name} 호출` : "물품을 찾을 수 없어요"}
        </button>
      </section>

      <section className="simple-mode-grid">
        {shortcuts.map((shortcut) => {
          const Icon = iconMap[shortcut.icon];
          return (
            <div key={shortcut.id}>
              <ModeButton icon={Icon} label={shortcut.label} onClick={() => runShortcut(shortcut)} />
            </div>
          );
        })}
      </section>
    </div>
  );
}

function ModeButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="simple-mode-button" onClick={onClick}>
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
