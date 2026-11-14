// FILE: lib/api-client.ts
// The single way the browser calls our own API. On failure it throws an ApiError (code + message).

export class ApiError extends Error {
  status: number;
  code: string;
  data: Record<string, unknown>;

  constructor(status: number, code: string, message: string, data: Record<string, unknown> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

type Options = Omit<RequestInit, "body"> & { json?: unknown };

export async function api<T = unknown>(url: string, options: Options = {}): Promise<T> {
  const { json, headers, ...rest } = options;

  const res = await fetch(url, {
    ...rest,
    cache: "no-store",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers as Record<string, string> | undefined),
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const body = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(
      res.status,
      String(body.code ?? body.error ?? "ERROR"),
      String(body.message ?? "Something went wrong. Please try again."),
      body
    );
  }

  return data as T;
}

export function errorMessage(e: unknown, fallback = "Something went wrong. Please try again."): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}
