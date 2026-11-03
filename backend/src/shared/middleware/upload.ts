import fs from "node:fs";
import multer from "multer";
import { env } from "../../config/env";
import { badRequest } from "../utils/http-error";

// Local fallback for covers when R2 is not configured (see shared/storage/covers.ts).
fs.mkdirSync(env.paths.uploads, { recursive: true });

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MANUSCRIPT_TYPES = new Set(["text/plain", "text/markdown", "application/octet-stream"]);

/**
 * Cover images stay in memory until the work passes validation, then go to
 * R2 (or local disk). Manuscripts stay in memory and are parsed into chapters.
 */
export const workUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname !== "cover") return cb(badRequest("Unexpected file field"));
    if (IMAGE_TYPES.has(file.mimetype)) return cb(null, true);
    cb(badRequest("Cover must be a JPG, PNG or WebP image"));
  },
});

export const manuscriptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const okExt = /\.(txt|md)$/i.test(file.originalname);
    if (okExt && MANUSCRIPT_TYPES.has(file.mimetype)) return cb(null, true);
    cb(badRequest("Manuscript must be a .txt or .md file"));
  },
});
