import { Router } from "express";
import prisma from "../db";
import { Role, TutorStatus } from "@prisma/client";

const router = Router();

/**
 * GET /api/admin/pending-tutors
 * Fetches all pending tutor applications.
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

/**
 * POST /api/admin/reject-tutor/:userId
 * Rejects a tutor application.
 */
router.post("/reject-tutor/:userId", async (req, res) => {
  const { userId } = req.params;
  const { rejection_message } = req.body; 

  if (!rejection_message || rejection_message.trim() === "") {
    return res.status(400).json({ message: "A rejection message is required." });
  }

  try {
    await prisma.tutorProfile.update({
      where: { user_id: parseInt(userId) },
      data: {
        status: TutorStatus.REJECTED,
        rejection_message: rejection_message,
      },
    });
    
    res.status(200).json({ message: "Tutor rejected successfully" });
  } catch (error) {
    console.error("Error rejecting tutor:", error);
    res.status(500).json({ message: "Error rejecting tutor" });
  }
});

// --- NEW: Get Site Statistics ---
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTutors = await prisma.user.count({ where: { role: Role.tutor } });
    const totalBookings = await prisma.booking.count();
    const pendingApps = await prisma.tutorProfile.count({ where: { status: TutorStatus.PENDING } });

    res.json({ totalUsers, totalTutors, totalBookings, pendingApps });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// --- NEW: Get All Users ---
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// --- NEW: Delete a User ---
router.delete("/user/:userId", async (req, res) => {
  // @ts-ignore
  const adminId = req.user.userId; // Get admin's own ID from token
  const userIdToDelete = parseInt(req.params.userId);

  if (adminId === userIdToDelete) {
    return res.status(400).json({ message: "Admin cannot delete themselves." });
  }

  try {
    await prisma.user.delete({
      where: { id: userIdToDelete },
    });
    res.status(204).send(); // No Content
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// --- NEW: Update User Role ---
router.put("/user/:userId/role", async (req, res) => {
  // @ts-ignore
  const adminId = req.user.userId; // Get admin's own ID from token
  const userIdToUpdate = parseInt(req.params.userId);
  const { newRole } = req.body;

  // Validate the new role
  if (!newRole || !Object.values(Role).includes(newRole)) {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  // Safety check: Admin cannot demote themselves
  if (adminId === userIdToUpdate && newRole !== Role.ADMIN) {
    return res.status(400).json({ message: "Admin cannot demote themselves." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdate },
      data: { role: newRole },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Error updating user role" });
  }
});


export default router;