"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

const SmokeScene = dynamic(
  () => import("react-smoke").then((module) => module.SmokeScene),
  { ssr: false },
);

export default function ArenaSmoke() {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const smokeColor = useMemo(() => new THREE.Color("#5b91a8"), []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setMotionAllowed(!preference.matches);

    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  if (!motionAllowed) return null;

  return (
    <SmokeScene
      camera={{ fov: 60, position: [0, 0, 500], far: 6000 }}
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      scene={{ background: null }}
      smoke={{
        color: smokeColor,
        density: 44,
        opacity: 0.21,
        minBounds: [-800, -600, -500],
        maxBounds: [800, 500, 500],
        maxVelocity: [3, 26, 0],
        enableRotation: true,
        rotation: [0, 0, 0.05],
        enableWind: true,
        windStrength: [0, 7, 0],
        windDirection: [0, 1, 0],
      }}
      style={{ background: "transparent" }}
    />
  );
}
