import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Role } from "@prisma/client"; // Import Role

// --- IMPORTS ---
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Index from "./pages/Index";
import FindTutorPage from "./pages/FindTutorPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage"; // --- IMPORT NEW ADMIN PAGE ---
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/find-tutors" element={<FindTutorPage />} />
            <Route path="/tutor/:id" element={<TutorProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes (Logged in users) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* --- NEW ADMIN-ONLY ROUTE --- */}
            <Route element={<ProtectedRoute role={Role.ADMIN} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;