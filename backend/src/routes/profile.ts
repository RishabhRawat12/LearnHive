import { Router } from "express";
import prisma from "../db";
import { Prisma } from "@prisma/client";

const router = Router();

/**
 * GET /api/profile
 * Gets the authenticated tutor's profile.
 * Protected by 'protect' and 'checkRole("tutor")' middleware.
 */
router.get("/", async (req, res) => {
  // @ts-ignore
  const { userId: tutor_user_id } = req.user;

  try {
    const profile = await prisma.tutorProfile.findUnique({
      where: { user_id: tutor_user_id },
      include: {
        skills: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    // Format skills to be a simple array of strings
    const response = {
      ...profile,
      skills: profile.skills.map((s) => s.name),
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

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
    return res
      .status(400)
      .json({ message: "Skills must be an array of strings" });
  }

  // Ensure hourly_rate is a valid number
  const rate = parseFloat(hourly_rate);
  if (isNaN(rate)) {
    return res.status(400).json({ message: "Hourly rate must be a number" });
  }

  try {
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // 1. Update the profile's bio and hourly rate
      const profile = await tx.tutorProfile.update({
        where: { user_id: tutor_user_id },
        data: {
          bio: bio,
          hourly_rate: new Prisma.Decimal(rate),
        },
      });

      // 2. Delete all old skills for this tutor
      await tx.skill.deleteMany({
        where: { tutor_profile_id: tutor_user_id },
      });

      // 3. Create new skills
      // Note: We use placeholder values as the frontend form is simple.
      if (skills.length > 0) {
        await tx.skill.createMany({
          data: skills.map((skillName: string) => ({
            tutor_profile_id: tutor_user_id,
            name: skillName,
            experienceLevel: "Expert", // Placeholder
            hourlyRate: new Prisma.Decimal(rate), // Use main hourly rate
          })),
        });
      }

      return profile;
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

export default router;