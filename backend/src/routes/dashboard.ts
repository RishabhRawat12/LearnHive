// rishabhrawat12/learnhive/LearnHive-7537ae6c8f879fa606a7578eca3423fa2a6e5132/backend/src/routes/dashboard.ts
import { Router } from "express";
import prisma from "../db";
import { Role, TutorStatus } from "@prisma/client";

const router = Router();

/**
 * GET /api/dashboard
 * Fetches all data for the logged-in user's dashboard.
 */
router.get("/", async (req, res) => {
  // @ts-ignore
  const { userId, role } = req.user;

  try {
    // 1. Fetch basic user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, avatar_url: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // --- ADMIN DASHBOARD ---
    // If user is ADMIN, return site-wide stats and exit
    if (role === Role.ADMIN) {
      const totalUsers = await prisma.user.count();
      const totalTutors = await prisma.user.count({ where: { role: Role.tutor } });
      const totalBookings = await prisma.booking.count();
      const pendingApps = await prisma.tutorProfile.count({ where: { status: TutorStatus.PENDING } });

      return res.json({
        name: user.name,
        email: user.email,
        avatar: user.avatar_url,
        isTutor: false, // Not a tutor
        isAdmin: true, // Add flag for admin
        totalUsers,
        totalTutors,
        totalBookings,
        pendingApps,
        bookings: [], // Admin dashboard doesn't show booking list
        reviews: [],
      });
    }

    // --- STUDENT/TUTOR DASHBOARD ---

    // 2. Auto-update status of bookings that have finished
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
              lt: now, // If end_time is in the past
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
            status: 'completed', // Mark them as completed
          },
        });
      }

    // Helper function to determine live status
    const getLiveBookingStatus = (status: string, startTime: Date, endTime: Date): string => {
      const now = new Date();
      if (status.toLowerCase() === 'upcoming') {
        if (now >= startTime && now < endTime) {
          return 'ongoing'; // The session is live
        }
        return 'upcoming'; // Still upcoming
      }
      return status.toLowerCase(); // Return original status (completed, cancelled)
    };

    let formattedBookings: any[] = [];
    let totalSessions = 0;
    let averageRating = 0;
    let formattedReviews: any[] = [];
    
    let application_status: string | null = null;
    let rejection_message: string | null = null;

    if (role === Role.tutor) {
      // --- TUTOR LOGIC ---
      const tutorBookings = await prisma.booking.findMany({ where: { availability: { tutor_user_id: userId } }, include: { availability: { include: { tutorProfile: { include: { skills: { select: { name: true }, take: 1 } } } } }, student: { select: { name: true } }, review: true }, orderBy: { availability: { start_time: "desc" } } });
      
      formattedBookings = tutorBookings.map((b) => {
        const liveStatus = getLiveBookingStatus(b.status, b.availability.start_time, b.availability.end_time);
        return { 
          id: b.id, 
          tutorName: user.name, 
          studentName: b.student.name, 
          subject: b.availability.tutorProfile.skills[0]?.name || "Tutoring", 
          date: b.availability.start_time.toISOString().split("T")[0], 
          time: b.availability.start_time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", }), 
          status: liveStatus,
          hasReview: !!b.review, 
          meetingUrl: b.meetingUrl 
        };
      });

      const tutorReviewsData = await prisma.review.findMany({ where: { tutor_user_id: userId }, include: { student: { select: { name: true } } }, orderBy: { created_at: 'desc' } });
      formattedReviews = tutorReviewsData.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, created_at: r.created_at, learnerName: r.student.name, }));
      totalSessions = tutorBookings.length;
      if (tutorReviewsData.length > 0) { averageRating = tutorReviewsData.reduce((acc, r) => acc + r.rating, 0) / tutorReviewsData.length; }

    } else {
      // --- STUDENT LOGIC ---
      const studentBookings = await prisma.booking.findMany({ where: { student_user_id: userId }, include: { availability: { include: { tutorProfile: { include: { user: { select: { name: true } }, skills: { select: { name: true }, take: 1 } } } } }, review: true }, orderBy: { availability: { start_time: "desc" } } });

      formattedBookings = studentBookings.map((b) => {
        const liveStatus = getLiveBookingStatus(b.status, b.availability.start_time, b.availability.end_time);
        return {
          id: b.id, 
          tutorName: b.availability.tutorProfile.user.name, 
          studentName: user.name, 
          subject: b.availability.tutorProfile.skills[0]?.name || "Tutoring", 
          date: b.availability.start_time.toISOString().split("T")[0], 
          time: b.availability.start_time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", }), 
          status: liveStatus,
          hasReview: !!b.review, 
          meetingUrl: b.meetingUrl 
        };
      });
      
      totalSessions = studentBookings.length;
      // For student, 'averageRating' is the avg they have GIVEN, not received.
      const studentReviews = await prisma.review.findMany({ where: { student_user_id: userId }, select: { rating: true } });
      if (studentReviews.length > 0) { averageRating = studentReviews.reduce((acc, r) => acc + r.rating, 0) / studentReviews.length; }
      formattedReviews = [];

      const tutorApplication = await prisma.tutorProfile.findUnique({
        where: { user_id: userId },
        select: {
          status: true,
          rejection_message: true,
        },
      });

      if (tutorApplication) {
        application_status = tutorApplication.status;
        rejection_message = tutorApplication.rejection_message;
      }
    }

    // 5. Construct final response
    const dashboardData = {
      name: user.name,
      email: user.email,
      avatar: user.avatar_url,
      isTutor: role === Role.tutor,
      isAdmin: false,
      totalSessions,
      averageRating: parseFloat(averageRating.toFixed(1)),
      bookings: formattedBookings,
      reviews: formattedReviews,
      application_status: application_status,
      rejection_message: rejection_message,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

export default router;