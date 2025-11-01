import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

/**
 * Middleware to check if the authenticated user has the required role.
 * Must be used *after* the 'protect' middleware.
 */
export const checkRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};