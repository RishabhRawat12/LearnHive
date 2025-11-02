import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Role } from "@prisma/client";

// Middleware
import { protect } from "./middleware/auth";
import { checkRole } from "./middleware/checkRole";

// Route Imports
import authRoutes from "./routes/auth";
import tutorRoutes from "./routes/tutors";
import skillRoutes from "./routes/skills";
import dashboardRoutes from "./routes/dashboard";
import bookingRoutes from "./routes/bookings";
import reviewRoutes from "./routes/reviews";
import profileRoutes from "./routes/profile";
import availabilityRoutes from "./routes/availability";
import lectureRoutes from "./routes/lectures";
import adminRoutes from "./routes/admin"; // --- IMPORT NEW ADMIN ROUTE ---

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
app.use("/api/skills", skillRoutes);

// --- Protected API Routes (All roles) ---
app.use(protect);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// --- Protected Tutor-Only Routes ---
app.use("/api/profile", checkRole(Role.tutor), profileRoutes);
app.use("/api/availability", checkRole(Role.tutor), availabilityRoutes);
app.use("/api/lectures", checkRole(Role.tutor), lectureRoutes);

// --- NEW PROTECTED ADMIN-ONLY ROUTE ---
app.use("/api/admin", checkRole(Role.ADMIN), adminRoutes);

// Start the server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});