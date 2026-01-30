# @fastrack/starter-http

HTTP client wrapper (fetch/undici, Node 18+): timeouts, retries for idempotent methods only, correlation ID propagation. No ad-hoc HTTP clients (design rule).

Use a **singleton** client; pass the current request's correlation ID at **request time** so it is propagated on outbound calls:

```ts
// In a route handler (starter-web sets request.correlationId)
const res = await app.httpClient.fetch("https://api.example.com/data", undefined, {
  correlationId: request.correlationId,
});
```

See [docs/starters.md](../../docs/starters.md).
