import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";

const ChocolateGlobe = lazy(() => import("@/components/hero/ChocolateGlobe"));

export default function CinematicHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 62,
    damping: 24,
    mass: 0.8,
  });

  const globeX = useTransform(
    smooth,
    [0, 0.25, 0.48, 0.72, 1],
    ["10vw", "-7vw", "7vw", "0vw", "0vw"]
  );

  const globeY = useTransform(
    smooth,
    [0, 0.25, 0.5, 0.78, 1],
    ["0vh", "20vh", "36vh", "53vh", "59vh"]
  );

  const globeScale = useTransform(
    smooth,
    [0, 0.32, 0.65, 0.86, 1],
    [1, 0.86, 0.62, 0.43, 0.28]
  );

  const globeRotate = useTransform(smooth, [0, 1], [0, -28]);
  const globeOpacity = useTransform(smooth, [0, 0.9, 1], [1, 1, 0.28]);

  const heroOpacity = useTransform(smooth, [0, 0.2], [1, 0]);
  const craftOpacity = useTransform(smooth, [0.18, 0.36, 0.5], [0, 1, 0]);
  const orbitOpacity = useTransform(smooth, [0.44, 0.58, 0.68], [0, 1, 0]);
  const boxCopyOpacity = useTransform(smooth, [0.72, 0.86, 1], [0, 1, 1]);

  const boxOpacity = useTransform(smooth, [0.48, 0.62], [0, 1]);
  const boxY = useTransform(smooth, [0.48, 0.72], [120, 0]);

  const lidRotate = useTransform(
    smooth,
    [0.55, 0.7, 0.88, 1],
    [-3, -67, -67, -5]
  );

  const lidY = useTransform(
    smooth,
    [0.55, 0.7, 0.88, 1],
    [0, -48, -48, 0]
  );

  const boxGlowOpacity = useTransform(smooth, [0.68, 0.86, 1], [0, 1, 0.35]);
  const finalSealOpacity = useTransform(smooth, [0.9, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[430vh] bg-[#050201] text-[#f8eadc]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,rgba(215,168,95,0.18),transparent_30%),radial-gradient(circle_at_20%_70%,rgba(88,29,9,0.48),transparent_38%),linear-gradient(180deg,#130704_0%,#070302_62%,#020100_100%)]" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:92px_92px]" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_36%,rgba(0,0,0,0.82)_100%)]" />

        <FloatingGold />

        {/* Hero text */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute left-6 top-[19%] z-30 max-w-xl sm:left-12 lg:left-20"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.48em] text-[#d7a85f]">
            Noir Sane
          </p>

          <h1 className="font-serif text-5xl leading-[0.9] sm:text-7xl lg:text-8xl">
            A chocolate world <br />
            made for <span className="italic text-[#d7a85f]">gifting</span>.
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-[#c8b5a4]">
            Wholesome Bites, Delightful Nights. A glossy dark-chocolate globe
            travels through gold, cocoa, and celebration before resting inside
            its luxury gift box.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 bg-[#d7a85f] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#090403] shadow-[0_0_45px_rgba(215,168,95,0.28)]"
            >
              Shop Collection
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center border border-[#d7a85f]/35 bg-white/[0.03] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#f8eadc] backdrop-blur"
            >
              Explore Story
            </Link>
          </div>
        </motion.div>

        {/* Scene 2 text */}
        <motion.div
          style={{ opacity: craftOpacity }}
          className="absolute left-6 top-[23%] z-30 max-w-md sm:left-12 lg:left-20"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-[#d7a85f]">
            Cocoa Orbit
          </p>
          <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
            The globe follows your scroll.
          </h2>
          <p className="mt-5 text-sm leading-7 text-[#c8b5a4]">
            As the visitor moves down, the chocolate sphere descends slowly -
            like a premium object being prepared for its final reveal.
          </p>
        </motion.div>

        {/* Scene 3 text */}
        <motion.div
          style={{ opacity: orbitOpacity }}
          className="absolute right-6 top-[24%] z-30 max-w-md text-left sm:right-12 lg:right-20"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-[#d7a85f]">
            Golden Motion
          </p>
          <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
            Gold dust. Dark cocoa. Slow luxury.
          </h2>
          <p className="mt-5 text-sm leading-7 text-[#c8b5a4]">
            The animation should feel cinematic, not fast - the globe becomes
            the emotional centre of the website.
          </p>
        </motion.div>

        {/* 3D Globe - reused, travels with scroll */}
        <motion.div
          style={
            reduceMotion
              ? { opacity: 1, scale: 0.7 }
              : {
                  x: globeX,
                  y: globeY,
                  scale: globeScale,
                  rotate: globeRotate,
                  opacity: globeOpacity,
                }
          }
          className="pointer-events-none absolute left-1/2 top-[4%] z-20 w-[92vw] max-w-[880px] -translate-x-1/2 sm:top-[3%] lg:w-[78vw]"
        >
          <Suspense
            fallback={
              <div className="mx-auto h-[520px] w-[520px] animate-pulse rounded-full bg-[#1a0b05]" />
            }
          >
            <ChocolateGlobe />
          </Suspense>
        </motion.div>

        {/* Gift box */}
        <motion.div
          style={{ opacity: boxOpacity, y: boxY }}
          className="absolute bottom-[8%] left-1/2 z-10 w-[88vw] max-w-[720px] -translate-x-1/2"
        >
          <GiftBox
            lidRotate={lidRotate}
            lidY={lidY}
            glowOpacity={boxGlowOpacity}
            finalSealOpacity={finalSealOpacity}
          />
        </motion.div>

        {/* Final text */}
        <motion.div
          style={{ opacity: boxCopyOpacity }}
          className="absolute left-1/2 top-[10%] z-30 w-[90%] max-w-3xl -translate-x-1/2 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-[#d7a85f]">
            The Final Reveal
          </p>

          <h2 className="font-serif text-4xl leading-tight sm:text-6xl lg:text-7xl">
            Sealed inside a moment worth gifting.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#c8b5a4]">
            From floating chocolate planet to luxury gift box - Noir Sane turns
            every scroll into a crafted gifting ritual.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-3 bg-[#d7a85f] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#090403] shadow-[0_0_45px_rgba(215,168,95,0.25)]"
          >
            Discover The Box
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute bottom-8 left-1/2 z-40 -translate-x-1/2 text-center"
        >
          <div className="mx-auto mb-3 h-10 w-px overflow-hidden bg-[#d7a85f]/20">
            <motion.div
              className="h-1/2 w-full bg-[#d7a85f]"
              animate={{ y: ["-100%", "220%"] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
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

function GiftBox({
  lidRotate,
  lidY,
  glowOpacity,
  finalSealOpacity,
}: {
  lidRotate: MotionValue<number>;
  lidY: MotionValue<number>;
  glowOpacity: MotionValue<number>;
  finalSealOpacity: MotionValue<number>;
}) {
  return (
    <div className="relative mx-auto h-[290px] w-full max-w-[680px] sm:h-[360px]">
      {/* Gold inner glow */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute left-1/2 top-[32%] h-44 w-72 -translate-x-1/2 rounded-full bg-[#d7a85f]/35 blur-[70px] sm:h-56 sm:w-96"
      />

      {/* Open box lid */}
      <motion.div
        style={{
          rotateX: lidRotate,
          y: lidY,
          transformOrigin: "bottom center",
          transformStyle: "preserve-3d",
        }}
        className="absolute left-1/2 top-[12%] h-[110px] w-[78%] -translate-x-1/2 rounded-t-[1.8rem] border border-[#d7a85f]/20 bg-gradient-to-b from-[#2a211a] via-[#0c0503] to-[#050201] shadow-[0_30px_90px_rgba(0,0,0,0.75)] sm:h-[140px]"
      >
        <div className="absolute inset-[10px] rounded-t-[1.35rem] bg-gradient-to-b from-[#2c1b0c] via-[#d7a85f]/20 to-[#090403]" />
        <div className="absolute left-1/2 top-1/2 h-px w-28 -translate-x-1/2 bg-[#d7a85f]/45" />
        <p className="absolute left-1/2 top-[42%] -translate-x-1/2 font-serif text-sm tracking-[0.28em] text-[#d7a85f]">
          NOIR SANE
        </p>
      </motion.div>

      {/* Back wall / golden inside */}
      <div className="absolute bottom-[34%] left-1/2 h-[118px] w-[70%] -translate-x-1/2 rounded-t-[1.6rem] border border-[#d7a85f]/25 bg-gradient-to-b from-[#d7a85f] via-[#9b6128] to-[#301005] shadow-[inset_0_0_55px_rgba(255,232,183,0.25)] sm:h-[142px]" />

      {/* Box base */}
      <div className="absolute bottom-[14%] left-1/2 h-[125px] w-[82%] -translate-x-1/2 rounded-b-[1.6rem] border border-[#d7a85f]/25 bg-gradient-to-b from-[#17100c] via-[#080302] to-[#030100] shadow-[0_35px_100px_rgba(0,0,0,0.85)] sm:h-[155px]">
        <div className="absolute left-0 right-0 top-0 h-5 bg-gradient-to-r from-[#5f3616] via-[#d7a85f] to-[#5f3616]" />

        <div className="absolute left-1/2 top-7 h-10 w-36 -translate-x-1/2 rounded-full bg-[#d7a85f]/20 blur-2xl" />

        <p className="absolute left-1/2 top-[48%] -translate-x-1/2 font-serif text-lg tracking-[0.28em] text-[#d7a85f] sm:text-2xl">
          NOIR SANE
        </p>
      </div>

      {/* Closing lid / final sealed box effect */}
      <motion.div
        style={{ opacity: finalSealOpacity }}
        className="absolute bottom-[31%] left-1/2 h-[98px] w-[82%] -translate-x-1/2 rounded-[1.45rem] border border-[#d7a85f]/20 bg-gradient-to-b from-[#17100c] via-[#080302] to-[#030100] shadow-[0_35px_120px_rgba(0,0,0,0.9)]"
      >
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-base tracking-[0.28em] text-[#d7a85f] sm:text-xl">
          NOIR SANE
        </p>
      </motion.div>
    </div>
  );
}

function FloatingGold() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {Array.from({ length: 28 }).map((_, index) => (
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
