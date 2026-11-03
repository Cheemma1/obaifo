import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";
import type { Role, Session } from "@/shared/types";

export const sessionKey = ["session"] as const;

/** The signed-in reader's profile (our API), backed by the Better Auth session cookie. */
const fetchSession = () => api<Session>("/account");

export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
  });
}

/** Anything gated on who you are (access, library, studio) must refetch after auth changes. */
function useAuthMutation<TInput>(fn: (input: TInput) => Promise<Session>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (session) => {
      qc.setQueryData(sessionKey, session);
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "session" });
    },
  });
}

/** Sign-up and sign-in go through Better Auth (/api/auth/*), which sets the session cookie. */
export const useLogin = () =>
  useAuthMutation(async (input: { email: string; password: string }) => {
    await api("/auth/sign-in/email", { method: "POST", body: input });
    return fetchSession();
  });

export const useRegister = () =>
  useAuthMutation(
    async (input: {
      name: string;
      email: string;
      password: string;
      role: Role;
    }) => {
      await api("/auth/sign-up/email", { method: "POST", body: input });
      return fetchSession();
    },
  );

export const useBecomeAuthor = () =>
  useAuthMutation(() =>
    api<Session>("/account/become-author", { method: "POST" }),
  );

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>("/auth/sign-out", { method: "POST", body: {} }),
    onSuccess: () => {
      qc.setQueryData<Session>(sessionKey, { user: null });
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "session" });
    },
  });
}

export const useUpdateProfile = () =>
  useAuthMutation((input: { name?: string; bio?: string }) =>
    api<Session>("/account", { method: "PATCH", body: input }),
  );

/** Always succeeds for well-formed emails, so it never reveals who has an account. */
export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: (input: { email: string; locale: string }) =>
      api("/auth/request-password-reset", {
        method: "POST",
        body: {
          email: input.email,
          redirectTo: `/${input.locale}/reset-password`,
        },
      }),
  });

/** Sets the new password. Every session for the account ends, so the reader signs in afresh. */
export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { token: string; newPassword: string }) =>
      api("/auth/reset-password", { method: "POST", body: input }),
    onSuccess: () => {
      qc.setQueryData<Session>(sessionKey, { user: null });
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "session" });
    },
  });
}
