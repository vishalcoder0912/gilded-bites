import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { getFeatured } from "@/services/products";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const featured = getFeatured();
  return (
    <>
      <Hero />

      {/* Featured collection */}
      <section className="container py-32" id="featured">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-4">The Atelier Selection</p>
            <h2 className="font-serif text-4xl md:text-6xl max-w-2xl leading-[1.1]">
              Six pieces, <span className="gold-text italic">infinite</span> reverence.
            </h2>
          </div>
          <Link to="/shop" className="btn-ghost-gold">View all</Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Story strip */}
      <section id="story" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rich/30 via-transparent to-transparent" />
        <div className="container relative grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="eyebrow mb-4">Our Atelier</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
              From bean to <span className="gold-text italic">bonbon</span>, by hand.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For four generations, our chocolatiers have travelled to single-estate plantations across Madagascar,
              Venezuela and the Ivory Coast — selecting only the beans that whisper of place.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Each piece is conched for seventy-two hours, tempered to a mirror sheen, and finished by a single pair
              of hands in our Mumbai atelier.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { n: "1899", l: "Year founded" },
              { n: "72h", l: "Conching time" },
              { n: "11", l: "Origin estates" },
              { n: "100%", l: "Hand-finished" },
            ].map((s) => (
              <div key={s.l} className="luxe-card p-8 text-center">
                <div className="font-serif text-4xl gold-text mb-2">{s.n}</div>
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
