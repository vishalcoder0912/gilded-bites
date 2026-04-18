import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import textureUrl from "@/assets/chocolate-texture.jpg";

interface Props {
  onClick: () => void;
}

/** Hook: track viewport breakpoint without re-rendering on every resize tick */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
};

const Sphere = ({ onClick, isMobile }: Props & { isMobile: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const { viewport } = useThree();

  // Configure texture once
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = isMobile ? 4 : 8;
  }, [texture, isMobile]);

  // Responsive scale: shrink on mobile, push slightly down so it doesn't collide with copy
  const scale = isMobile ? 0.7 : 1;
  const yOffset = isMobile ? -0.4 : 0;

  // Lower geometry detail on mobile for 60fps
  const segments = isMobile ? 64 : 128;

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

  // Touch hint: small breathing scale on first mount for mobile
  useEffect(() => {
    if (!isMobile || !meshRef.current) return;
    const start = performance.now();
    const id = requestAnimationFrame(function pulse(now) {
      const t = (now - start) / 1000;
      if (t > 1.2 || !meshRef.current) return;
      const s = scale * (1 + Math.sin(t * Math.PI * 2) * 0.03);
      meshRef.current.scale.set(s, s, s);
      requestAnimationFrame(pulse);
    });
    return () => cancelAnimationFrame(id);
  }, [isMobile, scale]);

  return (
    <group position={[0, yOffset, 0]} scale={scale}>
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
          if (!isMobile) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[1.5, segments, segments]} />
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
  const isMobile = useIsMobile();

  return (
    <Canvas
      camera={{ position: [0, 0, isMobile ? 4.8 : 4.2], fov: isMobile ? 50 : 45 }}
      // Lower DPR on mobile to keep things smooth
      dpr={isMobile ? [1, 1.25] : [1, 1.75]}
      gl={{
        antialias: !isMobile,
        powerPreference: "high-performance",
        alpha: true,
      }}
      style={{
        background: "transparent",
        // Allow vertical page scroll to pass through on touch devices
        touchAction: "pan-y",
      }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.6} color={"#F4E2D8"} />
      <pointLight position={[-4, -2, -2]} intensity={1.2} color={"#A67C52"} />
      {!isMobile && (
        <pointLight position={[3, -3, 2]} intensity={0.6} color={"#3B1F0D"} />
      )}

      <Sphere onClick={onClick} isMobile={isMobile} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        // Disable manual rotation on mobile — let the auto-rotate do its thing
        // and let users scroll the page freely. Tap still triggers onClick.
        enableRotate={!isMobile}
        autoRotate
        autoRotateSpeed={isMobile ? 0.9 : 0.6}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
};

export default ChocolateGlobe;
