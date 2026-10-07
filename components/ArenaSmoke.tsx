"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SmokeScene = dynamic(
  () => import("@/components/ArenaSmokeCanvas"),
  { ssr: false },
);

export default function ArenaSmoke() {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      const allowed = !preference.matches;
      setMotionAllowed(allowed);

      if (!allowed) {
        setWebglAvailable(false);
        return;
      }

      // Three's WebGLRenderer logs an error when the browser cannot create a
      // context. Check first so WebGL-disabled environments skip the canvas.
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("webgl2");
        setWebglAvailable(Boolean(context));
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        setWebglAvailable(false);
      }
    };

    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  if (!motionAllowed || !webglAvailable) return null;

  return <SmokeScene />;
}
