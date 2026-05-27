import { useState } from "react";
import { CalendarClock, MapPin, Music, Palette, Plus } from "lucide-react";
import { useCarry } from "../context/CarryContext";

export function RoutineSetup() {
  const { lightPresets, songPresets, addDrawerCustomization } = useCarry();
  const [name, setName] = useState("");
  const [time, setTime] = useState("20:30");
  const [place, setPlace] = useState("거실");
  const [drawer, setDrawer] = useState<1 | 2 | 3>(3);
  const [lightId, setLightId] = useState(lightPresets[0]?.id ?? "");
  const [songName, setSongName] = useState(songPresets[0] ?? "");

  const selectedLight = lightPresets.find((light) => light.id === lightId) ?? lightPresets[0];

  const saveRoutine = () => {
    const modeName = name.trim();
    if (!modeName || !selectedLight || !songName) return;
    addDrawerCustomization({
      drawer,
      modeName: `${modeName} ${time} ${place}`,
      lightName: selectedLight.name,
      lightColor: selectedLight.color,
      songName,
    });
    setName("");
  };

  return (
    <div className="carry-page routine-page">
      <section className="routine-create-card">
        <span className="carry-eyebrow">Routine Setup</span>
        <h2>루틴 만들기</h2>
        <p>설정에 저장한 불빛과 음악을 골라서 호출 루틴에 묶어둘 수 있습니다.</p>

        <div className="routine-form-grid">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="예: 퇴근 후 휴식" />
          <label>
            <CalendarClock size={17} />
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          </label>
          <label>
            <MapPin size={17} />
            <input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="장소 예: 쇼파 옆" />
          </label>
          <select value={drawer} onChange={(event) => setDrawer(Number(event.target.value) as 1 | 2 | 3)}>
            <option value={1}>1층 칸</option>
            <option value={2}>2층 칸</option>
            <option value={3}>3층 칸</option>
          </select>
          <label>
            <Palette size={17} />
            <select value={lightId} onChange={(event) => setLightId(event.target.value)}>
              {lightPresets.map((light) => (
                <option key={light.id} value={light.id}>
                  {light.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <Music size={17} />
            <select value={songName} onChange={(event) => setSongName(event.target.value)}>
              {songPresets.map((song) => (
                <option key={song}>{song}</option>
              ))}
            </select>
          </label>
          <button onClick={saveRoutine}>
            <Plus size={18} />
            루틴 저장
          </button>
        </div>
      </section>
    </div>
  );
}
