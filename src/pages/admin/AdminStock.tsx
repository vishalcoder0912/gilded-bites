import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Plus, ArrowUpDown, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n / 100);

const AdminStock = () => {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const { data: stockData, isLoading, error } = useQuery({
    queryKey: ["admin-stock"],
    queryFn: () => adminApi.getStock(),
  });

  const adjustStock = useMutation({
    mutationFn: ({ productId, quantity, reason }: { productId: string; quantity: number; reason: string }) =>
      adminApi.adjustStock(productId, quantity, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stock"] });
      toast.success("Stock adjusted");
      setAdjustingId(null);
      setAdjustQty("");
      setAdjustReason("");
    },
    onError: () => toast.error("Failed to adjust stock"),
  });

  const filtered = stockData?.filter((s) => {
    if (!q.trim()) return true;
    const lq = q.toLowerCase();
    return s.product?.name?.toLowerCase().includes(lq) || s.product?.slug?.toLowerCase().includes(lq);
  }) ?? [];

  const handleAdjust = (productId: string) => {
    if (!adjustQty || !adjustReason.trim()) return;
    adjustStock.mutate({ productId, quantity: parseInt(adjustQty), reason: adjustReason });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Inventory</p>
        <h1 className="font-serif text-4xl">Stock Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and adjust inventory levels.</p>
      </div>

      <div className="flex items-center gap-2 flex-1 bg-rich/40 border border-border rounded-md px-3 py-2 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="bg-transparent flex-1 text-sm focus:outline-none" />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive max-w-md">
          Failed to load inventory: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : (
        <div className="luxe-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-border">
                <th className="text-left px-5 py-3 font-normal">Product</th>
                <th className="text-left py-3 font-normal">Current Stock</th>
                <th className="text-left py-3 font-normal">Threshold</th>
                <th className="text-left py-3 font-normal">Price</th>
                <th className="text-left py-3 font-normal">Status</th>
                <th className="text-right px-5 py-3 font-normal">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const isLow = s.quantity <= s.lowStockThreshold;
                return (
                  <tr key={s.id} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div className="font-medium">{s.product?.name}</div>
                      <div className="text-xs text-muted-foreground">{s.product?.slug}</div>
                    </td>
                    <td className="py-4 font-serif text-lg gold-text">{s.quantity}</td>
                    <td className="py-4 text-sm text-muted-foreground">{s.lowStockThreshold}</td>
                    <td className="py-4 text-sm">{formatINR(s.product?.price ?? 0)}</td>
                    <td className="py-4">
                      {s.quantity === 0 ? (
                        <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Out of Stock</span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-100">
                          <AlertTriangle className="w-3 h-3" /> Low
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400">In Stock</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-end">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={adjustingId === s.productId ? adjustQty : ""}
                          onChange={(e) => { setAdjustingId(s.productId); setAdjustQty(e.target.value); }}
                          className="w-20 bg-input border border-border px-2 py-1 rounded-sm text-xs text-center"
                        />
                        {adjustingId === s.productId && (
                          <div className="flex gap-1">
                            <input
                              placeholder="Reason"
                              value={adjustReason}
                              onChange={(e) => setAdjustReason(e.target.value)}
                              className="w-28 bg-input border border-border px-2 py-1 rounded-sm text-xs"
                            />
                            <button
                              onClick={() => handleAdjust(s.productId)}
                              disabled={adjustStock.isPending}
                              className="px-2 py-1 bg-primary text-abyss text-xs rounded-sm hover:bg-gold-bright disabled:opacity-40"
                            >
                              {adjustStock.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                            </button>
                            <button onClick={() => { setAdjustingId(null); setAdjustQty(""); setAdjustReason(""); }} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground">✕</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No stock records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminStock;