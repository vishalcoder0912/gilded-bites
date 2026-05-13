import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/store/auth";
import type { Product } from "@/lib/api";
import { getProductImage } from "@/lib/api";
import { savePendingCartItem } from "@/lib/pendingCart";
import { formatINRFromPaise } from "@/components/luxury/LuxuryPrimitives";

interface Props {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: Props) => {
  const addToCart = useCartStore((s) => s.addToCart);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const inStock = Boolean(product.stock && product.stock.quantity > 0);

  const handleAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!inStock) return;

    if (!isAuthenticated) {
      savePendingCartItem({ productId: product.id, quantity: 1 });
      navigate("/login", { state: { from: location.pathname, openCart: true } });
      return;
    }

    addToCart(product.id, 1);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.25) }}
      className="group h-full"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-sm border border-[#d9a35b]/20 bg-[#160a05]/80 shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition duration-500 hover:-translate-y-1 hover:border-[#d9a35b]/55 hover:shadow-[0_28px_90px_rgba(217,163,91,0.12)]"
      >
        <div className="relative aspect-[4/4.35] overflow-hidden bg-[#0d0503]">
          <img
            src={getProductImage(product)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090403] via-[#090403]/10 to-transparent" />
          <div className="absolute left-4 top-4 rounded-full border border-[#d9a35b]/25 bg-[#090403]/65 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#f0c27a] backdrop-blur">
            {product.category?.name || "Chocolate"}
          </div>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full border border-[#d9a35b]/35 bg-[#d9a35b]/95 text-[#090403] opacity-100 shadow-[0_10px_30px_rgba(217,163,91,0.28)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-45 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className={`text-[10px] uppercase tracking-[0.2em] ${inStock ? "text-[#6fbf73]" : "text-[#d94f35]"}`}>
              {inStock ? `In Stock${product.stock?.quantity ? ` (${product.stock.quantity})` : ""}` : "Out of Stock"}
            </span>
            <ShoppingBag className="h-3.5 w-3.5 text-[#9d6a36]" />
          </div>
          <h3 className="font-serif text-2xl leading-tight text-[#f8eadc]">{product.name}</h3>
          <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-[#c8b5a4]">
            {product.shortDescription || product.description || "Atelier-finished chocolate crafted for slow tasting."}
          </p>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <div className="font-serif text-xl text-[#f0c27a]">{formatINRFromPaise(product.price)}</div>
              {product.mrp && product.mrp > product.price && (
                <div className="text-xs text-[#c8b5a4]/60 line-through">{formatINRFromPaise(product.mrp)}</div>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#d9a35b]">View</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default ProductCard;
