import { useState } from "react";
import { Palette, Plus, Trash2 } from "lucide-react";
import { useCarry } from "../context/CarryContext";

export function LightSettings() {
  const { lightPresets, addLightPreset, deleteLightPreset } = useCarry();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#A7D8FF");

  const addLight = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addLightPreset({ name: trimmed, color });
    setName("");
  };

  return (
    <div className="carry-page settings-page">
      <section className="setting-panel">
        <div className="setting-section-head">
          <div>
            <span>Light</span>
            <h2>불빛 설정</h2>
          </div>
          <Palette size={22} />
        </div>
        <div className="custom-add-row">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="예: 따뜻한 저녁빛" />
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} aria-label="불빛 색상" />
          <button onClick={addLight}>
            <Plus size={17} />
          </button>
        </div>
      </section>

      <section className="preset-list">
        {lightPresets.map((preset) => (
          <article className="preset-card" key={preset.id}>
            <span className="light-preview-dot" style={{ background: preset.color }} />
            <div>
              <strong>{preset.name}</strong>
              <p>{preset.color}</p>
            </div>
            {preset.name !== "끄기" && preset.name !== "없음" && (
              <button onClick={() => deleteLightPreset(preset.id)} disabled={lightPresets.length <= 1}>
                <Trash2 size={16} />
              </button>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
