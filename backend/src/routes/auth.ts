import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db"; // Import our shared Prisma client
import { Role } from "@prisma/client"; // Import the Role enum from Prisma

// Create a new router for /api/auth paths
const authRoutes = Router();

/**
 * POST /api/auth/register
 * Handles new user registration.
 * Matches the signup form in your AuthPage.tsx.
 */
authRoutes.post("/register", async (req, res) => {
  try {
    const { name, email, password, isTutor } = req.body;

    // 1. Simple Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // 3. Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // 4. Determine the user's role
    const role: Role = isTutor ? Role.tutor : Role.student;

    // 5. Create user (and profile if a tutor) in a transaction.
    // A transaction ensures both actions (create user, create profile)
    // either both succeed or both fail together.
    const user = await prisma.$transaction(async (tx) => {
      // Create the main user entry
      const newUser = await tx.user.create({
        data: { name, email, password_hash, role },
      });

      // If they are a tutor, create their associated empty profile
      if (isTutor) {
        await tx.tutorProfile.create({
          data: {
            user_id: newUser.id,
            bio: "Welcome to my profile!", // Add a default bio
          },
        });
      }
      return newUser;
    });

    // 6. Create a JSON Web Token (JWT)
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // The data to store in the token
      process.env.JWT_SECRET as string, // The secret key from .env
      { expiresIn: "1d" } // The token will be valid for 1 day
    );

    // 7. Send the token back to the frontend
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/auth/login
 * Handles existing user login.
 * Matches the login form in your AuthPage.tsx.
 */
authRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Simple Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find the user
    const user = await prisma.user.findUnique({ where: { email } });

    // 3. Check if user exists and password is correct
    // We use bcrypt.compare to securely check the password hash
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Create and send the JWT (same as register)
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