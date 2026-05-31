import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/store/auth";
import { useEffect } from "react";
import ProductImage from "@/components/ProductImage";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n / 100);

const CartDrawer = () => {
  const { isOpen, close, items, isLoading, updateQuantity, removeFromCart, getSubtotal, fetchCart } = useCartStore();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isAuthenticated && !authLoading) {
      fetchCart();
    }
  }, [isOpen, isAuthenticated, authLoading, fetchCart]);

  const handleCheckout = () => {
    close();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/", openCart: true } });
      return;
    }
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-abyss/80 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-gold/20 bg-gradient-dark-card shadow-soft"
          >
            <div className="flex items-center justify-between p-6 border-b border-gold/15">
              <div>
                <div className="eyebrow">Your selection</div>
                <h2 className="font-serif text-2xl text-cream">Coffret</h2>
              </div>
              <button type="button" onClick={close} className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20">
                  <div className="font-serif text-2xl mb-3 text-cream">Your coffret awaits.</div>
                  <p className="text-sm text-muted-foreground mb-8">Begin curating from our collection.</p>
                  <button type="button" onClick={() => { close(); navigate("/shop"); }} className="btn-ghost-gold text-xs">
                    Browse chocolate
                  </button>
                </div>
              ) : items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 border-b border-gold/10 pb-5 sm:flex"
                >
                  <ProductImage
                    product={item.product}
                    alt={item.product.name}
                    loading="lazy"
                    className="w-20 h-20 object-cover rounded-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-lg text-cream leading-tight truncate">{item.product?.name}</div>
                    <div className="text-xs text-muted-foreground mb-3">{formatINR(item.priceSnapshot)}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gold/20 rounded-sm">
                        <button type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="col-start-2 text-left sm:text-right">
                    <div className="font-serif text-lg gold-text">
                      {formatINR(item.priceSnapshot * item.quantity)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gold/15 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Subtotal</span>
                  <span className="font-serif text-2xl gold-text">{formatINR(getSubtotal())}</span>
                </div>
                <p className="text-xs text-muted-foreground">Shipping & taxes calculated at checkout.</p>
                <button type="button" onClick={handleCheckout} className="btn-gold w-full">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
