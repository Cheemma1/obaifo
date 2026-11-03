# Ọbaifo

A home for **ifo**, Igbo folktales, and nothing else. People write down the ifo they know so others can read them.

**Mission:** promote reading in Igbo and help preserve the Igbo language. Ọbaifo gives readers an everyday reason to read Igbo, gives storytellers a place to record the tales they grew up with, and builds a growing archive of ifo for the next generation.

- **Tales** are classified by kind (`THEMES` in `backend/src/shared/types.ts`): tortoise tales, animal tales, origin tales, spirit tales, heroes, tales that teach, and song tales. The API rejects anything else.
- **Free for everyone**: every tale and every chapter can be read without paying or signing in. An account is only needed to like, comment and keep your place.
- **Donations**: a small floating “Nye onyinye · Donate” button (and `/donate`) takes one-off gifts to help pay for hosting and development, through Paystack (mock checkout in development).
- **Storytellers**: publish from the studio by typing chapters or importing a `.txt`/`.md` manuscript, with an uploaded or generated cover.
- **Likes, comments and sharing**: signed-in readers can like and comment on a tale (at the end of the reader and on the tale page). Commenters can delete their own comments, and a tale's storyteller can delete any comment on it. Share buttons cover X, Facebook and LinkedIn via their share links. Instagram and TikTok have no web share links, so those buttons open the phone's share sheet where available and otherwise copy the link.

## Languages

The **interface** is available in Igbo and English; **tales are always Igbo** and are never translated.

- Every page lives under `/ig/…` or `/en/…` (`frontend/src/app/[lang]/`). `frontend/src/proxy.ts` redirects unprefixed URLs, including shared tale links, to the visitor's saved language, or Igbo by default (`DEFAULT_LOCALE` in `frontend/src/i18n/config.ts`).
- The IG / EN switch in the navbar saves the choice in the `obaifo_locale` cookie.
- All interface text lives in `frontend/src/i18n/dictionaries/en.ts` and `ig.ts`. The `Dictionary` type makes the build fail if a key is missing from either language. Have a native speaker review `ig.ts`.
- Tale titles, chapter titles and tale text are marked `lang="ig"` for screen readers and search engines.
- The API refuses to **publish** a tale whose text is clearly English (`backend/src/features/works/igbo-check.ts`, error code `NOT_IGBO`). Drafts are never checked. The check is deliberately lenient, so Igbo typed without diacritics, a line of English song or code-switched dialogue still pass.

```
agumagu/
├── docker-compose.yml   PostgreSQL 17 for local development (port 5544)
├── backend/    Express 5 + TypeScript + Prisma ORM API (port 4400)
└── frontend/   Next.js 16 + React Query + Tailwind CSS v4 (port 3400)
```

Both apps use a **feature-based** layout:

```
backend/src/features/{auth,works,library,engagement,donations,authors}/   routes · service · schema
backend/src/shared/{db,middleware,utils}/        db/client.ts is the single Prisma client
backend/prisma/                                  schema.prisma + migrations

frontend/src/features/{auth,works,reader,library,engagement,donations,studio,authors,home}/   api hooks + components
frontend/src/shared/{ui,layout,lib,providers}/
frontend/src/app/                                            thin route files only
```

## Running locally

You need Node 20+ and Docker. Start PostgreSQL, then the API:

```bash
docker compose up -d
```

```bash
cd backend && npm install && npx prisma migrate deploy && npm run dev
```

```bash
cd frontend && npm install && npm run dev
```

Open http://localhost:3400. The frontend proxies `/api/*` and `/uploads/*` to the API (see `frontend/next.config.ts`), so the session cookie stays first-party.

When the database is empty, the API seeds sample authors and stories on first start. Demo accounts (password `agumagu123`):

| Email | Role |
| --- | --- |
| `reader@agumagu.test` | Free reader |
| `author@agumagu.test` | Author with published works and a draft |

Reset the sample data with `npm run seed` in `backend/` (this wipes every account and tale). Browse the database with `npm run db:studio`.

After changing `backend/prisma/schema.prisma`, run `npm run db:migrate -- --name what-changed` to create and apply a migration. The generated client lives in `backend/src/generated/` and is rebuilt on `npm install` and `npm run build`.

## Configuration

Copy `backend/.env.example` to `backend/.env`:

- `DATABASE_URL`: PostgreSQL connection string. The default matches `docker-compose.yml`: `postgresql://agumagu:agumagu@localhost:5544/agumagu`.
- `BETTER_AUTH_SECRET`: signs login sessions. Required in production (at least 32 random characters, e.g. `openssl rand -base64 32`); the API refuses to start without it.
- `PAYSTACK_SECRET_KEY`: leave empty to use the built-in mock checkout for donations, or set it to take real gifts through Paystack (initialize → hosted page → `/donate/thanks` → verify).

Set `API_ORIGIN` for the frontend if the API is not on `http://localhost:4400`.

## Accounts and sign-in

Sign-up, sign-in, sign-out and sessions are handled by [Better Auth](https://better-auth.com) (`backend/src/features/auth/auth.ts`), served at `/api/auth/*`. The reader's profile (role, bio) lives at `/api/account`.

- Passwords are hashed with scrypt in `Account` rows; sessions are `Session` rows, so signing out ends a session immediately.
- Sign-in and sign-up are limited to 5 attempts per minute per IP address; other auth routes to 100 per minute.
- Requests that carry the session cookie must come from `CLIENT_ORIGIN`, which blocks cross-site form posts.

## Production notes

- Rate limits are counted in memory per API instance, keyed by the client IP from `X-Forwarded-For`. Behind a load balancer or CDN, set `advanced.ipAddress.trustedProxies` in `auth.ts` to its addresses, or every visitor shares one limit. With more than one API instance, switch `rateLimit.storage` to `"database"` (this adds a `rateLimit` table).

- Point `DATABASE_URL` at a managed PostgreSQL and run `npm run db:deploy` on each release to apply migrations. The API never seeds sample data in production.
- Search folds dotted vowels (so `ozuzo` finds `Ọzụzọ`) in the API. Once the catalogue grows large, move it into Postgres with the `unaccent` extension and a trigram index.
- Covers go to Cloudflare R2 when the `R2_*` variables are set (see `backend/.env.example`), otherwise to `backend/uploads/`. Use R2 in production: local files are lost on redeploy and aren't shared between instances. Covers uploaded before R2 was switched on keep working from `/uploads/`.
- Donations are confirmed when the donor returns to `/donate/thanks`. Add a Paystack webhook so a gift still counts if the donor closes the tab before returning.
- The seeded stories are original placeholder texts. Have a native Igbo editor review them, or replace them with real submissions before launch.
