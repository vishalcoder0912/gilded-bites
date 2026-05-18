import { ContactShadows, Environment, Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import type { MutableRefObject, PointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

type PointerState = {
  x: number;
  y: number;
};

type DragState = {
  isDragging: boolean;
  velocity: { x: number; y: number };
  target: { x: number; y: number };
};

type ChocolateGlobeProps = {
  className?: string;
  onClick?: () => void;
};

const GOLD = "#d7a85f";
const PALE_GOLD = "#f8eadc";
const DARK_GOLD = "#c38a46";
const AMBER = "#e6b66f";

function seededNoise(seed: number) {
  const x = Math.sin(seed * 9301.73) * 43758.5453;
  return x - Math.floor(x);
}

function drawCacaoEmblem(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const cx = width * 0.52;
  const cy = height * 0.46;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.14);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(6, 2, 1, 0.9)";
  ctx.shadowBlur = 16;
  ctx.strokeStyle = "rgba(28, 10, 4, 0.72)";
  ctx.lineWidth = 18;

  const leaves = [
    [-245, -10, -120, -225, 65, -92],
    [-80, -68, 55, -275, 225, -72],
    [12, 36, 190, -118, 365, 54],
  ];

  leaves.forEach(([sx, c1y, c2x, c2y, ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.bezierCurveTo(sx + 55, c1y, c2x, c2y, ex, ey);
    ctx.bezierCurveTo(c2x - 28, ey + 115, sx + 62, 90, sx, 0);
    ctx.stroke();
  });

  ctx.shadowColor = "rgba(215, 168, 95, 0.4)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(215, 168, 95, 0.6)";
  ctx.lineWidth = 6;

  leaves.forEach(([sx, c1y, c2x, c2y, ex, ey]) => {
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.bezierCurveTo(sx + 55, c1y, c2x, c2y, ex, ey);
    ctx.bezierCurveTo(c2x - 28, ey + 115, sx + 62, 90, sx, 0);
    ctx.stroke();
  });

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(215, 168, 95, 0.7)";
  for (let i = 0; i < 9; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    ctx.beginPath();
    ctx.ellipse(130 + col * 34, 16 + row * 31 - col * 8, 15, 22, 0.72, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function createChocolateTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.Texture();

  const base = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  base.addColorStop(0, "#0a0402");
  base.addColorStop(0.25, "#4a1e0e");
  base.addColorStop(0.50, "#201008");
  base.addColorStop(0.78, "#3a160b");
  base.addColorStop(1, "#080402");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 46; i += 1) {
    const y = seededNoise(i + 7) * canvas.height;
    const strength = seededNoise(i + 31);
    ctx.beginPath();
    ctx.lineWidth = 3 + strength * 11;
    ctx.strokeStyle = `rgba(94, 38, 16, ${0.18 + strength * 0.22})`;
    ctx.moveTo(-120, y);

    for (let x = 0; x <= canvas.width + 180; x += 92) {
      const wave = Math.sin(x * 0.006 + i * 0.47) * (28 + strength * 46) +
        Math.sin(x * 0.017 + i) * (9 + strength * 20);
      ctx.lineTo(x, y + wave);
    }

    ctx.stroke();
  }

  for (let i = 0; i < 16; i += 1) {
    const y = seededNoise(i + 109) * canvas.height;
    ctx.beginPath();
    ctx.lineWidth = 1.4 + seededNoise(i + 19) * 3.2;
    ctx.strokeStyle = `rgba(215, 168, 95, ${0.22 + seededNoise(i + 41) * 0.38})`;
    ctx.moveTo(-120, y);

    for (let x = 0; x <= canvas.width + 180; x += 104) {
      ctx.lineTo(x, y + Math.sin(x * 0.007 + i * 0.8) * 36 + Math.sin(x * 0.023 + i * 1.2) * 13);
    }

    ctx.stroke();
  }

  const shine = ctx.createRadialGradient(680, 280, 18, 680, 280, 430);
  shine.addColorStop(0, "rgba(248, 234, 220, 0.55)");
  shine.addColorStop(0.26, "rgba(215, 168, 95, 0.2)");
  shine.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCacaoEmblem(ctx, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

function createBumpTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#78716c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 58; i += 1) {
    const y = seededNoise(i + 203) * canvas.height;
    ctx.beginPath();
    ctx.lineWidth = 2 + seededNoise(i + 211) * 7;
    ctx.strokeStyle = `rgba(255,255,255,${0.07 + seededNoise(i + 217) * 0.2})`;
    ctx.moveTo(-90, y);

    for (let x = 0; x <= canvas.width + 120; x += 74) {
      ctx.lineTo(x, y + Math.sin(x * 0.011 + i * 0.75) * 24 + Math.sin(x * 0.031 + i) * 8);
    }

    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
}

function OrbitRings({ hovered }: { hovered: boolean }) {
  const orbit = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!orbit.current) return;
    orbit.current.rotation.y = clock.elapsedTime * 0.055;
    orbit.current.rotation.z = Math.sin(clock.elapsedTime * 0.18) * 0.04;
  });

  return (
    <group ref={orbit}>
      <mesh rotation={[1.32, 0.12, -0.2]}>
        <torusGeometry args={[1.72, 0.0048, 10, 220]} />
        <meshBasicMaterial color={AMBER} transparent opacity={hovered ? 0.85 : 0.55} />
      </mesh>
      <mesh rotation={[1.48, -0.34, 0.37]}>
        <torusGeometry args={[1.94, 0.0038, 10, 220]} />
        <meshBasicMaterial color={GOLD} transparent opacity={hovered ? 0.65 : 0.42} />
      </mesh>
      <mesh rotation={[1.12, 0.48, 0.58]}>
        <torusGeometry args={[1.5, 0.003, 10, 180]} />
        <meshBasicMaterial color={DARK_GOLD} transparent opacity={hovered ? 0.48 : 0.28} />
      </mesh>
    </group>
  );
}

function GoldParticles() {
  const points = useMemo(() => Array.from({ length: 58 }, (_, index) => {
    const angle = seededNoise(index + 11) * Math.PI * 2;
    const radius = 1.75 + seededNoise(index + 23) * 1.25;
    const y = (seededNoise(index + 37) - 0.5) * 2.25;
    return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  }), []);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <points geometry={geometry}>
      <pointsMaterial color={AMBER} size={0.03} transparent opacity={0.6} depthWrite={false} />
    </points>
  );
}

function ChocolateSphere({ pointer }: { pointer: MutableRefObject<PointerState> }) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const drag = useRef<DragState>({
    isDragging: false,
    velocity: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
  });
  const chocolateMap = useMemo(() => createChocolateTexture(), []);
  const bumpMap = useMemo(() => createBumpTexture(), []);

  useFrame(({ clock }) => {
    if (!group.current) return;

    const d = drag.current;

    if (d.isDragging) {
      d.velocity.y = pointer.current.x * 0.32;
      d.velocity.x = pointer.current.y * 0.18;
      d.target.y += d.velocity.y * 0.06;
      d.target.x += d.velocity.x * 0.06;
    } else {
      d.velocity.x = THREE.MathUtils.damp(d.velocity.x, 0, 4, 0.016);
      d.velocity.y = THREE.MathUtils.damp(d.velocity.y, 0, 4, 0.016);
      d.target.y += clock.elapsedTime * 0.05 + d.velocity.y;
      d.target.x = THREE.MathUtils.damp(d.target.x, pointer.current.y * 0.12, 3, 0.016);
    }

    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      THREE.MathUtils.clamp(d.target.x, -0.6, 0.5),
      0.06,
    );
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, d.target.y, 0.06);
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      Math.sin(clock.elapsedTime * 0.33) * 0.018,
      0.05,
    );
    const scale = hovered ? 1.045 : 1;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, scale, 0.08));
  });

  const handlePointerDown = (e: { stopPropagation: () => void; target: { setPointerCapture: (arg0: number) => void }; pointerId: number }) => {
    e.stopPropagation();
    drag.current.isDragging = true;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    drag.current.isDragging = false;
  };

  return (
    <group
      ref={group}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "grab"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = ""; }}
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.26, 128, 128]} />
        <meshPhysicalMaterial
          map={chocolateMap}
          bumpMap={bumpMap}
          bumpScale={0.06}
          color="#2a1008"
          roughness={0.35}
          metalness={0.08}
          clearcoat={0.9}
          clearcoatRoughness={0.15}
          reflectivity={0.55}
        />
      </mesh>
      <mesh position={[0.42, 0.66, 1.18]}>
        <sphereGeometry args={[0.17, 32, 32]} />
        <meshBasicMaterial color="#f8eadc" transparent opacity={hovered ? 0.3 : 0.2} />
      </mesh>
      <OrbitRings hovered={hovered} />
    </group>
  );
}

function GlobeScene({ pointer }: { pointer: MutableRefObject<PointerState> }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3.6, 4.2, 4.8]} intensity={3.8} color="#f8eadc" castShadow />
      <pointLight position={[-3.4, -0.7, 2.8]} intensity={1.6} color="#c38a46" />
      <pointLight position={[2.6, 1.7, 2.4]} intensity={1.4} color="#e6b66f" />
      <Suspense fallback={null}>
        <Environment preset="warehouse" />
      </Suspense>
      <Float speed={1.05} rotationIntensity={0.08} floatIntensity={0.18}>
        <ChocolateSphere pointer={pointer} />
        <GoldParticles />
      </Float>
      <ContactShadows position={[0, -1.55, 0]} opacity={0.26} scale={4.4} blur={2.5} far={3} color="#1a0b04" />
    </>
  );
}

export default function ChocolateGlobe({ className = "", onClick }: ChocolateGlobeProps) {
  const navigate = useNavigate();
  const pointer = useRef<PointerState>({ x: 0, y: 0 });

  const discover = () => {
    if (onClick) {
      onClick();
      return;
    }

    const featured = document.getElementById("featured-creations");
    if (featured) {
      featured.scrollIntoView({ behavior: "smooth" });
      return;
    }

    navigate("/shop");
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    pointer.current.y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
  };

  return (
    <div
      aria-label="Interactive Noir Sane chocolate globe"
      role="button"
      tabIndex={0}
      onClick={discover}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          discover();
        }
      }}
      onPointerMove={handlePointerMove}
      className={`group relative isolate mx-auto h-[360px] w-full max-w-[580px] cursor-grab touch-pan-y outline-none sm:h-[520px] sm:max-w-[720px] lg:h-[720px] lg:max-w-none ${className}`}
    >
      <div className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_center,rgba(215,168,95,0.3),rgba(74,30,14,0.18)_42%,transparent_68%)] blur-3xl transition duration-500 group-hover:opacity-100" />
      <Canvas
        className="pointer-events-auto"
        camera={{ position: [0, 0, 4.65], fov: 39 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        shadows
        style={{ touchAction: "pan-y" }}
      >
        <GlobeScene pointer={pointer} />
      </Canvas>
    </div>
  );
}
