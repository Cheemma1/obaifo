import { Router } from "express";
import type { User } from "../../shared/types";
import { requireAuth } from "../../shared/middleware/auth";
import { profileSchema } from "./auth.schema";
import * as account from "./auth.service";

const sessionPayload = (user: User) => ({ user: account.toPublicUser(user) });

/**
 * /api/account: the signed-in reader's profile. Signing up, in and out is
 * Better Auth's job at /api/auth/* (see auth.ts).
 */
export const accountRouter = Router();

accountRouter.get("/", (req, res) => {
  res.json(req.user ? sessionPayload(req.user) : { user: null });
});

accountRouter.patch("/", requireAuth, async (req, res) => {
  const user = await account.updateProfile(
    req.user!,
    profileSchema.parse(req.body),
  );
  res.json(sessionPayload(user));
});

/** Any reader can open the studio; authors keep all reader abilities. */
accountRouter.post("/become-author", requireAuth, async (req, res) => {
  res.json(sessionPayload(await account.becomeAuthor(req.user!)));
});
