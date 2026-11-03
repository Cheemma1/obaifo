import { Theme, type User } from "../generated/prisma/client";

/** Row types come straight from the Prisma schema (prisma/schema.prisma). */
export type {
  Chapter,
  Comment,
  Donation,
  Like,
  Progress,
  Role,
  Theme,
  User,
  Work,
  WorkStatus,
  WorkType,
} from "../generated/prisma/client";

/**
 * Ọbaifo publishes ifo (Igbo folktales) only. Every work is an ifo; the theme
 * says what kind of tale it is: Akụkọ Mbe, Anụmanụ, Ihe mere, Mmụọ, Dike,
 * Amamihe, Ifo nwere egwu.
 */
export const THEMES = Object.values(Theme) as [Theme, ...Theme[]];

export type PublicUser = Omit<User, "emailVerified" | "image" | "updatedAt">;
