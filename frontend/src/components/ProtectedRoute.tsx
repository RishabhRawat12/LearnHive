import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/roles";
interface ProtectedRouteProps {
  role?: Role; // Add an optional role prop
}

const ProtectedRoute = ({ role }: ProtectedRouteProps) => {
  // --- MODIFICATION: Get full auth context ---
  const { isAuthenticated, userRole } = useAuth();
  // --- END MODIFICATION ---

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/auth?mode=login" replace />;
  }

  // --- NEW ROLE CHECK ---
  // If a specific role is required and the user doesn't have it
  if (role && userRole !== role) {
    // Redirect them to the dashboard (or a "Not Authorized" page)
    return <Navigate to="/dashboard" replace />;
  }
  // --- END NEW ROLE CHECK ---

  // Render the child route
  return <Outlet />;
};

export default ProtectedRoute;