import { Link, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Package, MapPin, Settings, LogOut, ShoppingBag, ArrowRight } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useCartStore } from "@/store/cartStore";
import { useQuery } from "@tanstack/react-query";
import { orderApi, addressApi } from "@/lib/api";
import { PageShell } from "@/components/luxury/LuxuryPrimitives";

const menuItems = [
  {
    icon: ShoppingBag,
    label: "Shop Products",
    description: "Browse our chocolate collection",
    href: "/shop",
    color: "bg-gradient-gold/10 text-primary border border-gold/20",
  },
  {
    icon: Package,
    label: "My Orders",
    description: "View your order history",
    href: "/orders",
    color: "bg-gradient-gold/10 text-primary border border-gold/20",
  },
  {
    icon: MapPin,
    label: "Addresses",
    description: "Manage delivery addresses",
    href: "/addresses",
    color: "bg-gradient-gold/10 text-primary border border-gold/20",
  },
  {
    icon: Settings,
    label: "Account Settings",
    description: "Update your profile",
    href: "/settings",
    color: "bg-gradient-gold/10 text-primary border border-gold/20",
  },
];

const UserDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const itemCount = useCartStore((state) => state.getCount());
  const location = useLocation();

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderApi.getOrders(),
    enabled: isAuthenticated,
  });

  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.getAddresses(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const handleLogout = async () => {
    await logout();
  };

  const stats = [
    { label: "Active Orders", value: orders?.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length || 0, icon: Package },
    { label: "Saved Addresses", value: addresses?.length || 0, icon: MapPin },
    { label: "Completed Orders", value: orders?.filter((o) => o.status === "DELIVERED").length || 0, icon: ShoppingBag },
  ];

  return (
    <PageShell>
      <section className="container pt-28 pb-24 sm:pt-36">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="eyebrow mb-4">Welcome back</p>
            <h1 className="font-serif text-5xl text-cream sm:text-6xl">
              {user?.name?.split(" ")[0] || "Patron"}&apos;s Quarter
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg">
              Your personal space to manage orders, addresses, and explore new arrivals from our atelier.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center gap-4 mt-8"
          >
            {itemCount > 0 && (
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-gold-bright transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                {itemCount} item{itemCount > 1 ? "s" : ""} in coffret
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cream transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="luxe-card p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-gold/10 border border-gold/20 grid place-items-center shrink-0">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-serif text-3xl gold-text">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
            >
              <Link
                to={item.href}
                className="group block luxe-card p-6 h-full"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl text-cream mb-2 group-hover:text-primary transition-colors">
                  {item.label}
                </h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-primary uppercase tracking-[0.2em]">
                  Explore <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {orders && orders.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="luxe-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-3xl text-cream">Recent Orders</h2>
              <Link to="/orders" className="text-sm text-primary hover:text-gold-bright transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-gold/10 pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground mb-1">{order.orderNumber}</div>
                    <div className="text-sm text-cream">
                      {order.items?.slice(0, 2).map((i) => i.productNameSnapshot).join(", ")}
                      {order.items && order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-lg gold-text">
                      ₹{(order.totalAmount / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                    <span className={`text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40"
                        : order.status === "CANCELLED"
                        ? "bg-red-900/30 text-red-400 border border-red-700/40"
                        : "bg-primary/20 text-primary border border-primary/40"
                    }`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="luxe-card p-12 text-center"
          >
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gradient-gold/10 border border-gold/20 grid place-items-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl text-cream mb-3">No orders yet</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
              Your collection awaits. Explore our atelier and find something extraordinary.
            </p>
            <Link to="/shop" className="btn-gold inline-flex items-center gap-3">
              Explore the Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </section>
    </PageShell>
  );
};

export default UserDashboard;