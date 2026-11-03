export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
  }
}

export const badRequest = (msg: string, code?: string) => new HttpError(400, msg, code);
export const unauthorized = (msg = "Please sign in to continue") => new HttpError(401, msg, "UNAUTHORIZED");
export const forbidden = (msg = "You do not have access to this", code = "FORBIDDEN") => new HttpError(403, msg, code);
export const notFound = (msg = "Not found") => new HttpError(404, msg, "NOT_FOUND");
export const conflict = (msg: string) => new HttpError(409, msg, "CONFLICT");
