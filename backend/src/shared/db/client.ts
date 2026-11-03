import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../../config/env";
import { PrismaClient } from "../../generated/prisma/client";

/** One Prisma client for the whole API, talking to Postgres through node-postgres. */
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.databaseUrl }),
});
