import { LayoutDashboard, Package, Settings, LogOut, Cookie, Boxes, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/store/adminAuth";
import { toast } from "@/hooks/use-toast";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar-context";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

const navItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Orders", url: "/admin/orders", icon: Package, end: false },
  { title: "Products", url: "/admin/products", icon: Boxes, end: false },
  { title: "Categories", url: "/admin/categories", icon: Layers, end: false },
  { title: "Stock", url: "/admin/stock", icon: Layers, end: false },
  { title: "Settings", url: "/admin/settings", icon: Settings, end: false },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const logout = useAdminAuth((s) => s.logout);

  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.getDashboard(),
    staleTime: 30 * 1000,
  });
  const pendingCount = dashboard?.pendingOrders ?? 0;

  const handleSignOut = () => {
    logout();
    toast({ title: "Signed out", description: "À bientôt." });
    navigate("/login", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-2 py-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-gold grid place-items-center shrink-0">
            <Cookie className="w-4 h-4 text-abyss" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-serif text-base leading-tight truncate">Noir Sane</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Atelier Admin
              </div>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Commerce</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/40 transition-colors"
                      activeClassName="bg-muted/60 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 truncate">{item.title}</span>
                      )}
                      {!collapsed && item.title === "Orders" && pendingCount > 0 && (
                        <span className="ml-auto text-[10px] uppercase tracking-[0.2em] bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                          {pendingCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign out" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
