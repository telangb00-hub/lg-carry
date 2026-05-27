import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Battery, CalendarClock, CheckCircle2, Database, Home, Mic, Settings, Signal, Wifi } from "lucide-react";
import { useCarry } from "../context/CarryContext";

const navItems = [
  { path: "/", label: "홈", icon: Home },
  { path: "/voice", label: "호출", icon: Mic },
  { path: "/database", label: "물품", icon: Database },
  { path: "/routines", label: "루틴", icon: CalendarClock },
  { path: "/settings", label: "설정", icon: Settings },
];

const pageTitleMap: Record<string, string> = {
  "/": "홈",
  "/voice": "호출",
  "/database": "물품",
  "/routines": "루틴",
  "/routine-alarms": "루틴 만들기",
  "/routine-setup": "루틴 설정",
  "/mode-builder": "모드 만들기",
  "/settings": "설정",
  "/settings/lights": "불빛 설정",
  "/settings/songs": "노래 설정",
  "/settings/parking": "주차 포인트",
  "/default-call": "기본값",
  "/log": "실행 로그",
};

export function AppShell() {
  const location = useLocation();
  const { battery, isUnityConnected, feedbackMessage } = useCarry();
  const pageTitle = pageTitleMap[location.pathname] ?? "CARRY";

  return (
    <div className="phone-stage">
      <motion.div
        className="phone-device"
        aria-label="CARRY 스마트폰 앱"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="phone-speaker" />

        <div className="phone-screen">
          <header className="phone-statusbar">
            <span>15:34</span>
            <div className="phone-system-icons">
              <Signal size={14} />
              <Wifi size={14} />
              <Battery size={16} />
            </div>
          </header>

          <section className="phone-appbar">
            <div>
              <span className="phone-kicker">CARRY</span>
              <h1>{pageTitle}</h1>
            </div>
            <div className={`phone-connection ${isUnityConnected ? "online" : ""}`}>
              <span />
              {battery}%
            </div>
          </section>

          <main className="phone-content">
            <motion.div
              key={location.pathname}
              className="page-motion"
              initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </main>

          {feedbackMessage && (
            <motion.div
              className="app-toast"
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle2 size={18} />
              <span>{feedbackMessage}</span>
            </motion.div>
          )}

          <nav className="phone-tabbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) => `phone-tab${isActive ? " active" : ""}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </motion.div>
    </div>
  );
}
