import { Router } from "express";
import prisma from "../db";

const router = Router();

/**
 * POST /api/availability
 * Adds a new availability slot for the tutor.
 * Protected by 'protect' and 'checkRole("tutor")' middleware.
 */
router.post("/", async (req, res) => {
  // @ts-ignore
  const { userId: tutor_user_id } = req.user;
  const { start_time, end_time } = req.body;

  if (!start_time || !end_time) {
    return res.status(400).json({ message: "Start time and end time are required" });
  }

  try {
    const newSlot = await prisma.availability.create({
      data: {
        tutor_user_id: tutor_user_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        is_booked: false,
      },
    });
    res.status(201).json(newSlot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding availability" });
  }
});

/**
 * DELETE /api/availability/:id
 * Deletes an availability slot if it's not booked.
 * Protected by 'protect' and 'checkRole("tutor")' middleware.
 */
router.delete("/:id", async (req, res) => {
  // @ts-ignore
  const { userId: tutor_user_id } = req.user;
  const { id } = req.params;

  try {
    // deleteMany ensures we only delete if it matches ALL criteria
    const deleteResult = await prisma.availability.deleteMany({
      where: {
        id: parseInt(id),
        tutor_user_id: tutor_user_id, // Ensure tutor owns this slot
        is_booked: false, // Ensure it's not booked
      },
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({
        message: "Slot not found, is already booked, or you do not own it.",
      });
    }

    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting availability" });
  }
});

export default router;