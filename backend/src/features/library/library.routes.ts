import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../shared/middleware/auth";
import * as library from "./library.service";

export const libraryRouter = Router();
libraryRouter.use(requireAuth);

libraryRouter.get("/", async (req, res) => {
  res.json(await library.getLibrary(req.user!));
});

const progressSchema = z.object({
  workId: z.string().min(1),
  chapterIndex: z.number().int().min(0),
  percent: z.number().min(0).max(100),
});

libraryRouter.put("/progress", async (req, res) => {
  const { workId, chapterIndex, percent } = progressSchema.parse(req.body);
  await library.saveProgress(req.user!, workId, chapterIndex, percent);
  res.status(204).end();
});
