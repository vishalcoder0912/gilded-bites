import { Environment, Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function seededRandom(seed: number) {
  const value = Math.sin(seed * 9301.73) * 43758.5453;
  return value - Math.floor(value);
}

function Globe() {
  const group = useRef<THREE.Group>(null);

  const goldPieces = useMemo(() => {
    return Array.from({ length: 34 }).map((_, index) => {
      const phi = seededRandom(index + 1) * Math.PI * 2;
      const theta = seededRandom(index + 17) * Math.PI;
      const r = 1.53;

      return {
        position: [
          r * Math.sin(theta) * Math.cos(phi),
          r * Math.cos(theta),
          r * Math.sin(theta) * Math.sin(phi),
        ] as [number, number, number],
        rotation: [
          seededRandom(index + 31) * 3,
          seededRandom(index + 47) * 3,
          seededRandom(index + 59) * 3,
        ] as [number, number, number],
        scale: 0.06 + seededRandom(index + 71) * 0.13,
      };
    });
  }, []);

  useFrame((state) => {
    if (!group.current) return;

    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;

    group.current.rotation.y += 0.004;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      mouseY * 0.22,
      0.05,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      -mouseX * 0.12,
      0.05,
    );
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.5, 96, 96]} />
        <meshStandardMaterial
          color="#190804"
          roughness={0.34}
          metalness={0.12}
          envMapIntensity={1.4}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.505, 96, 96]} />
        <meshPhysicalMaterial
          color="#321106"
          roughness={0.18}
          metalness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.2}
          transmission={0}
          transparent
          opacity={0.38}
        />
      </mesh>

      {goldPieces.map((piece, index) => (
        <mesh
          key={index}
          position={piece.position}
          rotation={piece.rotation}
          scale={piece.scale}
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#d6a14d"
            metalness={1}
            roughness={0.24}
            envMapIntensity={1.8}
          />
        </mesh>
      ))}

      <mesh rotation={[1.2, 0.2, 0.4]}>
        <torusGeometry args={[1.95, 0.006, 8, 160]} />
        <meshStandardMaterial color="#d6a14d" metalness={1} roughness={0.3} />
      </mesh>

      <mesh rotation={[1.55, 0.6, -0.5]}>
        <torusGeometry args={[2.12, 0.005, 8, 160]} />
        <meshStandardMaterial color="#b87832" metalness={1} roughness={0.32} />
      </mesh>
    </group>
  );
}

export default function ProceduralChocolateGlobe() {
  return (
    <div className="h-[420px] w-full sm:h-[520px] lg:h-[560px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 35 }} dpr={[1, 1.6]}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 5]} intensity={3.2} color="#ffd29a" />
        <pointLight position={[-3, -2, 3]} intensity={1.1} color="#8b3f18" />

        <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.35}>
          <Globe />
        </Float>

        <Sparkles
          count={90}
          scale={4.8}
          size={1.8}
          speed={0.35}
          color="#d6a14d"
        />

        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
