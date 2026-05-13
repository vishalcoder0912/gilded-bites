import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

type ChocolateGlobeProps = {
  className?: string;
  clickTarget?: string;
  onClick?: () => void;
};

function createChocolateTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d")!;

  const base = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  base.addColorStop(0, "#1a0904");
  base.addColorStop(0.35, "#5a2b18");
  base.addColorStop(0.6, "#2a1008");
  base.addColorStop(1, "#070302");

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 34; i++) {
    ctx.beginPath();
    ctx.lineWidth = Math.random() * 10 + 4;
    ctx.strokeStyle = `rgba(177, 96, 34, ${Math.random() * 0.24 + 0.08})`;

    const y = Math.random() * canvas.height;
    ctx.moveTo(-100, y);

    for (let x = 0; x <= canvas.width + 200; x += 140) {
      const wave =
        Math.sin(x * 0.006 + i) * 45 +
        Math.sin(x * 0.018 + i * 0.7) * 18;

      ctx.lineTo(x, y + wave);
    }

    ctx.stroke();
  }

  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.lineWidth = Math.random() * 4 + 1.2;
    ctx.strokeStyle = `rgba(212, 142, 61, ${Math.random() * 0.45 + 0.25})`;

    const y = Math.random() * canvas.height;
    ctx.moveTo(-80, y);

    for (let x = 0; x <= canvas.width + 100; x += 110) {
      const wave =
        Math.sin(x * 0.009 + i * 0.8) * 28 +
        Math.sin(x * 0.02 + i) * 12;

      ctx.lineTo(x, y + wave);
    }

    ctx.stroke();
  }

  const shine = ctx.createRadialGradient(
    canvas.width * 0.36,
    canvas.height * 0.27,
    30,
    canvas.width * 0.36,
    canvas.height * 0.27,
    380
  );

  shine.addColorStop(0, "rgba(255, 225, 190, 0.45)");
  shine.addColorStop(0.32, "rgba(190, 105, 55, 0.18)");
  shine.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawNoirSaneMark(ctx, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;

  return texture;
}

function createBumpTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#777";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 42; i++) {
    ctx.beginPath();
    ctx.lineWidth = Math.random() * 8 + 3;
    ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.22 + 0.12})`;

    const y = Math.random() * canvas.height;
    ctx.moveTo(-100, y);

    for (let x = 0; x <= canvas.width + 200; x += 130) {
      ctx.lineTo(
        x,
        y +
          Math.sin(x * 0.007 + i) * 40 +
          Math.sin(x * 0.02 + i) * 18
      );
    }

    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

function drawNoirSaneMark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const cx = width * 0.5;
  const cy = height * 0.48;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);

  ctx.strokeStyle = "rgba(218, 165, 92, 0.85)";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(-210, -20);
  ctx.bezierCurveTo(-330, -180, -510, -170, -570, 0);
  ctx.bezierCurveTo(-420, 70, -290, 70, -210, -20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-180, -55);
  ctx.bezierCurveTo(-130, -270, 90, -300, 160, -90);
  ctx.bezierCurveTo(45, -40, -75, 10, -180, -55);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(25, 10);
  ctx.bezierCurveTo(145, -155, 350, -125, 415, 35);
  ctx.bezierCurveTo(260, 115, 120, 105, 25, 10);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(235, 190, 120, 0.78)";

  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(95 + i * 35, 22 - i * 13);
    ctx.lineTo(115 + i * 34, 58 - i * 7);
    ctx.stroke();
  }

  ctx.font = "92px Georgia, serif";
  ctx.fillStyle = "rgba(20, 8, 3, 0.82)";
  ctx.shadowColor = "rgba(229, 171, 92, 0.45)";
  ctx.shadowBlur = 12;
  ctx.fillText("Noir Sane", -250, 190);

  ctx.restore();
}

function GoldenOrbit() {
  const ringOne = useRef<THREE.Mesh>(null);
  const ringTwo = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (ringOne.current) {
      ringOne.current.rotation.z = time * 0.18;
    }

    if (ringTwo.current) {
      ringTwo.current.rotation.z = -time * 0.14;
    }
  });

  return (
    <group>
      <mesh ref={ringOne} rotation={[1.32, 0.15, -0.15]}>
        <torusGeometry args={[1.65, 0.005, 12, 220]} />
        <meshBasicMaterial color="#c7893f" transparent opacity={0.75} />
      </mesh>

      <mesh ref={ringTwo} rotation={[1.42, -0.35, 0.35]}>
        <torusGeometry args={[1.85, 0.004, 12, 220]} />
        <meshBasicMaterial color="#8f531f" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

function ChocolateSphere({
  mouse,
  onOpenShop,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  onOpenShop: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const sphere = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const chocolateTexture = useMemo(() => createChocolateTexture(), []);
  const bumpTexture = useMemo(() => createBumpTexture(), []);

  useFrame(({ clock }) => {
    if (!group.current) return;

    const time = clock.getElapsedTime();

    const targetX = mouse.current.y * 0.18;
    const targetY = mouse.current.x * 0.35 + time * 0.08;

    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetX,
      0.055
    );

    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetY,
      0.055
    );

    const targetScale = hovered ? 1.055 : 1;
    group.current.scale.x = THREE.MathUtils.lerp(
      group.current.scale.x,
      targetScale,
      0.08
    );
    group.current.scale.y = THREE.MathUtils.lerp(
      group.current.scale.y,
      targetScale,
      0.08
    );
    group.current.scale.z = THREE.MathUtils.lerp(
      group.current.scale.z,
      targetScale,
      0.08
    );

    if (sphere.current) {
      sphere.current.rotation.z = Math.sin(time * 0.35) * 0.015;
    }
  });

  return (
    <group
      ref={group}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={onOpenShop}
    >
      <mesh ref={sphere}>
        <sphereGeometry args={[1.3, 128, 128]} />
        <meshPhysicalMaterial
          map={chocolateTexture}
          bumpMap={bumpTexture}
          bumpScale={0.09}
          color="#3a1609"
          roughness={0.43}
          metalness={0.08}
          clearcoat={0.78}
          clearcoatRoughness={0.22}
          reflectivity={0.45}
        />
      </mesh>

      <GoldenOrbit />

      <mesh position={[0.5, 0.75, 1.3]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="#fff2de" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

function ChocolateGlobeScene({
  mouse,
  onOpenShop,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  onOpenShop: () => void;
}) {
  return (
    <>
      <ambientLight intensity={0.72} />

      <directionalLight position={[4, 4, 5]} intensity={3.2} color="#ffd0a0" />

      <pointLight position={[-4, -1, 3]} intensity={2.1} color="#b46323" />

      <pointLight position={[2, 3, 2]} intensity={1.8} color="#ffe0bc" />

      <Suspense fallback={null}>
        <ChocolateSphere mouse={mouse} onOpenShop={onOpenShop} />
      </Suspense>
    </>
  );
}

export default function ChocolateGlobe({
  className = "",
  clickTarget = "/shop",
  onClick,
}: ChocolateGlobeProps) {
  const navigate = useNavigate();
  const mouse = useRef({ x: 0, y: 0 });

  const openTarget = () => {
    if (onClick) {
      onClick();
      return;
    }

    navigate(clickTarget);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    mouse.current.x =
      ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;

    mouse.current.y =
      -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`relative isolate mx-auto h-[min(86vw,360px)] min-h-[260px] w-full max-w-[560px] touch-pan-y sm:h-[min(72vw,520px)] sm:max-w-[700px] lg:h-[min(54vw,680px)] lg:max-w-none ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-[6%] inset-y-[4%] rounded-full bg-[radial-gradient(circle_at_center,rgba(184,105,42,0.22),transparent_62%)] blur-2xl" />

      <Canvas
        camera={{ position: [0, 0, 4.65], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        style={{ touchAction: "pan-y" }}
      >
        <ChocolateGlobeScene
          mouse={mouse}
          onOpenShop={openTarget}
        />
      </Canvas>

      <button
        type="button"
        onClick={openTarget}
        className="absolute right-4 top-20 hidden items-center gap-3 rounded-full border border-[#c58a46]/30 bg-black/20 px-4 py-3 text-left text-[#e7c18a] backdrop-blur-md transition hover:border-[#d9a65d]/70 hover:bg-[#2b160d]/70 md:flex"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c58a46]/40 text-lg">
          ↘
        </span>
        <span>
          <span className="block text-sm font-medium text-[#f3ddbd]">
            Drag to explore
          </span>
          <span className="block text-xs text-[#bfa180]">
            Click to discover
          </span>
        </span>
      </button>
    </div>
  );
}
