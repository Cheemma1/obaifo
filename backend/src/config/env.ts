import "dotenv/config";
import path from "node:path";

const root = path.resolve(__dirname, "..", "..");

export const env = {
  port: Number(process.env.PORT ?? 4400),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3400",
  /** Matches the Postgres in docker-compose.yml. */
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://agumagu:agumagu@localhost:5544/agumagu",
  /** Signs and encrypts Better Auth session cookies. */
  authSecret:
    process.env.BETTER_AUTH_SECRET ??
    "agumagu-dev-secret-do-not-use-in-production",
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY ?? "",
  /** Cloudflare R2 for cover images. Empty account id = store covers on local disk. */
  r2: {
    accountId: process.env.R2_ACCOUNT_ID ?? "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.R2_BUCKET ?? "",
    /** Public base URL of the bucket, e.g. https://files.example.com (no trailing slash). */
    publicUrl: (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, ""),
  },
  /** Outgoing email (password resets). Empty host = print mail to the console. */
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.MAIL_FROM ?? "Ọbaifo <no-reply@obaifo.example>",
  },
  isProduction: process.env.NODE_ENV === "production",
  paths: {
    root,
    uploads: path.join(root, "uploads"),
  },
} as const;

if (
  env.isProduction &&
  (env.authSecret.length < 32 || /agumagu-dev|change-me/.test(env.authSecret))
) {
  throw new Error(
    "BETTER_AUTH_SECRET must be set to a long random value in production (openssl rand -base64 32)",
  );
}
