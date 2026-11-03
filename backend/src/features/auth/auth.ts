import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { env } from "../../config/env";
import { prisma } from "../../shared/db/client";
import { sendMail, simpleMail } from "../../shared/mail/mailer";

const DAY = 24 * 60 * 60;
const ROLES = ["reader", "author"];

const RESET_MAIL = {
  en: {
    subject: "Reset your Ọbaifo password",
    heading: (name: string) => `Hello ${name},`,
    body: "Someone asked to reset the password for your Ọbaifo account. Choose a new password with the button below. The link works for one hour.",
    button: "Choose a new password",
    footer:
      "If you did not ask for this, ignore this email and your password will stay the same. If the button does not work, open this link:",
  },
  ig: {
    subject: "Gbanwee okwuntughe Ọbaifo gị",
    heading: (name: string) => `Ndewo ${name},`,
    body: "Mmadụ rịọrọ ka a gbanwee okwuntughe akaụntụ Ọbaifo gị. Pịa bọtịnụ dị n'okpuru ka ị họrọ okwuntughe ọhụrụ. Njikọ a ga-arụ ọrụ maka otu awa.",
    button: "Họrọ okwuntughe ọhụrụ",
    footer:
      "Ọ bụrụ na ọ bụghị gị rịọrọ ya, leghara email a anya; okwuntughe gị agaghị agbanwe. Ọ bụrụ na bọtịnụ adịghị arụ ọrụ, mepee njikọ a:",
  },
};

/**
 * Better Auth owns sign-up, sign-in, sign-out and sessions, served at /api/auth/*
 * (see app.ts). Passwords are hashed with scrypt into Account rows; sessions are
 * database rows, so signing out ends them immediately.
 */
export const auth = betterAuth({
  appName: "Ọbaifo",
  secret: env.authSecret,
  // The browser reaches the API through the Next.js proxy, so that is the public origin.
  baseURL: env.clientOrigin,
  basePath: "/api/auth",
  trustedOrigins: [env.clientOrigin, env.adminOrigin],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Reset links last an hour, and a new password signs out every other device.
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      // The link's callbackURL is /ig/... or /en/..., so write the email in that language.
      const ig = !decodeURIComponent(url).includes("callbackURL=/en/");
      const copy = ig ? RESET_MAIL.ig : RESET_MAIL.en;
      await sendMail({
        to: user.email,
        subject: copy.subject,
        ...simpleMail({ ...copy, heading: copy.heading(user.name), url }),
      });
    },
  },
  session: {
    expiresIn: 30 * DAY,
    updateAge: DAY,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "reader",
        input: true,
      },
      bio: { type: "string", required: false, defaultValue: "", input: false },
      // Never settable from sign-up: admin is granted with `npm run admin:grant`.
      isAdmin: { type: "boolean", required: false, defaultValue: false, input: false },
      avatarHue: { type: "number", required: false, input: false },
    },
  },
  databaseHooks: {
    // Suspended accounts cannot start a session (sign-in answers 403 SUSPENDED).
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { suspendedAt: true },
          });
          if (user?.suspendedAt) {
            throw new APIError("FORBIDDEN", {
              message: "This account has been suspended",
              code: "SUSPENDED",
            });
          }
        },
      },
    },
    user: {
      create: {
        before: async (user) => {
          const name = String(user.name ?? "").trim();
          if (name.length < 2 || name.length > 80) {
            throw new APIError("BAD_REQUEST", {
              message: "name: must be 2 to 80 characters",
              code: "VALIDATION",
            });
          }
          const role = ROLES.includes(String(user.role)) ? user.role : "reader";
          return {
            data: {
              ...user,
              name,
              role,
              avatarHue: Math.floor(Math.random() * 360),
            },
          };
        },
      },
    },
  },
  // On in every environment so password guessing is slowed down locally too.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
    },
  },
  advanced: {
    // Same UUID ids as the rest of the schema, created here rather than by Postgres.
    database: { generateId: () => crypto.randomUUID() },
  },
});
