import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import textureUrl from "@/assets/chocolate-texture.jpg";

interface Props {
  onClick: () => void;
}

const Sphere = ({ onClick }: Props) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  // Configure texture once
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
  }, [texture]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* Soft outer glow */}
      <mesh ref={glowRef} scale={1.15}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial color={"#A67C52"} transparent opacity={0.06} />
      </mesh>

      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[1.5, 128, 128]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.35}
          metalness={0.4}
          color={"#6b4226"}
          emissive={"#3B1F0D"}
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
};

const ChocolateGlobe = ({ onClick }: Props) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 5]} intensity={1.6} color={"#F4E2D8"} />
      <pointLight position={[-4, -2, -2]} intensity={1.2} color={"#A67C52"} />
      <pointLight position={[3, -3, 2]} intensity={0.6} color={"#3B1F0D"} />

      <Sphere onClick={onClick} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
};

export default ChocolateGlobe;
