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

    // --- START OF BOOKING STATUS UPDATE ---
    const now = new Date();
    const bookingsToUpdate = await prisma.booking.findMany({
      where: {
        status: 'upcoming',
        OR: [
          { student_user_id: userId },
          { availability: { tutor_user_id: userId } },
        ],
        availability: {
          end_time: {
            lt: now, // 'lt' means "less than"
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (bookingsToUpdate.length > 0) {
      const bookingIds = bookingsToUpdate.map((b) => b.id);
      await prisma.booking.updateMany({
        where: {
          id: {
            in: bookingIds,
          },
        },
        data: {
          status: 'completed',
        },
      });
    }
    // --- END OF BOOKING STATUS UPDATE ---

    let formattedBookings: any[] = [];
    let totalSessions = 0;
    let averageRating = 0;
    let formattedReviews: any[] = []; // --- ADDED THIS ---

    if (role === Role.tutor) {
      // --- TUTOR LOGIC ---
      const tutorBookings = await prisma.booking.findMany({
        where: { availability: { tutor_user_id: userId } },
        include: {
          availability: {
            include: {
              tutorProfile: {
                include: {
                  skills: { select: { name: true }, take: 1 },
                },
              },
            },
          },
          student: { select: { name: true } },
          review: true,
        },
        orderBy: { availability: { start_time: "desc" } },
      });

      formattedBookings = tutorBookings.map((b) => ({
        id: b.id,
        tutorName: user.name,
        studentName: b.student.name,
        subject: b.availability.tutorProfile.skills[0]?.name || "Tutoring",
        date: b.availability.start_time.toISOString().split("T")[0],
        time: b.availability.start_time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: b.status.toLowerCase(),
        hasReview: !!b.review,
      }));

      // --- START OF REVIEW FETCHING ---
      const tutorReviewsData = await prisma.review.findMany({
        where: { tutor_user_id: userId },
        include: {
          student: { select: { name: true } }, // Get student's name
        },
        orderBy: { created_at: 'desc' },
      });
      
      formattedReviews = tutorReviewsData.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        learnerName: r.student.name, // Match prop 'learnerName' for ReviewsList
      }));
      // --- END OF REVIEW FETCHING ---

      totalSessions = tutorBookings.length;
      if (tutorReviewsData.length > 0) {
        averageRating =
          tutorReviewsData.reduce((acc, r) => acc + r.rating, 0) /
          tutorReviewsData.length;
      }
    } else {
      // --- STUDENT LOGIC ---
      const studentBookings = await prisma.booking.findMany({
        where: { student_user_id: userId },
        include: {
          availability: {
            include: {
              tutorProfile: {
                include: {
                  user: { select: { name: true } },
                  skills: { select: { name: true }, take: 1 },
                },
              },
            },
          },
          review: true,
        },
        orderBy: { availability: { start_time: "desc" } },
      });

      formattedBookings = studentBookings.map((b) => ({
        id: b.id,
        tutorName: b.availability.tutorProfile.user.name,
        studentName: user.name,
        subject: b.availability.tutorProfile.skills[0]?.name || "Tutoring",
        date: b.availability.start_time.toISOString().split("T")[0],
        time: b.availability.start_time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: b.status.toLowerCase(),
        hasReview: !!b.review,
      }));

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
      // Students don't need to see a list of reviews they've left
      formattedReviews = [];
    }

    // 5. Construct final response
    const dashboardData = {
      name: user.name,
      email: user.email,
      avatar: user.avatar_url,
      isTutor: role === Role.tutor,
      totalSessions,
      averageRating: parseFloat(averageRating.toFixed(1)),
      bookings: formattedBookings,
      reviews: formattedReviews, // --- ADDED THIS ---
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

export default router;