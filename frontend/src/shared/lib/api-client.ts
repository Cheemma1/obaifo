export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
  }
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * All calls go to same-origin /api (proxied to Express by next.config.ts), so
 * the httpOnly session cookie rides along automatically.
 */
export async function api<T>(path: string, { body, headers, ...init }: Options = {}): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    ...init,
    headers: isForm || body === undefined ? headers : { "Content-Type": "application/json", ...headers },
    body: isForm ? (body as FormData) : body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Our API nests errors under `error`; Better Auth (/api/auth/*) returns them flat.
    const error = data?.error ?? data;
    const code = error?.code ?? (res.status === 429 ? "TOO_MANY_REQUESTS" : undefined);
    throw new ApiError(res.status, error?.message ?? "Something went wrong", code);
  }
  return data as T;
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";
