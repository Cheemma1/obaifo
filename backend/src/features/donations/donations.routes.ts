import { Router } from "express";
import { z } from "zod";
import * as donations from "./donations.service";

/** /api/donations — open to everyone, signed in or not. */
export const donationsRouter = Router();

// ₦500 minimum keeps card fees from eating the gift; ₦5,000,000 caps typos.
const startSchema = z.object({
  amountKobo: z.number().int().min(50_000).max(500_000_000),
  name: z.string().trim().max(80).default(""),
  email: z.email().trim().toLowerCase(),
});

donationsRouter.get("/stats", async (_req, res) => {
  res.json(await donations.donationStats());
});

donationsRouter.post("/", async (req, res) => {
  const input = startSchema.parse({ email: req.user?.email, name: req.user?.name, ...req.body });
  res.json(await donations.startDonation(input, req.user));
});

donationsRouter.post("/verify", async (req, res) => {
  const { reference } = z.object({ reference: z.string().min(4).max(64) }).parse(req.body);
  res.json(await donations.verifyDonation(reference));
});
