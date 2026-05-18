import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FRAME_COUNT = 210;
const FRAME_PATH = "/Frames/ezgif-frame-";

interface FrameImageProps {
  currentFrame: number;
}

function FrameImage({ currentFrame }: FrameImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const frameNumber = Math.min(Math.max(currentFrame, 1), FRAME_COUNT);
  const paddedFrame = String(frameNumber).padStart(3, "0");
  const src = `${FRAME_PATH}${paddedFrame}.jpg`;

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#0a0604] animate-pulse" />
      )}
      <img
        src={src}
        alt={`Frame ${frameNumber}`}
        className="w-full h-full object-contain"
        onLoad={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0 }}
      />
    </div>
  );
}

function PreloadFrames({ progress }: { progress: number }) {
  const frameToLoad = Math.min(Math.max(Math.floor(progress * FRAME_COUNT), 1), FRAME_COUNT);
  const paddedFrame = String(frameToLoad).padStart(3, "0");
  const src = `${FRAME_PATH}${paddedFrame}.jpg`;

  useEffect(() => {
    const img = new Image();
    img.src = src;
  }, [src]);

  return null;
}

const parallaxTexts = [
  { text: "The Art of Chocolate", subtext: "Precision meets passion", progress: 0.05 },
  { text: "Handcrafted Perfection", subtext: "Every detail matters", progress: 0.25 },
  { text: "Premium Ingredients", subtext: "Sourced from the finest", progress: 0.45 },
  { text: "The Noir Signature", subtext: "A legacy of excellence", progress: 0.65 },
  { text: "Experience True Luxury", subtext: "Taste the difference", progress: 0.85 },
];

function ParallaxText({ text, subtext, progress, scrollProgress }: { text: string; subtext: string; progress: number; scrollProgress: number }) {
  const opacity = useTransform(
    scrollProgress,
    [progress - 0.1, progress, progress + 0.1],
    [0, 1, 0]
  );
  const y = useTransform(scrollProgress, [progress - 0.1, progress, progress + 0.1], [50, 0, -50]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
      style={{ opacity, y }}
    >
      <h2 className="text-5xl md:text-7xl font-serif text-white/90 tracking-tight text-center">
        {text}
      </h2>
      <p className="mt-4 text-xl md:text-2xl text-white/60 font-light">
        {subtext}
      </p>
    </motion.div>
  );
}

export default function Atelier() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedFrames, setLoadedFrames] = useState<Set<number>>(new Set());

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const currentFrame = useTransform(smoothProgress, [0, 1], [1, FRAME_COUNT]);

  const [displayFrame, setDisplayFrame] = useState(1);

  useEffect(() => {
    const unsubscribe = currentFrame.on("change", (latest) => {
      const frame = Math.round(latest);
      setDisplayFrame(frame);

      if (!loadedFrames.has(frame) && loadedFrames.size < 50) {
        setLoadedFrames((prev) => new Set([...prev, frame]));
      }
    });

    return () => unsubscribe();
  }, [currentFrame, loadedFrames]);

  return (
    <div className="bg-[#0a0604] min-h-screen">
      <div ref={containerRef} className="relative h-[210vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(217,163,91,0.08)_0%,_transparent_70%)]" />

          <div className="relative w-full h-full max-w-4xl mx-auto pt-24 pb-12">
            <FrameImage currentFrame={displayFrame} />
          </div>

          {parallaxTexts.map((item, index) => (
            <ParallaxText
              key={index}
              text={item.text}
              subtext={item.subtext}
              progress={item.progress}
              scrollProgress={smoothProgress}
            />
          ))}

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]),
            }}
          >
            <span className="text-white/40 text-sm uppercase tracking-[0.3em]">
              Scroll to Explore
            </span>
            <motion.animate
              initial={{ y: 0 }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-5 h-5 text-white/40" />
            </motion.animate>
          </motion.div>
        </div>
      </div>

      <footer className="py-20 px-6 text-center bg-[#0a0604]">
        <h2 className="text-4xl md:text-5xl font-serif text-white/90 mb-6">
          Experience Noir Sane
        </h2>
        <p className="text-white/60 mb-8 max-w-xl mx-auto">
          Discover our handcrafted chocolate collection, where every piece tells a story of passion and precision.
        </p>
        <a
          href="/shop"
          className="inline-block px-8 py-4 bg-[#d9a35b] text-[#090403] font-semibold uppercase tracking-[0.18em] rounded-full hover:bg-[#f0c27a] transition-colors"
        >
          Explore Collection
        </a>
      </footer>
    </div>
  );
}