import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Role } from "@/lib/roles";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: Role | null;
  userId: number | null; // Add user's ID
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const [userRole, setUserRole] = useState<Role | null>(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const payload = parseJwt(storedToken);
      return payload?.role || null;
    }
    return null;
  });

  // Store userId from token
  const [userId, setUserId] = useState<number | null>(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const payload = parseJwt(storedToken);
      return payload?.userId || null;
    }
    return null;
  });

  const login = (newToken: string) => {
    const payload = parseJwt(newToken);
    setToken(newToken);
    setUserRole(payload?.role || null);
    setUserId(payload?.userId || null); // Set the userId
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken(null);
    setUserRole(null);
    setUserId(null); // Clear the userId
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userId, login, logout }}>
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