import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { formatINR, type Product } from "@/services/products";
import { useCart } from "@/store/cart";

interface Props {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const add = useCart((s) => s.add);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className="luxe-card group relative overflow-hidden"
      >
        <Link to={`/product/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-rich">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              width={768}
              height={768}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-abyss/80 via-transparent to-transparent opacity-60" />
            <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.3em] text-cream/80 bg-abyss/40 backdrop-blur px-3 py-1 rounded-full border border-cream/10">
              {product.category}
            </div>
          </div>
          <div className="p-6">
            <div className="eyebrow mb-2">{product.cocoa}% cacao</div>
            <h3 className="font-serif text-2xl mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-5">{product.tagline}</p>
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl gold-text">{formatINR(product.price)}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  add(product);
                }}
                className="text-xs uppercase tracking-[0.25em] text-cream/70 hover:text-primary transition-colors"
              >
                Add +
              </button>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;
