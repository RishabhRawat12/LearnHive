import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload } from "../types/express"; // Import our custom type

/**
 * A middleware function to protect routes.
 * It verifies the JWT and attaches the payload to req.user.
 */
export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get the Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if it's a "Bearer" token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized, no token" });
    }

    // 3. Extract the token string
    const token = authHeader.split(" ")[1];

    // 4. Verify the token using the secret key
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthPayload;

    // 5. Attach the user data to the request object
    // Now any protected route can access `req.user`
    req.user = payload;

    // 6. Pass to the next function (the route handler)
    next();
  } catch (error) {
    // Handle specific errors
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Unauthorized, invalid token" });
  }
};