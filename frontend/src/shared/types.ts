export type Role = "reader" | "author";
export type WorkType = "short" | "long";

/** Every work is an ifo (Igbo folktale); the theme is the kind of tale. Mirrors the API. */
export const THEMES = ["tortoise", "animals", "origins", "spirits", "heroes", "wisdom", "song"] as const;
export type Theme = (typeof THEMES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio: string;
  avatarHue: number;
  createdAt: string;
}

export interface Session {
  user: User | null;
}

export interface AuthorRef {
  id: string;
  name: string;
  avatarHue: number;
}

export interface WorkSummary {
  id: string;
  slug: string;
  /** Always Igbo — never translated, in either interface language. */
  title: string;
  type: WorkType;
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
  author: AuthorRef | null;
}

export interface WorkDetail extends WorkSummary {
  chapters: { index: number; title: string; words: number }[];
}

export interface ChapterPayload {
  work: WorkSummary;
  index: number;
  total: number;
  chapter: { title: string; body: string };
  hasNext: boolean;
  hasPrev: boolean;
}
