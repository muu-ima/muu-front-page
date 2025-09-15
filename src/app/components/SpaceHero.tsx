// src/app/components/SpaceHero.tsx
"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";

// --- WebGL実起動テスト（本番オプションで事前にRendererを作ってみる）---
function canInitThreeRenderer(): boolean {
  try {
    const testCanvas = document.createElement("canvas");
    const gl =
      (testCanvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        preserveDrawingBuffer: false,
        powerPreference: "low-power",
        failIfMajorPerformanceCaveat: false,
      }) ||
        testCanvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;

    const testRenderer = new THREE.WebGLRenderer({
      canvas: testCanvas,
      context: gl,
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    testRenderer.setSize(1, 1, false);
    testRenderer.dispose();
    return true;
  } catch {
    return false;
  }
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Particles({ count = 2600, radius = 22, spin = 0.06 }: { count?: number; radius?: number; spin?: number }) {
  const points = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const rand = mulberry32(42);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(rand());
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    return pos;
  }, [count, radius]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y += spin * state.clock.getDelta();
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#eaeaea" size={0.03} sizeAttenuation transparent opacity={0.95} />
    </points>
  );
}

function Rings({ rings = 12, gap = 2.2 }: { rings?: number; gap?: number }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.x = -Math.PI / 3;
    group.current.rotation.z = state.clock.elapsedTime * 0.018;
  });

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(0.85, 0.85, 0.85),
        transparent: true,
        opacity: 0.35,
      }),
    []
  );

  const lines = useMemo(() => {
    const arr: THREE.LineLoop[] = [];
    for (let i = 1; i <= rings; i++) {
      const r = i * gap;
      const geo = new THREE.RingGeometry(r - 0.008, r + 0.008, 256);
      arr.push(new THREE.LineLoop(geo, material));
    }
    return arr;
  }, [rings, gap, material]);

  return <group ref={group}>{lines.map((l, i) => <primitive key={i} object={l} />)}</group>;
}

function FloorGrid() {
  return (
    <Grid
      position={[0, -3.4, 0]}
      args={[40, 40]}
      cellSize={0.8}
      sectionSize={3.2}
      cellColor="#222"
      sectionColor="#5a5a5a"
      fadeDistance={22}
      fadeStrength={2.2}
      infiniteGrid
    />
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 6, 3]} intensity={0.65} />
      <directionalLight position={[-6, -2, -3]} intensity={0.2} />
    </>
  );
}

export interface SpaceHeroProps extends React.ComponentPropsWithoutRef<"div"> {
  children?: React.ReactNode;
  particleCount?: number;
  onReady?: () => void;
}

const ENABLE_3D = process.env.NEXT_PUBLIC_ENABLE_3D !== "false";

export default function SpaceHero({ children, particleCount = 2600, onReady, className, ...rest }: SpaceHeroProps) {
  // --- Hooks はトップレベルに固定 ---
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!ENABLE_3D) return;
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    if (!canInitThreeRenderer()) return;
    setEnabled(true);
  }, []);

  const handleCreated = ({ gl }: { gl: THREE.WebGLRenderer }) => {
    try {
      gl.setClearColor("#0a0a0a", 1);
      gl.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 1.5));
      gl.getContext().getExtension?.("OES_standard_derivatives");

      const canvasEl = gl.domElement as HTMLCanvasElement;
      const onLost = (e: Event) => e.preventDefault();
      canvasEl.addEventListener("webglcontextlost", onLost as EventListener, { passive: false });

      requestAnimationFrame(() => {
        onReady?.();
      });
    } catch (e) {
      console.warn("WebGL onCreated failed:", e);
      setEnabled(false);
    }
  };

  // --- JSX を用意して最後に分岐で返す ---
  const fallbackView = (
    <div
      className={`fallback-hero relative h-[80vh] w-full overflow-hidden rounded-2xl bg-black ${className ?? ""}`}
      {...rest}
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(120% 120% at 10% 10%, rgba(99,102,241,0.25), rgba(56,189,248,0.15) 40%, rgba(0,0,0,0) 70%)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* 薄いノイズの質感（任意） */}
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.8)_1px,transparent_1px)] bg-[length:12px_12px]" />
      {children && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );

  const threeView = (
    <div className={`relative h+[80vh] w-full overflow-hidden rounded-2xl bg-black ${className ?? ""}`} {...rest}>
      <Canvas
        camera={{ position: [0, 1.4, 7], fov: 52 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: "low-power",
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={handleCreated}
      >
        <Lights />
        <group>
          <Particles count={particleCount} radius={22} spin={0.06} />
          <Rings rings={12} gap={2.2} />
          <FloorGrid />
        </group>

        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.25} mipmapBlur />
          <Noise premultiply opacity={0.035} />
          <Vignette eskil={false} offset={0.15} darkness={0.9} />
        </EffectComposer>
      </Canvas>

      {children && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );

  return enabled ? threeView : fallbackView;
}
