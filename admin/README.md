# Ọbaifo Admin

A separate Next.js app for running Ọbaifo. It talks only to `/api/admin/*` on the API (`backend/src/features/admin/`), and every one of those routes rejects anyone who isn't an admin.

| Page | What you can do |
| --- | --- |
| **Overview** | Four questions, each answered in a sentence with the data under it: **Is reading growing?** (readers, returning readers, tales started and sign-ups vs last week, 30-day chart) · **What needs your attention?** (tales losing readers, unread tales, stalled drafts with the storyteller's email, new comments, stuck payments) · **Which tales are working?** (starts, how far readers get chapter by chapter, finish rate, likes per 100 reads, and a "what to do" verdict with a one-click Feature) · **What should storytellers write next?** (reads per tale for each kind of tale, and which kinds to ask for) · **Is the archive growing?** (tales published per month, active storytellers, donations) |
| **Live readers** | Everyone with the site open in the last 75 seconds, signed in or guest, with the tale and chapter each one is reading |
| **Users** | Search and filter accounts. Open one to see their tales, comments, reading history, devices and donations, and to make them a storyteller or admin, sign them out everywhere, **suspend**, or **delete** them |
| **Tales** | Every tale, published or draft. Feature or unfeature it, unpublish it, or **delete** it |
| **Comments** | Every comment, searchable. Delete any of them |
| **Donations** | Every gift, with filters and totals |

Live numbers refresh every 15 seconds.

## Running it

```bash
cd admin && npm install && npm run dev
```

Open http://localhost:3500. The API must be running (see the root README). Like the reader site, this app proxies `/api/*` to the API, so the session cookie stays first-party.

## Becoming an admin

Admin can't be chosen at sign-up. Create a normal account on the reader site, then in `backend/`:

```bash
npm run admin:grant -- you@example.com            # make an admin
npm run admin:grant -- you@example.com --revoke   # remove admin
```

Once you're an admin, you can also make other people admins from their user page.

## How it works

- **Live readers.** Every open tab on the reader site sends a heartbeat to `POST /api/presence` every 30 seconds while it's visible (`frontend/src/shared/providers/presence.tsx`). The heartbeat carries a random per-browser id, the page path, and the tale and chapter when the reader is open. A tab counts as online for 75 seconds after its last heartbeat. Heartbeats older than a day are deleted.
- **Reads and visits.** Every chapter open is saved as a dated `ReadEvent`; opening chapter 1 is a "read" and also adds to the tale's all-time total. Each browser with the site open adds one `VisitorDay` row per day, marked when it read a tale, which gives readers per week and returning readers. Days run on West Africa Time. This history starts when it was added, so week-on-week comparisons appear once two full weeks are recorded, and the page says so until then.
- **Suspending** ends every session the account has, blocks sign-in (error code `SUSPENDED`, shown in both languages on the site), and makes the API treat the account as signed out. Their tales stay up; unpublish or delete them separately if needed.
- **Deleting a user** also deletes their tales, chapters, likes, comments, reading progress and cover images. Donation records stay, unlinked from the account.
- An admin can't suspend, delete or un-admin their own account, so the last admin can't lock everyone out.

## Configuration

- `API_ORIGIN`: where the API runs (default `http://localhost:4400`).
- `NEXT_PUBLIC_SITE_URL`: the public reader site, for "open on site" links (default `http://localhost:3400`).
- On the API, set `ADMIN_ORIGIN` to this app's public origin (default `http://localhost:3500`) so it may sign in and send the session cookie.

In production, put the admin on its own domain (for example `admin.obaifo.com`).
