import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Trash2, MapPin, Edit, Check } from "lucide-react";
import { toast } from "sonner";
import { addressApi } from "@/lib/api";
import { PageShell } from "@/components/luxury/LuxuryPrimitives";

const Addresses = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: true,
  });

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.getAddresses(),
  });

  const createAddress = useMutation({
    mutationFn: (data: Parameters<typeof addressApi.createAddress>[0]) => addressApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added");
      setShowForm(false);
      resetForm();
    },
    onError: () => toast.error("Failed to add address"),
  });

  const deleteAddress = useMutation({
    mutationFn: (id: string) => addressApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted");
    },
    onError: () => toast.error("Failed to delete address"),
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => addressApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Default address set");
    },
    onError: () => toast.error("Failed to set default"),
  });

  const resetForm = () => {
    setForm({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAddress.mutate(form);
  };

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
          className="mb-12"
        >
          <p className="eyebrow mb-3">Delivery</p>
          <h1 className="font-serif text-5xl text-cream sm:text-6xl mb-4">
            My <span className="gold-text italic">Addresses</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Manage your delivery addresses.
          </p>
        </motion.div>

        <div className="space-y-4 mb-6">
          {addresses?.map((addr) => (
            <motion.div
              key={addr.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="luxe-card p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-cream">{addr.fullName}</div>
                      {addr.isDefault && (
                        <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </div>
                    <div className="text-sm text-muted-foreground">{addr.phone}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefault.mutate(addr.id)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      title="Set as default"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteAddress.mutate(addr.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="luxe-card p-6 max-w-xl"
          >
            <h2 className="font-serif text-2xl text-cream mb-4">Add Address</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Full Name *
                </label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                  className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm text-cream"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm text-cream"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Address Line 1 *
                </label>
                <input
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  required
                  className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm text-cream"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Address Line 2
                </label>
                <input
                  value={form.addressLine2}
                  onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                  className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm text-cream"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    City *
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                    className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm text-cream"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    State *
                  </label>
                  <input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    required
                    className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm text-cream"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Postal Code *
                </label>
                <input
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  required
                  pattern="^\d{6}$"
                  className="w-full bg-input border border-border rounded-sm px-4 py-3 text-sm text-cream"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-gold">Save Address</button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="btn-ghost-gold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <button onClick={() => setShowForm(true)} className="btn-gold">
            <Plus className="w-4 h-4 mr-2" /> Add Address
          </button>
        )}
      </section>
    </PageShell>
  );
};

export default Addresses;