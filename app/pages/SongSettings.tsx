import { useState } from "react";
import { Music, Plus, Trash2 } from "lucide-react";
import { useCarry } from "../context/CarryContext";

export function SongSettings() {
  const { songPresets, addSongPreset, deleteSongPreset } = useCarry();
  const [song, setSong] = useState("");

  const addSong = () => {
    const trimmed = song.trim();
    if (!trimmed) return;
    addSongPreset(trimmed);
    setSong("");
  };

  return (
    <div className="carry-page settings-page">
      <section className="setting-panel">
        <div className="setting-section-head">
          <div>
            <span>Sound</span>
            <h2>노래 설정</h2>
          </div>
          <Music size={22} />
        </div>
        <div className="custom-add-row">
          <input value={song} onChange={(event) => setSong(event.target.value)} placeholder="예: 아침 주방 리듬" />
          <button onClick={addSong}>
            <Plus size={17} />
          </button>
        </div>
      </section>

      <section className="preset-list">
        {songPresets.map((songName) => (
          <article className="preset-card" key={songName}>
            <Music size={19} />
            <div>
              <strong>{songName}</strong>
              <p>모드와 루틴에서 선택 가능</p>
            </div>
            <button onClick={() => deleteSongPreset(songName)} disabled={songPresets.length <= 1}>
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
