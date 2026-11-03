"use client";

import { ApiError } from "@/shared/lib/api-client";
import { useI18n } from "./provider";

/** Turns an API error into text in the reader's language, falling back to the server's message. */
export function useErrorText() {
  const { t } = useI18n();
  return (error: unknown) => {
    if (error instanceof ApiError && error.code && t.errors[error.code]) return t.errors[error.code]!;
    return error instanceof Error ? error.message : t.common.somethingWrong;
  };
}
