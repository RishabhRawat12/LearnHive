import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Role } from "@/lib/roles";
// --- ADD userRole TO CONTEXT ---
interface AuthContextType {
  isAuthenticated: boolean;
  userRole: Role | null; // Add user's role
  login: (token: string) => void;
  logout: () => void;
}
// --- END ADD ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to parse the JWT
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  // --- NEW: Store userRole in state ---
  const [userRole, setUserRole] = useState<Role | null>(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const payload = parseJwt(storedToken);
      return payload?.role || null;
    }
    return null;
  });
  // --- END NEW ---

  const login = (newToken: string) => {
    const payload = parseJwt(newToken); // Parse the new token
    setToken(newToken);
    setUserRole(payload?.role || null); // Set the role from the payload
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken(null);
    setUserRole(null); // Clear the role
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!token;

  return (
    // --- ADD userRole to provider value ---
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};