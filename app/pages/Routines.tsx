import { Link } from "react-router-dom";
import { AlarmClock, ChevronRight, Grid2X2Plus } from "lucide-react";

export function Routines() {
  return (
    <div className="carry-page routine-page">
      <Link className="routine-entry-card" to="/routine-alarms">
        <div className="routine-entry-icon">
          <AlarmClock size={24} />
        </div>
        <div>
          <span className="carry-eyebrow">Routine</span>
          <h2>루틴 만들기</h2>
          <p>알람처럼 시간과 요일을 정하고 자동 호출을 설정해요.</p>
        </div>
        <ChevronRight size={21} />
      </Link>

      <Link className="routine-entry-card" to="/mode-builder">
        <div className="routine-entry-icon">
          <Grid2X2Plus size={24} />
        </div>
        <div>
          <span className="carry-eyebrow">Mode</span>
          <h2>모드 만들기</h2>
          <p>홈 화면 아래 버튼을 추가하거나 지우고 순서를 정리해요.</p>
        </div>
        <ChevronRight size={21} />
      </Link>
    </div>
  );
}
