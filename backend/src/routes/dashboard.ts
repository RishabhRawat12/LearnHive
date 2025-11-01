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
      select: { name: true, email: true, avatar_url: true },
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
                skills: { select: { name: true }, take: 1 }, // Get first skill as subject
              },
            },
          },
        },
        review: true, // Check if a review exists
      },
      orderBy: { availability: { start_time: "desc" } },
    });

    // 3. Format bookings to match frontend
    const formattedBookings = studentBookings.map((b) => ({
      id: b.id,
      tutorName: b.availability.tutorProfile.user.name,
      subject: b.availability.tutorProfile.skills[0]?.name || "Tutoring",
      date: b.availability.start_time.toISOString().split("T")[0],
      time: b.availability.start_time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: b.status.toLowerCase(),
      hasReview: !!b.review, // Let frontend know if review is submitted
    }));

    // 4. Calculate stats based on role
    let totalSessions = 0;
    let averageRating = 0;

    if (role === Role.tutor) {
      // For a tutor, get their received ratings
      const tutorReviews = await prisma.review.findMany({
        where: { tutor_user_id: userId },
        select: { rating: true },
      });
      const tutorBookings = await prisma.booking.findMany({
        where: { availability: { tutor_user_id: userId } },
      });

      totalSessions = tutorBookings.length;
      if (tutorReviews.length > 0) {
        averageRating =
          tutorReviews.reduce((acc, r) => acc + r.rating, 0) /
          tutorReviews.length;
      }
    } else {
      // For a student, get their given ratings (if we want to show that)
      // For now, we'll just show their session count
      totalSessions = studentBookings.length;
      const studentReviews = await prisma.review.findMany({
        where: { student_user_id: userId },
        select: { rating: true },
      });
      if (studentReviews.length > 0) {
        averageRating =
          studentReviews.reduce((acc, r) => acc + r.rating, 0) /
          studentReviews.length;
      }
    }

    const dashboardData = {
      name: user.name,
      email: user.email,
      avatar: user.avatar_url,
      isTutor: role === Role.tutor,
      totalSessions,
      averageRating: parseFloat(averageRating.toFixed(1)),
      bookings: formattedBookings,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

export default router;