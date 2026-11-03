import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import { HttpError } from "../utils/http-error";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { message: "Route not found", code: "NOT_FOUND" } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, code: err.code } });
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({
      error: {
        message: first ? `${first.path.join(".") || "input"}: ${first.message}` : "Invalid input",
        code: "VALIDATION",
        issues: err.issues,
      },
    });
  }
  if (err instanceof MulterError) {
    return res.status(400).json({ error: { message: err.message, code: err.code } });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 unique clash (e.g. two requests racing), P2025 row vanished mid-request.
    if (err.code === "P2002") return res.status(409).json({ error: { message: "That already exists", code: "CONFLICT" } });
    if (err.code === "P2025") return res.status(404).json({ error: { message: "Not found", code: "NOT_FOUND" } });
  }
  console.error(err);
  return res.status(500).json({ error: { message: "Something went wrong", code: "INTERNAL" } });
}
