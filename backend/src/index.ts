import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Role } from "@prisma/client"; // Import Role enum

// Middleware
import { protect } from "./middleware/auth";
import { checkRole } from "./middleware/checkRole"; // Import new role middleware

// Route Imports
import authRoutes from "./routes/auth";
import tutorRoutes from "./routes/tutors";
import skillRoutes from "./routes/skills"; // Using 'skills' as per your file
import dashboardRoutes from "./routes/dashboard";
import bookingRoutes from "./routes/bookings";
import reviewRoutes from "./routes/reviews";
// --- NEW IMPORTS FOR PHASE 5 ---
import profileRoutes from "./routes/profile";
import availabilityRoutes from "./routes/availability";
import lectureRoutes from "./routes/lectures";

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
app.use("/api/skills", skillRoutes); // Renamed 'subjects' to 'skills'

// --- Protected API Routes (All roles) ---
// All routes defined after this line will require a valid token
app.use(protect);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// --- Protected Tutor-Only Routes ---
// These routes require the user to be a 'tutor'
app.use("/api/profile", checkRole(Role.tutor), profileRoutes);
app.use("/api/availability", checkRole(Role.tutor), availabilityRoutes);
app.use("/api/lectures", checkRole(Role.tutor), lectureRoutes);

// Start the server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});