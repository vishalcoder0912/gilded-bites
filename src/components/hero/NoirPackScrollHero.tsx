import { useLayoutEffect, useRef, type RefObject } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, PackageCheck, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_FOLDER = "/Frames";
const TOTAL_FRAMES = 240;

// Frames 217-240 return back to the loose globe, so stop on the packed box.
const END_FRAME = 216;
const PRELOAD_EAGER_COUNT = 42;

const imageCache = new Map<number, HTMLImageElement>();
const loadedFrames = new Set<number>();

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function framePath(index: number) {
  const frame = String(clamp(Math.round(index), 0, TOTAL_FRAMES - 1) + 1).padStart(3, "0");
  return `${FRAME_FOLDER}/ezgif-frame-${frame}.jpg`;
}

function getImage(index: number) {
  const safe = clamp(Math.round(index), 0, TOTAL_FRAMES - 1);
  const cached = imageCache.get(safe);
  if (cached) return cached;

  const image = new Image();
  image.decoding = "async";
  image.loading = safe < PRELOAD_EAGER_COUNT ? "eager" : "lazy";
  image.src = framePath(safe);
  image.onload = () => loadedFrames.add(safe);
  image.onerror = () => imageCache.delete(safe);

  imageCache.set(safe, image);
  return image;
}

function preloadFrames() {
  for (let i = 0; i < PRELOAD_EAGER_COUNT; i += 1) {
    getImage(i).decode?.().catch(() => undefined);
  }

  const loadRest = () => {
    for (let i = PRELOAD_EAGER_COUNT; i < END_FRAME; i += 1) {
      getImage(i).decode?.().catch(() => undefined);
    }
  };

  window.requestIdleCallback?.(loadRest, { timeout: 1600 }) ?? window.setTimeout(loadRest, 450);
}

function nearestLoadedFrame(target: number) {
  const safe = clamp(Math.round(target), 0, END_FRAME - 1);
  if (loadedFrames.has(safe)) return safe;

  for (let distance = 1; distance < END_FRAME; distance += 1) {
    const before = safe - distance;
    const after = safe + distance;
    if (before >= 0 && loadedFrames.has(before)) return before;
    if (after < END_FRAME && loadedFrames.has(after)) return after;
  }

  return 0;
}

function drawContainImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  frameProgress: number,
  opacity = 1,
) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  if (!imageWidth || !imageHeight) return;

  const imageRatio = imageWidth / imageHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth: number;
  let drawHeight: number;

  if (imageRatio > canvasRatio) {
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imageRatio;
  } else {
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imageRatio;
  }

  const responsiveScale = canvasWidth < 768 ? 1.02 : canvasWidth < 1280 ? 0.96 : 0.9;
  drawWidth *= responsiveScale;
  drawHeight *= responsiveScale;

  const drawX = (canvasWidth - drawWidth) / 2;
  const verticalBias = gsap.utils.interpolate(-34, 18, clamp(frameProgress, 0, 1));
  const drawY = (canvasHeight - drawHeight) / 2 + verticalBias;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

export default function NoirPackScrollHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const scrollPromptRef = useRef<HTMLDivElement | null>(null);

  const introRef = useRef<HTMLDivElement | null>(null);
  const descentTextRef = useRef<HTMLDivElement | null>(null);
  const boxTextRef = useRef<HTMLDivElement | null>(null);
  const finalPanelRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const canvasWrap = canvasWrapRef.current;
    const canvas = canvasRef.current;
    const progress = progressRef.current;

    if (!section || !sticky || !canvasWrap || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    const sequence = { target: 0, current: 0 };
    let canvasWidth = 0;
    let canvasHeight = 0;
    let rafId = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvasWidth = Math.max(1, rect.width);
      canvasHeight = Math.max(1, rect.height);
      canvas.width = Math.floor(canvasWidth * dpr);
      canvas.height = Math.floor(canvasHeight * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    const render = () => {
      sequence.current += (sequence.target - sequence.current) * 0.16;
      const frameFloat = clamp(sequence.current, 0, END_FRAME - 1);
      const baseFrame = Math.floor(frameFloat);
      const nextFrame = Math.min(END_FRAME - 1, baseFrame + 1);
      const blend = frameFloat - baseFrame;
      const frameProgress = frameFloat / (END_FRAME - 1);

      const baseImage = getImage(nearestLoadedFrame(baseFrame));
      const nextImage = getImage(nearestLoadedFrame(nextFrame));

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#050201";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (baseImage.complete && (baseImage.naturalWidth || baseImage.width)) {
        drawContainImage(ctx, baseImage, canvasWidth, canvasHeight, frameProgress, 1);
      }

      if (blend > 0.001 && nextImage.complete && (nextImage.naturalWidth || nextImage.width)) {
        drawContainImage(ctx, nextImage, canvasWidth, canvasHeight, frameProgress, blend);
      }

      rafId = window.requestAnimationFrame(render);
    };

    preloadFrames();
    resizeCanvas();
    render();

    const context = gsap.context(() => {
      gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
      gsap.set([descentTextRef.current, boxTextRef.current, finalPanelRef.current], {
        autoAlpha: 0,
        y: 42,
        filter: "blur(10px)",
      });
      gsap.set(canvasWrap, { rotateX: 0, rotateY: 0, x: 0, y: 0, transformPerspective: 1200 });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "noir-pack-scroll-second-video-fix",
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.85,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            sequence.target = self.progress * (END_FRAME - 1);
            if (progress) gsap.set(progress, { scaleX: self.progress });
          },
        },
      });

      timeline
        .to(introRef.current, { autoAlpha: 0, y: -42, filter: "blur(10px)", duration: 0.1 }, 0.08)
        .to(scrollPromptRef.current, { autoAlpha: 0, y: 20, duration: 0.08 }, 0.08)
        .to(descentTextRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.12 }, 0.15)
        .to(descentTextRef.current, { autoAlpha: 0, y: -32, filter: "blur(10px)", duration: 0.1 }, 0.36)
        .to(boxTextRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.12 }, 0.42)
        .to(boxTextRef.current, { autoAlpha: 0, y: -32, filter: "blur(10px)", duration: 0.1 }, 0.72)
        .to(finalPanelRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.12 }, 0.82);

      gsap.to(scrollPromptRef.current, {
        y: 18,
        opacity: 0.55,
        duration: 1.15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.fromTo(
        ".noir-pack-particle",
        { y: 26, autoAlpha: 0, scale: 0.5 },
        {
          y: -90,
          autoAlpha: 0.75,
          scale: 1,
          duration: 3.6,
          stagger: 0.07,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        },
      );

      const rotateXTo = gsap.quickTo(canvasWrap, "rotateX", { duration: 0.5, ease: "power3.out" });
      const rotateYTo = gsap.quickTo(canvasWrap, "rotateY", { duration: 0.5, ease: "power3.out" });
      const xTo = gsap.quickTo(canvasWrap, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(canvasWrap, "y", { duration: 0.5, ease: "power3.out" });

      const handlePointerMove = (event: PointerEvent) => {
        const nx = event.clientX / window.innerWidth - 0.5;
        const ny = event.clientY / window.innerHeight - 0.5;
        rotateYTo(nx * 2.8);
        rotateXTo(ny * -2.2);
        xTo(nx * 10);
        yTo(ny * 8);
      };

      window.addEventListener("pointermove", handlePointerMove, { passive: true });

      const first = getImage(0);
      if (first.complete) {
        loadedFrames.add(0);
        gsap.to(loaderRef.current, { autoAlpha: 0, duration: 0.55, ease: "power2.out" });
      } else {
        first.onload = () => {
          loadedFrames.add(0);
          gsap.to(loaderRef.current, { autoAlpha: 0, duration: 0.55, ease: "power2.out" });
          ScrollTrigger.refresh();
        };
      }

      return () => window.removeEventListener("pointermove", handlePointerMove);
    }, section);

    const onResize = () => {
      resizeCanvas();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);

    const fallbackLoader = window.setTimeout(() => {
      gsap.to(loaderRef.current, { autoAlpha: 0, duration: 0.4 });
    }, 1800);

    return () => {
      window.clearTimeout(fallbackLoader);
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[540vh] bg-[#050201] text-[#f8eadc]">
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden bg-[#050201]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_22%,rgba(215,168,95,0.18),transparent_30%),radial-gradient(circle_at_20%_24%,rgba(75,24,9,0.46),transparent_34%),linear-gradient(180deg,#0b0402_0%,#050201_64%,#020100_100%)]" />
        <div className="cinematic-sequence-grid pointer-events-none absolute inset-0 z-[1]" />
        <div className="cinematic-sequence-noise pointer-events-none absolute inset-0 z-[2]" />
        <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.82)_100%)]" />

        <GoldParticles />

        <div ref={canvasWrapRef} className="noir-pack-stage pointer-events-none absolute inset-0 z-[5] will-change-transform">
          <canvas ref={canvasRef} className="h-full w-full" aria-label="Noir Sane chocolate globe packing animation" />
        </div>

        <div className="absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-[#050201] via-[#050201]/72 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-44 bg-gradient-to-t from-[#050201] via-[#050201]/76 to-transparent" />

        <div ref={introRef} className="absolute left-6 top-[17%] z-20 max-w-xl sm:left-12 lg:left-24">
          <p className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.46em] text-[#d7a85f]">
            <Sparkles className="h-3.5 w-3.5" /> Maison de Chocolat
          </p>
          <h1 className="font-serif text-6xl leading-[0.88] tracking-tight sm:text-8xl lg:text-9xl">
            Noir <span className="italic text-[#d7a85f]">Sane</span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-[#c8b5a4]">
            Scroll to watch the chocolate globe become a finished gift.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/shop" className="inline-flex items-center gap-3 rounded-full bg-[#d7a85f] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#090403] shadow-[0_0_45px_rgba(215,168,95,0.28)]">
              Shop Dark Chocolate <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="inline-flex items-center rounded-full border border-[#d7a85f]/30 bg-white/[0.04] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#f8eadc] backdrop-blur">
              Learn More
            </Link>
          </div>
        </div>

        <SceneText refEl={descentTextRef} eyebrow="Act I - Descent" title="The chocolate globe begins to fall." align="right" />
        <SceneText refEl={boxTextRef} eyebrow="Act II - Box" title="The lid opens. The gift forms." align="left" />

        <div ref={finalPanelRef} className="absolute bottom-10 left-1/2 z-30 w-[90%] max-w-5xl -translate-x-1/2 rounded-[2.25rem] border border-[#d7a85f]/20 bg-[#080604]/72 p-6 shadow-[0_35px_130px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.34em] text-[#d7a85f]">
                <PackageCheck className="h-4 w-4" /> Finished Gift Experience
              </p>
              <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
                Open the box. <span className="text-[#d7a85f]">Taste the story.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#c8b5a4]">
                The scroll ends on the packed box instead of looping back to the globe.
              </p>
            </div>
            <Link to="/shop" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#d7a85f] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#090403]">
              Discover Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div ref={scrollPromptRef} className="absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#f8eadc]/50">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 text-[#f8eadc]/45" />
        </div>

        <div ref={loaderRef} className="absolute inset-0 z-50 flex items-center justify-center bg-[#050201]">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border border-[#d7a85f]/25 border-t-[#d7a85f]" />
            <p className="mt-6 text-xs uppercase tracking-[0.35em] text-[#d7a85f]/80">Loading experience</p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 z-50 h-[2px] w-full bg-[#d7a85f]/10">
          <div ref={progressRef} className="h-full w-full origin-left scale-x-0 bg-[#d7a85f] shadow-[0_0_24px_rgba(215,168,95,0.8)]" />
        </div>
      </div>
    </section>
  );
}

function SceneText({
  refEl,
  eyebrow,
  title,
  align,
}: {
  refEl: RefObject<HTMLDivElement | null>;
  eyebrow: string;
  title: string;
  align: "left" | "right";
}) {
  const position = align === "right" ? "right-6 sm:right-12 lg:right-24" : "left-6 sm:left-12 lg:left-24";

  return (
    <div ref={refEl} className={`absolute top-[19%] z-20 max-w-lg ${position}`}>
      <p className="mb-5 text-xs uppercase tracking-[0.42em] text-[#d7a85f]">{eyebrow}</p>
      <h2 className="font-serif text-4xl leading-tight sm:text-6xl lg:text-7xl">{title}</h2>
    </div>
  );
}

function GoldParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden">
      {Array.from({ length: 30 }).map((_, index) => (
        <span
          key={index}
          className="noir-pack-particle absolute rounded-full bg-[#d7a85f]/70 shadow-[0_0_16px_rgba(215,168,95,0.75)]"
          style={{
            left: `${(index * 41) % 100}%`,
            top: `${(index * 23) % 100}%`,
            width: `${(index % 3) + 1}px`,
            height: `${(index % 3) + 1}px`,
          }}
        />
      ))}
    </div>
  );
}
