import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/auth?mode=login" replace />;
  }

  // Render the child route (e.g., DashboardPage)
  return <Outlet />;
};

export default ProtectedRoute;