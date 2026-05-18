import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function RouteGsapEnhancer() {
  const location = useLocation();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".noir-page-reveal, main section, footer, .admin-panel-card, [data-noir-reveal]",
        { autoAlpha: 0, y: 34, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.055,
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("nav a, nav button, .magnetic, .btn-gold").forEach((el) => {
        const enter = () => {
          gsap.to(el, {
            y: -2,
            scale: 1.035,
            duration: 0.28,
            ease: "power3.out",
          });
        };

        const leave = () => {
          gsap.to(el, {
            y: 0,
            scale: 1,
            duration: 0.32,
            ease: "power3.out",
          });
        };

        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);

        return () => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        };
      });

      gsap.to(".noir-cursor-aurora", {
        x: "var(--noir-cursor-x, 50vw)",
        y: "var(--noir-cursor-y, 50vh)",
        duration: 0.7,
        ease: "power3.out",
        repeatRefresh: true,
      });
    });

    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 250);

    return () => {
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, [location.pathname]);

  return null;
}
