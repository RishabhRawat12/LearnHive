import { Router } from "express";
import prisma from "../db";

const router = Router();

// Helper function to generate a random Google Meet link
const generateMeetLink = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const randomString = (length: number) =>
    Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  
  const part1 = randomString(3);
  const part2 = randomString(4);
  const part3 = randomString(3);
  
  return `https://meet.google.com/${part1}-${part2}-${part3}`;
};

/**
 * POST /api/bookings
 * Creates a new booking for an available slot.
 * Protected by 'protect' middleware in index.ts.
 */
router.post("/", async (req, res) => {
  // @ts-ignore
  const { userId } = req.user; // Get student's ID from token
  const { availability_id } = req.body;

  if (!availability_id) {
    return res.status(400).json({ message: "Availability ID is required" });
  }

  try {
    // Generate the unique meeting URL
    const newMeetingUrl = generateMeetLink();

    // Use a transaction to ensure atomicity
    const newBooking = await prisma.$transaction(async (tx) => {
      // 1. Find the availability slot and lock it
      const slot = await tx.availability.findFirst({
        where: {
          id: availability_id,
          is_booked: false,
          start_time: { gte: new Date() }, // Ensure slot is in the future
        },
      });

      // 2. If slot not found or already booked, throw error
      if (!slot) {
        throw new Error("Slot is not available");
      }

      // 3. Mark the slot as booked
      await tx.availability.update({
        where: { id: availability_id },
        data: { is_booked: true },
      });

      // 4. Create the booking
      const booking = await tx.booking.create({
        data: {
          student_user_id: userId,
          availability_id: availability_id,
          status: "upcoming",
          meetingUrl: newMeetingUrl, // Save the new meeting link
        },
      });

      return booking;
    });

    res.status(201).json(newBooking);
  } catch (error: any) {
    if (error.message === "Slot is not available") {
      return res.status(409).json({ message: "This slot is no longer available" });
    }
    console.error(error);
    res.status(500).json({ message: "Error creating booking" });
  }
});

export default router;