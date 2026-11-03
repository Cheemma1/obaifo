import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { auth } from "./features/auth/auth";
import { adminRouter } from "./features/admin/admin.routes";
import { accountRouter } from "./features/auth/auth.routes";
import { authorsRouter } from "./features/authors/authors.routes";
import { donationsRouter } from "./features/donations/donations.routes";
import { engagementRouter } from "./features/engagement/engagement.routes";
import { libraryRouter } from "./features/library/library.routes";
import { presenceRouter } from "./features/presence/presence.routes";
import { studioRouter, worksRouter } from "./features/works/works.routes";
import { attachUser } from "./shared/middleware/auth";
import { errorHandler, notFoundHandler } from "./shared/middleware/error";
import { THEMES } from "./shared/types";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: [env.clientOrigin, env.adminOrigin], credentials: true }));
  // Better Auth reads the raw request body, so it must come before express.json().
  app.all("/api/auth/*splat", toNodeHandler(auth));
  app.use(express.json({ limit: "2mb" }));
  app.use(attachUser);

  app.use("/uploads", express.static(env.paths.uploads, { maxAge: "7d", immutable: true }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.get("/api/meta", (_req, res) => res.json({ themes: THEMES }));

  app.use("/api/account", accountRouter);
  app.use("/api", engagementRouter);
  app.use("/api/works", worksRouter);
  app.use("/api/studio", studioRouter);
  app.use("/api/library", libraryRouter);
  app.use("/api/donations", donationsRouter);
  app.use("/api/authors", authorsRouter);
  app.use("/api/presence", presenceRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
