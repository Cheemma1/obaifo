"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, qs } from "./api";
import type { CommentRow, Donation, Insights, Live, Overview, Page, SessionUser, UserDetail, UserRow, WorkSummary } from "./types";

/** Live numbers refresh on their own while the page is open. */
const LIVE_MS = 15_000;

// ---------- Session ----------

export const useSession = () =>
  useQuery({
    queryKey: ["session"],
    queryFn: () => api<{ user: SessionUser | null }>("/account"),
    staleTime: 60_000,
  });

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      await api("/auth/sign-in/email", { method: "POST", body: input });
      return api<{ user: SessionUser | null }>("/account");
    },
    onSuccess: (session) => {
      qc.setQueryData(["session"], session);
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "session" });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>("/auth/sign-out", { method: "POST", body: {} }),
    onSuccess: () => {
      qc.setQueryData(["session"], { user: null });
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "session" });
    },
  });
}

// ---------- Reads ----------

export const useOverview = () =>
  useQuery({ queryKey: ["overview"], queryFn: () => api<Overview>("/admin/overview"), refetchInterval: LIVE_MS });

export const useInsights = () =>
  useQuery({ queryKey: ["insights"], queryFn: () => api<Insights>("/admin/insights"), refetchInterval: 60_000 });

export const useLive = () =>
  useQuery({ queryKey: ["live"], queryFn: () => api<Live>("/admin/live"), refetchInterval: LIVE_MS });

type Filters = Record<string, string | number | undefined>;

export const useUsers = (filters: Filters) =>
  useQuery({
    queryKey: ["users", filters],
    queryFn: () => api<Page<UserRow>>(`/admin/users${qs(filters)}`),
    placeholderData: keepPreviousData,
  });

export const useUser = (id: string) =>
  useQuery({ queryKey: ["user", id], queryFn: () => api<UserDetail>(`/admin/users/${id}`), refetchInterval: 30_000 });

export const useWorks = (filters: Filters) =>
  useQuery({
    queryKey: ["works", filters],
    queryFn: () => api<Page<WorkSummary>>(`/admin/works${qs(filters)}`),
    placeholderData: keepPreviousData,
  });

export const useComments = (filters: Filters) =>
  useQuery({
    queryKey: ["comments", filters],
    queryFn: () => api<Page<CommentRow>>(`/admin/comments${qs(filters)}`),
    placeholderData: keepPreviousData,
  });

export const useDonations = (filters: Filters) =>
  useQuery({
    queryKey: ["donations", filters],
    queryFn: () => api<Page<Donation> & { successKobo: number }>(`/admin/donations${qs(filters)}`),
    placeholderData: keepPreviousData,
  });

// ---------- Actions ----------

/** Any change can move numbers anywhere in the dashboard, so refresh every admin query after it. */
function useAction<TInput, TResult = unknown>(fn: (input: TInput) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "session" }),
  });
}

export const useUpdateUser = () =>
  useAction((v: { id: string; role?: "reader" | "author"; isAdmin?: boolean }) => {
    const { id, ...body } = v;
    return api<UserDetail>(`/admin/users/${id}`, { method: "PATCH", body });
  });

export const useSuspendUser = () =>
  useAction((v: { id: string; reason?: string }) =>
    api<UserDetail>(`/admin/users/${v.id}/suspend`, { method: "POST", body: { reason: v.reason } }),
  );

export const useUnsuspendUser = () =>
  useAction((id: string) => api<UserDetail>(`/admin/users/${id}/unsuspend`, { method: "POST", body: {} }));

export const useSignOutUser = () =>
  useAction((id: string) => api<void>(`/admin/users/${id}/sign-out`, { method: "POST", body: {} }));

export const useDeleteUser = () => useAction((id: string) => api<void>(`/admin/users/${id}`, { method: "DELETE" }));

export const useUpdateWork = () =>
  useAction((v: { id: string; featured?: boolean; status?: "draft" | "published" }) => {
    const { id, ...body } = v;
    return api<WorkSummary>(`/admin/works/${id}`, { method: "PATCH", body });
  });

export const useDeleteWork = () => useAction((id: string) => api<void>(`/admin/works/${id}`, { method: "DELETE" }));

export const useDeleteComment = () =>
  useAction((id: string) => api<void>(`/admin/comments/${id}`, { method: "DELETE" }));
