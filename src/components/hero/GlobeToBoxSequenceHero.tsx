import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Gift, Sparkles } from "lucide-react";

const FRAME_COUNT = 215;
const FRAME_FOLDER = "/Frames";

function framePath(index: number) {
  const frameNumber = String(index + 1).padStart(3, "0");
  return `${FRAME_FOLDER}/ezgif-frame-${frameNumber}.jpg`;
}

function preloadFrames() {
  const priorityFrames = [0, 1, 2, 3, 4, 5, 20, 40, 60, 80, 100, 120, 140, 160, 180, 209, 214];

  priorityFrames.forEach((index) => {
    const img = new Image();
    img.src = framePath(index);
  });

  const preloadRest = () => {
    for (let index = 0; index < FRAME_COUNT; index += 1) {
      if (priorityFrames.includes(index)) continue;

      const img = new Image();
      img.src = framePath(index);
    }
  };

  window.setTimeout(preloadRest, 900);
}

const scenes = [
  {
    start: 0,
    end: 0.22,
    eyebrow: "Noir Sane",
    title: "A chocolate world made for gifting.",
    body:
      "A glossy dark-chocolate globe travels through gold, cocoa, and celebration before entering its luxury gift box.",
    align: "left",
  },
  {
    start: 0.18,
    end: 0.42,
    eyebrow: "Cocoa Orbit",
    title: "The globe follows the scroll.",
    body:
      "Every movement feels slow, premium, and cinematic — like a handcrafted object being prepared for its final reveal.",
    align: "right",
  },
  {
    start: 0.42,
    end: 0.67,
    eyebrow: "Gift Ritual",
    title: "The box opens for the moment.",
    body:
      "Gold light, dark shadows, and floating particles make the product feel like a ritual, not just a store section.",
    align: "left",
  },
  {
    start: 0.7,
    end: 1,
    eyebrow: "Final Reveal",
    title: "Sealed inside a moment worth gifting.",
    body:
      "Noir Sane turns the chocolate experience into a cinematic gifting journey — from floating globe to luxury box.",
    align: "center",
  },
];

export default function GlobeToBoxSequenceHero() {
  const reduceMotion = useReducedMotion();
  const [activeFrame, setActiveFrame] = useState(0);
  const [imageReady, setImageReady] = useState(false);

  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 48,
    damping: 26,
    mass: 0.9,
  });

  useEffect(() => {
    preloadFrames();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setActiveFrame(150);
    }
  }, [reduceMotion]);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (reduceMotion) return;

    const scrollRange = Math.min(Math.max(latest / 0.72, 0), 1);
    const nextFrame = Math.round(scrollRange * (FRAME_COUNT - 1));

    setActiveFrame((current) => {
      if (current === nextFrame) return current;
      return nextFrame;
    });
  });

  const currentImage = useMemo(() => framePath(activeFrame), [activeFrame]);

  const heroTextOpacity = useTransform(smoothProgress, [0, 0.1, 0.18], [1, 1, 0]);
  const frameScale = useTransform(smoothProgress, [0, 0.4, 0.72], [1.08, 1.02, 1]);
  const frameY = useTransform(smoothProgress, [0, 0.72], ["0vh", "-2vh"]);
  const darkOverlay = useTransform(smoothProgress, [0, 0.7], [0.22, 0.52]);
  const finalPanelOpacity = useTransform(smoothProgress, [0.68, 0.78, 1], [0, 1, 1]);
  const finalPanelY = useTransform(smoothProgress, [0.68, 0.88], [80, 0]);
  const progressScale = useTransform(smoothProgress, [0, 0.72], [0, 1]);

  return (
    <section className="relative h-[430vh] bg-[#050201] text-[#f8eadc]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.img
          key={currentImage}
          src={currentImage}
          alt=""
          aria-hidden="true"
          onLoad={() => setImageReady(true)}
          style={{ scale: frameScale, y: frameY }}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {!imageReady && (
          <div className="absolute inset-0 grid place-items-center bg-[#050201]">
            <div className="h-20 w-20 animate-pulse rounded-full bg-[#d7a85f]/20 blur-xl" />
          </div>
        )}

        <motion.div
          style={{ opacity: darkOverlay }}
          className="absolute inset-0 bg-[#050201]"
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.72)_100%)]" />
        <div className="cinematic-sequence-noise pointer-events-none absolute inset-0" />
        <div className="cinematic-sequence-grid pointer-events-none absolute inset-0" />

        <FloatingGoldParticles />

        <motion.div
          style={{ opacity: heroTextOpacity }}
          className="absolute left-6 top-[18%] z-30 max-w-xl sm:left-12 lg:left-20"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.48em] text-[#d7a85f]">
            Maison de Chocolat
          </p>

          <h1 className="font-serif text-5xl leading-[0.9] sm:text-7xl lg:text-8xl">
            Noir <span className="italic text-[#d7a85f]">Sane</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-[#c8b5a4]">
            Wholesome Bites, Delightful Nights. A luxury chocolate journey
            where the globe travels down and becomes a gift.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 bg-[#d7a85f] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#090403] shadow-[0_0_45px_rgba(215,168,95,0.28)]"
            >
              Shop Collection
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center border border-[#d7a85f]/35 bg-white/[0.03] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#f8eadc] backdrop-blur"
            >
              Explore Story
            </Link>
          </div>
        </motion.div>

        {scenes.map((scene) => (
          <SceneText
            key={scene.title}
            scene={scene}
            progress={smoothProgress}
          />
        ))}

        <motion.div
          style={{ opacity: finalPanelOpacity, y: finalPanelY }}
          className="absolute bottom-8 left-1/2 z-40 w-[92%] max-w-5xl -translate-x-1/2 rounded-[2rem] border border-[#d7a85f]/25 bg-[#080302]/75 p-5 shadow-[0_35px_120px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-8"
        >
          <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d7a85f]/20 bg-[#d7a85f]/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#d7a85f]">
                <Gift className="h-3.5 w-3.5" />
                Luxury Box Experience
              </div>

              <h2 className="font-serif text-3xl leading-tight text-[#f8eadc] sm:text-5xl">
                From floating globe to finished gift.
              </h2>
            </div>

            <div>
              <p className="text-sm leading-7 text-[#c8b5a4]">
                Use this hero as the main brand moment. After the box closes,
                the customer naturally moves into collection, gifting, and
                shopping sections.
              </p>

              <Link
                to="/shop"
                className="mt-6 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#d7a85f]"
              >
                Discover Collection
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 z-50 h-[3px] w-full bg-[#d7a85f]/10">
          <motion.div
            style={{ scaleX: progressScale, transformOrigin: "left center" }}
            className="h-full w-full bg-[#d7a85f] shadow-[0_0_24px_rgba(215,168,95,0.85)]"
          />
        </div>

        <motion.div
          style={{ opacity: heroTextOpacity }}
          className="absolute bottom-8 left-1/2 z-40 -translate-x-1/2 text-center"
        >
          <div className="mx-auto mb-3 h-10 w-px overflow-hidden bg-[#d7a85f]/20">
            <motion.div
              className="h-1/2 w-full bg-[#d7a85f]"
              animate={{ y: ["-100%", "220%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <p className="text-[10px] uppercase tracking-[0.34em] text-[#d7a85f]/80">
            Scroll
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function SceneText({
  scene,
  progress,
}: {
  scene: {
    start: number;
    end: number;
    eyebrow: string;
    title: string;
    body: string;
    align: string;
  };
  progress: any;
}) {
  const middle = (scene.start + scene.end) / 2;

  const opacity = useTransform(
    progress,
    [scene.start, scene.start + 0.05, middle, scene.end - 0.05, scene.end],
    [0, 1, 1, 1, 0]
  );

  const y = useTransform(
    progress,
    [scene.start, middle, scene.end],
    [32, 0, -32]
  );

  const positionClass =
    scene.align === "right"
      ? "right-6 text-left sm:right-12 lg:right-20"
      : scene.align === "center"
        ? "left-1/2 w-[90%] max-w-3xl -translate-x-1/2 text-center"
        : "left-6 sm:left-12 lg:left-20";

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute top-[18%] z-30 max-w-xl ${positionClass}`}
    >
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7a85f]/20 bg-[#d7a85f]/10 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-[#d7a85f] backdrop-blur">
        <Sparkles className="h-3.5 w-3.5" />
        {scene.eyebrow}
      </div>

      <h2 className="font-serif text-4xl leading-[0.95] text-[#f8eadc] sm:text-6xl lg:text-7xl">
        {scene.title}
      </h2>

      <p
        className={`mt-5 text-sm leading-7 text-[#c8b5a4] ${
          scene.align === "center" ? "mx-auto max-w-2xl" : "max-w-md"
        }`}
      >
        {scene.body}
      </p>
    </motion.div>
  );
}

function FloatingGoldParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {Array.from({ length: 34 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-[#d7a85f]/70 shadow-[0_0_18px_rgba(215,168,95,0.85)]"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 19) % 100}%`,
          }}
          animate={{
            y: [0, -34, 0],
            opacity: [0.18, 0.95, 0.18],
            scale: [0.75, 1.55, 0.75],
          }}
          transition={{
            duration: 4.2 + (index % 5),
            repeat: Infinity,
            delay: index * 0.14,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}