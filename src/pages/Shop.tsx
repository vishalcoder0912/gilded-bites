import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useProducts, useCategories } from "@/store/catalog";
import ProductCard from "@/components/ProductCard";
import { EmptyState, LoadingState, PageShell } from "@/components/luxury/LuxuryPrimitives";

const Shop = () => {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("");
  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState("5000");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data: productsData, isLoading, error } = useProducts({
    page,
    limit: 12,
    categoryId: categoryFilter || undefined,
    sort: sort || undefined,
    q: q || undefined,
  });
  const { data: categories } = useCategories();

  const clearFilters = () => {
    setQ("");
    setCategoryFilter("");
    setSort("");
    setPage(1);
  };

  const filterPanel = (
    <aside className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/78 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.25)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Categories</p>
          <h2 className="font-serif text-2xl text-[#f8eadc]">Collection</h2>
        </div>
        <button type="button" className="lg:hidden" onClick={() => setShowMobileFilters(false)} aria-label="Close filters">
          <X className="h-4 w-4 text-[#c8b5a4]" />
        </button>
      </div>

      <div className="space-y-2">
        <button type="button"
          onClick={() => {
            setCategoryFilter("");
            setPage(1);
          }}
          className={`w-full rounded-sm px-3 py-2 text-left text-sm transition ${!categoryFilter ? "bg-[#d9a35b]/15 text-[#f0c27a]" : "text-[#c8b5a4] hover:bg-[#d9a35b]/8 hover:text-[#f8eadc]"}`}
        >
          All Collections
        </button>
        {categories?.map((cat) => (
          <button type="button"
            key={cat.id}
            onClick={() => {
              setCategoryFilter(cat.id);
              setPage(1);
            }}
            className={`w-full rounded-sm px-3 py-2 text-left text-sm transition ${categoryFilter === cat.id ? "bg-[#d9a35b]/15 text-[#f0c27a]" : "text-[#c8b5a4] hover:bg-[#d9a35b]/8 hover:text-[#f8eadc]"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#d9a35b]/30 to-transparent" />

      <label className="block text-xs uppercase tracking-[0.25em] text-[#d9a35b]">Gift Budget</label>
      <input
        type="range"
        min="500"
        max="10000"
        step="500"
        value={maxPrice}
        onChange={(event) => setMaxPrice(event.target.value)}
        className="mt-5 w-full accent-[#d9a35b]"
      />
      <div className="mt-2 flex justify-between text-xs text-[#c8b5a4]">
        <span>₹500</span>
        <span>Up to ₹{maxPrice}</span>
      </div>
      <button type="button" onClick={clearFilters} className="btn-ghost-gold mt-6 w-full px-4 py-3 text-xs">
        Reset Filters
      </button>
    </aside>
  );

  return (
    <PageShell>
      <section className="relative pt-28 pb-10 sm:pt-36 sm:pb-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,163,91,0.12),transparent_36%)]" />
        <div className="container relative text-center">
          <p className="eyebrow mb-3">Noir Sane Collection</p>
          <h1 className="font-serif text-4xl leading-tight text-[#f8eadc] sm:text-7xl">Shop Dark Chocolate</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#c8b5a4] sm:text-base">
            Fruit Chocolates, Truffles, Bars, Pralines, Bonbons, and Single Origin pieces
            crafted for gifting, celebration, and slow indulgence.
          </p>
        </div>
      </section>

      <section className="container pb-16 sm:pb-24">
        <div className="mb-6 grid gap-3 lg:grid-cols-[270px_1fr]">
          <button type="button"
            onClick={() => setShowMobileFilters(true)}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#d9a35b]/20 bg-[#140904]/80 px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#f0c27a] lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <div className="hidden lg:block" />
          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_210px_190px]">
            <div className="flex min-w-0 items-center gap-3 rounded-sm border border-[#d9a35b]/18 bg-[#140904]/80 px-4 py-3">
              <Search className="h-4 w-4 text-[#9d6a36]" />
              <input
                value={q}
                onChange={(event) => {
                  setQ(event.target.value);
                  setPage(1);
                }}
                placeholder="Search fruit chocolate, truffles, bars..."
                className="w-full bg-transparent text-sm text-[#f8eadc] outline-none placeholder:text-[#c8b5a4]/55"
              />
              {q && <button type="button" onClick={() => setQ("")}><X className="h-4 w-4 text-[#c8b5a4]" /></button>}
            </div>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/80 px-4 py-3 text-sm text-[#f8eadc] outline-none"
            >
              <option value="">All Collections</option>
              {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              className="rounded-sm border border-[#d9a35b]/18 bg-[#140904]/80 px-4 py-3 text-sm text-[#f8eadc] outline-none"
            >
              <option value="">Featured First</option>
              <option value="name">Name</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileFilters(false)}>
            <div className="w-full max-w-sm" onClick={(event) => event.stopPropagation()}>{filterPanel}</div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[270px_1fr]">
          <div className="hidden lg:block">{filterPanel}</div>

          <div>
            {(q || categoryFilter || sort) && (
              <div className="mb-5 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#c8b5a4]">
                Active filters
                <button type="button" onClick={clearFilters} className="rounded-full border border-[#d9a35b]/25 px-3 py-1 text-[#f0c27a]">Clear all</button>
              </div>
            )}

            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <EmptyState title="The collection is resting" description="We could not load Noir Sane products right now. Please refresh to view Fruit Chocolates, Truffles, Bars, Pralines, Bonbons, and Single Origin pieces." />
            ) : productsData?.data.length === 0 ? (
              <EmptyState title="Curating your selection" description="No matching chocolates are visible for these filters. Try another collection or return to all Noir Sane products." actionLabel="View All" actionTo="/shop" />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {productsData?.data.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>

                {productsData && productsData.totalPages > 1 && (
                  <div className="mt-12 flex flex-wrap justify-center gap-2">
                    {Array.from({ length: productsData.totalPages }, (_, index) => (
                      <button type="button"
                        key={index}
                        onClick={() => setPage(index + 1)}
                        className={`grid h-10 w-10 place-items-center rounded-sm border text-sm transition ${page === index + 1 ? "border-[#d9a35b] bg-[#d9a35b] text-[#090403]" : "border-[#d9a35b]/22 text-[#c8b5a4] hover:border-[#d9a35b] hover:text-[#f8eadc]"}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Shop;
