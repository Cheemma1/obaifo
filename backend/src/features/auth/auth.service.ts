import type { z } from "zod";
import { prisma } from "../../shared/db/client";
import type { PublicUser, User } from "../../shared/types";
import type { profileSchema } from "./auth.schema";

export function toPublicUser(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { emailVerified, image, updatedAt, ...rest } = user;
  return rest;
}

export function updateProfile(
  user: User,
  input: z.infer<typeof profileSchema>,
): Promise<User> {
  return prisma.user.update({ where: { id: user.id }, data: input });
}

export function becomeAuthor(user: User): Promise<User> {
  return prisma.user.update({
    where: { id: user.id },
    data: { role: "author" },
  });
}
