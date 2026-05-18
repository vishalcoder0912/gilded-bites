import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ChocolateGlobe = lazy(() => import("./ChocolateGlobe"));

const HeroFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-40 h-40 rounded-full bg-gradient-gold opacity-20 blur-2xl animate-float" />
  </div>
);

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-gradient-hero">
      <div className="absolute inset-x-0 bottom-0 top-[45%] md:inset-0 md:top-0 pointer-events-none">
        <Suspense fallback={<HeroFallback />}>
          <ChocolateGlobe onClick={() => navigate("/shop")} />
        </Suspense>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 md:h-40 bg-gradient-melt" />
      </div>

      <div className="relative z-10 container min-h-[100svh] flex flex-col justify-start pt-24 pb-60 md:pb-0 md:justify-center md:pt-0 pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="eyebrow mb-4 md:mb-6"
        >
          Wholesome Bites, Delightful Nights.
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-8xl leading-[1.05] max-w-3xl"
        >
          Noir Sane <span className="gold-text italic">dark chocolate</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="mt-4 md:mt-8 max-w-sm md:max-w-md text-sm md:text-lg text-muted-foreground"
        >
          Premium dark chocolate with fruit-forward fillings, glossy jelly notes, and elegant gifting.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.95 }}
          className="mt-6 md:mt-10 flex flex-wrap gap-3 md:gap-4 pointer-events-auto"
        >
          <button onClick={() => navigate("/shop")} className="btn-gold text-sm md:text-base px-5 py-2.5 md:px-7 md:py-3">
            Explore the Collection
          </button>
          <button onClick={() => navigate("/shop")} className="btn-ghost-gold text-sm md:text-base px-5 py-2.5 md:px-7 md:py-3">
            Explore Our Story
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
