import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Package, Clock, CheckCircle2, XCircle, IndianRupee } from "lucide-react";
import { useAdminOrders } from "@/store/adminOrders";
import { formatINR } from "@/services/products";
import { StatusBadge } from "@/components/admin/StatusBadge";

const AdminDashboard = () => {
  const orders = useAdminOrders((s) => s.orders);

  const pending = orders.filter((o) => o.status === "pending");
  const approved = orders.filter((o) => o.status === "approved");
  const rejected = orders.filter((o) => o.status === "rejected");
  const revenue = approved.reduce((s, o) => s + o.amount, 0);

  const stats = [
    { label: "Awaiting", value: pending.length, icon: Clock, accent: "text-primary" },
    { label: "Approved", value: approved.length, icon: CheckCircle2, accent: "text-emerald-400" },
    { label: "Rejected", value: rejected.length, icon: XCircle, accent: "text-destructive" },
    { label: "Revenue", value: formatINR(revenue), icon: IndianRupee, accent: "text-primary" },
  ];

  const recent = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-2">Maison · Today</p>
          <h1 className="font-serif text-4xl md:text-5xl">
            Bonjour, <span className="gold-text italic">Anaïs</span>.
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {pending.length} order{pending.length === 1 ? "" : "s"} awaiting your verification.
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="btn-ghost-gold inline-flex items-center gap-2"
        >
          Review orders <ArrowUpRight className="w-4 h-4" />
        </Link>
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
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {s.label}
              </div>
              <s.icon className={`w-4 h-4 ${s.accent}`} />
            </div>
            <div className="font-serif text-3xl">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="luxe-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h2 className="font-serif text-xl">Recent orders</h2>
          </div>
          <Link to="/admin/orders" className="text-xs uppercase tracking-[0.25em] text-primary hover:text-gold-bright">
            View all
          </Link>
        </div>
        <div className="divide-y divide-border/60">
          {recent.map((o) => (
            <div key={o.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <img
                src={o.items[0].product.image}
                alt=""
                className="w-10 h-10 rounded-md object-cover border border-border"
              />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-sm truncate">{o.id}</div>
                <div className="text-xs text-muted-foreground truncate">{o.customerName}</div>
              </div>
              <div className="hidden sm:block text-sm font-serif gold-text">{formatINR(o.amount)}</div>
              <StatusBadge status={o.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
