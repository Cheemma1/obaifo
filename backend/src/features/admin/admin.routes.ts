import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/auth";
import {
  listCommentsSchema,
  listDonationsSchema,
  listUsersSchema,
  listWorksSchema,
  suspendSchema,
  updateUserSchema,
  updateWorkSchema,
} from "./admin.schema";
import * as admin from "./admin.service";
import { insights } from "./insights.service";

/** /api/admin: everything the admin app (../admin) can see and change. Admins only. */
export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get("/overview", async (_req, res) => {
  res.json(await admin.overview());
});

adminRouter.get("/insights", async (_req, res) => {
  res.json(await insights());
});

adminRouter.get("/live", async (_req, res) => {
  res.json(await admin.live());
});

adminRouter.get("/users", async (req, res) => {
  res.json(await admin.listUsers(listUsersSchema.parse(req.query)));
});

adminRouter.get("/users/:id", async (req, res) => {
  res.json(await admin.getUser(req.params.id));
});

adminRouter.patch("/users/:id", async (req, res) => {
  res.json(await admin.updateUser(req.user!, req.params.id, updateUserSchema.parse(req.body)));
});

adminRouter.post("/users/:id/suspend", async (req, res) => {
  res.json(await admin.suspendUser(req.user!, req.params.id, suspendSchema.parse(req.body ?? {})));
});

adminRouter.post("/users/:id/unsuspend", async (req, res) => {
  res.json(await admin.unsuspendUser(req.params.id));
});

adminRouter.post("/users/:id/sign-out", async (req, res) => {
  await admin.signOutEverywhere(req.params.id);
  res.status(204).end();
});

adminRouter.delete("/users/:id", async (req, res) => {
  await admin.deleteUser(req.user!, req.params.id);
  res.status(204).end();
});

adminRouter.get("/works", async (req, res) => {
  res.json(await admin.listWorks(listWorksSchema.parse(req.query)));
});

adminRouter.patch("/works/:id", async (req, res) => {
  res.json(await admin.updateWork(req.params.id, updateWorkSchema.parse(req.body)));
});

adminRouter.delete("/works/:id", async (req, res) => {
  await admin.deleteWork(req.params.id);
  res.status(204).end();
});

adminRouter.get("/comments", async (req, res) => {
  res.json(await admin.listComments(listCommentsSchema.parse(req.query)));
});

adminRouter.delete("/comments/:id", async (req, res) => {
  await admin.deleteComment(req.params.id);
  res.status(204).end();
});

adminRouter.get("/donations", async (req, res) => {
  res.json(await admin.listDonations(listDonationsSchema.parse(req.query)));
});
