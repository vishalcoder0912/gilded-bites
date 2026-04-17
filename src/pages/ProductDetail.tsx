import { useParams, Link, useNavigate } from "react-router-dom";
import { formatINR, getProduct, products } from "@/services/products";
import { useCart } from "@/store/cart";
import { motion } from "framer-motion";
import { useState } from "react";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = id ? getProduct(id) : undefined;
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="container pt-40 pb-24 text-center">
        <h1 className="font-serif text-4xl mb-4">Piece not found</h1>
        <Link to="/shop" className="btn-ghost-gold">Back to collection</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="pt-32 pb-24">
      <div className="container">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-primary mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative aspect-square overflow-hidden rounded-sm bg-rich"
          >
            <img
              src={product.image}
              alt={product.name}
              width={768}
              height={768}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-primary/20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="eyebrow mb-4">{product.category} · {product.cocoa}% cacao</p>
            <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-3">{product.name}</h1>
            <p className="text-lg text-muted-foreground italic mb-8">{product.tagline}</p>

            <div className="hairline mb-8" />

            <p className="text-base leading-relaxed text-foreground/90 mb-8">{product.description}</p>

            <dl className="grid grid-cols-2 gap-6 mb-10 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Weight</dt>
                <dd className="font-serif text-lg">{product.weight}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Cacao</dt>
                <dd className="font-serif text-lg">{product.cocoa}%</dd>
              </div>
            </dl>

            <div className="flex items-center justify-between mb-8">
              <span className="font-serif text-4xl gold-text">{formatINR(product.price * qty)}</span>
              <div className="flex items-center border border-border rounded-sm">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:text-primary" aria-label="Decrease">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-10 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-3 hover:text-primary" aria-label="Increase">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button onClick={() => add(product, qty)} className="btn-gold w-full">
              Add to coffret
            </button>
            <p className="text-xs text-muted-foreground mt-4 text-center uppercase tracking-[0.25em]">
              Complimentary shipping on orders over ₹2,500
            </p>
          </motion.div>
        </div>

        {/* Related */}
        <section className="mt-32">
          <h2 className="font-serif text-3xl md:text-4xl mb-10">You may also <span className="italic gold-text">savour</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
