import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";
import type { WorkSummary } from "@/shared/types";

export interface AuthorCard {
  id: string;
  name: string;
  bio: string;
  avatarHue: number;
  workCount: number;
  totalReads: number;
  joinedAt: string;
}

export function useAuthors() {
  return useQuery({
    queryKey: ["authors"],
    queryFn: () => api<{ items: AuthorCard[] }>("/authors").then((r) => r.items),
  });
}

export function useAuthor(id: string) {
  return useQuery({
    queryKey: ["authors", id],
    queryFn: () => api<AuthorCard & { works: WorkSummary[] }>(`/authors/${id}`),
  });
}
