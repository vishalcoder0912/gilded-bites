import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/services/products";
import { motion } from "framer-motion";

const Shop = () => {
  const [active, setActive] = useState<typeof categories[number]>("All");
  const filtered = useMemo(
    () => (active === "All" ? products : products.filter((p) => p.category === active)),
    [active],
  );

  return (
    <div className="pt-32 pb-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="eyebrow mb-4">The Collection</p>
          <h1 className="font-serif text-5xl md:text-7xl mb-4">
            Every <span className="gold-text italic">piece</span>, a story.
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Browse the full atelier: truffles, bars, pralines and single-origin rarities.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 text-xs uppercase tracking-[0.25em] rounded-full border transition-all ${
                active === cat
                  ? "bg-gradient-gold text-abyss border-transparent"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Shop;
