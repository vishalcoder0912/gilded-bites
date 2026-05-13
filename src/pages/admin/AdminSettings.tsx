import { FormEvent, useState, useEffect } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
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

  const activeSetting = upiSettings?.find((s) => s.isActive);
  const inactiveSettings = upiSettings?.filter((s) => !s.isActive) ?? [];

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
      toast.success("UPI setting updated");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update UPI setting"),
  });

  const deleteUpi = useMutation({
    mutationFn: (id: string) => adminApi.deleteUpiSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-upi-settings"] });
      toast.success("UPI setting disabled");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to disable UPI setting"),
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
              <label htmlFor="is-active" className="text-sm">Set as active UPI</label>
            </div>
            <button type="submit" disabled={createUpi.isPending || !form.upiId.trim()} className="btn-gold disabled:opacity-60">
              {createUpi.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Add UPI Setting"}
            </button>
          </form>

          <div className="luxe-card p-6">
            <h2 className="font-serif text-xl mb-4">Active UPI</h2>
            {activeSetting ? (
              <div className="p-4 border border-primary/40 rounded-sm bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-lg">{activeSetting.upiId}</div>
                    <div className="text-sm text-muted-foreground">{activeSetting.displayName || "Noir Sane"}</div>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] px-3 py-1 bg-primary/20 text-primary rounded-full">Active</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No active UPI setting.</p>
            )}
          </div>

          {inactiveSettings.length > 0 && (
            <div className="luxe-card p-6">
              <h2 className="font-serif text-xl mb-4">Other UPI Settings</h2>
              <div className="space-y-3">
                {inactiveSettings.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 border border-border rounded-sm">
                    <div>
                      <div className="font-mono">{s.upiId}</div>
                      {s.displayName && <div className="text-sm text-muted-foreground">{s.displayName}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateUpi.mutate({ id: s.id, data: { isActive: true } })}
                        disabled={updateUpi.isPending}
                        className="text-xs uppercase tracking-[0.15em] text-primary hover:text-gold-bright disabled:opacity-40"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => deleteUpi.mutate(s.id)}
                        disabled={deleteUpi.isPending}
                        className="text-xs uppercase tracking-[0.15em] text-destructive hover:text-destructive/80 disabled:opacity-40"
                      >
                        Disable
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminSettings;
