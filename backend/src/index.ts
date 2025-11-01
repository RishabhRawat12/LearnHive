import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth"; // Import the auth routes
import { protect } from "./middleware/auth"; // Import the 'protect' middleware

// Load .env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- Global Middleware ---
app.use(cors({ origin: "http://localhost:8080" })); // Allow frontend
app.use(express.json()); // Parse JSON request bodies

// --- API Routes ---

// All auth routes are handled by the 'authRoutes' file
// This creates POST /api/auth/register and POST /api/auth/login
app.use("/api/auth", authRoutes);

// --- Example Protected Route ---
// The 'protect' middleware runs first.
// If the token is invalid, it will send a 401 error.
// If valid, it will call the next function.
app.get("/api/dashboard", protect, (req, res) => {
  // We can safely access req.user here because of the 'protect' middleware
  res.json({
    message: `Welcome to your dashboard, user #${req.user?.userId}!`,
    role: req.user?.role,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});