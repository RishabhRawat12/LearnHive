import { Router } from "express";
import prisma from "../db";

const subjectRoutes = Router();

/**
 * GET /api/subjects
 * Gets a distinct list of all skill names from the Skill table.
 */
subjectRoutes.get("/", async (req, res) => {
  try {
    // Find all unique skill names
    const skills = await prisma.skill.findMany({
      distinct: ['name'],
      select: {
        name: true
      }
    });
    
    // Return just the array of strings
    res.json(skills.map(s => s.name));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subjects" });
  }
});

export default subjectRoutes;