import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { Decal, Environment } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

type InteractiveChocolateGlobeProps = {
  onClick?: () => void;
};

function drawGoldLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(width / 100, height / 160);

  const fill = ctx.createLinearGradient(-42, -76, 52, 62);
  fill.addColorStop(0, "#fff4bd");
  fill.addColorStop(0.28, "#f0c76c");
  fill.addColorStop(0.68, "#b97e2d");
  fill.addColorStop(1, "#73501c");

  ctx.fillStyle = fill;
  ctx.strokeStyle = "#f8d98d";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(245,197,97,0.42)";
  ctx.shadowBlur = 16;

  ctx.beginPath();
  ctx.moveTo(0, -78);
  ctx.lineTo(16, -43);
  ctx.lineTo(42, -56);
  ctx.lineTo(32, -22);
  ctx.lineTo(58, -12);
  ctx.lineTo(30, 8);
  ctx.lineTo(46, 38);
  ctx.lineTo(12, 30);
  ctx.lineTo(0, 74);
  ctx.lineTo(-12, 30);
  ctx.lineTo(-46, 38);
  ctx.lineTo(-30, 8);
  ctx.lineTo(-58, -12);
  ctx.lineTo(-32, -22);
  ctx.lineTo(-42, -56);
  ctx.lineTo(-16, -43);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(68,36,10,0.62)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, -68);
  ctx.lineTo(0, 68);
  ctx.moveTo(0, -36);
  ctx.lineTo(-29, -54);
  ctx.moveTo(0, -27);
  ctx.lineTo(27, -47);
  ctx.moveTo(0, -4);
  ctx.lineTo(-38, -13);
  ctx.moveTo(0, 6);
  ctx.lineTo(35, -6);
  ctx.moveTo(0, 27);
  ctx.lineTo(-24, 37);
  ctx.moveTo(0, 31);
  ctx.lineTo(22, 42);
  ctx.stroke();

  ctx.restore();
}

function useGoldLeafTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 640;

    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGoldLeaf(ctx, 520, 315, 146, 196, 0.08);
    drawGoldLeaf(ctx, 386, 292, 118, 172, -0.62);
    drawGoldLeaf(ctx, 665, 292, 112, 166, 0.64);
    drawGoldLeaf(ctx, 520, 182, 106, 146, 0.05);
    drawGoldLeaf(ctx, 474, 420, 102, 156, -0.38);

    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#fff1bf";
    ctx.beginPath();
    ctx.ellipse(434, 210, 52, 15, -0.58, 0, Math.PI * 2);
    ctx.ellipse(584, 246, 60, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;

    return texture;
  }, []);
}

function ChocolateSphere({ onClick }: InteractiveChocolateGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const isDraggingRef = useRef(false);
  const targetRotationRef = useRef({ x: -0.08, y: 0.2 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const leafTexture = useGoldLeafTexture();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isDraggingRef.current) {
      targetRotationRef.current.y += delta * 0.1;
      targetRotationRef.current.x = THREE.MathUtils.damp(
        targetRotationRef.current.x,
        state.pointer.y * -0.16,
        2.5,
        delta
      );
    }

    targetRotationRef.current.y += velocityRef.current.y * delta * 3.2;
    targetRotationRef.current.x += velocityRef.current.x * delta * 2.4;

    velocityRef.current.y = THREE.MathUtils.damp(velocityRef.current.y, 0, 2.2, delta);
    velocityRef.current.x = THREE.MathUtils.damp(velocityRef.current.x, 0, 2.2, delta);

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotationRef.current.y,
      isDraggingRef.current ? 9 : 4.2,
      delta
    );

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      THREE.MathUtils.clamp(targetRotationRef.current.x, -0.52, 0.42),
      isDraggingRef.current ? 9 : 4.2,
      delta
    );

    if (sphereRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.15) * 0.008;
      sphereRef.current.scale.setScalar(scale);
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    isDraggingRef.current = true;
    event.target.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return;

    event.stopPropagation();
    const movementX = event.nativeEvent.movementX || 0;
    const movementY = event.nativeEvent.movementY || 0;

    targetRotationRef.current.y += movementX * 0.008;
    targetRotationRef.current.x += movementY * 0.005;
    velocityRef.current.y = THREE.MathUtils.clamp(movementX * 0.06, -3.8, 3.8);
    velocityRef.current.x = THREE.MathUtils.clamp(movementY * 0.035, -2.2, 2.2);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    isDraggingRef.current = false;
    event.target.releasePointerCapture(event.pointerId);
  };

  const handleOver = () => {
    document.body.style.cursor = "grab";
  };

  const handleOut = () => {
    isDraggingRef.current = false;
    document.body.style.cursor = "default";
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={onClick}
    >
      <mesh ref={sphereRef} castShadow receiveShadow>
        <sphereGeometry args={[1.32, 128, 128]} />
        <meshPhysicalMaterial
          color="#321006"
          emissive="#110402"
          emissiveIntensity={0.12}
          roughness={0.2}
          metalness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.08}
          reflectivity={0.78}
          sheen={0.12}
        />

        <Decal
          position={[0, 0.62, 1.12]}
          rotation={[-0.38, 0, 0.03]}
          scale={[0.92, 0.56, 1]}
        >
          <meshPhysicalMaterial
            map={leafTexture}
            transparent
            roughness={0.24}
            metalness={0.72}
            clearcoat={0.45}
            clearcoatRoughness={0.18}
            polygonOffset
            polygonOffsetFactor={-5}
          />
        </Decal>
      </mesh>

      <mesh position={[0.44, 0.35, 1.18]} rotation={[0.2, -0.22, -0.08]}>
        <sphereGeometry args={[0.28, 48, 48]} />
        <meshBasicMaterial
          color="#fff0df"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight position={[-2.8, 2.8, 3.4]} intensity={8} color="#d7a85f" />
      <pointLight position={[2.4, -0.7, 2.8]} intensity={4.5} color="#7b2d10" />
      <pointLight position={[1.2, 1.4, 2.8]} intensity={5} color="#fff2df" />
    </group>
  );
}

export default function InteractiveChocolateGlobe({
  onClick,
}: InteractiveChocolateGlobeProps) {
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[520px] cursor-grab active:cursor-grabbing sm:h-[420px] sm:max-w-[680px] lg:h-[600px] lg:max-w-none xl:h-[650px]">
      <div className="pointer-events-none absolute left-1/2 top-[52%] h-[66%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_48%_35%,rgba(255,232,194,0.12),transparent_18%),radial-gradient(circle_at_50%_50%,rgba(78,20,8,0.22),transparent_58%)] blur-2xl" />

      <Canvas
        shadows
        dpr={[1, 1.65]}
        camera={{
          position: [0, 0, 4.9],
          fov: 35,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ touchAction: "pan-y" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.75} />
          <directionalLight
            position={[2.8, 3.8, 5]}
            intensity={5.2}
            color="#fff0dc"
            castShadow
          />
          <directionalLight
            position={[-4, -2, 3]}
            intensity={1.85}
            color="#8a3314"
          />

          <ChocolateSphere onClick={onClick} />

          <Environment preset="studio" />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute right-2 top-6 hidden items-center gap-3 rounded-full border border-[#b88445]/25 bg-[#120804]/45 py-3 pl-3 pr-5 text-[#d8b276]/80 backdrop-blur lg:flex">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b88445]/40 text-[10px] font-bold uppercase tracking-[0.16em]">
          Drag
        </div>
        <div>
          <p className="text-sm font-medium text-[#f5dfc8]">Drag to explore</p>
          <p className="text-xs text-[#bda48d]">Click to discover</p>
        </div>
      </div>
    </div>
  );
}
