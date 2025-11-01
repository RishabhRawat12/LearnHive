import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import tutorRoutes from "./routes/tutors";
import skillRoutes from "./routes/skills";
import { protect } from "./middleware/auth"; // Import the 'protect' middleware

// --- NEW IMPORTS ---
import dashboardRoutes from "./routes/dashboard";
import bookingRoutes from "./routes/bookings";
import reviewRoutes from "./routes/reviews";

// Load .env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- Global Middleware ---
app.use(cors({ origin: "http://localhost:8080" }));
app.use(express.json());

// --- Public API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/skills", skillRoutes); // Use skill routes (as per your file)

// --- Protected API Routes ---
// All routes defined after this will require a valid token
app.use(protect);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Start the server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});