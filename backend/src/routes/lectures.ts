import { Router } from "express";
import prisma from "../db";

const router = Router();

/**
 * POST /api/lectures
 * Adds a new lecture for the tutor.
 * Protected by 'protect' and 'checkRole("tutor")' middleware.
 */
router.post("/", async (req, res) => {
  // @ts-ignore
  const { userId: tutor_user_id } = req.user;
  const { title, description, video_url } = req.body;

  if (!title || !video_url) {
    return res.status(400).json({ message: "Title and Video URL are required" });
  }

  try {
    const newLecture = await prisma.lecture.create({
      data: {
        tutor_user_id,
        title,
        description,
        video_url,
      },
    });
    res.status(201).json(newLecture);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding lecture" });
  }
});

/**
 * DELETE /api/lectures/:id
 * Deletes a lecture.
 * Protected by 'protect' and 'checkRole("tutor")' middleware.
 */
router.delete("/:id", async (req, res) => {
  // @ts-ignore
  const { userId: tutor_user_id } = req.user;
  const { id } = req.params;

  try {
    const deleteResult = await prisma.lecture.deleteMany({
      where: {
        id: parseInt(id),
        tutor_user_id: tutor_user_id, // Ensure tutor owns this lecture
      },
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({
        message: "Lecture not found or you do not own it.",
      });
    }

    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting lecture" });
  }
});

export default router;