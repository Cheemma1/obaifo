import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/api";
import { api } from "@/shared/lib/api-client";
import type { WorkSummary } from "@/shared/types";

export interface LibraryPayload {
  reading: { work: WorkSummary; chapterIndex: number; percent: number; updatedAt: string }[];
}

export const libraryKey = ["library"] as const;

export function useLibrary() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: libraryKey,
    queryFn: () => api<LibraryPayload>("/library"),
    enabled: !!session?.user,
  });
}

export function useSaveProgress() {
  return useMutation({
    mutationFn: (input: { workId: string; chapterIndex: number; percent: number }) =>
      api<void>("/library/progress", { method: "PUT", body: input }),
  });
}
