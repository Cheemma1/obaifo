import { z } from "zod";
import { THEMES } from "../../shared/types";

const chapterSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(140),
  body: z.string().trim().min(1, "chapter text cannot be empty").max(200_000),
});

/** Multipart forms send everything as strings, so chapters arrive as a JSON string. */
const chaptersField = z.preprocess(
  (v) => (typeof v === "string" ? JSON.parse(v) : v),
  z.array(chapterSchema).min(1, "add at least one chapter").max(120),
);

const boolField = z.preprocess((v) => v === true || v === "true", z.boolean());

export const createWorkSchema = z.object({
  title: z.string().trim().min(1).max(140),
  type: z.enum(["short", "long"]),
  theme: z.enum(THEMES),
  synopsis: z.string().trim().min(10).max(1200),
  publish: boolField.default(false),
  chapters: chaptersField,
});

export const updateWorkSchema = createWorkSchema.partial().extend({
  removeCover: boolField.optional(),
});

export const listWorksSchema = z.object({
  type: z.enum(["short", "long"]).optional(),
  theme: z.enum(THEMES).optional(),
  q: z.string().trim().max(80).optional(),
  author: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
  sort: z.enum(["new", "popular"]).default("new"),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});
