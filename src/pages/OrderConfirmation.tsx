import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useOrder } from "@/store/order";
import { formatINR } from "@/services/products";

const OrderConfirmation = () => {
  const order = useOrder((s) => s.current);
  const navigate = useNavigate();

  useEffect(() => {
    if (!order) navigate("/", { replace: true });
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="pt-32 pb-24">
      <div className="container max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-gold grid place-items-center shadow-glow"
        >
          <Check className="w-9 h-9 text-abyss" strokeWidth={3} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <p className="eyebrow mb-3">Order received</p>
          <h1 className="font-serif text-5xl md:text-6xl mb-4">
            Merci, <span className="gold-text italic">truly</span>.
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-10">
            We're verifying your payment. You'll receive a confirmation by email within minutes — and your coffret will
            be on its way shortly after.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="luxe-card p-8 text-left mb-10"
        >
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Order ID</div>
              <div className="font-mono text-base">{order.id}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Amount</div>
              <div className="font-serif text-xl gold-text">{formatINR(order.amount)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">UTR</div>
              <div className="font-mono text-sm break-all">{order.utr}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Status</div>
              <div className="text-sm text-primary">Awaiting verification</div>
            </div>
          </div>

          <div className="hairline mb-6" />

          <div className="space-y-3">
            {order.items.map((it) => (
              <div key={it.product.id} className="flex gap-3 items-center">
                <img src={it.product.image} alt={it.product.name} className="w-12 h-12 object-cover rounded-sm" />
                <div className="flex-1">
                  <div className="text-sm">{it.product.name}</div>
                  <div className="text-xs text-muted-foreground">× {it.quantity}</div>
                </div>
                <div className="text-sm gold-text font-serif">
                  {formatINR(it.product.price * it.quantity)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link to="/shop" className="btn-gold">Continue shopping</Link>
          <Link to="/" className="btn-ghost-gold">Back home</Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
