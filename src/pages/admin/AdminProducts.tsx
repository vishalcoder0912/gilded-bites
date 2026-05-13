import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Plus, Pencil, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n / 100);

const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const inferFlavor = (name: string) => {
  const lowerName = name.toLowerCase();
  const flavors = ["apple", "orange", "mango", "grape", "pineapple", "pomegranate", "caramel", "hazelnut", "truffle", "praline"];
  return flavors.find((flavor) => lowerName.includes(flavor)) || "signature cocoa";
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", shortDescription: "", price: "", mrp: "", categoryId: "",
    imageUrls: "", isActive: true, isFeatured: false,
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-products", page, q],
    queryFn: () => adminApi.getProducts({ page, limit: 20, q: q || undefined }),
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminApi.getCategories(),
  });

  const createProduct = useMutation({
    mutationFn: (data: Parameters<typeof adminApi.createProduct>[0]) => adminApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product created");
      setShowForm(false);
      resetForm();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create product"),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateProduct>[1] }) =>
      adminApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product updated");
      setEditingId(null);
      resetForm();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update product"),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product archived");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete product"),
  });

  const resetForm = () => setForm({ name: "", slug: "", description: "", shortDescription: "", price: "", mrp: "", categoryId: "", imageUrls: "", isActive: true, isFeatured: false });

  const autoFillProductCopy = () => {
    const selectedCategory = categories?.find((category) => category.id === form.categoryId)?.name || "Chocolate";
    const flavor = inferFlavor(form.name);
    const productName = form.name.trim() || "New NoirSane creation";

    setForm({
      ...form,
      slug: form.slug || makeSlug(productName),
      shortDescription:
        form.shortDescription ||
        `${flavor.charAt(0).toUpperCase()}${flavor.slice(1)} notes with premium ${selectedCategory.toLowerCase()}`,
      description:
        form.description ||
        `${productName} pairs polished chocolate craft with ${flavor} character for a balanced bite: smooth cocoa, layered sweetness, and a clean finish made for gifting or slow tasting.`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description,
      shortDescription: form.shortDescription || undefined,
      price: Math.round(Number(form.price) * 100),
      mrp: form.mrp ? Math.round(Number(form.mrp) * 100) : undefined,
      categoryId: form.categoryId,
      imageUrls: form.imageUrls ? form.imageUrls.split(",").map((s) => s.trim()).filter(Boolean) : [],
      isActive: form.isActive,
      isFeatured: form.isFeatured,
    };
    if (editingId) {
      updateProduct.mutate({ id: editingId, data });
    } else {
      createProduct.mutate(data as Parameters<typeof adminApi.createProduct>[0]);
    }
  };

  const startEdit = (product: { id: string; name: string; slug: string; description: string | null; shortDescription: string | null; price: number; mrp: number | null; categoryId: string; imageUrls: string[]; isActive: boolean; isFeatured: boolean }) => {
    setEditingId(product.id);
    setForm({
      name: product.name, slug: product.slug, description: product.description || "",
      shortDescription: product.shortDescription || "", price: String(product.price / 100),
      mrp: product.mrp ? String(product.mrp / 100) : "", categoryId: product.categoryId,
      imageUrls: product.imageUrls?.join(", ") || "", isActive: product.isActive, isFeatured: product.isFeatured,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-2">Catalog</p>
          <h1 className="font-serif text-4xl">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your chocolate collection.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }} className="btn-gold">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2 flex-1 bg-rich/40 border border-border rounded-md px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search products…" className="bg-transparent flex-1 text-sm focus:outline-none" />
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxe-card p-6">
          <h2 className="font-serif text-xl mb-4">{editingId ? "Edit Product" : "Add Product"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || makeSlug(e.target.value) })}
                  required
                  className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm font-mono" />
              </div>
            </div>
            <button type="button" onClick={autoFillProductCopy} className="btn-ghost-gold text-xs">
              <Sparkles className="w-4 h-4 mr-2" /> Auto-fill copy
            </button>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Short Description</label>
              <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Price (₹) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">MRP (₹)</label>
                <input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Category *</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm">
                  <option value="">Select category</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Image URLs or paths (comma-separated)</label>
              <input value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} className="w-full bg-input border border-border px-3 py-2 rounded-sm text-sm" placeholder="/products/apple-1.png, https://..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-primary" />
              <label htmlFor="active" className="text-sm">Active product</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-primary" />
              <label htmlFor="featured" className="text-sm">Featured product</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="btn-gold disabled:opacity-60">
                {createProduct.isPending || updateProduct.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingId ? "Update" : "Create"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }} className="btn-ghost-gold">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : (
        <div className="luxe-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b border-border">
                <th className="text-left px-5 py-3 font-normal">Product</th>
                <th className="text-left py-3 font-normal">Category</th>
                <th className="text-left py-3 font-normal">Price</th>
                <th className="text-left py-3 font-normal">Stock</th>
                <th className="text-left py-3 font-normal">Status</th>
                <th className="text-right px-5 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsData?.data.map((p) => (
                <tr key={p.id} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="px-5 py-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </td>
                  <td className="py-4 text-sm">{p.category?.name}</td>
                  <td className="py-4 font-serif gold-text">{formatINR(p.price)}</td>
                  <td className="py-4 text-sm">
                    {p.stock?.quantity ?? 0}
                  </td>
                  <td className="py-4">
                    <span className={`text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${p.isActive ? "bg-emerald-900/30 text-emerald-400" : "bg-destructive/20 text-destructive"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                    {p.isFeatured && <span className="ml-1 text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-primary/20 text-primary">Featured</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => startEdit(p)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteProduct.mutate(p.id)} disabled={deleteProduct.isPending} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {productsData?.data.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No products found.</td></tr>
              )}
            </tbody>
          </table>
          {productsData && productsData.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4">
              {Array.from({ length: productsData.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-sm text-xs ${page === i + 1 ? "bg-primary text-abyss" : "border border-border hover:border-primary"}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
