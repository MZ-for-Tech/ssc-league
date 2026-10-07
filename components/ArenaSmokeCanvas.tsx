"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Color, Group, Mesh, Vector3 } from "three";
import { Smoke } from "react-smoke";

const PARTICLE_COUNT = 44;
const MIN_Y = -600;
const MAX_Y = 500;

function RisingSmoke() {
  const smokeGroup = useRef<Group>(null);
  const particles = useRef<Mesh[]>([]);
  const smokeColor = useMemo(() => new Color("#5b91a8"), []);

  useEffect(() => {
    const group = smokeGroup.current;
    if (!group) return;

    const smokeMeshes: Mesh[] = [];
    group.traverse((object) => {
      const mesh = object as Mesh;
      const velocity = mesh.userData.velocity as Vector3 | undefined;
      if (!mesh.isMesh || !velocity) return;

      mesh.position.y = MIN_Y + Math.random() * (MAX_Y - MIN_Y);
      velocity.x = (Math.random() - 0.5) * 3;
      velocity.y = 10 + Math.random() * 16;
      velocity.z = 0;
      smokeMeshes.push(mesh);
    });
    particles.current = smokeMeshes;
  }, []);

  // Three.js animation updates mesh and velocity objects imperatively each frame.
  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    for (const particle of particles.current) {
      if (particle.position.y < MAX_Y - 1) continue;

      particle.position.y = MIN_Y + Math.random() * 120;
      const velocity = particle.userData.velocity as Vector3 | undefined;
      if (!velocity) continue;

      velocity.x = (Math.random() - 0.5) * 3;
      velocity.y = 10 + Math.random() * 16;
      velocity.z = 0;
    }
  }, -1);
  /* eslint-enable react-hooks/immutability */

  return (
    <group ref={smokeGroup}>
      <Smoke
        color={smokeColor}
        density={PARTICLE_COUNT}
        opacity={0.21}
        minBounds={[-800, MIN_Y, -500]}
        maxBounds={[800, MAX_Y, 500]}
        maxVelocity={[3, 26, 0]}
        enableRotation
        rotation={[0, 0, 0.05]}
        enableWind
        windStrength={[0, 7, 0]}
        windDirection={[0, 1, 0]}
      />
    </group>
  );
}

export default function ArenaSmokeCanvas() {
  return (
    <Canvas
      camera={{ fov: 60, position: [0, 0, 500], far: 6000 }}
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      scene={{ background: null }}
      style={{ background: "transparent" }}
    >
      <directionalLight intensity={1} position={[-1, 0, 1]} />
      <ambientLight intensity={1} />
      <Suspense fallback={null}>
        <RisingSmoke />
      </Suspense>
    </Canvas>
  );
}
