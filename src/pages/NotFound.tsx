import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/luxury/LuxuryPrimitives";

const NotFound = () => {
  return (
    <PageShell>
      <section className="flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div className="font-serif text-[180px] leading-none text-cream/5 sm:text-[240px]">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-[1px] bg-gradient-gold" />
            </div>
          </div>

          <p className="eyebrow mb-4">Lost in the atelier</p>
          <h1 className="font-serif text-4xl text-cream sm:text-5xl mb-4">
            This page has <span className="gold-text italic">melted away</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-10">
            The piece you were looking for seems to have been crafted into something else. 
            Perhaps it&apos;s time to explore our collection anew.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/" className="btn-gold">
              Return Home
            </Link>
            <Link to="/shop" className="btn-ghost-gold">
              Explore Collection
            </Link>
          </div>

          <div className="mt-16">
            <div className="hairline mb-8 w-24 mx-auto" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              DARK CHOCOLATE · FRUIT-JELLY CENTRES
            </p>
          </div>
        </motion.div>
      </section>
    </PageShell>
  );
};

export default NotFound;
