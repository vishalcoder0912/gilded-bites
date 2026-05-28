import { FormEvent, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ upiId: "", displayName: "", qrCodeUrl: "", isActive: true });

  const { data: upiSettings, isLoading } = useQuery({
    queryKey: ["admin-upi-settings"],
    queryFn: () => adminApi.getUpiSettings(),
  });

  const createUpi = useMutation({
    mutationFn: (data: Parameters<typeof adminApi.createUpiSetting>[0]) => adminApi.createUpiSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-upi-settings"] });
      toast.success("UPI setting created");
      setForm({ upiId: "", displayName: "", qrCodeUrl: "", isActive: true });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create UPI setting"),
  });

  const updateUpi = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateUpiSetting>[1] }) => adminApi.updateUpiSetting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-upi-settings"] });
      toast.success("UPI setting status updated");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update UPI setting"),
  });

  const deleteUpi = useMutation({
    mutationFn: (id: string) => adminApi.deleteUpiSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-upi-settings"] });
      toast.success("UPI setting deleted");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete UPI setting"),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.upiId.trim()) return;
    createUpi.mutate({
      upiId: form.upiId.trim(),
      displayName: form.displayName.trim() || "Noir Sane",
      qrCodeUrl: form.qrCodeUrl.trim() || undefined,
      isActive: form.isActive,
    });
  };

  // Sort UPI settings so that active ones appear at the top
  const sortedSettings = [...(upiSettings ?? [])].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="eyebrow mb-2">Configuration</p>
        <h1 className="font-serif text-4xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage UPI payment settings for customer checkout.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="luxe-card p-6 space-y-5">
            <h2 className="font-serif text-xl">Add UPI Configuration</h2>
            <div>
              <label htmlFor="upi-id" className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                UPI ID *
              </label>
              <input
                id="upi-id"
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                placeholder="merchant@bank"
                required
                className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-primary transition-colors font-mono"
              />
            </div>
            <div>
              <label htmlFor="upi-name" className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                Display Name
              </label>
              <input
                id="upi-name"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Noir Sane"
                className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label htmlFor="upi-qr" className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">
                QR Code URL
              </label>
              <input
                id="upi-qr"
                value={form.qrCodeUrl}
                onChange={(e) => setForm({ ...form, qrCodeUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="accent-primary"
              />
              <label htmlFor="is-active" className="text-sm">Set as active UPI (Deactivates other active UPIs)</label>
            </div>
            <button type="submit" disabled={createUpi.isPending || !form.upiId.trim()} className="btn-gold disabled:opacity-60">
              {createUpi.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Add UPI Setting"}
            </button>
          </form>

          <div className="luxe-card p-6">
            <div className="mb-6">
              <h2 className="font-serif text-2xl">UPI Configurations</h2>
              <p className="text-sm text-muted-foreground mt-1">Configure and toggle active status for merchant UPI accounts.</p>
            </div>

            {sortedSettings.length > 0 ? (
              <div className="divide-y divide-border/40">
                {sortedSettings.map((s) => (
                  <div key={s.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-medium">{s.upiId}</span>
                        <span className={`text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${s.isActive ? "bg-emerald-900/30 text-emerald-400" : "bg-muted/30 text-muted-foreground"}`}>
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">{s.displayName || "Noir Sane"}</div>
                      {s.qrCodeUrl && (
                        <div className="text-xs text-muted-foreground/70 mt-1 truncate max-w-xs font-mono">
                          QR: {s.qrCodeUrl}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateUpi.mutate({ id: s.id, data: { isActive: !s.isActive } })}
                        disabled={updateUpi.isPending}
                        className={`text-xs uppercase tracking-[0.15em] font-medium transition-colors ${s.isActive ? "text-muted-foreground hover:text-foreground" : "text-primary hover:text-gold-bright"}`}
                      >
                        {s.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete UPI setting "${s.upiId}"?`)) {
                            deleteUpi.mutate(s.id);
                          }
                        }}
                        disabled={deleteUpi.isPending}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete UPI configuration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No UPI settings configured yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSettings;
