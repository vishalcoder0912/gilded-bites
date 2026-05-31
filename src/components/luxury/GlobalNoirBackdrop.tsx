import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;
const END_FRAME = 216;
const FRAME_FOLDER = "/Frames";

const imageCache = new Map<number, HTMLImageElement>();
const loadedFrames = new Set<number>();

function clampFrame(index: number) {
  return Math.min(Math.max(Math.round(index), 0), FRAME_COUNT - 1);
}

function getFramePath(index: number) {
  const frameNumber = String(clampFrame(index) + 1).padStart(3, "0");
  return `${FRAME_FOLDER}/ezgif-frame-${frameNumber}.jpg`;
}

function getOrCreateImage(index: number) {
  const safeIndex = clampFrame(index);
  const cached = imageCache.get(safeIndex);
  if (cached) return cached;

  const image = new Image();
  image.decoding = "async";
  image.loading = safeIndex < 18 ? "eager" : "lazy";
  image.src = getFramePath(safeIndex);
  image.onload = () => loadedFrames.add(safeIndex);
  image.onerror = () => imageCache.delete(safeIndex);

  imageCache.set(safeIndex, image);
  return image;
}

function preloadFrames() {
  [
    0, 1, 2, 3, 4, 5, 8, 12, 18, 24, 32, 44, 56, 70, 86, 104, 124, 144, 164,
    184, 204, 215,
  ].forEach((index) => getOrCreateImage(index));

  const loadRest = () => {
    for (let index = 0; index < END_FRAME; index += 1) {
      getOrCreateImage(index);
    }
  };

  if (window.requestIdleCallback) {
    window.requestIdleCallback(loadRest, { timeout: 1800 });
  } else {
    window.setTimeout(loadRest, 450);
  }
}

function findNearestLoadedFrame(targetIndex: number) {
  const safeIndex = Math.min(clampFrame(targetIndex), END_FRAME - 1);
  if (loadedFrames.has(safeIndex)) return safeIndex;

  for (let distance = 1; distance < END_FRAME; distance += 1) {
    const previous = safeIndex - distance;
    const next = safeIndex + distance;

    if (previous >= 0 && loadedFrames.has(previous)) return previous;
    if (next < END_FRAME && loadedFrames.has(next)) return next;
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
  const drawY = (canvasHeight - drawHeight) / 2 + gsap.utils.interpolate(-24, 14, frameProgress);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function ease(current: number, target: number, factor: number) {
  return current + (target - current) * factor;
}

export default function GlobalNoirBackdrop() {
  const { pathname } = useLocation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = pathname.startsWith("/admin");
  const isDelivery = pathname.startsWith("/delivery");
  const shouldDrawSequence = !isAdmin && !isDelivery;

  useLayoutEffect(() => {
    if (!shouldDrawSequence) return undefined;

    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const ring = ringRef.current;
    const glow = glowRef.current;

    if (!canvas || !stage) return undefined;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sequence = { frame: 0, targetFrame: 0 };
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    let canvasWidth = 0;
    let canvasHeight = 0;
    let rafId = 0;
    let scrollProgress = 0;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();

      canvasWidth = Math.max(1, rect.width);
      canvasHeight = Math.max(1, rect.height);

      canvas.width = Math.floor(canvasWidth * dpr);
      canvas.height = Math.floor(canvasHeight * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    const readScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      scrollProgress = gsap.utils.clamp(0, 1, window.scrollY / maxScroll);

      const routeOffset = pathname.startsWith("/checkout")
        ? 0.54
        : pathname.startsWith("/login") || pathname.startsWith("/register")
          ? 0.18
          : pathname.startsWith("/shop")
            ? 0.34
            : 0.24;

      sequence.targetFrame = gsap.utils.clamp(
        0,
        END_FRAME - 1,
        (scrollProgress + routeOffset) * (END_FRAME - 1),
      );
    };

    const renderFrame = () => {
      const currentFrame = gsap.utils.clamp(0, END_FRAME - 1, sequence.frame);
      const baseFrame = Math.floor(currentFrame);
      const nextFrame = Math.min(END_FRAME - 1, baseFrame + 1);
      const blend = currentFrame - baseFrame;
      const frameProgress = currentFrame / (END_FRAME - 1);

      const baseImage = getOrCreateImage(findNearestLoadedFrame(baseFrame));
      const nextImage = getOrCreateImage(findNearestLoadedFrame(nextFrame));

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (baseImage.complete && (baseImage.naturalWidth || baseImage.width)) {
        drawContainImage(ctx, baseImage, canvasWidth, canvasHeight, frameProgress, 0.82);
      }

      if (
        blend > 0.02 &&
        nextImage.complete &&
        (nextImage.naturalWidth || nextImage.width)
      ) {
        drawContainImage(ctx, nextImage, canvasWidth, canvasHeight, frameProgress, blend * 0.84);
      }
    };

    const renderMotion = () => {
      sequence.frame = ease(sequence.frame, sequence.targetFrame, reduceMotion ? 0.35 : 0.11);
      mouse.x = ease(mouse.x, mouse.targetX, 0.095);
      mouse.y = ease(mouse.y, mouse.targetY, 0.095);

      const baseX = gsap.utils.interpolate(0, -115, scrollProgress);
      const baseY = gsap.utils.interpolate(0, 245, scrollProgress);
      const baseScale = gsap.utils.interpolate(1.04, 0.78, scrollProgress);
      const baseRotate = gsap.utils.interpolate(0, -8, scrollProgress);

      const parallaxX = mouse.x * 48;
      const parallaxY = mouse.y * 34;
      const rotateY = mouse.x * 9;
      const rotateX = mouse.y * -6;

      stage.style.transform = `
        translate3d(${baseX + parallaxX}px, ${baseY + parallaxY}px, 0)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        rotateZ(${baseRotate}deg)
        scale(${baseScale})
      `;

      if (ring) {
        ring.style.transform = `
          translate3d(${baseX * 0.45 + mouse.x * 24}px, ${baseY * 0.2 + mouse.y * 18}px, 0)
          rotateX(${60 + mouse.y * -4}deg)
          rotateY(${mouse.x * 10}deg)
          rotateZ(${22 + scrollProgress * 70}deg)
        `;
        ring.style.opacity = String(gsap.utils.interpolate(0.72, 0.2, scrollProgress));
      }

      if (glow) {
        glow.style.transform = `translate3d(${mouse.x * 80}px, ${mouse.y * 52}px, 0)`;
        glow.style.opacity = String(gsap.utils.interpolate(0.9, 0.45, scrollProgress));
      }

      renderFrame();
      rafId = window.requestAnimationFrame(renderMotion);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const normalizedX = (event.clientX / window.innerWidth - 0.5) * 2;
      const normalizedY = (event.clientY / window.innerHeight - 0.5) * 2;

      mouse.targetX = gsap.utils.clamp(-1, 1, normalizedX);
      mouse.targetY = gsap.utils.clamp(-1, 1, normalizedY);

      document.documentElement.style.setProperty("--noir-cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--noir-cursor-y", `${event.clientY}px`);
    };

    const handleScroll = () => {
      readScroll();
      document.documentElement.style.setProperty("--noir-scroll-progress", String(scrollProgress));
    };

    preloadFrames();
    resizeCanvas();
    readScroll();

    const ctxGsap = gsap.context(() => {
      gsap.fromTo(
        stage,
        { autoAlpha: 0, scale: 0.92, y: 24 },
        { autoAlpha: 1, scale: 1.04, y: 0, duration: 1.35, ease: "power3.out" },
      );

      gsap.to(".noir-reactive-particle", {
        y: "random(-38, 38)",
        x: "random(-22, 22)",
        opacity: "random(0.22, 0.92)",
        scale: "random(0.65, 1.55)",
        duration: "random(2.8, 5.8)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.035,
          from: "random",
        },
      });
    });

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    rafId = window.requestAnimationFrame(renderMotion);

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      readScroll();
    }, 350);

    return () => {
      window.clearTimeout(refreshTimer);
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      ctxGsap.revert();
    };
  }, [pathname, shouldDrawSequence]);

  if (!shouldDrawSequence) {
    const opacity = isAdmin ? 0.45 : isDelivery ? 0.35 : 0.28;

    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050201]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            opacity,
            background:
              "radial-gradient(circle at 76% 22%, rgba(215,168,95,0.18), transparent 28%), radial-gradient(circle at 18% 24%, rgba(87,29,10,0.42), transparent 34%), linear-gradient(180deg,#090403 0%,#050201 62%,#020100 100%)",
          }}
        />
        <div className="cinematic-sequence-grid absolute inset-0 opacity-[0.045]" />
        <div className="cinematic-sequence-noise absolute inset-0 opacity-[0.06]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.78)_100%)]" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050201]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(217,163,91,0.16),transparent_34%),radial-gradient(circle_at_20%_75%,rgba(91,34,13,0.34),transparent_42%),linear-gradient(180deg,#090403_0%,#050201_46%,#020100_100%)]" />

      <div
        ref={glowRef}
        className="absolute right-[-10vw] top-[-8vh] h-[78vmin] w-[78vmin] rounded-full bg-[#d9a35b]/12 blur-[90px] mix-blend-screen"
      />

      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:86px_86px] [mask-image:radial-gradient(circle_at_65%_35%,black,transparent_75%)]" />

      <div
        ref={stageRef}
        className="noir-globe-stage absolute right-[-20vmin] top-[5vh] h-[82vmin] max-h-[760px] min-h-[430px] w-[98vmin] max-w-[920px] min-w-[520px] origin-center will-change-transform md:right-[-12vmin] lg:right-[-5vmin]"
      >
        <div className="absolute inset-0 rounded-full bg-[#d9a35b]/10 blur-[70px]" />
        <canvas
          ref={canvasRef}
          className="relative h-full w-full opacity-[0.94] mix-blend-screen [filter:contrast(1.12)_saturate(1.08)_brightness(1.02)_drop-shadow(0_32px_80px_rgba(0,0,0,0.5))] [mask-image:radial-gradient(circle_at_55%_48%,black_0%,black_56%,rgba(0,0,0,0.82)_66%,transparent_80%)]"
        />
      </div>

      <div
        ref={ringRef}
        className="absolute right-[5vw] top-[28vh] h-[22vmin] w-[54vmin] rounded-[999px] border border-[#d9a35b]/45 shadow-[0_0_48px_rgba(217,163,91,0.25)] blur-[0.1px]"
      />

      <div className="absolute inset-0">
        {Array.from({ length: 42 }).map((_, index) => (
          <span
            key={index}
            className="noir-reactive-particle absolute rounded-full bg-[#f0c27a]"
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 19) % 100}%`,
              width: `${1 + (index % 3)}px`,
              height: `${1 + (index % 3)}px`,
              opacity: 0.35,
              boxShadow: "0 0 18px rgba(240,194,122,0.78)",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_36%,rgba(0,0,0,0.78)_100%)]" />
      <div className="noir-cursor-aurora absolute left-0 top-0 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d9a35b]/10 blur-[95px] mix-blend-screen" />
      <div className="absolute inset-0 opacity-[0.045] [background-image:radial-gradient(rgba(255,255,255,.36)_0.7px,transparent_0.7px)] [background-size:4px_4px]" />
    </div>
  );
}
