import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ShoppingBag, Package, Tags, Boxes,
  CreditCard, Settings, LogOut, Headphones
} from "lucide-react";
import { useAdminAuth } from "@/store/adminAuth";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
    { label: "Products", icon: Package, path: "/admin/products" },
    { label: "Categories", icon: Tags, path: "/admin/categories" },
    { label: "Inventory", icon: Boxes, path: "/admin/stock" },
    { label: "Payments", icon: CreditCard, path: "/admin/orders?paymentStatus=SUBMITTED" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const { logout } = useAdminAuth();

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("user");
    logout();
    navigate("/login");
  }

  return (
    <aside className="hidden min-h-screen w-[270px] shrink-0 p-3 lg:block">
      <div className="glass-noir-panel flex h-full flex-col rounded-lg">
        <div className="border-b border-gold/20 px-8 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold">
            <span className="font-serif text-2xl text-abyss">N</span>
          </div>
          <h2 className="mt-4 font-serif text-3xl text-cream">Noir Sane</h2>
          <p className="mt-1 tracking-[.45em] text-primary text-xs">DARK CHOCOLATE</p>
        </div>

        <nav className="mt-3 flex-1 space-y-1 px-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path.split("?")[0]);

            return (
              <button type="button"
                key={item.label}
                onClick={() => navigate(item.path)}
                className={cx(
                  "flex w-full items-center gap-4 rounded-md px-6 py-4 text-left text-sm transition",
                  isActive
                    ? "bg-gradient-gold/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:bg-rich/60 hover:text-cream"
                )}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="rounded-xl border border-gold/20 bg-[#080302]/60 p-5 backdrop-blur-xl">
            <Headphones className="text-primary" size={28} />
            <p className="mt-3 text-sm font-medium text-cream">Need Support?</p>
            <p className="mt-1 text-xs text-muted-foreground">Our team is here to help.</p>
            <button type="button" className="mt-4 w-full rounded-md border border-gold/30 py-2 text-xs text-primary hover:bg-gold/10 transition-colors">
              Contact Support
            </button>
          </div>

          <button type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-gold/20 py-3 text-sm text-muted-foreground hover:border-gold/40 hover:text-cream transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>

          <p className="mt-8 text-xs text-muted-foreground">© 2026 Noir Sane</p>
          <p className="mt-1 text-xs text-primary">All rights reserved.</p>
        </div>
      </div>
    </aside>
  );
}

export function AdminLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-gold/20 bg-[#050201]/58 px-6 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-serif text-cream">Admin Panel</h1>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-abyss font-medium">
                NS
              </div>
            </div>
          </header>
          <main className="p-6">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
