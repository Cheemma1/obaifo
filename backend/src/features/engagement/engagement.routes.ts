import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../shared/middleware/auth";
import * as engagement from "./engagement.service";

/** Likes and comments: mounted at /api */
export const engagementRouter = Router();

engagementRouter.get("/works/:slug/likes", async (req, res) => {
  res.json(await engagement.getLikes(req.params.slug, req.user));
});

engagementRouter.put("/works/:slug/likes", requireAuth, async (req, res) => {
  const { liked } = z.object({ liked: z.boolean() }).parse(req.body);
  res.json(await engagement.setLike(String(req.params.slug), req.user!, liked));
});

engagementRouter.get("/works/:slug/comments", async (req, res) => {
  res.json({ items: await engagement.listComments(req.params.slug) });
});

const commentSchema = z.object({
  body: z.string().trim().min(1, "write something first").max(1000),
});

engagementRouter.post(
  "/works/:slug/comments",
  requireAuth,
  async (req, res) => {
    const { body } = commentSchema.parse(req.body);
    res
      .status(201)
      .json(
        await engagement.addComment(String(req.params.slug), req.user!, body),
      );
  },
);

engagementRouter.delete("/comments/:id", requireAuth, async (req, res) => {
  await engagement.deleteComment(String(req.params.id), req.user!);
  res.status(204).end();
});
