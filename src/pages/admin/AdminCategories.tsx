import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true });

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminApi.getCategories(),
  });

  const createCategory = useMutation({
    mutationFn: (data: Parameters<typeof adminApi.createCategory>[0]) => adminApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created");
      setShowForm(false);
      setForm({ name: "", slug: "", description: "", isActive: true });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create category"),
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateCategory>[1] }) =>
      adminApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated");
      setEditingId(null);
      setForm({ name: "", slug: "", description: "", isActive: true });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update category"),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category disabled");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete category"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name, slug: form.slug || undefined, description: form.description || undefined, isActive: form.isActive };
    if (editingId) {
      updateCategory.mutate({ id: editingId, data });
    } else {
      createCategory.mutate(data as Parameters<typeof adminApi.createCategory>[0]);
    }
  };

  const startEdit = (cat: { id: string; name: string; slug: string; description: string | null; isActive: boolean }) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", isActive: cat.isActive });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-2">Catalog</p>
          <h1 className="font-serif text-4xl">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize your chocolate collection.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", slug: "", description: "", isActive: true }); }} className="btn-gold">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxe-card p-6">
          <h2 className="font-serif text-xl mb-4">{editingId ? "Edit Category" : "Add Category"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm font-mono" />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="category-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-primary" />
              <label htmlFor="category-active" className="text-sm">Active category</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={createCategory.isPending || updateCategory.isPending} className="btn-gold disabled:opacity-60">
                {createCategory.isPending || updateCategory.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingId ? "Update" : "Create"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: "", slug: "", description: "", isActive: true }); }} className="btn-ghost-gold">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive max-w-md">
          Failed to load categories: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : (
        <div className="luxe-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-border">
                <th className="text-left px-5 py-3 font-normal">Name</th>
                <th className="text-left py-3 font-normal">Slug</th>
                <th className="text-left py-3 font-normal">Description</th>
                <th className="text-left py-3 font-normal">Status</th>
                <th className="text-right px-5 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((cat) => (
                <tr key={cat.id} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="px-5 py-4 font-medium">{cat.name}</td>
                  <td className="py-4 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                  <td className="py-4 text-sm text-muted-foreground">{cat.description || "—"}</td>
                  <td className="py-4">
                    <span className={`text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${cat.isActive ? "bg-emerald-900/30 text-emerald-400" : "bg-destructive/20 text-destructive"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => startEdit(cat)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button
                        onClick={() => updateCategory.mutate({ id: cat.id, data: { isActive: !cat.isActive } })}
                        disabled={updateCategory.isPending}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                        aria-label={cat.isActive ? "Disable category" : "Activate category"}
                      >
                        {cat.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => deleteCategory.mutate(cat.id)} disabled={deleteCategory.isPending || !cat.isActive} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!categories || categories.length === 0) && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
