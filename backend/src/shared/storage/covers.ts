import fs from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../config/env";
import { newId } from "../utils/text";

/**
 * Cover images live in Cloudflare R2 when R2_ACCOUNT_ID is set, otherwise on
 * local disk under /uploads (local dev). Both return a URL the browser can load.
 */

export type CoverFile = { buffer: Buffer; mimetype: string };

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const KEY_PREFIX = "covers/";

const r2 = env.r2.accountId
  ? new S3Client({
      region: "auto",
      endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: env.r2.accessKeyId, secretAccessKey: env.r2.secretAccessKey },
    })
  : null;

if (r2 && (!env.r2.bucket || !env.r2.publicUrl)) {
  throw new Error("R2_BUCKET and R2_PUBLIC_URL must be set when R2_ACCOUNT_ID is set");
}

export async function saveCover(file: CoverFile): Promise<string> {
  const name = `${newId()}${EXTENSIONS[file.mimetype] ?? ""}`;

  if (!r2) {
    await fs.writeFile(path.join(env.paths.uploads, name), file.buffer);
    return `/uploads/${name}`;
  }

  // Every upload gets a fresh key, so the file can be cached forever.
  await r2.send(
    new PutObjectCommand({
      Bucket: env.r2.bucket,
      Key: KEY_PREFIX + name,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${env.r2.publicUrl}/${KEY_PREFIX}${name}`;
}

/** Best effort: a leftover file is harmless, so failures are logged, not thrown. */
export async function deleteCover(coverUrl: string | null) {
  if (!coverUrl) return;
  try {
    // Covers saved before R2 was switched on still live on disk.
    if (coverUrl.startsWith("/uploads/")) {
      await fs.rm(path.join(env.paths.uploads, path.basename(coverUrl)), { force: true });
    } else if (r2 && coverUrl.startsWith(`${env.r2.publicUrl}/${KEY_PREFIX}`)) {
      const key = coverUrl.slice(env.r2.publicUrl.length + 1);
      await r2.send(new DeleteObjectCommand({ Bucket: env.r2.bucket, Key: key }));
    }
  } catch (err) {
    console.error("Could not delete cover", coverUrl, err);
  }
}
