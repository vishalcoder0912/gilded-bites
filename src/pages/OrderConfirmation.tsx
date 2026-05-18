import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, CreditCard, MapPin, QrCode, Loader2 } from "lucide-react";
import { orderApi } from "@/lib/api";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n / 100);

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getOrder(orderId!),
    enabled: !!orderId,
  });

  useEffect(() => {
    if (!orderId) {
      navigate("/", { replace: true });
    }
  }, [orderId, navigate]);

  if (isLoading) {
    return (
      <div className="pt-40 pb-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const isStripePayment = order.paymentMethod === "STRIPE";
  const paymentLabel = isStripePayment ? "Stripe" : "UPI";
  const isPaid = order.paymentStatus === "PAID" || order.paymentStatus === "VERIFIED";

  return (
    <div className="pt-24 pb-24">
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
            Merci, <span className="gold-text italic">{order.customerName?.split(" ")[0] || "truly"}</span>.
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-10">
            {order.paymentStatus === "PENDING" || order.paymentStatus === "SUBMITTED" 
              ? "We have your order. Payment is being verified." 
              : "Your order is confirmed and being prepared."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="luxe-card p-8 text-left mb-10"
        >
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Order Number</div>
              <div className="font-mono text-base">{order.orderNumber}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Transaction ID</div>
              <div className="font-mono text-sm">{order.transactionId}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Amount</div>
              <div className="font-serif text-xl gold-text">{formatINR(order.totalAmount)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Payment</div>
              <div className="inline-flex items-center gap-2 text-sm">
                {isStripePayment ? <CreditCard className="w-4 h-4 text-primary" /> : <QrCode className="w-4 h-4 text-primary" />}
                {paymentLabel}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Payment Status</div>
              <div className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                isPaid
                  ? "bg-emerald-900/30 text-emerald-400"
                  : order.paymentStatus === "SUBMITTED"
                  ? "bg-amber-900/30 text-amber-100"
                  : "bg-amber-900/30 text-amber-100"
              }`}>
                {order.paymentStatus === "PAID" ? "Paid" :
                 order.paymentStatus === "VERIFIED" ? "Verified" : 
                 order.paymentStatus === "SUBMITTED" ? "Submitted" : 
                 order.paymentStatus === "PENDING" ? "Pending" : order.paymentStatus}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Order Status</div>
              <div className="text-sm text-primary">
                {order.status.replaceAll("_", " ")}
              </div>
            </div>
            {order.paymentReferenceNumber && (
              <div className="sm:col-span-2">
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">UTR / Reference</div>
                <div className="font-mono text-sm break-all">{order.paymentReferenceNumber}</div>
              </div>
            )}
          </div>

          <div className="hairline mb-6" />
          
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="font-serif text-xl">Shipping address</h2>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <div className="text-foreground">{order.customerName}</div>
              <div>{order.customerPhone}</div>
              <div>{order.deliveryAddressLine1}</div>
              {order.deliveryAddressLine2 && <div>{order.deliveryAddressLine2}</div>}
              <div>{order.city}, {order.state} {order.pincode}</div>
            </div>
          </div>

          <div className="hairline mb-6" />

          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-muted rounded-sm flex items-center justify-center text-xs text-muted-foreground">
                  IMG
                </div>
                <div className="flex-1">
                  <div className="text-sm">{item.productNameSnapshot}</div>
                  <div className="text-xs text-muted-foreground">× {item.quantity}</div>
                </div>
                <div className="text-sm gold-text font-serif">
                  {formatINR(item.totalPrice)}
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
          <Link to="/orders" className="btn-ghost-gold">View orders</Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
