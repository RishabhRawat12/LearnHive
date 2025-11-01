import { Router } from "express";
import prisma from "../db";
import { Role } from "@prisma/client";

const router = Router();

/**
 * GET /api/dashboard
 * Fetches all data for the logged-in user's dashboard.
 * This route is protected by the 'protect' middleware in index.ts.
 */
router.get("/", async (req, res) => {
  // @ts-ignore
  const { userId, role } = req.user; // Get user info from token

  try {
    // 1. Fetch basic user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, avatar_url: true }, // Use avatar_url from schema
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Fetch user's bookings (as a student)
    const studentBookings = await prisma.booking.findMany({
      where: { student_user_id: userId },
      include: {
        availability: {
          include: {
            tutorProfile: {
              include: {
                user: { select: { name: true } }, // Get tutor's name
              },
            },
          },
        },
      },
      orderBy: { availability: { start_time: "desc" } },
    });

    // 3. Format bookings to match frontend
    const formattedBookings = studentBookings.map((b) => ({
      id: b.id,
      tutorName: b.availability.tutorProfile.user.name,
      subject: "Subject placeholder", // Your schema doesn't link bookings to subjects
      date: b.availability.start_time.toISOString().split("T")[0],
      time: b.availability.start_time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: b.status.toLowerCase(),
    }));

    // 4. Calculate stats
    const totalSessions = formattedBookings.length;
    // Real rating would be on the user/tutor model, this is a placeholder
    const averageRating = 4.7;

    const dashboardData = {
      name: user.name,
      email: user.email,
      avatar: user.avatar_url,
      isTutor: role === Role.tutor,
      totalSessions,
      averageRating,
      bookings: formattedBookings,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

export default router;