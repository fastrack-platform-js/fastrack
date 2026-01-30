export interface CreateHttpClientOptions {
  timeoutMs?: number;
  retries?: number;
}

/**
 * Per-call options: pass the current request's correlation ID so it is propagated
 * on the outbound request. Use singleton client and pass at request time.
 */
export interface HttpRequestOptions {
  correlationId?: string;
}

/**
 * Create an HTTP client with timeout and optional retries (idempotent only).
 * Uses native fetch (Node 18+). Keep a singleton instance; pass correlationId
 * at request time so it is propagated on each outbound call (e.g. from request.correlationId).
 */
export function createHttpClient(options: CreateHttpClientOptions = {}): {
  fetch(url: string | URL, init?: RequestInit, requestOptions?: HttpRequestOptions): Promise<Response>;
} {
  const { timeoutMs = 30_000, retries = 0 } = options;

  async function doFetch(
    url: string | URL,
    init?: RequestInit,
    requestOptions?: HttpRequestOptions,
    attempt = 0
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const headers = new Headers(init?.headers);
    if (requestOptions?.correlationId) {
      headers.set("x-correlation-id", requestOptions.correlationId);
    }
    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers,
      });
      clearTimeout(timeout);
      const method = (init?.method ?? "GET").toUpperCase();
      const isIdempotent = ["GET", "HEAD", "PUT", "DELETE", "OPTIONS", "TRACE"].includes(method);
      if (!res.ok && isIdempotent && attempt < retries) {
        return doFetch(url, init, requestOptions, attempt + 1);
      }
      return res;
    } catch (e) {
      clearTimeout(timeout);
      if (attempt < retries) {
        return doFetch(url, init, requestOptions, attempt + 1);
      }
      throw e;
    }
  }

  return {
    fetch: (url: string | URL, init?: RequestInit, requestOptions?: HttpRequestOptions) =>
      doFetch(url, init, requestOptions),
  };
}
