import { useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  type: "chocolate" | "gold" | "fruit" | "sparkle";
  duration: number;
  delay: number;
}

interface FloatingParticlesProps {
  className?: string;
  count?: number;
}

export default function FloatingParticles({ className = "", count = 20 }: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const particles = useMemo(() => {
    const types: Particle["type"][] = ["chocolate", "gold", "fruit", "sparkle"];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 12 + 4,
      type: types[Math.floor(Math.random() * types.length)],
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    }));
  }, [count]);

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const getParticleStyle = (type: Particle["type"], size: number) => {
    switch (type) {
      case "chocolate":
        return {
          background: "linear-gradient(135deg, #3a1609 0%, #1a0904 100%)",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        };
      case "gold":
        return {
          background: "radial-gradient(circle at 30% 30%, #f0c27a 0%, #d9a35b 50%, #b88445 100%)",
          borderRadius: "50%",
          boxShadow: "0 0 20px rgba(217,168,95,0.5), 0 0 40px rgba(217,168,95,0.2)",
        };
      case "fruit":
        return {
          background: "linear-gradient(135deg, #c45c3e 0%, #8b3a2a 100%)",
          borderRadius: "50%",
          boxShadow: "0 4px 8px rgba(139,58,42,0.4)",
        };
      case "sparkle":
        return {
          background: "transparent",
          border: "1px solid rgba(217,168,95,0.6)",
          borderRadius: "50%",
          boxShadow: "0 0 10px rgba(217,168,95,0.8)",
        };
      default:
        return {};
    }
  };

  return (
    <div ref={containerRef} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, y: "110%" }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
              y: ["110%", "-10%"],
              x: [`${particle.x}%`, `${particle.x + (Math.random() - 0.5) * 20}%`],
              rotate: [0, Math.random() * 360],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              width: particle.size,
              height: particle.size,
              ...getParticleStyle(particle.type, particle.size),
            }}
          >
            {particle.type === "sparkle" && (
              <div className="golden-sparkle absolute inset-0 flex items-center justify-center">
                <div className="h-full w-full" style={{
                  background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)",
                }} />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function HeroSparkles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
          }}
          transition={{
            duration: 3,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(240,194,122,0.9) 0%, transparent 70%)",
            boxShadow: "0 0 20px rgba(240,194,122,0.6)",
          }}
        />
      ))}
    </div>
  );
}

export function AmbientGlow() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.4, 0.15]);

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none fixed inset-0 z-0"
    >
      <div className="absolute left-[10%] top-[20%] h-[600px] w-[600px] rounded-full bg-[#d9a35b]/5 blur-[150px]" />
      <div className="absolute bottom-[10%] right-[5%] h-[500px] w-[500px] rounded-full bg-[#8b4513]/5 blur-[120px]" />
      <div className="absolute left-[50%] top-[60%] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#d9a35b]/3 blur-[100px]" />
    </motion.div>
  );
}