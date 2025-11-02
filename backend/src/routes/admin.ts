import { Router } from "express";
import prisma from "../db";
import { Role, TutorStatus } from "@prisma/client";

const router = Router();

/**
 * GET /api/admin/pending-tutors
 * ... (This route is unchanged) ...
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
 * ... (This route is unchanged) ...
 */
router.post("/approve-tutor/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
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
          // Clear any old rejection message just in case
          rejection_message: null, 
        },
      });
    });

    res.status(200).json({ message: "Tutor approved successfully" });
  } catch (error) {
    console.error("Error approving tutor:", error);
    res.status(500).json({ message: "Error approving tutor" });
  }
});

// --- START: NEW REJECT ROUTE ---
/**
 * POST /api/admin/reject-tutor/:userId
 * Rejects a tutor application and provides a reason.
 * Protected by 'protect' and 'checkRole("ADMIN")' middleware.
 */
router.post("/reject-tutor/:userId", async (req, res) => {
  const { userId } = req.params;
  const { rejection_message } = req.body; // Get message from request body

  if (!rejection_message || rejection_message.trim() === "") {
    return res.status(400).json({ message: "A rejection message is required." });
  }

  try {
    // Only need to update the TutorProfile
    await prisma.tutorProfile.update({
      where: { user_id: parseInt(userId) },
      data: {
        status: TutorStatus.REJECTED,
        rejection_message: rejection_message,
      },
    });
    
    // Note: The user's role remains 'student'
    res.status(200).json({ message: "Tutor rejected successfully" });
  } catch (error) {
    console.error("Error rejecting tutor:", error);
    res.status(500).json({ message: "Error rejecting tutor" });
  }
});
// --- END: NEW REJECT ROUTE ---

export default router;