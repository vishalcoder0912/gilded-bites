import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Loader2, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useProductBySlug, useProducts } from "@/store/catalog";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/store/auth";
import { getProductImageCandidates } from "@/lib/api";
import { addPendingCartItem } from "@/lib/pendingCart";
import { toast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import { EmptyState, PageShell } from "@/components/luxury/LuxuryPrimitives";
import { formatINRFromPaise } from "@/lib/currency";

const detailSections = [
  ["Ingredients", "Single-origin cacao, cocoa butter, cane sugar, and natural inclusions selected for each recipe."],
  ["Tasting Notes", "A layered profile of roasted cocoa, gentle fruit, warm spice, and a clean lingering finish."],
  ["Shipping & Delivery", "Packed in protective insulated materials and dispatched with temperature-aware handling."],
  ["Storage", "Store in a cool, dry place away from sunlight. Best enjoyed at room temperature."],
];

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProductBySlug(slug || "");
  const addToCart = useCartStore((s) => s.addToCart);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [openSection, setOpenSection] = useState("Ingredients");

  const { data: productsData } = useProducts({ limit: 4 });
  const relatedProducts = productsData?.data.filter((p) => p.id !== product?.id).slice(0, 3) || [];

  const addCurrentProduct = async (redirectToCheckout = false) => {
    if (!product) return;
    if (!isAuthenticated) {
      addPendingCartItem({ productId: product.id, quantity: qty });
      toast({ title: "Added to cart" });
      return;
    }
    await addToCart(product.id, qty);
    if (redirectToCheckout) navigate("/checkout");
  };

  if (isLoading) {
    return (
      <PageShell className="pt-32">
        <div className="container grid min-h-[50vh] place-items-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#d9a35b]" />
        </div>
      </PageShell>
    );
  }

  if (error || !product) {
    return (
      <PageShell className="pt-32">
        <div className="container py-20">
          <EmptyState title="Piece not found" description="The product you are looking for is unavailable or has moved." actionLabel="Back to Shop" actionTo="/shop" />
        </div>
      </PageShell>
    );
  }

  const images = getProductImageCandidates(product);
  const inStock = Boolean(product.stock && product.stock.quantity > 0);

  return (
    <PageShell>
      <section className="container pt-28 pb-20 sm:pt-36">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#c8b5a4]">
          <Link to="/" className="hover:text-[#f0c27a]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#f0c27a]">Shop</Link>
          <span>/</span>
          <span className="text-[#f0c27a]">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="grid gap-4 sm:grid-cols-[88px_1fr]">
            <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
              {images.map((image, index) => (
                <button type="button"
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-sm border transition ${activeImage === index ? "border-[#d9a35b]" : "border-[#d9a35b]/20"}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="order-1 overflow-hidden rounded-sm border border-[#d9a35b]/22 bg-[#160a05] sm:order-2">
              <img
                src={images[activeImage] || "/placeholder.svg"}
                alt={product.name}
                className="aspect-square w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          </div>

          <div className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/72 p-6 sm:p-8">
            <p className="eyebrow mb-3">{product.category?.name || "Noir Sane"}</p>
            <h1 className="font-serif text-5xl leading-tight text-[#f8eadc] sm:text-6xl">{product.name}</h1>
            <p className="mt-3 font-serif text-3xl text-[#f0c27a]">{formatINRFromPaise(product.price)}</p>
            <p className="mt-5 text-base leading-relaxed text-[#c8b5a4]">{product.description || product.shortDescription}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["70% Cacao", "Single Origin", "Handcrafted", "Small Batch"].map((chip) => (
                <span key={chip} className="rounded-full border border-[#d9a35b]/22 bg-[#d9a35b]/8 px-3 py-1 text-xs text-[#f0c27a]">
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between gap-5">
              <span className={`text-xs uppercase tracking-[0.24em] ${inStock ? "text-[#6fbf73]" : "text-[#d94f35]"}`}>
                {inStock ? `In Stock${product.stock?.quantity ? ` (${product.stock.quantity})` : ""}` : "Out of Stock"}
              </span>
              <div className="flex items-center rounded-sm border border-[#d9a35b]/22">
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-[#c8b5a4] hover:text-[#f0c27a]" aria-label="Decrease quantity">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <button type="button" onClick={() => setQty(qty + 1)} className="p-3 text-[#c8b5a4] hover:text-[#f0c27a]" aria-label="Increase quantity">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={!inStock} onClick={() => addCurrentProduct(false)} className="btn-gold disabled:cursor-not-allowed disabled:opacity-50">
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
              <button type="button" disabled={!inStock} onClick={() => addCurrentProduct(true)} className="btn-ghost-gold disabled:cursor-not-allowed disabled:opacity-50">
                <Zap className="h-4 w-4" /> Buy Now
              </button>
            </div>

            <div className="mt-8 divide-y divide-[#d9a35b]/14 border-y border-[#d9a35b]/14">
              {detailSections.map(([title, body]) => (
                <div key={title}>
                  <button type="button" onClick={() => setOpenSection(openSection === title ? "" : title)} className="flex w-full items-center justify-between py-4 text-left text-xs uppercase tracking-[0.24em] text-[#f0c27a]">
                    {title}
                    <ChevronDown className={`h-4 w-4 transition ${openSection === title ? "rotate-180" : ""}`} />
                  </button>
                  {openSection === title && <p className="pb-4 text-sm leading-relaxed text-[#c8b5a4]">{body}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="font-serif text-4xl text-[#f8eadc]">You may also <span className="gold-text italic">savour</span></h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}
            </div>
          </section>
        )}
      </section>
    </PageShell>
  );
};

export default ProductDetail;
