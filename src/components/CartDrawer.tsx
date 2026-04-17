import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/store/cart";
import { formatINR } from "@/services/products";
import { useEffect } from "react";

const CartDrawer = () => {
  const { isOpen, close, items, setQty, remove, subtotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCheckout = () => {
    close();
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
            className="fixed inset-0 z-[60] bg-abyss/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-card border-l border-border flex flex-col shadow-soft"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <div className="eyebrow">Your selection</div>
                <h2 className="font-serif text-2xl">Coffret</h2>
              </div>
              <button onClick={close} className="p-2 hover:text-primary transition-colors" aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {items.length === 0 && (
                <div className="text-center py-20">
                  <div className="font-serif text-2xl mb-3">Your coffret awaits.</div>
                  <p className="text-sm text-muted-foreground mb-8">Begin curating from our collection.</p>
                  <button onClick={() => { close(); navigate("/shop"); }} className="btn-ghost-gold">
                    Browse chocolate
                  </button>
                </div>
              )}
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex gap-4 pb-5 border-b border-border/50"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    loading="lazy"
                    className="w-20 h-20 object-cover rounded-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-lg leading-tight truncate">{item.product.name}</div>
                    <div className="text-xs text-muted-foreground mb-3">{item.product.weight}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-sm">
                        <button
                          onClick={() => setQty(item.product.id, item.quantity - 1)}
                          className="p-1.5 hover:text-primary"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => setQty(item.product.id, item.quantity + 1)}
                          className="p-1.5 hover:text-primary"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.product.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-lg gold-text">
                      {formatINR(item.product.price * item.quantity)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Subtotal</span>
                  <span className="font-serif text-2xl gold-text">{formatINR(subtotal())}</span>
                </div>
                <p className="text-xs text-muted-foreground">Shipping & taxes calculated at checkout.</p>
                <button onClick={handleCheckout} className="btn-gold w-full">
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
