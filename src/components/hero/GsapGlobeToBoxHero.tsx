import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 210;
const FRAME_FOLDER = "/hero-sequence";

function getFramePath(index: number) {
  const frameNumber = String(index + 1).padStart(3, "0");
  return `${FRAME_FOLDER}/ezgif-frame-${frameNumber}.jpg`;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  alpha = 1
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
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

export default function GsapGlobeToBoxHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;

    if (!section || !stage || !canvas) return;

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
      const frame = gsap.utils.clamp(0, FRAME_COUNT - 1, sequence.frame);
      const baseFrame = Math.floor(frame);
      const nextFrame = Math.min(FRAME_COUNT - 1, baseFrame + 1);
      const blend = frame - baseFrame;

      const safeBaseFrame = findNearestLoadedFrame(baseFrame);
      const baseImage = images[safeBaseFrame];

      if (!baseImage || !baseImage.complete) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawCoverImage(ctx, baseImage, canvasWidth, canvasHeight, 1);

      const nextImage = images[nextFrame];

      if (blend > 0.02 && loadedFrames[nextFrame] && nextImage?.complete) {
        drawCoverImage(ctx, nextImage, canvasWidth, canvasHeight, blend);
      }
    };

    const smoothRender = () => {
      sequence.frame += (sequence.targetFrame - sequence.frame) * 0.18;
      render();
      rafId = requestAnimationFrame(smoothRender);
    };

    resizeCanvas();

    for (let index = 0; index < FRAME_COUNT; index += 1) {
      const image = new Image();
      image.decoding = "async";
      image.src = getFramePath(index);

      image.onload = () => {
        loadedFrames[index] = true;

        if (index === 0) {
          gsap.to(loaderRef.current, {
            autoAlpha: 0,
            duration: 0.5,
            ease: "power2.out",
          });
          render();
        }
      };

      images.push(image);
    }

    const gsapContext = gsap.context(() => {
      const scenes = sceneRefs.current.filter(Boolean) as HTMLDivElement[];

      gsap.set(scenes, {
        autoAlpha: 0,
        y: 36,
        filter: "blur(10px)",
      });

      gsap.set(scenes[0], {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
      });

      gsap.set(progressRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.to(sequence, {
        targetFrame: FRAME_COUNT - 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.85,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.85,
        },
      });

      const sceneTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.85,
        },
      });

      sceneTimeline
        .to(scenes[0], { autoAlpha: 0, y: -34, filter: "blur(10px)", duration: 0.12 }, 0.12)

        .to(scenes[1], { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.12 }, 0.19)
        .to(scenes[1], { autoAlpha: 0, y: -34, filter: "blur(10px)", duration: 0.12 }, 0.39)

        .to(scenes[2], { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.12 }, 0.44)
        .to(scenes[2], { autoAlpha: 0, y: -34, filter: "blur(10px)", duration: 0.12 }, 0.65)

        .to(scenes[3], { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.12 }, 0.71);

      gsap.fromTo(
        ".hero-gold-particle",
        {
          y: 30,
          autoAlpha: 0.2,
          scale: 0.7,
        },
        {
          y: -42,
          autoAlpha: 1,
          scale: 1.4,
          duration: 2.8,
          stagger: {
            each: 0.08,
            repeat: -1,
            yoyo: true,
          },
          ease: "sine.inOut",
        }
      );

      gsap.fromTo(
        ".final-glass-panel",
        {
          y: 80,
          autoAlpha: 0,
          scale: 0.96,
        },
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "72% top",
            end: "90% top",
            scrub: 0.85,
          },
        }
      );

      ScrollTrigger.refresh();
    }, section);

    const handleResize = () => {
      resizeCanvas();
      render();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);
    rafId = requestAnimationFrame(smoothRender);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
      gsapContext.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[460vh] bg-[#050201] text-[#f8eadc]"
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-screen overflow-hidden bg-[#050201]"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label="Noir Sane chocolate globe entering gift box animation"
        />

        <div
          ref={loaderRef}
          className="absolute inset-0 z-50 grid place-items-center bg-[#050201]"
        >
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#d7a85f]/20" />
            <div className="absolute inset-4 rounded-full bg-[#d7a85f]/25 blur-xl" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.74)_100%)]" />
        <div className="sequence-noise pointer-events-none absolute inset-0" />
        <div className="sequence-grid pointer-events-none absolute inset-0" />

        <FloatingParticles />

        <div
          ref={(el) => {
            sceneRefs.current[0] = el;
          }}
          className="absolute left-6 top-[18%] z-30 max-w-xl sm:left-12 lg:left-20"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.48em] text-[#d7a85f]">
            Maison de Chocolat
          </p>

          <h1 className="font-serif text-5xl leading-[0.9] sm:text-7xl lg:text-8xl">
            Noir <span className="italic text-[#d7a85f]">Sane</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-[#c8b5a4]">
            Wholesome Bites, Delightful Nights. A chocolate globe travels
            through gold and shadow before becoming a gift.
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
        </div>

        <div
          ref={(el) => {
            sceneRefs.current[1] = el;
          }}
          className="absolute right-6 top-[22%] z-30 max-w-md sm:right-12 lg:right-20"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-[#d7a85f]">
            Cocoa Orbit
          </p>

          <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
            The globe follows the scroll.
          </h2>

          <p className="mt-5 text-sm leading-7 text-[#c8b5a4]">
            GSAP scrubs the frame sequence directly on canvas, so the motion
            feels smooth instead of jumping between image tags.
          </p>
        </div>

        <div
          ref={(el) => {
            sceneRefs.current[2] = el;
          }}
          className="absolute left-6 top-[22%] z-30 max-w-md sm:left-12 lg:left-20"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-[#d7a85f]">
            Gift Ritual
          </p>

          <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
            Gold light opens the box.
          </h2>

          <p className="mt-5 text-sm leading-7 text-[#c8b5a4]">
            The frame sequence becomes the main luxury moment: globe, descent,
            reveal, and final box close.
          </p>
        </div>

        <div
          ref={(el) => {
            sceneRefs.current[3] = el;
          }}
          className="absolute left-1/2 top-[12%] z-30 w-[90%] max-w-3xl -translate-x-1/2 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-[#d7a85f]">
            Final Reveal
          </p>

          <h2 className="font-serif text-4xl leading-tight sm:text-6xl lg:text-7xl">
            Sealed inside a moment worth gifting.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#c8b5a4]">
            From floating chocolate world to luxury gift box — the whole
            homepage now follows your video flow.
          </p>
        </div>

        <div className="final-glass-panel absolute bottom-8 left-1/2 z-40 w-[92%] max-w-5xl -translate-x-1/2 rounded-[2rem] border border-[#d7a85f]/25 bg-[#080302]/75 p-5 opacity-0 shadow-[0_35px_120px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d7a85f]/20 bg-[#d7a85f]/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#d7a85f]">
                <Gift className="h-3.5 w-3.5" />
                Luxury Box Experience
              </div>

              <h2 className="font-serif text-3xl leading-tight text-[#f8eadc] sm:text-5xl">
                The collection begins after the box closes.
              </h2>
            </div>

            <div>
              <p className="text-sm leading-7 text-[#c8b5a4]">
                After this hero, continue into your product collection, gifting
                section, and checkout flow.
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
        </div>

        <div className="absolute bottom-0 left-0 z-50 h-[3px] w-full bg-[#d7a85f]/10">
          <div
            ref={progressRef}
            className="h-full w-full bg-[#d7a85f] shadow-[0_0_24px_rgba(215,168,95,0.85)]"
          />
        </div>
      </div>
    </section>
  );
}

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {Array.from({ length: 34 }).map((_, index) => (
        <span
          key={index}
          className="hero-gold-particle absolute h-1 w-1 rounded-full bg-[#d7a85f]/70 shadow-[0_0_18px_rgba(215,168,95,0.85)]"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 19) % 100}%`,
          }}
        />
      ))}
    </div>
  );
}