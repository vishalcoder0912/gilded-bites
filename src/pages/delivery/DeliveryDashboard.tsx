import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle2, MapPin } from "lucide-react";
import { deliveryApi } from "@/lib/api";

const DeliveryDashboard = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["delivery-orders"],
    queryFn: () => deliveryApi.getOrders(),
  });

  const pending = orders?.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)) || [];
  const delivered = orders?.filter((o) => o.status === "DELIVERED") || [];

  const stats = [
    { label: "Active", value: pending.length, icon: Clock, accent: "text-primary" },
    { label: "Delivered", value: delivered.length, icon: CheckCircle2, accent: "text-emerald-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-2">Hello</p>
        <h1 className="font-serif text-4xl">Your Deliveries</h1>
        <p className="text-muted-foreground mt-2">
          {pending.length} delivery{pending.length === 1 ? "" : "s"} pending.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="luxe-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{s.label}</div>
              <s.icon className={`w-4 h-4 ${s.accent}`} />
            </div>
            <div className="font-serif text-3xl">{s.value}</div>
          </motion.div>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="luxe-card p-6">
          <h2 className="font-serif text-xl mb-5">Active Deliveries</h2>
          <div className="space-y-3">
            {pending.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-sm">
                <div>
                  <div className="font-mono text-sm">{order.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {order.deliveryAddressLine1}, {order.city}
                  </div>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] px-3 py-1 bg-primary/20 text-primary rounded-full">
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;