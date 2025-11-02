import {
  createContext,
  useContext,
  useState,
  useEffect, // <-- We no longer need this
  ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // --- MODIFICATION HERE ---
  // Initialize state by lazy-loading the token from localStorage.
  // This function only runs ONCE on the initial load.
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });
  // --- END MODIFICATION ---

  // --- REMOVE THE USELESS EFFECT ---
  // We no longer need this, as the state is initialized correctly.
  // useEffect(() => {
  //   const storedToken = localStorage.getItem("token");
  //   if (storedToken) {
  //     setToken(storedToken);
  //   }
  // }, []);
  // --- END REMOVE ---

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};