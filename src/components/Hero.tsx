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
      {/* 3D scene */}
      <div className="absolute inset-0">
        <Suspense fallback={<HeroFallback />}>
          <ChocolateGlobe onClick={() => navigate("/shop")} />
        </Suspense>
        {/* bottom melt */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-melt" />
      </div>

      {/* copy overlay */}
      <div className="relative z-10 container min-h-[100svh] flex flex-col justify-center pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="eyebrow mb-6"
        >
          Maison de Chocolat — Est. 1899
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-3xl"
        >
          A world cast in <span className="gold-text italic">cocoa</span> & gold.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="mt-8 max-w-md text-base md:text-lg text-muted-foreground"
        >
          Single-origin beans, atelier-finished by hand. Tap the sphere to enter the collection.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.95 }}
          className="mt-10 flex flex-wrap gap-4 pointer-events-auto"
        >
          <button onClick={() => navigate("/shop")} className="btn-gold">
            Explore the Collection
          </button>
          <button onClick={() => navigate("/shop")} className="btn-ghost-gold">
            Our Atelier
          </button>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-xs uppercase tracking-[0.4em] text-muted-foreground"
      >
        scroll
      </motion.div>
    </section>
  );
};

export default Hero;
