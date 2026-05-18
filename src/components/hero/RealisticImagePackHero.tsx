import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, PackageCheck, ChevronDown } from "lucide-react";
import MagneticButton from "@/components/luxury/MagneticButtons";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;
const FRAME_FOLDER = "/Frames";

function getFramePath(index: number) {
  const safeIndex = Math.min(Math.max(index, 0), FRAME_COUNT - 1);
  const frameNumber = String(safeIndex + 1).padStart(3, "0");
  return `${FRAME_FOLDER}/ezgif-frame-${frameNumber}.jpg`;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  opacity = 1
) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;

  if (!imageWidth || !imageHeight) return;

  const imageRatio = imageWidth / imageHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let drawX = 0;
  let drawY = 0;

  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imageRatio;
    drawX = (canvasWidth - drawWidth) / 2;
  } else {
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imageRatio;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

export default function RealisticImagePackHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const scrollPromptRef = useRef<HTMLDivElement | null>(null);

  const introRef = useRef<HTMLDivElement | null>(null);
  const globeTextRef = useRef<HTMLDivElement | null>(null);
  const boxTextRef = useRef<HTMLDivElement | null>(null);
  const packedTextRef = useRef<HTMLDivElement | null>(null);
  const finalPanelRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;

    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });

    if (!ctx) return;

    const images: HTMLImageElement[] = [];
    const loadedFrames = new Array(FRAME_COUNT).fill(false);

    const sequence = {
      frame: 0,
      targetFrame: 0,
    };

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

    const findNearestLoadedFrame = (targetIndex: number) => {
      if (loadedFrames[targetIndex]) return targetIndex;

      for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
        const previous = targetIndex - distance;
        const next = targetIndex + distance;

        if (previous >= 0 && loadedFrames[previous]) return previous;
        if (next < FRAME_COUNT && loadedFrames[next]) return next;
      }

      return 0;
    };

    const render = () => {
      const frame = gsap.utils.clamp(0, FRAME_COUNT - 1, sequence.frame);
      const baseFrame = Math.floor(frame);
      const nextFrame = Math.min(FRAME_COUNT - 1, baseFrame + 1);
      const blend = frame - baseFrame;

      const safeFrame = findNearestLoadedFrame(baseFrame);
      const baseImage = images[safeFrame];

      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (!baseImage || !baseImage.complete) return;

      drawCoverImage(ctx, baseImage, canvasWidth, canvasHeight, 1);

      const nextImage = images[nextFrame];

      if (blend > 0.02 && loadedFrames[nextFrame] && nextImage?.complete) {
        drawCoverImage(ctx, nextImage, canvasWidth, canvasHeight, blend);
      }
    };

    const smoothRender = () => {
      sequence.frame += (sequence.targetFrame - sequence.frame) * 0.15;
      render();
      rafId = requestAnimationFrame(smoothRender);
    };

    resizeCanvas();

    [0, 1, 2, 3, 4, 20, 40, 60, 80, 100, 120, 140, 160, 180, 209, FRAME_COUNT - 1].forEach((index) => {
      if (images[index]) return;
      const image = new Image();
      image.decoding = "async";
      image.src = getFramePath(index);
      image.onload = () => {
        loadedFrames[index] = true;
        if (index === 0) {
          render();
          gsap.to(loaderRef.current, {
            autoAlpha: 0,
            duration: 0.8,
            ease: "power3.out",
          });
        }
      };
      images[index] = image;
    });

    setTimeout(() => {
      for (let index = 0; index < FRAME_COUNT; index += 1) {
        if (images[index]) continue;
        const image = new Image();
        image.decoding = "async";
        image.src = getFramePath(index);
        image.onload = () => {
          loadedFrames[index] = true;
        };
        images[index] = image;
      }
    }, 500);

    const ctxGsap = gsap.context(() => {
      const intro = introRef.current;
      const globeText = globeTextRef.current;
      const boxText = boxTextRef.current;
      const packedText = packedTextRef.current;
      const finalPanel = finalPanelRef.current;
      const progress = progressRef.current;
      const scrollPrompt = scrollPromptRef.current;

      gsap.set([globeText, boxText, packedText, finalPanel], {
        autoAlpha: 0,
        y: 60,
        scale: 0.95,
        filter: "blur(12px)",
      });

      gsap.set(progress, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(".parallax-text", {
        y: 0,
      });

      gsap.set(".noir-sequence-particle", {
        autoAlpha: 0,
        scale: 0,
      });

      gsap.to(".noir-sequence-particle", {
        autoAlpha: 0.8,
        scale: "random(0.5,1.5)",
        duration: "random(3,5)",
        stagger: {
          each: 0.05,
          repeat: -1,
          yoyo: true,
        },
        ease: "sine.inOut",
      });

      gsap.to(scrollPrompt, {
        y: 20,
        opacity: 0.6,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(sequence, { targetFrame: FRAME_COUNT - 1, ease: "none", duration: 1 }, 0)
        .to(progress, { scaleX: 1, ease: "none", duration: 1 }, 0)
        .to(intro, { autoAlpha: 0, y: -80, filter: "blur(15px)", duration: 0.15 }, 0.08)
        .to(scrollPrompt, { autoAlpha: 0, y: 30, duration: 0.1 }, 0.08)

        .to(globeText, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.2 }, 0.12)
        .to(".globe-parallax", { y: -40, duration: 0.3 }, 0.12)
        .to(globeText, { autoAlpha: 0, y: -60, scale: 0.98, filter: "blur(10px)", duration: 0.15 }, 0.32)

        .to(boxText, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.2 }, 0.38)
        .to(".box-parallax", { y: -30, duration: 0.3 }, 0.38)
        .to(boxText, { autoAlpha: 0, y: -60, scale: 0.98, filter: "blur(10px)", duration: 0.15 }, 0.62)

        .to(packedText, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.2 }, 0.68)
        .to(".packed-parallax", { y: -20, duration: 0.3 }, 0.68)
        .to(packedText, { autoAlpha: 0, y: -60, scale: 0.98, filter: "blur(10px)", duration: 0.15 }, 0.88)

        .to(finalPanel, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.25 }, 0.92);

      ScrollTrigger.refresh();
    }, section);

    const onResize = () => {
      resizeCanvas();
      render();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);
    rafId = requestAnimationFrame(smoothRender);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
      ctxGsap.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[600vh] bg-[#050505] text-white/90"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[#050505]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label="Noir Sane chocolate globe packing sequence"
        />

        <div
          ref={loaderRef}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-[#d7a85f]/30" />
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-[#d7a85f]" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-[#d7a85f]/60">
            Loading experience
          </p>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,5,5,0.8)_100%)]" />
        <div className="sequence-grid pointer-events-none absolute inset-0" />
        <div className="sequence-noise pointer-events-none absolute inset-0 opacity-50" />
        <FilmGrain />
        <GoldParticles />

        <div
          ref={scrollPromptRef}
          className="absolute bottom-12 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/50">
            Scroll to explore
          </span>
          <ChevronDown className="h-5 w-5 text-white/40" />
        </div>

        <div
          ref={introRef}
          className="absolute left-6 top-[15%] z-30 max-w-xl sm:left-12 lg:left-24 globe-parallax"
        >
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-[#d7a85f]">
            Maison de Chocolat
          </p>

          <h1 className="font-serif text-6xl leading-[0.88] tracking-tight sm:text-8xl lg:text-9xl">
            Noir <span className="italic text-[#d7a85f]">Sane</span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-white/60">
            Wholesome Bites, Delightful Nights. Scroll through a cinematic
            chocolate journey from glowing globe to finished gift box.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">
            <MagneticButton
              href="/shop"
              className="group gap-3 px-7 py-4 text-xs font-semibold uppercase tracking-[0.24em] shadow-[0_0_60px_rgba(215,168,95,0.35)] hover:shadow-[0_0_80px_rgba(215,168,95,0.5)]"
            >
              Shop Collection
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </MagneticButton>

            <MagneticButton
              href="/about"
              variant="outline"
              className="border-white/20 bg-white/[0.02] px-7 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur-md hover:border-white/40 hover:bg-white/[0.05]"
            >
              Explore Story
            </MagneticButton>
          </div>
        </div>

        <div
          ref={globeTextRef}
          className="absolute right-6 top-[18%] z-30 max-w-lg sm:right-12 lg:right-24 globe-parallax"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#d7a85f]">
            Act I — The Descent
          </p>

          <h2 className="font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            The chocolate <br />
            <span className="text-[#d7a85f]">travels downward</span>
          </h2>

          <p className="mt-6 max-w-sm text-base leading-relaxed text-white/50">
            Watch as the golden sphere descends through dark cinematic space,
            beginning its transformation into a precious gift.
          </p>
        </div>

        <div
          ref={boxTextRef}
          className="absolute left-6 top-[18%] z-30 max-w-lg sm:left-12 lg:left-24 box-parallax"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#d7a85f]">
            Act II — The Reveal
          </p>

          <h2 className="font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            The box <span className="text-[#d7a85f]">opens</span> <br />
            at the perfect moment
          </h2>

          <p className="mt-6 max-w-sm text-base leading-relaxed text-white/50">
            The globe settles inside, transforming the ritual into a premium
            gifting experience worth presenting.
          </p>
        </div>

        <div
          ref={packedTextRef}
          className="absolute left-1/2 top-[12%] z-30 w-[94%] max-w-4xl -translate-x-1/2 text-center packed-parallax"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#d7a85f]">
            Act III — The Gift
          </p>

          <h2 className="font-serif text-5xl leading-[1.1] tracking-tight sm:text-7xl lg:text-8xl">
            Sealed inside a moment <br />
            <span className="text-[#d7a85f]">worth gifting</span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-white/50">
            The lid closes. The glow settles. The chocolate becomes more than candy —
            it becomes a memory, wrapped in elegance.
          </p>
        </div>

        <div
          ref={finalPanelRef}
          className="absolute bottom-12 left-1/2 z-40 w-[94%] max-w-5xl -translate-x-1/2 rounded-[2.5rem] border border-[#d7a85f]/20 bg-[#080604]/80 p-6 shadow-[0_40px_140px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#d7a85f]/15 bg-[#d7a85f]/08 px-5 py-2.5 text-[10px] uppercase tracking-[0.32em] text-[#d7a85f]">
                <PackageCheck className="h-4 w-4" />
                Finished Gift Experience
              </div>

              <h2 className="font-serif text-4xl leading-tight tracking-tight text-white/90 sm:text-5xl lg:text-6xl">
                Open the box. <br />
                <span className="text-[#d7a85f]">Taste the story.</span>
              </h2>
            </div>

            <div className="text-left">
              <p className="text-base leading-relaxed text-white/50">
                After the cinematic packing moment, discover our curated collection
                of premium dark chocolates crafted for slow indulgence.
              </p>

              <MagneticButton
                href="/shop"
                variant="ghost"
                className="mt-8 gap-3 px-0 py-0 text-sm font-semibold uppercase tracking-[0.26em] hover:gap-4"
              >
                Discover Collection
                <ArrowRight size={16} />
              </MagneticButton>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 z-50 h-[2px] w-full bg-white/[0.06]">
          <div
            ref={progressRef}
            className="h-full w-full bg-gradient-to-r from-[#d7a85f]/60 via-[#d7a85f] to-[#d7a85f]/80 shadow-[0_0_20px_rgba(215,168,95,0.6)]"
          />
        </div>
      </div>
    </section>
  );
}

function GoldParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {Array.from({ length: 28 }).map((_, index) => (
        <span
          key={index}
          className="noir-sequence-particle absolute rounded-full bg-[#d7a85f]"
          style={{
            left: `${(index * 41) % 100}%`,
            top: `${(index * 23) % 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            boxShadow: `0 0 ${Math.random() * 15 + 10}px rgba(215,168,95,0.7)`,
          }}
        />
      ))}
    </div>
  );
}

function FilmGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[3] opacity-[0.035]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}
