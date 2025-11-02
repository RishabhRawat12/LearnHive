import { Router } from "express";
import prisma from "../db";
import { Role, TutorStatus } from "@prisma/client";

const router = Router();

/**
 * GET /api/admin/pending-tutors
 * Gets all tutor profiles that are pending approval.
 * Protected by 'protect' and 'checkRole("ADMIN")' middleware.
 */
router.get("/pending-tutors", async (req, res) => {
  try {
    const pendingTutors = await prisma.tutorProfile.findMany({
      where: {
        status: TutorStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            created_at: true,
          },
        },
      },
      orderBy: {
        user: {
          created_at: "asc", // Show oldest applications first
        },
      },
    });
    res.json(pendingTutors);
  } catch (error) {
    console.error("Error fetching pending tutors:", error);
    res.status(500).json({ message: "Error fetching pending tutors" });
  }
});

/**
 * POST /api/admin/approve-tutor/:userId
 * Approves a tutor application.
 * Protected by 'protect' and 'checkRole("ADMIN")' middleware.
 */
router.post("/approve-tutor/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Use a transaction to ensure both updates succeed
    await prisma.$transaction(async (tx) => {
      // 1. Update the User's role from 'student' to 'tutor'
      await tx.user.update({
        where: { id: parseInt(userId) },
        data: { role: Role.tutor },
      });

      // 2. Update the TutorProfile status from 'PENDING' to 'APPROVED'
      await tx.tutorProfile.update({
        where: { user_id: parseInt(userId) },
        data: {
          status: TutorStatus.APPROVED,
          bio: "Your tutor application has been approved! Welcome to LearnHive.",
        },
      });
    });

    res.status(200).json({ message: "Tutor approved successfully" });
  } catch (error) {
    console.error("Error approving tutor:", error);
    res.status(500).json({ message: "Error approving tutor" });
  }
});

export default router;