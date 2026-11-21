"use client";

/*
  Browser-side calls to the Salem Tamil Roots API (salemtamilroots_web_backend).

  Always same-origin (/api/...): on UAT nginx sends /api to the API, and in development
  next.config.ts rewrites it. Sign-in is an HttpOnly cookie the API sets, so no token is
  ever handled here. The X-STR-Client header lets the API accept that cookie for changes
  (other websites can't add it, which is what stops them acting as the customer).
*/
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

type Body = Record<string, unknown> | unknown[] | undefined;

export async function api<T>(path: string, init: { method?: string; body?: Body } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "X-STR-Client": "web",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK", "We couldn't reach Salem Tamil Roots. Check your connection and try again.");
  }

  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  const err = (json?.error ?? null) as { message?: string; detail?: string; fields?: Record<string, string> } | null;
  const nested = json?.data as Record<string, unknown> | undefined;
  const failed =
    !res.ok || json?.isSuccess === false || json?.success === false || (nested && typeof nested === "object" && nested.success === false);

  if (failed) {
    // Errors come as { error: { message: CODE, detail: text } } or { message } or { success:false, message }.
    const code = err?.message ?? (json?.message as string | undefined) ?? `HTTP_${res.status}`;
    const text = err?.detail ?? (json?.message as string | undefined) ?? (nested?.message as string | undefined) ?? code;
    throw new ApiError(res.status, code, text, err?.fields);
  }

  // Unwrap { data } and the occasional double wrap { data: { success, data } }.
  let data: unknown = json?.data ?? json;
  if (data && typeof data === "object" && !Array.isArray(data) && "success" in data && "data" in data) {
    data = (data as Record<string, unknown>).data;
  }
  return data as T;
}
