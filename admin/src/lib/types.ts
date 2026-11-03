/** Shapes returned by /api/admin/* (backend/src/features/admin/admin.service.ts). */

export type Role = "reader" | "author";
export type Theme = "tortoise" | "animals" | "origins" | "spirits" | "heroes" | "wisdom" | "song";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isAdmin: boolean;
  avatarHue: number;
}

export interface Page<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface PersonRef {
  id: string;
  name: string;
  email?: string;
  avatarHue: number;
}

export interface WorkSummary {
  id: string;
  slug: string;
  title: string;
  type: "short" | "long";
  theme: Theme;
  synopsis: string;
  coverUrl: string | null;
  status: "draft" | "published";
  featured: boolean;
  reads: number;
  likes: number;
  comments: number;
  chapterCount: number;
  wordCount: number;
  minutes: number;
  createdAt: string;
  updatedAt: string;
  author: PersonRef | null;
}

export interface Overview {
  users: { total: number; authors: number; admins: number; suspended: number; new7d: number };
  works: { published: number; drafts: number; chapters: number; reads: number };
  /** Days run on West Africa Time. Dated counts only go back to trackedSince; allTime is older. */
  reads: {
    today: number;
    month: number;
    year: number;
    allTime: number;
    trackedSince: string | null;
    perDay: { day: string; count: number }[];
  };
  engagement: { likes: number; comments: number; comments7d: number };
  donations: { count: number; totalKobo: number; count30d: number; totalKobo30d: number };
  live: { online: number; reading: number; signedIn: number; guests: number };
  signups: { day: string; count: number }[];
  topWorks: WorkSummary[];
}

export interface LiveWork {
  id: string;
  slug: string;
  title: string;
  author: string;
  chapterCount: number;
}

export interface LiveVisitor {
  visitorId: string;
  user: PersonRef | null;
  path: string;
  work: LiveWork | null;
  chapterIndex: number | null;
  startedAt: string;
  lastSeen: string;
}

export interface Live {
  online: number;
  reading: number;
  tales: { work: LiveWork; readers: number }[];
  visitors: LiveVisitor[];
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isAdmin: boolean;
  avatarHue: number;
  suspendedAt: string | null;
  suspendReason: string | null;
  createdAt: string;
  _count: { works: number; comments: number; likes: number };
}

export interface Donation {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  reference: string;
  amountKobo: number;
  provider: "mock" | "paystack";
  status: "pending" | "success" | "failed";
  createdAt: string;
}

export interface UserDetail extends UserRow {
  bio: string;
  emailVerified: boolean;
  updatedAt: string;
  sessions: { id: string; ipAddress: string | null; userAgent: string | null; createdAt: string; updatedAt: string }[];
  online: boolean;
  lastSeen: string | null;
  nowReading: { slug: string; title: string; chapterIndex: number | null } | null;
  works: WorkSummary[];
  comments: { id: string; body: string; createdAt: string; work: { slug: string; title: string } }[];
  progress: { id: string; chapterIndex: number; percent: number; updatedAt: string; work: { slug: string; title: string } }[];
  donations: Donation[];
}

export interface CommentRow {
  id: string;
  body: string;
  createdAt: string;
  user: PersonRef;
  work: { id: string; slug: string; title: string };
}

/** GET /api/admin/insights (backend/src/features/admin/insights.service.ts). */
export interface Change {
  now: number;
  before: number;
  /** Percent change on the previous period, or null when there isn't a fair comparison yet. */
  change: number | null;
}

export type TaleVerdict = "new" | "unread" | "losing" | "feature" | "steady";
export type KindAdvice = "write-more" | "missing" | "enough" | "steady";

export interface TaleInsight {
  id: string;
  slug: string;
  title: string;
  theme: Theme;
  featured: boolean;
  author: { id: string; name: string } | null;
  chapters: number;
  publishedAt: string;
  starts: number;
  startsChange: number | null;
  perChapter: number[];
  reachRate: number | null;
  dropAfter: number | null;
  signedIn: number;
  finishRate: number | null;
  likesPer100: number | null;
  reads: number;
  comments: number;
  verdict: TaleVerdict;
}

export interface Insights {
  trackedSince: string | null;
  growth: {
    hasLastWeek: boolean;
    visitors: Change;
    readers: Change;
    returning: { now: number; share: number | null };
    reads: Change;
    signups: Change;
    days: { day: string; visitors: number; readers: number; reads: number }[];
  };
  attention: {
    staleDrafts: {
      count: number;
      items: { id: string; title: string; updatedAt: string; author: { id: string; name: string; email: string }; _count: { chapters: number } }[];
    };
    unreadTales: { id: string; title: string; author: { id: string; name: string } | null }[];
    losingTales: { id: string; title: string; dropAfter: number | null; reachRate: number | null }[];
    newComments: { count: number; latest: { id: string; body: string; createdAt: string; user: { id: string; name: string }; work: { title: string } }[] };
    stuckPayments: number;
  };
  tales: TaleInsight[];
  kinds: {
    basis: "30d" | "allTime";
    avgPerTale: number;
    items: { theme: Theme; tales: number; demand: number; perTale: number; share: number; ratio: number | null; advice: KindAdvice }[];
  };
  archive: { months: { month: string; published: number }[]; storytellers: number; activeStorytellers: number; drafts: number };
  support: { kobo30d: number; gifts30d: number; change: number | null };
}
