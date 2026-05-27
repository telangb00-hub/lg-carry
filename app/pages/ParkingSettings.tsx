import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useCarry } from "../context/CarryContext";

interface ParkingPoint {
  id: string;
  name: string;
  desc: string;
  coordinate: string;
}

const storageKey = "carry-parking-points";
const defaultParkingPoints: ParkingPoint[] = [
  { id: "home", name: "거실 중앙", desc: "기본 대기 위치", coordinate: "X 0.0 / Z 0.0" },
  { id: "bed", name: "침대 옆", desc: "취침 루틴 위치", coordinate: "X -4.2 / Z 6.8" },
  { id: "kitchen", name: "주방 조리대", desc: "주방 호출 위치", coordinate: "X 5.4 / Z 2.1" },
];

export function ParkingSettings() {
  const { currentLocation, addLogEntry } = useCarry();
  const [points, setPoints] = useState<ParkingPoint[]>(() => readParkingPoints());
  const [name, setName] = useState("");

  const updatePoints = (next: ParkingPoint[]) => {
    setPoints(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const rememberCurrentPosition = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const coordinate = makeMockCoordinate(currentLocation, points.length);
    updatePoints([{ id: Date.now().toString(), name: trimmed, desc: "현재 위치 기준으로 기억됨", coordinate }, ...points]);
    addLogEntry(`${trimmed} 위치를 기억했어요`);
    setName("");
  };

  return (
    <div className="carry-page settings-page">
      <section className="setting-panel">
        <div className="setting-section-head">
          <div>
            <span>Parking</span>
            <h2>주차 포인트</h2>
          </div>
          <MapPin size={22} />
        </div>
        <div className="parking-map-row">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="예: 내 책상 앞" />
          <button onClick={rememberCurrentPosition}>
            <Plus size={17} />
            현재 위치 기억하기
          </button>
        </div>
      </section>

      <section className="parking-list">
        {points.map((point) => (
          <article className="preset-card" key={point.id}>
            <MapPin size={19} />
            <div>
              <strong>{point.name}</strong>
              <p>{point.desc} · {point.coordinate}</p>
            </div>
            <button onClick={() => updatePoints(points.filter((item) => item.id !== point.id))}>
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

function readParkingPoints() {
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return defaultParkingPoints;
  try {
    return JSON.parse(saved) as ParkingPoint[];
  } catch {
    return defaultParkingPoints;
  }
}

function makeMockCoordinate(location: string, index: number) {
  const base = {
    bedroom: [-4.2, 6.8],
    kitchen: [5.4, 2.1],
    living: [0.8, -1.6],
    entrance: [7.2, -4.8],
    idle: [0, 0],
  }[location] ?? [0, 0];

  return `X ${(base[0] + index * 0.2).toFixed(1)} / Z ${(base[1] + index * 0.15).toFixed(1)}`;
}
