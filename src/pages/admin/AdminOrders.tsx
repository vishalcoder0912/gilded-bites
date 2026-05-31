import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, X, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n / 100);

type OrderStatus = "PLACED" | "PAYMENT_PENDING" | "PAYMENT_SUBMITTED" | "CONFIRMED" | "PACKED" | "OUT_FOR_DELIVERY" | "NEARBY" | "DELIVERED" | "CANCELLED" | "FAILED";
type PaymentStatus = "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED" | "REFUNDED";

const orderStatusOptions: OrderStatus[] = [
  "PLACED",
  "PAYMENT_PENDING",
  "PAYMENT_SUBMITTED",
  "CONFIRMED",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "NEARBY",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
];

const statusLabels: Record<string, string> = {
  PLACED: "Placed",
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_SUBMITTED: "Payment Submitted",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for Delivery",
  NEARBY: "Nearby",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

const paymentLabels: Record<string, string> = {
  PENDING: "Pending",
  SUBMITTED: "Submitted",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  REFUNDED: "Refunded",
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-orders", filter],
    queryFn: () => adminApi.getOrders({ page: 1, limit: 100 }),
  });

  const updatePaymentStatus = useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: string }) =>
      adminApi.updatePaymentStatus(id, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast.success("Payment status updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update payment status");
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
    },
  });

  const filteredOrders = ordersData?.data?.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.transactionId?.toLowerCase().includes(q) ||
        o.paymentReferenceNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  }) || [];

  const handlePaymentStatus = (id: string, status: string) => {
    updatePaymentStatus.mutate({ id, paymentStatus: status });
  };

  const handleOrderStatus = (id: string, status: string) => {
    updateOrderStatus.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Operations</p>
        <h1 className="font-serif text-4xl">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verify UPI payments and dispatch coffrets to your patrons.
        </p>
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
            {["all", "PLACED", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((f) => (
              <button type="button"
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] border transition-colors ${
                  filter === f
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {f === "all" ? "All" : statusLabels[f] || f}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-border">
                <th className="text-left font-normal px-5 py-3">Order</th>
                <th className="text-left font-normal py-3">Customer</th>
                <th className="text-left font-normal py-3">Amount</th>
                <th className="text-left font-normal py-3">UTR</th>
                <th className="text-left font-normal py-3">Payment</th>
                <th className="text-left font-normal py-3">Status</th>
                <th className="text-right font-normal px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-mono text-xs">{o.orderNumber}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {new Date(o.createdAt).toLocaleDateString()} · {o.items?.length || 0} item{(o.items?.length || 0) === 1 ? "" : "s"}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm">{o.customerName}</div>
                    <div className="text-[11px] text-muted-foreground">{o.customerPhone}</div>
                  </td>
                  <td className="py-4 font-serif text-base gold-text">
                    {formatINR(o.totalAmount)}
                  </td>
                  <td className="py-4 font-mono text-xs">{o.paymentReferenceNumber || "-"}</td>
                  <td className="py-4">
                    <span className={`text-xs uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${
                      o.paymentStatus === "VERIFIED"
                        ? "bg-emerald-900/30 text-emerald-400"
                        : o.paymentStatus === "SUBMITTED"
                        ? "bg-amber-900/30 text-amber-100"
                        : o.paymentStatus === "REJECTED"
                        ? "bg-red-900/30 text-red-400"
                        : "bg-amber-900/30 text-amber-100"
                    }`}>
                      {paymentLabels[o.paymentStatus] || o.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`text-xs uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${
                      o.status === "DELIVERED"
                        ? "bg-emerald-900/30 text-emerald-400"
                        : o.status === "CANCELLED"
                        ? "bg-red-900/30 text-red-400"
                        : "bg-primary/20 text-primary"
                    }`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      {o.paymentStatus !== "VERIFIED" && o.paymentStatus !== "REJECTED" && (
                        <>
                          <button type="button"
                            onClick={() => handlePaymentStatus(o.id, "VERIFIED")}
                            disabled={updatePaymentStatus.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors text-xs uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Check className="w-3.5 h-3.5" /> Verify
                          </button>
                          <button type="button"
                            onClick={() => handlePaymentStatus(o.id, "REJECTED")}
                            disabled={updatePaymentStatus.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-colors text-xs uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                      <select
                        value={o.status}
                        onChange={(event) => handleOrderStatus(o.id, event.target.value)}
                        disabled={updateOrderStatus.isPending}
                        className="rounded-md border border-border bg-rich px-2 py-1.5 text-xs uppercase tracking-[0.12em] text-foreground outline-none transition-colors hover:border-primary disabled:opacity-40"
                        aria-label={`Update status for ${o.orderNumber}`}
                      >
                        {orderStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No orders match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
