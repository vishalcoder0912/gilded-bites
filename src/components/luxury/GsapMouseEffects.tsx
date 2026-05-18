import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GsapMouseEffects() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dotEl = dot.current;
    const ringEl = ring.current;
    if (!dotEl || !ringEl) return;

    const moveDot = gsap.quickTo(dotEl, "x", { duration: 0.18, ease: "power3" });
    const moveDotY = gsap.quickTo(dotEl, "y", { duration: 0.18, ease: "power3" });
    const moveRing = gsap.quickTo(ringEl, "x", { duration: 0.45, ease: "power3" });
    const moveRingY = gsap.quickTo(ringEl, "y", { duration: 0.45, ease: "power3" });

    const onMove = (event: MouseEvent) => {
      moveDot(event.clientX);
      moveDotY(event.clientY);
      moveRing(event.clientX);
      moveRingY(event.clientY);
    };

    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const active = target.closest("a, button, canvas, input, textarea");

      gsap.to(ringEl, {
        scale: active ? 2.2 : 1,
        borderColor: active ? "#f0c27a" : "rgba(217,163,91,.55)",
        duration: 0.25,
      });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f0c27a] mix-blend-difference md:block"
      />
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d9a35b]/60 md:block"
      />
    </>
  );
}
