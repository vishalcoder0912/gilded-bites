import { useEffect, useState, useCallback, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface CursorGlowProps {
  className?: string;
}

export function CursorGlow({ className = "" }: CursorGlow) {
  const [isVisible, setIsVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const x = useSpring(mouseX, { stiffness: 500, damping: 28 });
  const y = useSpring(mouseY, { stiffness: 500, damping: 28 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove]);

  if (!isVisible) return null;

  return (
    <motion.div
      className={cn("pointer-events-none fixed left-0 top-0 z-[9999] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(215,168,95,0.15),transparent_70%)]", className)}
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
    />
  );
}

interface MagneticElementProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticElement({
  children,
  className = "",
  strength = 0.3,
}: MagneticElementProps) {
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = node.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) * strength;
      const y = (e.clientY - top - height / 2) * strength;

      node.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleMouseLeave = () => {
      node.style.transform = "translate(0px, 0px)";
    };

    node.addEventListener("mousemove", handleMouseMove);
    node.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      node.removeEventListener("mousemove", handleMouseMove);
      node.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn("transition-transform duration-200", className)}>
      {children}
    </div>
  );
}

interface FloatingGradientProps {
  className?: string;
  color?: "gold" | "amber" | "copper";
}

export function FloatingGradient({
  className = "",
  color = "gold",
}: FloatingGradientProps) {
  const colors = {
    gold: "from-[#d7a85f]/20 via-[#e6b66f]/10 to-transparent",
    amber: "from-[#c38a46]/20 via-[#b97a38]/10 to-transparent",
    copper: "from-[#a26d38]/20 via-[#8b5a2b]/10 to-transparent",
  };

  return (
    <div className={cn("absolute rounded-full bg-gradient-to-br opacity-40 blur-3xl animate-pulse", colors[color], className)} />
  );
}

interface NoiseOverlayProps {
  className?: string;
  opacity?: number;
}

export function NoiseOverlay({ className = "", opacity = 0.03 }: NoiseOverlayProps) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-[9998] opacity-[var(--noise-opacity)]", className)}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        "--noise-opacity": opacity,
      }}
    />
  );
}

interface PremiumButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PremiumButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  size = "md",
}: PremiumButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: "bg-gradient-to-r from-[#e6b66f] to-[#b97a38] text-[#1a0a04]",
    secondary: "bg-[#120804] border border-[#d7a85f]/40 text-[#f8eadc]",
    ghost: "bg-transparent border border-[#d7a85f]/30 text-[#d7a85f]",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-sm font-semibold uppercase tracking-wider transition-all duration-300",
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.span
        className="relative z-10 flex items-center gap-2"
        animate={{ x: isHovered ? 4 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.span>

      <motion.div
        className="absolute inset-0 bg-white/10"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "0%" : "-100%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}

interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerText({ children, className = "" }: ShimmerText) {
  return (
    <motion.span
      className={cn(
        "bg-gradient-to-r from-[#f8eadc] via-[#d7a85f] to-[#f8eadc] bg-[length:200%_auto] bg-clip-text text-transparent",
        className
      )}
      animate={{ backgroundPosition: ["0% center", "200% center", "0% center"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}