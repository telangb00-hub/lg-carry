import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Battery,
  BluetoothConnected,
  ChevronRight,
  CirclePower,
  History,
  MapPin,
  Music,
  Palette,
  SlidersHorizontal,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useCarry } from "../context/CarryContext";

export function Settings() {
  const { battery, isUnityConnected } = useCarry();
  const [speed, setSpeed] = useState(60);
  const [isRunning, setIsRunning] = useState(true);
  const [showErrorDetail, setShowErrorDetail] = useState(false);

  return (
    <div className="carry-page settings-page">
      <section className="setting-status-grid">
        <StatusCard icon={Battery} label="배터리" value={`${battery}%`} />
        <StatusCard icon={BluetoothConnected} label="연결" value={isUnityConnected ? "정상" : "끊김"} />
        <StatusCard icon={AlertTriangle} label="충돌" value="0회" />
        <button className="setting-status-card action" onClick={() => setShowErrorDetail((value) => !value)}>
          <Wrench size={20} />
          <span>오류 코드</span>
          <strong>C-00</strong>
          <ChevronRight size={17} />
        </button>
      </section>

      {showErrorDetail && (
        <section className="error-detail-card">
          <div className="error-row">
            <strong>C-00</strong>
            <div>
              <b>정상</b>
              <p>현재 보고된 오류가 없습니다. 기술자에게 보낼 때는 이 코드를 함께 전달하면 됩니다.</p>
            </div>
          </div>
        </section>
      )}

      <section className="settings-menu-list">
        <SettingLink icon={Palette} title="불빛 설정" desc="색깔을 추가하거나 삭제해요." to="/settings/lights" />
        <SettingLink icon={Music} title="노래 설정" desc="호출음과 모드 음악을 관리해요." to="/settings/songs" />
        <SettingLink icon={MapPin} title="주차 포인트" desc="자주 두는 위치를 기억해요." to="/settings/parking" />
        <SettingLink icon={SlidersHorizontal} title="기본값 설정" desc="평소 호출에 쓸 기본값을 정해요." to="/default-call" />
        <SettingLink icon={History} title="실행 로그" desc="최근 호출과 설정 변경을 확인해요." to="/log" />
      </section>

      <section className="setting-panel compact">
        <div className="setting-section-head">
          <div>
            <span>Move</span>
            <h2>이동 속도</h2>
          </div>
          <SlidersHorizontal size={22} />
        </div>
        <input className="speed-range" type="range" min="20" max="100" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
        <div className="speed-value">{speed}%</div>
      </section>

      <button className={`power-button${isRunning ? " running" : ""}`} onClick={() => setIsRunning((value) => !value)}>
        <CirclePower size={22} />
        {isRunning ? "스테이션 종료" : "스테이션 시작"}
      </button>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="setting-status-card">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SettingLink({ icon: Icon, title, desc, to }: { icon: LucideIcon; title: string; desc: string; to: string }) {
  return (
    <Link className="customize-entry-card" to={to}>
      <Icon size={22} />
      <div>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      <ChevronRight size={20} />
    </Link>
  );
}
