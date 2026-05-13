import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";
import { orderApi } from "@/lib/api";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

import { PageShell } from "@/components/luxury/LuxuryPrimitives";

const Orders = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderApi.getOrders(),
  });

  if (isLoading) {
    return <PageShell className="pt-32"><div className="container py-20 text-center">Loading...</div></PageShell>;
  }

  return (
    <PageShell>
      <section className="container pt-28 pb-24 sm:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow mb-3">Your Collection</p>
          <h1 className="font-serif text-5xl text-cream sm:text-6xl mb-4">
            My <span className="gold-text italic">Orders</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Every coffret you&apos;ve placed. Each one crafted with care, waiting for its moment.
          </p>
        </motion.div>

        {orders?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="luxe-card p-16 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-gold/10 grid place-items-center">
              <Package className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-3xl text-cream mb-3">No orders yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Your collection awaits. Explore our atelier and find something extraordinary.
            </p>
            <Link to="/shop" className="btn-gold">
              Explore the Collection
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4 mt-12">
            {orders?.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="luxe-card p-6 hover:border-gold/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-gold/20 grid place-items-center">
                        <Package className="w-5 h-5 gold-text" />
                      </div>
                      <div>
                        <div className="font-mono text-xs text-muted-foreground">{order.orderNumber}</div>
                        <div className="font-serif text-lg gold-text">{formatINR(order.totalAmount)}</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{order.status.replace(/_/g, " ")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                        order.paymentStatus === "VERIFIED"
                          ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40"
                          : order.paymentStatus === "SUBMITTED"
                          ? "bg-amber-900/30 text-amber-100 border border-amber-700/40"
                          : "bg-amber-900/30 text-amber-100 border border-amber-700/40"
                      }`}>
                        {order.paymentStatus === "VERIFIED" ? "Confirmed" : 
                         order.paymentStatus === "SUBMITTED" ? "Verifying" : 
                         order.paymentStatus === "PENDING" ? "Awaiting Payment" : "Processing"}
                      </span>
                      <Link
                        to={`/orders/${order.id}`}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="hairline mb-4" />

                  <div className="flex flex-wrap gap-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-muted/50 rounded-sm px-3 py-1.5">
                        <span className="text-sm">{item.productNameSnapshot}</span>
                        <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default Orders;
