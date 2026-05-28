import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDeliveryAuth } from "@/store/deliveryAuth";
import { Loader2 } from "lucide-react";

const DeliveryRequire = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, loadUser } = useDeliveryAuth();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/delivery/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default DeliveryRequire;
