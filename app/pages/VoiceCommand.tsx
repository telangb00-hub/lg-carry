import { useState } from "react";
import { LocateFixed, Mic } from "lucide-react";
import { useCarry, type CarryMode, type ItemData } from "../context/CarryContext";

const sampleItems = ["비닐장갑", "수면안대", "리모컨", "마스크"];

export function VoiceCommand() {
  const { itemDatabase, callCarry, addLogEntry, isBusy } = useCarry();
  const [isListening, setIsListening] = useState(false);

  const listen = () => {
    if (isBusy) return;
    setIsListening(true);
    addLogEntry("음성 호출 대기");
    setTimeout(() => {
      const item = itemDatabase.find((entry) => entry.name === "비닐장갑") ?? itemDatabase[0];
      if (item) callCarry(getModeForItem(item), item);
      setIsListening(false);
    }, 1000);
  };

  const callItem = (name: string) => {
    if (isBusy) return;
    const item = itemDatabase.find((entry) => entry.name === name);
    if (item) callCarry(getModeForItem(item), item);
  };

  return (
    <div className="carry-page voice-simple-page">
      <section className="voice-hero-card">
        <h2>필요한 물건을 캐리에게 호출해보세요!</h2>
        <button className={`voice-mic-button${isListening ? " active" : ""}`} onClick={listen} disabled={isBusy}>
          <Mic size={42} />
        </button>
        <p>{isListening ? "듣고 있어요..." : isBusy ? "CARRY가 이동 중이에요" : "마이크를 누르고 말해보세요"}</p>
      </section>

      <button className="call-me-button" disabled>
        <LocateFixed size={22} />내 위치로 부르기
      </button>
      <p className="disabled-feature-note">위치 기반 호출은 기술 설정 후 사용할 수 있어요.</p>

      <section className="favorite-items-card">
        <div className="favorite-title">
          <span>Favorite</span>
          <h3>자주 쓰는 물품</h3>
        </div>
        <div className="favorite-item-list">
          {sampleItems.map((name) => (
            <button key={name} onClick={() => callItem(name)} disabled={isBusy}>
              {name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function getModeForItem(item: ItemData): CarryMode {
  if (item.drawer === 1) return "sleep";
  if (item.drawer === 2) return "kitchen";
  if (item.location === "외출") return "outing";
  return "living";
}
