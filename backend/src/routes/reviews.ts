import { Router } from "express";
import prisma from "../db";

const router = Router();

/**
 * POST /api/reviews
 * Submits a new review for a completed booking.
 * Protected by 'protect' middleware in index.ts.
 */
router.post("/", async (req, res) => {
  // @ts-ignore
  const { userId: student_user_id } = req.user;
  const { booking_id, rating, comment } = req.body;

  if (!booking_id || !rating) {
    return res.status(400).json({ message: "Booking ID and rating are required" });
  }

  try {
    // 1. Find the booking to validate
    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: {
        availability: true, // Need this to get the tutor's ID
      },
    });

    // 2. Validate the booking
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.student_user_id !== student_user_id) {
      return res.status(403).json({ message: "You cannot review this booking" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Only completed sessions can be reviewed" });
    }

    // 3. Check if a review already exists
    const existingReview = await prisma.review.findUnique({
      where: { booking_id },
    });
    if (existingReview) {
      return res.status(409).json({ message: "Review already submitted" });
    }

    // 4. Create the review
    const newReview = await prisma.review.create({
      data: {
        booking_id,
        student_user_id,
        tutor_user_id: booking.availability.tutor_user_id,
        rating: parseInt(rating),
        comment,
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting review" });
  }
});

export default router;