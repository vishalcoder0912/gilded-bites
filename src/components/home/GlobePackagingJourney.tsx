import { Suspense, lazy, useLayoutEffect, useRef, type RefObject } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Gift, PackageCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ChocolateGlobe = lazy(() => import("@/components/hero/ChocolateGlobe"));

export default function GlobePackagingJourney() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const globeRef = useRef<HTMLDivElement | null>(null);
  const globeGlowRef = useRef<HTMLDivElement | null>(null);

  const introRef = useRef<HTMLDivElement | null>(null);
  const craftRef = useRef<HTMLDivElement | null>(null);
  const boxTextRef = useRef<HTMLDivElement | null>(null);
  const finalTextRef = useRef<HTMLDivElement | null>(null);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const boxBaseRef = useRef<HTMLDivElement | null>(null);
  const boxBackRef = useRef<HTMLDivElement | null>(null);
  const leftFlapRef = useRef<HTMLDivElement | null>(null);
  const rightFlapRef = useRef<HTMLDivElement | null>(null);
  const frontFlapRef = useRef<HTMLDivElement | null>(null);
  const lidRef = useRef<HTMLDivElement | null>(null);
  const tissueLeftRef = useRef<HTMLDivElement | null>(null);
  const tissueRightRef = useRef<HTMLDivElement | null>(null);
  const ribbonVRef = useRef<HTMLDivElement | null>(null);
  const ribbonHRef = useRef<HTMLDivElement | null>(null);
  const sealRef = useRef<HTMLDivElement | null>(null);
  const finalPanelRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const globe = globeRef.current;
    const globeGlow = globeGlowRef.current;
    const intro = introRef.current;
    const craft = craftRef.current;
    const boxText = boxTextRef.current;
    const finalText = finalTextRef.current;
    const box = boxRef.current;
    const boxBase = boxBaseRef.current;
    const boxBack = boxBackRef.current;
    const leftFlap = leftFlapRef.current;
    const rightFlap = rightFlapRef.current;
    const frontFlap = frontFlapRef.current;
    const lid = lidRef.current;
    const tissueLeft = tissueLeftRef.current;
    const tissueRight = tissueRightRef.current;
    const ribbonV = ribbonVRef.current;
    const ribbonH = ribbonHRef.current;
    const seal = sealRef.current;
    const finalPanel = finalPanelRef.current;
    const progress = progressRef.current;

    if (
      !section ||
      !globe ||
      !globeGlow ||
      !intro ||
      !craft ||
      !boxText ||
      !finalText ||
      !box ||
      !boxBase ||
      !boxBack ||
      !leftFlap ||
      !rightFlap ||
      !frontFlap ||
      !lid ||
      !tissueLeft ||
      !tissueRight ||
      !ribbonV ||
      !ribbonH ||
      !seal ||
      !finalPanel ||
      !progress
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set([craft, boxText, finalText, finalPanel], {
        autoAlpha: 0,
        y: 36,
        filter: "blur(10px)",
      });

      gsap.set(box, {
        autoAlpha: 0,
        y: 160,
        scale: 0.85,
      });

      gsap.set(boxBase, {
        y: 45,
        scaleY: 0.82,
      });

      gsap.set(boxBack, {
        y: 28,
        scaleY: 0.8,
      });

      gsap.set([leftFlap, rightFlap, frontFlap], {
        rotateX: -70,
        transformPerspective: 900,
        transformOrigin: "bottom center",
      });

      gsap.set(lid, {
        y: -145,
        rotateX: -68,
        rotateZ: -3,
        transformPerspective: 900,
        transformOrigin: "bottom center",
        autoAlpha: 0.95,
      });

      gsap.set([tissueLeft, tissueRight], {
        autoAlpha: 0,
        y: -10,
        scale: 0.85,
      });

      gsap.set(ribbonV, {
        autoAlpha: 0,
        scaleY: 0,
        transformOrigin: "top center",
      });

      gsap.set(ribbonH, {
        autoAlpha: 0,
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(seal, {
        autoAlpha: 0,
        scale: 0,
        rotate: -18,
      });

      gsap.set(progress, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(".packing-spark", {
        autoAlpha: 0,
        scale: 0,
      });

      gsap.set(".floating-cocoa", {
        y: 40,
        autoAlpha: 0,
        scale: 0.8,
      });

      const main = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.05,
          pin: ".globe-pack-stage",
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      main
        .to(progress, { scaleX: 1, ease: "none", duration: 1 }, 0)
        .fromTo(
          globe,
          {
            xPercent: 12,
            yPercent: -6,
            scale: 1.03,
            rotate: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
          },
          {
            xPercent: 10,
            yPercent: 14,
            scale: 0.88,
            rotate: -8,
            duration: 0.18,
            ease: "none",
          },
          0
        )
        .to(intro, { autoAlpha: 0, y: -34, filter: "blur(10px)", duration: 0.08 }, 0.12)
        .to(craft, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.08 }, 0.16)
        .to(
          globe,
          {
            xPercent: -18,
            yPercent: 38,
            scale: 0.66,
            rotate: -18,
            duration: 0.22,
            ease: "none",
          },
          0.18
        )
        .to(craft, { autoAlpha: 0, y: -34, filter: "blur(10px)", duration: 0.08 }, 0.38)
        .to(boxText, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.08 }, 0.42)
        .to(box, { autoAlpha: 1, y: 0, scale: 1, duration: 0.16 }, 0.42)
        .to(boxBase, { y: 0, scaleY: 1, duration: 0.16 }, 0.44)
        .to(boxBack, { y: 0, scaleY: 1, duration: 0.16 }, 0.45)
        .to([leftFlap, rightFlap, frontFlap], { rotateX: -18, duration: 0.16, stagger: 0.015 }, 0.48)
        .to(lid, { autoAlpha: 1, y: -84, rotateX: -78, rotateZ: -7, duration: 0.16 }, 0.5)
        .to(
          globe,
          {
            xPercent: 0,
            yPercent: 66,
            scale: 0.43,
            rotate: -28,
            duration: 0.24,
            ease: "none",
          },
          0.48
        )
        .to(
          ".packing-spark",
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.08,
            stagger: 0.012,
          },
          0.58
        )
        .to(
          ".packing-spark",
          {
            y: -55,
            x: "random(-28,28)",
            rotate: "random(-60,60)",
            autoAlpha: 0,
            duration: 0.22,
            stagger: 0.01,
          },
          0.64
        )
        .to(boxText, { autoAlpha: 0, y: -34, filter: "blur(10px)", duration: 0.08 }, 0.68)
        .to(finalText, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.08 }, 0.72)
        .to(
          globe,
          {
            xPercent: 0,
            yPercent: 89,
            scale: 0.2,
            rotate: -42,
            autoAlpha: 0.22,
            filter: "blur(2px)",
            duration: 0.16,
            ease: "power2.in",
          },
          0.72
        )
        .to(globeGlow, { autoAlpha: 0.2, scale: 0.55, duration: 0.16 }, 0.72)
        .to(tissueLeft, { autoAlpha: 1, y: 0, scale: 1, rotate: -8, duration: 0.08 }, 0.76)
        .to(tissueRight, { autoAlpha: 1, y: 0, scale: 1, rotate: 8, duration: 0.08 }, 0.77)
        .to(tissueLeft, { rotate: 18, x: 34, y: 20, scaleX: 0.88, duration: 0.12 }, 0.81)
        .to(tissueRight, { rotate: -18, x: -34, y: 20, scaleX: 0.88, duration: 0.12 }, 0.81)
        .to(frontFlap, { rotateX: -88, duration: 0.1 }, 0.84)
        .to(leftFlap, { rotateX: -88, rotateZ: -4, duration: 0.1 }, 0.855)
        .to(rightFlap, { rotateX: -88, rotateZ: 4, duration: 0.1 }, 0.865)
        .to(lid, { y: -6, rotateX: 0, rotateZ: 0, duration: 0.16, ease: "back.out(1.4)" }, 0.89)
        .to(ribbonV, { autoAlpha: 1, scaleY: 1, duration: 0.08 }, 0.94)
        .to(ribbonH, { autoAlpha: 1, scaleX: 1, duration: 0.08 }, 0.955)
        .to(seal, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.08, ease: "back.out(2.6)" }, 0.975)
        .to(finalPanel, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.08 }, 0.98);

      gsap.to(".gold-orbit-dot", {
        y: -34,
        x: "random(-18,18)",
        autoAlpha: 1,
        scale: "random(0.8,1.6)",
        duration: "random(2.4,4.2)",
        stagger: {
          each: 0.08,
          repeat: -1,
          yoyo: true,
        },
        ease: "sine.inOut",
      });

      gsap.to(".floating-cocoa", {
        y: "random(-34,34)",
        x: "random(-26,26)",
        rotate: "random(-18,18)",
        autoAlpha: 0.75,
        scale: "random(0.75,1.15)",
        duration: "random(3,5)",
        stagger: {
          each: 0.12,
          repeat: -1,
          yoyo: true,
        },
        ease: "sine.inOut",
      });

      ScrollTrigger.refresh();
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[520vh] bg-[#050201] text-[#f8eadc]">
      <div className="globe-pack-stage sticky top-0 h-screen overflow-hidden bg-[#050201]">
        <Background />

        <FloatingGold />
        <FloatingCocoa />

        <div ref={introRef} className="absolute left-6 top-[18%] z-30 max-w-xl sm:left-12 lg:left-20">
          <p className="mb-5 text-xs uppercase tracking-[0.48em] text-[#d7a85f]">
            Maison de Chocolat
          </p>

          <h1 className="font-serif text-5xl leading-[0.9] sm:text-7xl lg:text-8xl">
            Noir <span className="italic text-[#d7a85f]">Sane</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-[#c8b5a4]">
            Wholesome Bites, Delightful Nights. Scroll to send the chocolate globe
            downward into a luxury box, then watch it get packed with a soft gifting animation.
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
        </div>

        <div ref={craftRef} className="absolute right-6 top-[20%] z-30 max-w-md sm:right-12 lg:right-20">
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-[#d7a85f]">
            Cocoa Orbit
          </p>

          <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
            The globe travels with your scroll.
          </h2>

          <p className="mt-5 text-sm leading-7 text-[#c8b5a4]">
            The 3D chocolate globe stays alive, but now it moves down the page
            smoothly using GSAP ScrollTrigger.
          </p>
        </div>

        <div ref={boxTextRef} className="absolute left-6 top-[20%] z-30 max-w-md sm:left-12 lg:left-20">
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-[#d7a85f]">
            Gift Box Reveal
          </p>

          <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
            The box opens before the globe arrives.
          </h2>

          <p className="mt-5 text-sm leading-7 text-[#c8b5a4]">
            As the globe descends, the box rises, opens, and prepares to receive
            the chocolate like a premium gifting ritual.
          </p>
        </div>

        <div ref={finalTextRef} className="absolute left-1/2 top-[10%] z-30 w-[92%] max-w-3xl -translate-x-1/2 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.42em] text-[#d7a85f]">
            Cute Packing Moment
          </p>

          <h2 className="font-serif text-4xl leading-tight sm:text-6xl lg:text-7xl">
            Wrapped, sealed, and ready to gift.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#c8b5a4]">
            Tissue folds softly, the lid closes, the ribbon wraps around the box,
            and the Noir Sane seal appears at the final scroll point.
          </p>
        </div>

        <div
          ref={globeRef}
          className="pointer-events-none absolute left-1/2 top-[2%] z-20 h-[520px] w-[520px] -translate-x-1/2 sm:h-[640px] sm:w-[640px] lg:h-[760px] lg:w-[760px]"
        >
          <div
            ref={globeGlowRef}
            className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_center,rgba(215,168,95,0.36),rgba(74,30,14,0.2)_45%,transparent_70%)] blur-3xl"
          />

          <div className="relative h-full w-full">
            <Suspense fallback={<div className="mx-auto mt-28 h-80 w-80 rounded-full bg-[#1a0b05]" />}>
              <ChocolateGlobe className="h-full max-w-none" />
            </Suspense>
          </div>
        </div>

        <PackingBox
          boxRef={boxRef}
          boxBaseRef={boxBaseRef}
          boxBackRef={boxBackRef}
          leftFlapRef={leftFlapRef}
          rightFlapRef={rightFlapRef}
          frontFlapRef={frontFlapRef}
          lidRef={lidRef}
          tissueLeftRef={tissueLeftRef}
          tissueRightRef={tissueRightRef}
          ribbonVRef={ribbonVRef}
          ribbonHRef={ribbonHRef}
          sealRef={sealRef}
        />

        <div
          ref={finalPanelRef}
          className="absolute bottom-8 left-1/2 z-40 w-[92%] max-w-5xl -translate-x-1/2 rounded-[2rem] border border-[#d7a85f]/25 bg-[#080302]/78 p-5 shadow-[0_35px_120px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-8"
        >
          <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d7a85f]/20 bg-[#d7a85f]/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#d7a85f]">
                <PackageCheck className="h-3.5 w-3.5" />
                Packed With Care
              </div>

              <h2 className="font-serif text-3xl leading-tight text-[#f8eadc] sm:text-5xl">
                A gift box that feels like the final scene.
              </h2>
            </div>

            <div>
              <p className="text-sm leading-7 text-[#c8b5a4]">
                After this animation, lead customers directly to your collection
                and let the product cards continue the luxury story.
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

function Background() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,rgba(215,168,95,0.18),transparent_30%),radial-gradient(circle_at_20%_70%,rgba(88,29,9,0.48),transparent_38%),linear-gradient(180deg,#130704_0%,#070302_62%,#020100_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:92px_92px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_36%,rgba(0,0,0,0.84)_100%)]" />
      <div className="pack-noise pointer-events-none absolute inset-0" />
    </>
  );
}

function FloatingGold() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {Array.from({ length: 34 }).map((_, index) => (
        <span
          key={index}
          className="gold-orbit-dot absolute h-1 w-1 rounded-full bg-[#d7a85f]/70 shadow-[0_0_18px_rgba(215,168,95,0.85)]"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 19) % 100}%`,
          }}
        />
      ))}
    </div>
  );
}

function FloatingCocoa() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
      {Array.from({ length: 12 }).map((_, index) => (
        <span
          key={index}
          className="floating-cocoa absolute block rounded-[4px] bg-gradient-to-br from-[#4a1608] to-[#160603] shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
          style={{
            left: `${8 + ((index * 13) % 84)}%`,
            top: `${18 + ((index * 17) % 64)}%`,
            width: `${10 + (index % 4) * 4}px`,
            height: `${8 + (index % 3) * 4}px`,
          }}
        />
      ))}
    </div>
  );
}

function PackingBox({
  boxRef,
  boxBaseRef,
  boxBackRef,
  leftFlapRef,
  rightFlapRef,
  frontFlapRef,
  lidRef,
  tissueLeftRef,
  tissueRightRef,
  ribbonVRef,
  ribbonHRef,
  sealRef,
}: {
  boxRef: RefObject<HTMLDivElement>;
  boxBaseRef: RefObject<HTMLDivElement>;
  boxBackRef: RefObject<HTMLDivElement>;
  leftFlapRef: RefObject<HTMLDivElement>;
  rightFlapRef: RefObject<HTMLDivElement>;
  frontFlapRef: RefObject<HTMLDivElement>;
  lidRef: RefObject<HTMLDivElement>;
  tissueLeftRef: RefObject<HTMLDivElement>;
  tissueRightRef: RefObject<HTMLDivElement>;
  ribbonVRef: RefObject<HTMLDivElement>;
  ribbonHRef: RefObject<HTMLDivElement>;
  sealRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div
      ref={boxRef}
      className="absolute bottom-[8%] left-1/2 z-10 h-[360px] w-[92vw] max-w-[760px] -translate-x-1/2 sm:h-[430px]"
    >
      <div className="absolute left-1/2 top-[26%] h-56 w-96 -translate-x-1/2 rounded-full bg-[#d7a85f]/25 blur-[80px]" />

      <div
        ref={lidRef}
        className="absolute left-1/2 top-[8%] z-30 h-[105px] w-[78%] -translate-x-1/2 rounded-[1.4rem] border border-[#d7a85f]/25 bg-gradient-to-b from-[#1b1008] via-[#080302] to-[#030100] shadow-[0_34px_120px_rgba(0,0,0,0.85)] sm:h-[130px]"
      >
        <div className="absolute inset-[10px] rounded-[1rem] border border-[#d7a85f]/18 bg-gradient-to-b from-[#2c1b0c] via-[#d7a85f]/12 to-[#090403]" />
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-lg tracking-[0.32em] text-[#d7a85f] sm:text-2xl">
          NOIR SANE
        </p>
      </div>

      <div
        ref={boxBackRef}
        className="absolute bottom-[35%] left-1/2 z-10 h-[130px] w-[72%] -translate-x-1/2 rounded-t-[1.6rem] border border-[#d7a85f]/25 bg-gradient-to-b from-[#d7a85f] via-[#9b6128] to-[#301005] shadow-[inset_0_0_55px_rgba(255,232,183,0.25)] sm:h-[160px]"
      />

      <div
        ref={tissueLeftRef}
        className="absolute bottom-[40%] left-[23%] z-20 h-[120px] w-[210px] rounded-[58%_42%_62%_38%] bg-gradient-to-br from-[#fff4df]/88 via-[#d7a85f]/40 to-[#7a4219]/18 blur-[0.2px]"
      />

      <div
        ref={tissueRightRef}
        className="absolute bottom-[40%] right-[23%] z-20 h-[120px] w-[210px] rounded-[42%_58%_38%_62%] bg-gradient-to-bl from-[#fff4df]/88 via-[#d7a85f]/40 to-[#7a4219]/18 blur-[0.2px]"
      />

      <div
        ref={leftFlapRef}
        className="absolute bottom-[33%] left-[12%] z-25 h-[115px] w-[36%] rounded-t-[1.35rem] border border-[#d7a85f]/20 bg-gradient-to-br from-[#23120a] via-[#0b0402] to-[#030100] shadow-[0_20px_70px_rgba(0,0,0,0.65)]"
      />

      <div
        ref={rightFlapRef}
        className="absolute bottom-[33%] right-[12%] z-25 h-[115px] w-[36%] rounded-t-[1.35rem] border border-[#d7a85f]/20 bg-gradient-to-bl from-[#23120a] via-[#0b0402] to-[#030100] shadow-[0_20px_70px_rgba(0,0,0,0.65)]"
      />

      <div
        ref={frontFlapRef}
        className="absolute bottom-[31%] left-1/2 z-30 h-[105px] w-[70%] -translate-x-1/2 rounded-t-[1.35rem] border border-[#d7a85f]/20 bg-gradient-to-b from-[#211006] via-[#0b0402] to-[#030100] shadow-[0_20px_70px_rgba(0,0,0,0.68)]"
      />

      <div
        ref={boxBaseRef}
        className="absolute bottom-[10%] left-1/2 z-20 h-[145px] w-[84%] -translate-x-1/2 overflow-hidden rounded-b-[1.75rem] border border-[#d7a85f]/25 bg-gradient-to-b from-[#17100c] via-[#080302] to-[#030100] shadow-[0_40px_120px_rgba(0,0,0,0.85)] sm:h-[175px]"
      >
        <div className="absolute left-0 right-0 top-0 h-5 bg-gradient-to-r from-[#5f3616] via-[#d7a85f] to-[#5f3616]" />
        <div className="absolute left-1/2 top-9 h-12 w-44 -translate-x-1/2 rounded-full bg-[#d7a85f]/20 blur-2xl" />
        <p className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 font-serif text-xl tracking-[0.32em] text-[#d7a85f] sm:text-3xl">
          NOIR SANE
        </p>
      </div>

      <div
        ref={ribbonVRef}
        className="absolute bottom-[10%] left-1/2 z-45 h-[250px] w-7 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#f8d99b] via-[#d7a85f] to-[#7e4718] shadow-[0_0_34px_rgba(215,168,95,0.35)]"
      />

      <div
        ref={ribbonHRef}
        className="absolute bottom-[31%] left-[11%] z-45 h-7 w-[78%] rounded-full bg-gradient-to-r from-[#7e4718] via-[#d7a85f] to-[#f8d99b] shadow-[0_0_34px_rgba(215,168,95,0.35)]"
      />

      <div
        ref={sealRef}
        className="absolute bottom-[29%] left-1/2 z-50 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full border border-[#fff0c6]/50 bg-gradient-to-br from-[#f8d99b] via-[#d7a85f] to-[#8f561d] text-[#130704] shadow-[0_0_45px_rgba(215,168,95,0.55)]"
      >
        <Gift className="h-7 w-7" />
      </div>

      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="packing-spark absolute z-50 h-1.5 w-1.5 rounded-full bg-[#f8d99b] shadow-[0_0_18px_rgba(248,217,155,0.95)]"
          style={{
            left: `${32 + ((index * 7) % 38)}%`,
            bottom: `${34 + ((index * 5) % 28)}%`,
          }}
        />
      ))}
    </div>
  );
}
