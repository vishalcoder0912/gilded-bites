import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { Loader2 } from "lucide-react";

interface RequireUserProps {
  children: React.ReactNode;
}

const RequireUser = ({ children }: RequireUserProps) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, loadUser } = useAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await loadUser();
      if (mounted) setInitializing(false);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [loadUser]);

  if (initializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default RequireUser;
