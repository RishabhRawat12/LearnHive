import { Router } from "express";
import prisma from "../db";

const skillRoutes = Router();

/**
 * GET /api/skills
 * Gets a list of all unique skill/subject names.
 * Based on your schema, this queries the `Skill` model.
 */
skillRoutes.get("/", async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      select: {
        name: true,
      },
      distinct: ["name"], // Ensure we only get unique names
    });

    // Return an array of strings
    res.json(skills.map((s) => s.name));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching skills" });
  }
});

export default skillRoutes;
