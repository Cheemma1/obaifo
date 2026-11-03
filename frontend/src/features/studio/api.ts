import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";
import type { WorkSummary } from "@/shared/types";

export interface DraftChapter {
  id?: string;
  title: string;
  body: string;
}

export interface StudioWork extends WorkSummary {
  chapters: Required<DraftChapter>[];
}

export const studioKeys = {
  list: ["studio", "works"] as const,
  detail: (id: string) => ["studio", "work", id] as const,
};

export function useStudioWorks(enabled: boolean) {
  return useQuery({
    queryKey: studioKeys.list,
    queryFn: () => api<{ items: WorkSummary[] }>("/studio/works").then((r) => r.items),
    enabled,
  });
}

export function useStudioWork(id: string | null) {
  return useQuery({
    queryKey: studioKeys.detail(id ?? "new"),
    queryFn: () => api<StudioWork>(`/studio/works/${id}`),
    enabled: !!id,
  });
}

/** `id` absent = create. The form is multipart so a cover image can ride along. */
export function useSaveWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id?: string; form: FormData }) =>
      api<StudioWork>(id ? `/studio/works/${id}` : "/studio/works", { method: id ? "PATCH" : "POST", body: form }),
    onSuccess: (work) => {
      qc.setQueryData(studioKeys.detail(work.id), work);
      qc.invalidateQueries({ queryKey: studioKeys.list });
      qc.invalidateQueries({ queryKey: ["works"] });
    },
  });
}

export function useDeleteWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/studio/works/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["studio"] });
      qc.invalidateQueries({ queryKey: ["works"] });
    },
  });
}

export function useParseManuscript() {
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return api<{ chapters: DraftChapter[] }>("/studio/manuscript", { method: "POST", body: form });
    },
  });
}
