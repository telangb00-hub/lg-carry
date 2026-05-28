import { motion } from "motion/react";
import { Music2 } from "lucide-react";
import { useCarry } from "../context/CarryContext";

export function CarryProductVisual() {
  const { mode, drawer1, drawer2, drawer3, drawerCustomizations, stationLightOn, stationMusicOn } = useCarry();
  const activeDrawer = getVisibleDrawer(drawer1, drawer2, drawer3);
  const activeCustomization = activeDrawer
    ? drawerCustomizations.find((customization) => Number(customization.drawer) === activeDrawer && customization.isActive) ??
      drawerCustomizations.find((customization) => Number(customization.drawer) === activeDrawer)
    : undefined;

  const lightColor = activeCustomization?.lightColor ?? "#F8F5EE";
  const lightOff = !stationLightOn || !activeCustomization || activeCustomization.lightName === "끄기";
  const songName = activeCustomization?.songName ?? "없음";
  const isMusicOn = stationMusicOn && songName !== "없음" && songName !== "무음";
  const blink = mode === "outing";
  const breath = mode === "living";
  const lightMotion = blink
    ? { opacity: [0.25, 1, 0.25], scale: [0.98, 1.02, 0.98] }
    : breath
      ? { opacity: [0.45, 0.95, 0.45], scale: [0.99, 1.02, 0.99] }
      : { opacity: lightOff ? 0.18 : 0.95, scale: 1 };

  return (
    <div className="carry-product-wrap">
      <svg viewBox="0 0 360 430" className="carry-product-svg" aria-label="CARRY AI 스테이션 상태">
        <defs>
          <filter id="aiGlow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="aiBody" x1="20%" y1="0%" x2="86%" y2="100%">
            <stop offset="0%" stopColor="#FFF9EC" />
            <stop offset="42%" stopColor="#E9DFC9" />
            <stop offset="100%" stopColor="#A9A18F" />
          </linearGradient>
          <linearGradient id="aiFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="100%" stopColor="#E8DDC9" />
          </linearGradient>
          <linearGradient id="aiDarkGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4C473E" />
            <stop offset="100%" stopColor="#25221E" />
          </linearGradient>
          <linearGradient id="aiDrawer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9B9484" />
            <stop offset="100%" stopColor="#6A6458" />
          </linearGradient>
          <linearGradient id="aiAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A50034" />
            <stop offset="100%" stopColor="#D16A86" />
          </linearGradient>
          <linearGradient id="aiShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse cx="180" cy="394" rx="104" ry="20" fill="#111" opacity="0.1" />
        <motion.ellipse
          cx="180"
          cy="376"
          rx="82"
          ry="12"
          fill={lightColor}
          opacity={lightOff ? 0.12 : 0.42}
          filter="url(#aiGlow)"
          animate={lightMotion}
          transition={{ duration: blink ? 0.7 : 2.2, repeat: lightOff ? 0 : Infinity }}
        />

        <path d="M93 118 C93 75 267 75 267 118 L267 322 C267 371 237 392 180 392 C123 392 93 371 93 322 Z" fill="url(#aiBody)" />
        <path d="M105 122 C122 94 238 94 255 122 L255 318 C255 354 229 374 180 374 C131 374 105 354 105 318 Z" fill="#FFF6E6" opacity="0.38" />
        <ellipse cx="180" cy="118" rx="87" ry="20" fill="#F7EBD2" />
        <ellipse cx="180" cy="322" rx="87" ry="15" fill="#5E594E" opacity="0.18" />
        <path d="M92 349 C115 371 245 371 268 349" fill="none" stroke="#F9F1DD" strokeWidth="8" strokeLinecap="round" opacity="0.92" />

        <g opacity="0.9">
          <path d="M95 185 C72 191 64 215 76 232 C85 246 96 235 96 220 Z" fill="#DED3BE" />
          <path d="M265 185 C288 191 296 215 284 232 C275 246 264 235 264 220 Z" fill="#DED3BE" />
          <circle cx="78" cy="213" r="8" fill="#F8F0DE" opacity="0.9" />
          <circle cx="282" cy="213" r="8" fill="#F8F0DE" opacity="0.9" />
        </g>

        <motion.path
          d="M107 119 C132 103 228 103 253 119"
          fill="none"
          stroke={lightOff ? "#FFFFFF" : lightColor}
          strokeWidth="7"
          strokeLinecap="round"
          opacity={lightOff ? 0.4 : 1}
          filter="url(#aiGlow)"
          animate={lightMotion}
          transition={{ duration: blink ? 0.7 : 2.2, repeat: lightOff ? 0 : Infinity }}
        />

        <motion.line
          x1="116"
          y1="144"
          x2="116"
          y2="330"
          stroke={lightOff ? "#FFFFFF" : lightColor}
          strokeWidth="5"
          strokeLinecap="round"
          opacity={lightOff ? 0.32 : 0.82}
          filter="url(#aiGlow)"
          animate={lightMotion}
          transition={{ duration: blink ? 0.7 : 2.2, repeat: lightOff ? 0 : Infinity }}
        />
        <motion.line
          x1="244"
          y1="144"
          x2="244"
          y2="330"
          stroke={lightOff ? "#FFFFFF" : lightColor}
          strokeWidth="5"
          strokeLinecap="round"
          opacity={lightOff ? 0.32 : 0.82}
          filter="url(#aiGlow)"
          animate={lightMotion}
          transition={{ duration: blink ? 0.7 : 2.2, repeat: lightOff ? 0 : Infinity }}
        />

        <Drawer y={151} floor="3" open={drawer3 === "open" || drawer3 === "opening"} />
        <Drawer y={226} floor="2" open={drawer2 === "open" || drawer2 === "opening"} />
        <Drawer y={301} floor="1" open={drawer1 === "open" || drawer1 === "opening"} />

        <MusicBadge active={isMusicOn} songName={songName} lightColor={lightColor} />
      </svg>
    </div>
  );
}

function Drawer({ y, floor, open }: { y: number; floor: string; open: boolean }) {
  return (
    <g>
      <motion.rect
        x="132"
        y={y + 8}
        width="88"
        height="40"
        rx="12"
        fill="url(#aiDarkGlass)"
        initial={false}
        animate={{ opacity: open ? 0.92 : 0 }}
        transition={{ duration: 0.18 }}
      />
      <motion.g
        initial={false}
        animate={{ x: open ? 116 : 0, y: open ? -1 : 0 }}
        transition={{ duration: 0.42, ease: [0.22, 0.9, 0.2, 1] }}
      >
        <rect x="125" y={y} width="110" height="56" rx="17" fill="url(#aiDrawer)" />
        <rect x="134" y={y + 7} width="92" height="2" rx="1" fill="url(#aiShine)" opacity="0.6" />
        <rect x="196" y={y + 23} width="26" height="7" rx="4" fill="#464238" />
        <motion.text
          x="180"
          y={y + 38}
          textAnchor="middle"
          fontSize="19"
          fontWeight="900"
          fill="#F4EBD8"
          initial={false}
          animate={{ opacity: open ? 0.3 : 1 }}
          transition={{ duration: 0.16 }}
        >
          {floor}
        </motion.text>
      </motion.g>
      {open && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.16 }}>
          <rect x="141" y={y + 18} width="42" height="7" rx="4" fill="#F4EBD8" opacity="0.32" />
          <rect x="141" y={y + 32} width="66" height="7" rx="4" fill="#F4EBD8" opacity="0.2" />
        </motion.g>
      )}
    </g>
  );
}

function MusicBadge({ active, songName, lightColor }: { active: boolean; songName: string; lightColor: string }) {
  return (
    <foreignObject x="60" y="18" width="240" height="45">
      <div className={`station-music-badge${active ? " active" : ""}`}>
        <Music2 size={14} />
        <span>{active ? songName : "음악 없음"}</span>
        <div className="station-eq">
          {[0, 1, 2].map((bar) => (
            <i key={bar} style={{ background: active ? lightColor : "#b8b1a4", animationDelay: `${bar * 0.12}s` }} />
          ))}
        </div>
      </div>
    </foreignObject>
  );
}

function getVisibleDrawer(drawer1: string, drawer2: string, drawer3: string) {
  if (drawer1 === "open" || drawer1 === "opening") return 1;
  if (drawer2 === "open" || drawer2 === "opening") return 2;
  if (drawer3 === "open" || drawer3 === "opening") return 3;
  return null;
}
