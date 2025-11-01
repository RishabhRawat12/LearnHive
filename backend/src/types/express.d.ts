// Import the Role enum from the auto-generated Prisma client
import { Role } from "@prisma/client";

// This is the data we will store inside our JWT
export interface AuthPayload {
  userId: number;
  role: Role;
  iat: number;
  exp: number;
}

// This tells TypeScript to add our custom 'user' property
// to the existing Express 'Request' type.
declare global {
  namespace Express {
    export interface Request {
      user?: AuthPayload;
    }
  }
}