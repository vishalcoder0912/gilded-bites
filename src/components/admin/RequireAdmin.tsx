import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/store/adminAuth";

const RequireAdmin = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const { isAuthenticated, user, loadUser } = useAdminAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await loadUser();
      if (mounted) {
        setInitializing(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [loadUser]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-gold grid place-items-center">
            <span className="font-serif text-2xl text-abyss">N</span>
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RequireAdmin;
