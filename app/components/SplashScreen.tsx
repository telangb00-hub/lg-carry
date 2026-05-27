import { motion } from "motion/react";

export function SplashScreen() {
  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <motion.div
        className="splash-brand"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="splash-lg">LG</div>
        <motion.div
          className="splash-orbit"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
        />
        <h1>CARRY</h1>
        <p>AI 생활 스테이션 연결 중</p>
      </motion.div>
    </motion.div>
  );
}
