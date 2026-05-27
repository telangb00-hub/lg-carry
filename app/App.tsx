import { RouterProvider } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { router } from "./routes";
import { CarryProvider } from "./context/CarryContext";
import { SplashScreen } from "./components/SplashScreen";
import { useEffect, useState } from "react";

export default function App() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 1850);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <CarryProvider>
      <AnimatePresence>{isBooting && <SplashScreen />}</AnimatePresence>
      <RouterProvider router={router} />
    </CarryProvider>
  );
}
