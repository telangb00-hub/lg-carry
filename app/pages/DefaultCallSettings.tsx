import { useState } from "react";
import { MapPin, Music, Palette } from "lucide-react";
import { useCarry } from "../context/CarryContext";

export function DefaultCallSettings() {
  const { lightPresets, songPresets, defaultCallSettings, setDefaultCallSettings, addLogEntry } = useCarry();
  const [place, setPlace] = useState(defaultCallSettings.place);
  const [lightId, setLightId] = useState(
    lightPresets.find((light) => light.color === defaultCallSettings.lightColor)?.id ?? lightPresets[0]?.id ?? "",
  );
  const [songName, setSongName] = useState(defaultCallSettings.songName);
  const selectedLight = lightPresets.find((light) => light.id === lightId) ?? lightPresets[0];

  const save = () => {
    if (!selectedLight || !songName) return;
    setDefaultCallSettings({
      place,
      lightName: selectedLight.name,
      lightColor: selectedLight.color,
      songName,
    });
    addLogEntry("기본 호출값 저장");
  };

  return (
    <div className="carry-page routine-page">
      <section className="routine-create-card">
        <span className="carry-eyebrow">Default Call</span>
        <h2>기본값 설정</h2>
        <p>평소에 부르고 보낼 때 사용할 장소, 불빛, 음악을 정합니다. 서랍은 자동으로 열지 않습니다.</p>
        <div className="routine-form-grid">
          <label>
            <MapPin size={17} />
            <input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="기본 호출 장소" />
          </label>
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
          <button onClick={save}>기본값 저장</button>
        </div>
      </section>
    </div>
  );
}
