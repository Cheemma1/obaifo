import { z } from "zod";
import { THEMES } from "../../shared/types";

const page = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().trim().max(200).optional(),
};

export const listUsersSchema = z.object({
  ...page,
  role: z.enum(["reader", "author", "admin"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(["reader", "author"]).optional(),
  isAdmin: z.boolean().optional(),
});

export const suspendSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const listWorksSchema = z.object({
  ...page,
  status: z.enum(["draft", "published"]).optional(),
  theme: z.enum(THEMES).optional(),
  featured: z.enum(["true", "false"]).optional(),
  sort: z.enum(["new", "reads", "updated"]).default("new"),
});

export const updateWorkSchema = z.object({
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const listCommentsSchema = z.object({ ...page });

export const listDonationsSchema = z.object({
  ...page,
  status: z.enum(["pending", "success", "failed"]).optional(),
});
