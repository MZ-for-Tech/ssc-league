"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SmokeScene = dynamic(
  () => import("@/components/ArenaSmokeCanvas"),
  { ssr: false },
);

export default function ArenaSmoke() {
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setMotionAllowed(!preference.matches);

    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  if (!motionAllowed) return null;

  return <SmokeScene />;
}
