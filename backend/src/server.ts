import { createApp } from "./app";
import { startPresencePruning } from "./features/presence/presence.routes";
import { env } from "./config/env";
import { prisma } from "./shared/db/client";
import { seed } from "./shared/db/seed";

async function main() {
  // A fresh development database gets the sample storytellers and tales.
  if (!env.isProduction && (await prisma.user.count()) === 0) {
    await seed();
    console.log("Seeded sample authors and stories");
  }
  startPresencePruning();
  createApp().listen(env.port, () => {
    console.log(`Ọbaifo API listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
