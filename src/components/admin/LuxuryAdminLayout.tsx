import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ClipboardList,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Order,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ClipboardList, label: "Inventory", href: "/admin/stock" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function LuxuryAdminSidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#d7a85f]/10 bg-[#050302]"
    >
      <div className="flex h-20 items-center justify-between border-b border-[#d7a85f]/10 px-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gradient-to-br from-[#d7a85f] to-[#8b5a2b]">
                <span className="font-serif text-lg font-bold text-[#1a0a04]">N</span>
              </div>
              <div>
                <h1 className="font-serif text-lg text-[#f8eadc]">Noir Sane</h1>
                <p className="text-[10px] uppercase tracking-wider text-[#d7a85f]">Dark Chocolate</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d7a85f]/20 text-[#d7a85f] transition hover:border-[#d7a85f]/40 hover:bg-[#d7a85f]/10"
        >
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/admin" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-3 transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-[#d7a85f]/20 to-transparent border-l-2 border-[#d7a85f]"
                  : "hover:bg-[#d7a85f]/5"
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-[#d7a85f]" : "text-[#8b6d4a] group-hover:text-[#d7a85f]"
                )}
              />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-[#f8eadc]" : "text-[#8b6d4a]"
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#d7a85f]/10 p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#d7a85f] to-[#b97a38]" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm font-medium text-[#f8eadc]">Admin User</p>
                <p className="text-xs text-[#8b6d4a]">Super Admin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export function LuxuryStatCard({ icon, label, value, change, changeLabel, className }: StatCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group relative overflow-hidden rounded-sm border border-[#d7a85f]/15 bg-[#0a0503] p-5 transition-all duration-300 hover:border-[#d7a85f]/30",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#d7a85f]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-[#d7a85f]/20 bg-[#120804] text-[#d7a85f]">
            {icon}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8b6d4a]">{label}</p>
            <p className="mt-1 font-serif text-3xl text-[#f8eadc]">{value}</p>
          </div>
        </div>
        
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            isPositive ? "bg-emerald-900/20 text-emerald-400" : "bg-red-900/20 text-red-400"
          )}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      {changeLabel && (
        <p className="mt-3 text-xs text-[#8b6d4a]">{changeLabel}</p>
      )}

      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-[#d7a85f]/0 via-[#d7a85f]/50 to-[#d7a85f]/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}

interface GlassPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function LuxuryGlassPanel({ title, subtitle, children, action, className }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-sm border border-[#d7a85f]/15 bg-[#0a0503]/80 backdrop-blur-xl",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#d7a85f]/3 to-transparent pointer-events-none" />
      
      <div className="relative z-10 border-b border-[#d7a85f]/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-[#f8eadc]">{title}</h3>
            {subtitle && <p className="mt-1 text-xs text-[#8b6d4a]">{subtitle}</p>}
          </div>
          {action}
        </div>
      </div>
      
      <div className="relative z-10 p-4">{children}</div>
    </motion.div>
  );
}

export function PremiumSearchBar({ className }: { className?: string }) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      className={cn("relative", className)}
      animate={{ width: focused ? 320 : 280 }}
      transition={{ duration: 0.3 }}
    >
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6d4a]"
      />
      <input
        type="text"
        placeholder="Search anything..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-sm border border-[#d7a85f]/15 bg-[#0a0503] py-2.5 pl-10 pr-4 text-sm text-[#f8eadc] placeholder:text-[#8b6d4a] outline-none transition-all duration-300 focus:border-[#d7a85f]/40 focus:ring-1 focus:ring-[#d7a85f]/20"
      />
    </motion.div>
  );
}

export function NotificationBell() {
  const [hasUnread, setHasUnread] = useState(true);

  return (
    <button className="relative flex h-10 w-10 items-center justify-center rounded-md border border-[#d7a85f]/15 text-[#8b6d4a] transition hover:border-[#d7a85f]/30 hover:text-[#d7a85f]">
      <Bell size={18} />
      {hasUnread && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white"
        >
          3
        </motion.span>
      )}
    </button>
  );
}
