import React, { ReactNode, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "scale";
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  parallax?: boolean;
  parallaxAmount?: number;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  threshold = 0.1,
  className = "",
  parallax = false,
  parallaxAmount = 50,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    parallax ? [parallaxAmount, -parallaxAmount] : [0, 0]
  );

  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { opacity: 0, y: parallax ? 0 : 60 };
      case "down": return { opacity: 0, y: parallax ? 0 : -60 };
      case "left": return { opacity: 0, x: parallax ? 0 : -60 };
      case "right": return { opacity: 0, x: parallax ? 0 : 60 };
      case "scale": return { opacity: 0, scale: 0.9 };
      default: return { opacity: 0, y: 60 };
    }
  };

  const initial = getInitialPosition();
  const animate = { opacity: 1, y: parallaxY, x: 0, scale: 1 };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? animate : initial}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxSection({
  children,
  speed = 0.5,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.8,
            delay: index * staggerDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

export function MotionBlurReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={isInView ? { opacity: 1, filter: "blur(0px)" } : {}}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ClipPathReveal({
  children,
  delay = 0,
  className = "",
  direction = "bottom",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "top" | "bottom" | "left" | "right";
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getClipPath = () => {
    switch (direction) {
      case "top": return "inset(100% 0 0 0)";
      case "bottom": return "inset(0 0 100% 0)";
      case "left": return "inset(0 100% 0 0)";
      case "right": return "inset(0 0 0 100%)";
      default: return "inset(0 0 100% 0)";
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: getClipPath() }}
      animate={isInView ? { clipPath: "inset(0 0 0 0)" } : {}}
      transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}