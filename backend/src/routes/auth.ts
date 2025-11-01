import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db"; // Import our shared Prisma client
import { Role } from "@prisma/client"; // Import the Role enum from Prisma

const authRoutes = Router();

/**
 * POST /api/auth/register
 * Handles new user registration.
 */
authRoutes.post("/register", async (req, res) => {
  try {
    const { name, email, password, isTutor } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // 3. Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 4. Determine role
    const role: Role = isTutor ? Role.tutor : Role.student;

    // 5. Create user (and profile if tutor) in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password_hash, role },
      });

      // If tutor, create associated profile
      if (isTutor) {
        await tx.tutorProfile.create({
          data: {
            user_id: newUser.id,
            bio: "Welcome to my profile!", // Default bio
          },
        });
      }
      return newUser;
    });

    // 6. Create a JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // Token payload
      process.env.JWT_SECRET as string, // Secret key
      { expiresIn: "1d" } // Expires in 1 day
    );

    // 7. Send token to frontend
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/auth/login
 * Handles existing user login.
 */
authRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find user
    const user = await prisma.user.findUnique({ where: { email } });

    // 3. Check user and password
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Create and send JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default authRoutes;