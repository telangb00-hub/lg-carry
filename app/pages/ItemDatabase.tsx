import { useMemo, useState } from "react";
import { Plus, Search, Tag } from "lucide-react";
import { useCarry, type CarryMode, type ItemData } from "../context/CarryContext";

const floors = [
  { floor: 1, title: "1층", defaultCategory: "취침 / 개인 물품" },
  { floor: 2, title: "2층", defaultCategory: "주방 / 생활 물품" },
  { floor: 3, title: "3층", defaultCategory: "거실 / 외출 물품" },
];

export function ItemDatabase() {
  const { itemDatabase, callCarry, addItem } = useCarry();
  const [activeFloor, setActiveFloor] = useState(1);
  const [floorNames, setFloorNames] = useState<Record<number, string>>({
    1: "취침 / 개인 물품",
    2: "주방 / 생활 물품",
    3: "거실 / 외출 물품",
  });
  const [newItemName, setNewItemName] = useState("");
  const [search, setSearch] = useState("");

  const activeItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return itemDatabase.filter((item) => {
      const matchesFloor = item.drawer === activeFloor;
      const matchesQuery = !query || item.name.toLowerCase().includes(query);
      return matchesFloor && matchesQuery;
    });
  }, [activeFloor, itemDatabase, search]);

  const activeFloorMeta = floors.find((floor) => floor.floor === activeFloor) ?? floors[0];

  const registerItem = () => {
    const name = newItemName.trim();
    if (!name) return;

    addItem({
      name,
      drawer: activeFloor,
      location: floorNames[activeFloor],
      recommendedCallLocation: getRecommendedLocation(activeFloor),
    });
    setNewItemName("");
  };

  return (
    <div className="carry-page floor-page">
      <section className="floor-tabs">
        {floors.map((floor) => {
          const count = itemDatabase.filter((item) => item.drawer === floor.floor).length;
          return (
            <button
              key={floor.floor}
              className={activeFloor === floor.floor ? "active" : ""}
              onClick={() => setActiveFloor(floor.floor)}
            >
              <strong>{floor.title}</strong>
              <span>{count}개</span>
            </button>
          );
        })}
      </section>

      <section className="floor-control-card">
        <div className="floor-card-title">
          <span>{activeFloorMeta.title}</span>
          <h2>이 칸을 자유롭게 설정</h2>
        </div>

        <label className="floor-input-label">
          <Tag size={17} />
          <input
            value={floorNames[activeFloor]}
            onChange={(event) =>
              setFloorNames((prev) => ({
                ...prev,
                [activeFloor]: event.target.value,
              }))
            }
            placeholder={activeFloorMeta.defaultCategory}
          />
        </label>

        <div className="floor-add-row">
          <input
            value={newItemName}
            onChange={(event) => setNewItemName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") registerItem();
            }}
            placeholder={`${activeFloorMeta.title}에 물품 추가`}
          />
          <button onClick={registerItem}>
            <Plus size={18} />
          </button>
        </div>
      </section>

      <section className="floor-list-card">
        <div className="floor-search">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="현재 칸 물품 검색" />
        </div>

        <div className="floor-item-list">
          {activeItems.map((item) => (
            <button key={item.id} onClick={() => callCarry(getModeForItem(item), item)}>
              <div>
                <strong>{item.name}</strong>
                <span>{floorNames[activeFloor]}</span>
              </div>
              <em>호출</em>
            </button>
          ))}
          {activeItems.length === 0 && <p className="floor-empty">아직 등록된 물품이 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}

function getRecommendedLocation(floor: number) {
  if (floor === 1) return "침대 옆";
  if (floor === 2) return "주방";
  return "거실";
}

function getModeForItem(item: ItemData): CarryMode {
  if (item.drawer === 1) return "sleep";
  if (item.drawer === 2) return "kitchen";
  if (item.location.includes("현관") || item.location.includes("외출")) return "outing";
  return "living";
}
