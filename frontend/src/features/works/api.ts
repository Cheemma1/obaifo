import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";
import type { ChapterPayload, Theme, WorkDetail, WorkSummary, WorkType } from "@/shared/types";

export interface WorkFilters {
  type?: WorkType;
  theme?: Theme;
  q?: string;
  featured?: boolean;
  author?: string;
  sort?: "new" | "popular";
  limit?: number;
}

function toQuery(filters: WorkFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const worksKeys = {
  list: (filters: WorkFilters) => ["works", "list", filters] as const,
  detail: (slug: string) => ["works", "detail", slug] as const,
  chapter: (slug: string, index: number) => ["works", "chapter", slug, index] as const,
};

export function useWorks(filters: WorkFilters = {}) {
  return useQuery({
    queryKey: worksKeys.list(filters),
    queryFn: () => api<{ items: WorkSummary[] }>(`/works${toQuery(filters)}`).then((r) => r.items),
    placeholderData: keepPreviousData,
  });
}

export function useWork(slug: string) {
  return useQuery({
    queryKey: worksKeys.detail(slug),
    queryFn: () => api<WorkDetail>(`/works/${encodeURIComponent(slug)}`),
  });
}

export function useChapter(slug: string, index: number) {
  return useQuery({
    queryKey: worksKeys.chapter(slug, index),
    queryFn: () => api<ChapterPayload>(`/works/${encodeURIComponent(slug)}/chapters/${index}`),
    staleTime: Infinity,
  });
}
