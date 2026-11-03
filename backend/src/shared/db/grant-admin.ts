/**
 * Makes an existing account an admin, or removes admin with --revoke:
 *   npm run admin:grant -- someone@example.com
 *   npm run admin:grant -- someone@example.com --revoke
 * The person signs up on the reader site first, then signs in to the admin app.
 */
import { prisma } from "./client";

async function main() {
  const email = process.argv
    .slice(2)
    .find((a) => !a.startsWith("--"))
    ?.trim()
    .toLowerCase();
  const revoke = process.argv.includes("--revoke");
  if (!email) throw new Error("Usage: npm run admin:grant -- <email> [--revoke]");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No account uses ${email}. Sign up on the site first.`);
  await prisma.user.update({ where: { id: user.id }, data: { isAdmin: !revoke } });
  console.log(revoke ? `${email} is no longer an admin` : `${email} is now an admin`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
