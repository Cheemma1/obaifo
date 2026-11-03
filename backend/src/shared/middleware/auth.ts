import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../../features/auth/auth";
import { prisma } from "../db/client";
import type { Role, User } from "../types";
import { forbidden, unauthorized } from "../utils/http-error";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/** Attaches req.user when a valid Better Auth session cookie is present. Never rejects. */
export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (session) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      // A suspended account is treated as signed out, even on a session that outlived the suspension.
      req.user = user && !user.suspendedAt ? user : undefined;
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  if (!req.user.isAdmin) return next(forbidden("Only admins can do this", "ADMIN_REQUIRED"));
  next();
}

export const requireRole = (role: Role) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(unauthorized());
  if (req.user.role !== role) return next(forbidden(`Only ${role}s can do this`, "ROLE_REQUIRED"));
  next();
};
