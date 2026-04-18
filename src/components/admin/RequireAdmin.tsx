import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/store/adminAuth";

const RequireAdmin = () => {
  const isAuthenticated = useAdminAuth((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
};

export default RequireAdmin;
