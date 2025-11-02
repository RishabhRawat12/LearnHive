import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // --- IMPORT useAuth ---

// --- REMOVE PROPS Interface ---
// interface NavbarProps {
//   isAuthenticated?: boolean;
//   onLogout?: () => void;
// }
// --- END REMOVE ---

// --- UPDATE Component Definition ---
// const Navbar = ({ isAuthenticated = false, onLogout }: NavbarProps) => {
const Navbar = () => {
  // --- END UPDATE ---
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth(); // --- USE THE CONTEXT ---

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">LearnHive</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/find-tutors"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/find-tutors") ? "text-primary" : "text-foreground"
            }`}
          >
            Find Tutors
          </Link>
          <Link
            to="/auth?mode=register&tutor=true"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/auth") ? "text-primary" : "text-foreground"
            }`}
          >
            Become a Tutor
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* This 'isAuthenticated' variable now comes from the useAuth hook */}
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              {/* This 'logout' function now comes from the useAuth hook */}
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth?mode=login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button variant="default">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;