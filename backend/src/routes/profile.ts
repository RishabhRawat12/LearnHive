import { Router } from "express";
import prisma from "../db";
import { Prisma } from "@prisma/client";

const router = Router();

/**
 * PUT /api/profile
 * Updates the authenticated tutor's profile.
 * Protected by 'protect' and 'checkRole("tutor")' middleware.
 */
router.put("/", async (req, res) => {
  // @ts-ignore
  const { userId: tutor_user_id } = req.user;
  const { bio, hourly_rate, skills } = req.body;

  // Validate skills array
  if (!Array.isArray(skills)) {
    return res.status(400).json({ message: "Skills must be an array of strings" });
  }

  try {
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // 1. Update the profile's bio and hourly rate
      const profile = await tx.tutorProfile.update({
        where: { user_id: tutor_user_id },
        data: {
          bio: bio,
          hourly_rate: new Prisma.Decimal(hourly_rate),
        },
      });

      // 2. Delete all old skills for this tutor
      await tx.skill.deleteMany({
        where: { tutor_profile_id: tutor_user_id },
      });

      // 3. Create new skills
      // Note: We use placeholder values as the frontend form is simple.
      await tx.skill.createMany({
        data: skills.map((skillName: string) => ({
          tutor_profile_id: tutor_user_id,
          name: skillName,
          experienceLevel: "Expert", // Placeholder
          hourlyRate: new Prisma.Decimal(hourly_rate), // Use main hourly rate
        })),
      });

      return profile;
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

export default router;