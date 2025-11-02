import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";
import { Role } from "@prisma/client";

const authRoutes = Router();

/**
 * POST /api/auth/register
 * Handles new user registration.
 */
authRoutes.post("/register", async (req, res) => {
  try {
    // We no longer need tutorCode
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

    // --- START OF NEW LOGIC ---
    // 4. ALL users are created as 'student' by default.
    //    The 'role' will be changed by an admin later.
    const role: Role = Role.student;
    // --- END OF NEW LOGIC ---

    // 5. Create user (and profile if tutor) in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password_hash, role }, // Role is now always 'student'
      });

      // If they applied to be a tutor, create their PENDING profile
      if (isTutor) {
        await tx.tutorProfile.create({
          data: {
            user_id: newUser.id,
            bio: "Welcome! Your application is pending approval.", // Default bio
            status: 'PENDING', // Set status to PENDING
          },
        });
      }
      return newUser;
    });

    // 6. Create a JWT. Note: user.role is 'student' here, which is correct!
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
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

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // This now correctly sends the user's CURRENT role from the DB
    // (which will be 'student' until you approve them)
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