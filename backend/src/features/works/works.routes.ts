import { Router } from "express";
import { requireRole } from "../../shared/middleware/auth";
import { manuscriptUpload, workUpload } from "../../shared/middleware/upload";
import { badRequest } from "../../shared/utils/http-error";
import { createWorkSchema, listWorksSchema, updateWorkSchema } from "./works.schema";
import * as works from "./works.service";

/** Public catalogue: /api/works */
export const worksRouter = Router();

worksRouter.get("/", async (req, res) => {
  res.json({ items: await works.listPublished(listWorksSchema.parse(req.query)) });
});

// Before "/:slug", or "today" would be read as a slug.
worksRouter.get("/today", async (_req, res) => {
  res.json({ item: await works.taleOfTheDay() });
});

worksRouter.get("/:slug", async (req, res) => {
  res.json(await works.getDetail(req.params.slug));
});

worksRouter.get("/:slug/chapters/:index", async (req, res) => {
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0) throw badRequest("Invalid chapter");
  res.json(await works.readChapter(req.params.slug, index, req.user));
});

/** Author studio: /api/studio */
export const studioRouter = Router();
studioRouter.use(requireRole("author"));

studioRouter.get("/works", async (req, res) => {
  res.json({ items: await works.listMine(req.user!) });
});

studioRouter.get("/works/:id", async (req, res) => {
  res.json(await works.getMine(req.params.id, req.user!));
});

studioRouter.post("/works", workUpload.single("cover"), async (req, res) => {
  const input = createWorkSchema.parse(req.body);
  res.status(201).json(await works.create(req.user!, input, req.file));
});

studioRouter.patch("/works/:id", workUpload.single("cover"), async (req, res) => {
  const input = updateWorkSchema.parse(req.body);
  res.json(await works.update(String(req.params.id), req.user!, input, req.file));
});

studioRouter.delete("/works/:id", async (req, res) => {
  await works.remove(req.params.id, req.user!);
  res.status(204).end();
});

studioRouter.post("/manuscript", manuscriptUpload.single("file"), (req, res) => {
  if (!req.file) throw badRequest("Attach a .txt or .md file");
  const chapters = works.parseManuscript(req.file.buffer.toString("utf8"));
  if (chapters.length === 0) throw badRequest("We could not find any text in that file");
  res.json({ chapters });
});
