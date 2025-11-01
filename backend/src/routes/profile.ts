import { Router } from "express";
import prisma from "../db";
import { Prisma } from "@prisma/client";

const router = Router();

/**
 * GET /api/profile
 * Gets the authenticated tutor's profile with full skill objects.
 * Protected by 'protect' and 'checkRole("tutor")' middleware.
 */
router.get("/", async (req, res) => {
  // @ts-ignore
  const { userId: tutor_user_id } = req.user;

  try {
    const profile = await prisma.tutorProfile.findUnique({
      where: { user_id: tutor_user_id },
      include: {
        // Fetch full skill objects, not just names
        skills: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    // Send the full profile with the array of skill objects
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

/**
 * PUT /api/profile
 * Updates the authenticated tutor's profile, including detailed skills.
 * Protected by 'protect' and 'checkRole("tutor")' middleware.
 */
router.put("/", async (req, res) => {
  // @ts-ignore
  const { userId: tutor_user_id } = req.user;
  // Now expecting 'skills' to be an array of objects
  const { bio, hourly_rate, avatar_url, skills } = req.body;

  // --- START VALIDATION ---
  if (!Array.isArray(skills)) {
    return res
      .status(400)
      .json({ message: "Skills must be an array" });
  }

  const rate = parseFloat(hourly_rate);
  if (isNaN(rate)) {
    return res.status(400).json({ message: "Hourly rate must be a number" });
  }

  // Validate each skill object in the array
  for (const skill of skills) {
    if (!skill.name || !skill.experienceLevel || !skill.hourlyRate) {
      return res.status(400).json({ message: "Invalid skill object provided. 'name', 'experienceLevel', and 'hourlyRate' are required." });
    }
    if (isNaN(parseFloat(skill.hourlyRate))) {
      return res.status(400).json({ message: `Invalid hourly rate for skill: ${skill.name}` });
    }
  }
  // --- END VALIDATION ---

  try {
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // 1. Update the profile's bio, avatar, and main hourly rate
      const profile = await tx.tutorProfile.update({
        where: { user_id: tutor_user_id },
        data: {
          bio: bio,
          hourly_rate: new Prisma.Decimal(rate),
          avatar_url: avatar_url, // Allow updating avatar_url
        },
      });

      // 2. Delete all old skills for this tutor
      await tx.skill.deleteMany({
        where: { tutor_profile_id: tutor_user_id },
      });

      // 3. Create new skills with details from the array
      if (skills.length > 0) {
        await tx.skill.createMany({
          data: skills.map((skill: any) => ({
            tutor_profile_id: tutor_user_id,
            name: skill.name,
            experienceLevel: skill.experienceLevel,
            hourlyRate: new Prisma.Decimal(skill.hourlyRate),
          })),
        });
      }

      // Return the updated profile data (skills will be refetched by frontend)
      return profile;
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

export default router;