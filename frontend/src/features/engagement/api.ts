import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/api";
import { api } from "@/shared/lib/api-client";
import type { AuthorRef } from "@/shared/types";

export interface LikeState {
  likes: number;
  liked: boolean;
}

export interface TaleComment {
  id: string;
  body: string;
  createdAt: string;
  user: AuthorRef | null;
  isWorkAuthor: boolean;
}

export const engagementKeys = {
  likes: (slug: string) => ["engagement", "likes", slug] as const,
  comments: (slug: string) => ["engagement", "comments", slug] as const,
};

export function useLikes(slug: string) {
  const { data: session } = useSession();
  return useQuery({
    // Keyed on the viewer so "liked" refreshes after sign-in/out.
    queryKey: [...engagementKeys.likes(slug), session?.user?.id ?? "anon"],
    queryFn: () => api<LikeState>(`/works/${encodeURIComponent(slug)}/likes`),
  });
}

/** Optimistic: the heart fills immediately and rolls back if the request fails. */
export function useToggleLike(slug: string) {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const key = [...engagementKeys.likes(slug), session?.user?.id ?? "anon"];

  return useMutation({
    mutationFn: (liked: boolean) => api<LikeState>(`/works/${encodeURIComponent(slug)}/likes`, { method: "PUT", body: { liked } }),
    onMutate: async (liked) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<LikeState>(key);
      if (previous) qc.setQueryData<LikeState>(key, { liked, likes: previous.likes + (liked ? 1 : -1) });
      return { previous };
    },
    onError: (_err, _liked, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSuccess: (state) => qc.setQueryData(key, state),
  });
}

export function useComments(slug: string) {
  return useQuery({
    queryKey: engagementKeys.comments(slug),
    queryFn: () => api<{ items: TaleComment[] }>(`/works/${encodeURIComponent(slug)}/comments`).then((r) => r.items),
  });
}

export function useAddComment(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api<TaleComment>(`/works/${encodeURIComponent(slug)}/comments`, { method: "POST", body: { body } }),
    onSuccess: (comment) => {
      qc.setQueryData<TaleComment[]>(engagementKeys.comments(slug), (prev) => [comment, ...(prev ?? [])]);
    },
  });
}

export function useDeleteComment(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/comments/${id}`, { method: "DELETE" }),
    onSuccess: (_void, id) => {
      qc.setQueryData<TaleComment[]>(engagementKeys.comments(slug), (prev) => prev?.filter((c) => c.id !== id));
    },
  });
}
