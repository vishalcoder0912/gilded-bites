import { Outlet, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useDeliveryAuth } from "@/store/deliveryAuth";

const links = [
  { to: "/delivery", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/delivery/orders", icon: Package, label: "Orders" },
];

const DeliveryLayout = () => {
  const { logout, user } = useDeliveryAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/delivery/login");
  };

  return (
    <div className="min-h-screen bg-transparent flex">
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-noir-panel m-3 w-64 rounded-lg flex flex-col"
      >
        <div className="p-6 border-b border-border">
          <Link to="/delivery" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-gold grid place-items-center">
              <Package className="w-5 h-5 text-abyss" />
            </div>
            <div>
              <div className="font-serif text-lg">Delivery</div>
              <div className="text-xs text-muted-foreground">{user?.name}</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm text-muted-foreground hover:text-destructive hover:bg-muted/50 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;
