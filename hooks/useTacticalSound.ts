"use client";

import useSound from "use-sound";

export default function useTacticalSound() {
  const [playHover] = useSound("/sounds/hover.mp3", { volume: 0.1 }); // Low volume is key
  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.3 });

  return { playHover, playClick };
}