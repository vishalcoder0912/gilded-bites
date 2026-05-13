import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useCartStore } from "@/store/cartStore";
import { getProductImage } from "@/lib/api";
import { EmptyState, PageShell, formatINR } from "@/components/luxury/LuxuryPrimitives";

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, isLoading, fetchCart, updateQuantity, removeFromCart, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const delivery = subtotal > 2500 ? 0 : 150;
  const discount = 0;
  const total = subtotal + delivery - discount;

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  if (!isAuthenticated) {
    return (
      <PageShell className="pt-32">
        <div className="container py-20">
          <EmptyState title="Sign in to view your coffret" description="Your cart is saved securely once you sign in." actionLabel="Sign In" actionTo="/login" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="container pt-28 pb-24 sm:pt-36">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3">Cart</p>
          <h1 className="font-serif text-5xl text-[#f8eadc] sm:text-6xl">Cart</h1>
        </div>

        {isLoading ? (
          <div className="grid min-h-[320px] place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#d9a35b]" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="Your coffret awaits" description="Begin curating from our collection of handcrafted chocolates." actionLabel="Browse Chocolate" actionTo="/shop" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/72 p-4 sm:p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="grid gap-4 border-b border-[#d9a35b]/12 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                    <img src={getProductImage(item.product)} alt={item.product.name} className="h-28 w-full rounded-sm object-cover sm:h-24 sm:w-24" loading="lazy" />
                    <div className="min-w-0">
                      <h2 className="font-serif text-2xl text-[#f8eadc]">{item.product.name}</h2>
                      <p className="mt-1 text-sm text-[#f0c27a]">{formatINR(item.priceSnapshot)}</p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex items-center rounded-sm border border-[#d9a35b]/22">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-[#c8b5a4] hover:text-[#f0c27a]" aria-label="Decrease quantity">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-9 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-[#c8b5a4] hover:text-[#f0c27a]" aria-label="Increase quantity">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-[#c8b5a4] transition hover:text-[#d94f35]" aria-label="Remove item">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="font-serif text-2xl text-[#f0c27a] sm:text-right">{formatINR(item.priceSnapshot * item.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="h-fit rounded-sm border border-[#d9a35b]/22 bg-[#140904]/82 p-6 lg:sticky lg:top-28">
              <h2 className="font-serif text-3xl text-[#f8eadc]">Order Summary</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-[#c8b5a4]"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
                <div className="flex justify-between text-[#c8b5a4]"><span>Delivery</span><span>{delivery ? formatINR(delivery) : "Complimentary"}</span></div>
                <div className="flex justify-between text-[#6fbf73]"><span>Discount</span><span>-{formatINR(discount)}</span></div>
                <div className="mt-4 border-t border-[#d9a35b]/14 pt-4">
                  <div className="flex justify-between font-serif text-2xl text-[#f8eadc]"><span>Total</span><span className="text-[#f0c27a]">{formatINR(total)}</span></div>
                  <p className="mt-2 text-xs leading-relaxed text-[#c8b5a4]">Tax included and shipping calculated at checkout.</p>
                </div>
              </div>
              <button onClick={() => navigate("/checkout")} className="btn-gold mt-7 w-full">Proceed to Checkout</button>
              <Link to="/shop" className="mt-4 block text-center text-xs uppercase tracking-[0.22em] text-[#c8b5a4] hover:text-[#f0c27a]">Continue Shopping</Link>
            </aside>
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default Cart;
