import { useLayoutEffect, useRef } from "react";

const FIRST_FRAME = 1;
const LAST_FRAME = 216;
const TOTAL_FRAMES = LAST_FRAME - FIRST_FRAME + 1;

const FRAME_PATH = "/Frames";
const FRAME_PREFIX = "ezgif-frame-";
const FRAME_EXT = "jpg";

const imageCache = new Map<number, HTMLImageElement>();
const loadedFrames = new Set<number>();

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function frameUrl(index: number) {
  const frame = String(FIRST_FRAME + index).padStart(3, "0");
  return `${FRAME_PATH}/${FRAME_PREFIX}${frame}.${FRAME_EXT}`;
}

function getImage(index: number) {
  const safeIndex = clamp(Math.round(index), 0, TOTAL_FRAMES - 1);

  if (imageCache.has(safeIndex)) {
    return imageCache.get(safeIndex)!;
  }

  const img = new Image();
  img.decoding = "async";
  img.src = frameUrl(safeIndex);

  img.onload = () => loadedFrames.add(safeIndex);
  img.onerror = () => imageCache.delete(safeIndex);

  imageCache.set(safeIndex, img);
  return img;
}

function preloadFrames() {
  for (let i = 0; i < Math.min(45, TOTAL_FRAMES); i++) {
    getImage(i);
  }

  const loadRest = () => {
    for (let i = 45; i < TOTAL_FRAMES; i += 2) getImage(i);
    for (let i = 46; i < TOTAL_FRAMES; i += 2) getImage(i);
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadRest, { timeout: 1500 });
  } else {
    window.setTimeout(loadRest, 400);
  }
}

function nearestLoaded(target: number) {
  const safe = clamp(Math.round(target), 0, TOTAL_FRAMES - 1);

  if (loadedFrames.has(safe)) return safe;

  for (let d = 1; d < TOTAL_FRAMES; d++) {
    const before = safe - d;
    const after = safe + d;

    if (before >= 0 && loadedFrames.has(before)) return before;
    if (after < TOTAL_FRAMES && loadedFrames.has(after)) return after;
  }

  return 0;
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  opacity = 1,
) {
  if (!img.complete || !img.naturalWidth) return;

  const imageRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;

  if (imageRatio > canvasRatio) {
    drawWidth = width;
    drawHeight = width / imageRatio;
  } else {
    drawHeight = height;
    drawWidth = height * imageRatio;
  }

  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(img, x, y, drawWidth, drawHeight);
  ctx.restore();
}

function getPackProgress() {
  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  const animationDistance = Math.min(maxScroll, 2800);

  return clamp(window.scrollY / animationDistance, 0, 1);
}

export default function SiteFrameSequenceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;

    let currentFrame = 0;
    let targetFrame = 0;

    let pointerX = 0;
    let pointerY = 0;
    let smoothX = 0;
    let smoothY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    const updateTarget = () => {
      const progress = getPackProgress();
      targetFrame = progress * (TOTAL_FRAMES - 1);

      progressRef.current?.style.setProperty(
        "transform",
        `scaleX(${progress})`,
      );
    };

    const render = () => {
      updateTarget();

      // Decreased from 0.18 to 0.06 for a much smoother, fluid transition between frames
      currentFrame += (targetFrame - currentFrame) * 0.06;

      if (targetFrame >= TOTAL_FRAMES - 1 - 0.01) {
        currentFrame = TOTAL_FRAMES - 1;
      }

      // Decreased from 0.06 to 0.03 for smoother mouse parallax
      smoothX += (pointerX - smoothX) * 0.03;
      smoothY += (pointerY - smoothY) * 0.03;

      wrap.style.transform = `
        translate3d(${smoothX * 18}px, ${smoothY * 12}px, 0)
        scale(1.025)
      `;

      const base = Math.floor(currentFrame);
      const next = Math.min(TOTAL_FRAMES - 1, base + 1);
      const blend = currentFrame - base;

      const baseImg = getImage(nearestLoaded(base));
      const nextImg = getImage(nearestLoaded(next));

      ctx.fillStyle = "#050201";
      ctx.fillRect(0, 0, width, height);

      drawContain(ctx, baseImg, width, height, 1);

      if (blend > 0.001) {
        drawContain(ctx, nextImg, width, height, blend);
      }

      raf = requestAnimationFrame(render);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointerX = e.clientX / window.innerWidth - 0.5;
      pointerY = e.clientY / window.innerHeight - 0.5;
    };

    preloadFrames();
    resize();
    render();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050201]"
    >
      <div ref={wrapRef} className="absolute inset-0 will-change-transform">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full opacity-90"
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(5,2,1,0.35)_60%,rgba(5,2,1,0.92)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#d7a85f]/10">
        <div
          ref={progressRef}
          className="h-full origin-left scale-x-0 bg-[#d7a85f]"
        />
      </div>
    </div>
  );
}
