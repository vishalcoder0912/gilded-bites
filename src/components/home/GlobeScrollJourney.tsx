import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

const ChocolateGlobe = lazy(() => import("@/components/hero/ChocolateGlobe"));

function useDesktopJourney() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setEnabled(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return enabled;
}

function PackagingBox({ progress }: { progress: ReturnType<typeof useSpring> }) {
  const boxOpacity = useTransform(progress, [0.72, 0.8, 1], [0, 1, 1]);
  const boxY = useTransform(progress, [0.72, 0.92], [90, 0]);
  const lidRotate = useTransform(progress, [0.78, 0.94], [-75, 0]);
  const finalOpacity = useTransform(progress, [0.9, 0.98], [0, 1]);

  return (
    <motion.div
      className="pointer-events-none fixed bottom-8 left-1/2 z-30 hidden h-[220px] w-[420px] max-w-[42vw] -translate-x-1/2 lg:block"
      style={{ opacity: boxOpacity, y: boxY, perspective: 900 }}
    >
      <div className="absolute inset-x-6 bottom-0 h-[128px] rounded-[14px] border border-[#d7a85f]/35 bg-gradient-to-br from-[#211009] via-[#070302] to-[#351407] shadow-[0_34px_90px_rgba(0,0,0,0.72)]">
        <div className="absolute inset-x-7 top-5 h-10 rounded-full bg-[#210b05] blur-xl" />
        <div className="absolute inset-x-8 top-5 h-14 rounded-[10px] border border-[#d7a85f]/14 bg-[radial-gradient(circle_at_center,rgba(111,39,16,0.75),rgba(16,5,2,0.95))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f0c27a]/70 to-transparent" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <p className="text-[10px] uppercase tracking-[0.48em] text-[#d7a85f]">Noir Sane</p>
          <p className="mt-2 font-serif text-xl italic text-[#f8eadc]">Wholesome Bites</p>
        </div>
      </div>

      <motion.div
        className="absolute left-1/2 top-8 h-[70px] w-[380px] max-w-[40vw] -translate-x-1/2 rounded-[14px] border border-[#d7a85f]/40 bg-gradient-to-r from-[#3b1709] via-[#0b0503] to-[#2a1007] shadow-[0_24px_70px_rgba(215,168,95,0.13)]"
        style={{
          rotateX: lidRotate,
          transformOrigin: "50% 100%",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-[#f0c27a]/70 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-sm italic text-[#f0c27a]">
          Noir Sane
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-[-26px] text-center"
        style={{ opacity: finalOpacity }}
      >
        <p className="text-xs uppercase tracking-[0.34em] text-[#f0c27a]">
          Sealed in Noir Sane elegance.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function GlobeScrollJourney() {
  const desktop = useDesktopJourney();
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 72,
    damping: 24,
    mass: 0.75,
  });

  const x = useTransform(progress, [0, 0.18, 0.38, 0.58, 0.78, 1], ["25vw", "24vw", "-3vw", "15vw", "0vw", "0vw"]);
  const y = useTransform(progress, [0, 0.18, 0.38, 0.58, 0.78, 0.92, 1], ["-8vh", "12vh", "18vh", "28vh", "34vh", "34vh", "34vh"]);
  const scale = useTransform(progress, [0, 0.18, 0.38, 0.58, 0.78, 0.92, 1], [1, 0.78, 0.62, 0.48, 0.38, 0.28, 0.28]);
  const opacity = useTransform(progress, [0, 0.38, 0.78, 0.9, 0.94], [1, 0.85, 0.78, 0.58, 0]);
  const rotate = useTransform(progress, [0, 1], [0, -28]);
  const glowOpacity = useTransform(progress, [0, 0.58, 0.88], [0.42, 0.24, 0.12]);
  const blur = useTransform(progress, [0, 0.78, 0.94], ["blur(0px)", "blur(0px)", "blur(3px)"]);

  if (!desktop || prefersReducedMotion) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-1/2 top-1/2 z-10 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2"
        style={{ x, y, scale, opacity, rotate, filter: blur }}
      >
        <motion.div
          className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_center,rgba(215,168,95,0.34),rgba(74,30,14,0.18)_42%,transparent_68%)] blur-3xl"
          style={{ opacity: glowOpacity }}
        />
        <div className="pointer-events-auto relative h-full w-full">
          <Suspense fallback={<div className="mx-auto mt-28 h-80 w-80 rounded-full bg-[#1a0b05]" />}>
            <ChocolateGlobe className="h-full max-w-none" />
          </Suspense>
        </div>
      </motion.div>

      <PackagingBox progress={progress} />
    </>
  );
}
