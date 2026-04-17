import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { useAdminOrders, type AdminOrderStatus } from "@/store/adminOrders";
import { formatINR } from "@/services/products";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ProofPreview } from "@/components/admin/ProofPreview";
import { cn } from "@/lib/utils";

const filters: Array<{ key: "all" | AdminOrderStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Awaiting" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const formatRelative = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

const AdminOrders = () => {
  const { orders, approve, reject, reset } = useAdminOrders();
  const [filter, setFilter] = useState<"all" | AdminOrderStatus>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return orders
      .filter((o) => (filter === "all" ? true : o.status === filter))
      .filter((o) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.utr.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, filter, query]);

  const handleApprove = (id: string) => {
    approve(id);
    toast.success(`Order ${id} approved`);
  };
  const handleReject = (id: string) => {
    reject(id);
    toast.error(`Order ${id} rejected`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-2">Operations</p>
          <h1 className="font-serif text-4xl">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verify UPI payments and dispatch coffrets to your patrons.
          </p>
        </div>
        <button
          onClick={() => {
            reset();
            toast.message("Mock orders restored");
          }}
          className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-primary inline-flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset mock data
        </button>
      </div>

      <div className="luxe-card p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1 bg-rich/40 border border-border rounded-md px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Order ID, customer, UTR…"
              className="bg-transparent flex-1 text-sm focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const active = filter === f.key;
              const count =
                f.key === "all"
                  ? orders.length
                  : orders.filter((o) => o.status === f.key).length;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] border transition-colors",
                    active
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
                  )}
                >
                  {f.label} <span className="opacity-60 ml-1">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-border">
                <th className="text-left font-normal px-5 py-3">Order</th>
                <th className="text-left font-normal py-3">Customer</th>
                <th className="text-left font-normal py-3">Amount</th>
                <th className="text-left font-normal py-3">UTR</th>
                <th className="text-left font-normal py-3">Proof</th>
                <th className="text-left font-normal py-3">Status</th>
                <th className="text-right font-normal px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-mono text-xs">{o.id}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {formatRelative(o.createdAt)} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm">{o.customerName}</div>
                    <div className="text-[11px] text-muted-foreground">{o.email}</div>
                  </td>
                  <td className="py-4 font-serif text-base gold-text">
                    {formatINR(o.amount)}
                  </td>
                  <td className="py-4 font-mono text-xs">{o.utr}</td>
                  <td className="py-4">
                    <ProofPreview src={o.proofUrl} orderId={o.id} />
                  </td>
                  <td className="py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleApprove(o.id)}
                        disabled={o.status === "approved"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors text-xs uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(o.id)}
                        disabled={o.status === "rejected"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-colors text-xs uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No orders match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/tablet cards */}
        <div className="lg:hidden space-y-3">
          {filtered.map((o) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border/60 rounded-md p-4 bg-rich/20"
            >
              <div className="flex items-start gap-3 mb-3">
                <ProofPreview src={o.proofUrl} orderId={o.id} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs truncate">{o.id}</div>
                  <div className="text-sm mt-1 truncate">{o.customerName}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{o.email}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Amount</div>
                  <div className="font-serif text-base gold-text mt-0.5">{formatINR(o.amount)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">UTR</div>
                  <div className="font-mono text-xs mt-0.5 truncate">{o.utr}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(o.id)}
                  disabled={o.status === "approved"}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs uppercase tracking-[0.15em] disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => handleReject(o.id)}
                  disabled={o.status === "rejected"}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-destructive/10 text-destructive border border-destructive/30 text-xs uppercase tracking-[0.15em] disabled:opacity-40"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No orders match the current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
