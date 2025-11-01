import { PrismaClient } from "@prisma/client";

// This is a way to store the Prisma client on the global object
// so it's not re-created on every hot-reload in development.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Create the Prisma client instance.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Optional: Log all database queries to the console.
    log: ["query"],
  });

// If we're not in production, store the client on the global object.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;