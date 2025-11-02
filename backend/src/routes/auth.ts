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
    // --- 1. Get new fields from body ---
    const { 
      name, 
      email, 
      password, 
      isTutor, 
      application_message, 
      subjects_applying_for, 
      credentials_url 
    } = req.body;

    // 2. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 3. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // 4. Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 5. ALL users are created as 'student' by default.
    const role: Role = Role.student;

    // 6. Create user (and profile if tutor) in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password_hash, role },
      });

      // If they applied to be a tutor, create their PENDING profile
      if (isTutor) {
        // --- 7. Save the new application data ---
        await tx.tutorProfile.create({
          data: {
            user_id: newUser.id,
            status: 'PENDING',
            bio: "Your application is pending approval.", // Default public bio
            application_message: application_message,
            subjects_applying_for: subjects_applying_for,
            credentials_url: credentials_url,
          },
        });
        // --- END SAVE ---
      }
      return newUser;
    });

    // 8. Create a JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // 9. Send token to frontend
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