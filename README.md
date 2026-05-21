# coonlink-ManYerSuchAPita

Next.js middleware: instant perma-ban for IPs whose first request is 4xx.

## How it works

- Legitimate users land on a real page first (200) → marked as **seen**
- Bots/scanners immediately probe non-existent paths → their first request is 4xx → **permanent ban**
- ~170 known exploit paths (`.env`, `wp-login`, webshells, etc.) are banned instantly in the middleware — no 4xx page needed
- Whitelisted IPs are never banned regardless of what they request
- Optional Cloudflare Firewall integration pushes the ban to the network level

## Setup

### 1. Environment variables (`.env`)

```env
# Cloudflare — account-level bans all your domains; zone-level bans one
CF_API_TOKEN=
CF_ACCOUNT_ID=
CF_ZONE_ID=

# Comma-separated IPs to never ban (your own IPs, office, etc.)
GUARD_ALLOWED_IPS=
```

### 2. Config (`lib/guard.ts`)

```ts
import { createMemoryStore, createUpstashStore } from "coonlink-manyersuchapita"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const guardConfig = {
  store: process.env.NODE_ENV === "production"
    ? createUpstashStore(redis)
    : createMemoryStore(),

  allowedIps: process.env.GUARD_ALLOWED_IPS
    ?.split(",").map(s => s.trim()).filter(Boolean),

  cfApiToken:  process.env.CF_API_TOKEN,
  cfAccountId: process.env.CF_ACCOUNT_ID,  // preferred — account-wide ban
  cfZoneId:    process.env.CF_ZONE_ID,     // fallback — single domain only
};
```

> IPv6 addresses in `allowedIps` are normalized automatically — paste the raw IP, no need to convert to `/64` notation.

### 3. Middleware (`middleware.ts`)

```ts
import { createMiddleware } from "coonlink-manyersuchapita"
import { guardConfig } from "./lib/guard"

export const { middleware, config } = createMiddleware(guardConfig)
```

### 4. Success tracking (`app/layout.tsx`)

Call `trackSuccess` from the root layout so every real page visit marks the IP as legitimate:

```tsx
import { trackSuccess } from "coonlink-manyersuchapita"
import { guardConfig } from "@/lib/guard"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await trackSuccess(guardConfig)
  return <html><body>{children}</body></html>
}
```

### 5. Failure tracking (`app/not-found.tsx`)

```tsx
import { trackFail } from "coonlink-manyersuchapita"
import { guardConfig } from "@/lib/guard"

export default async function NotFound() {
  await trackFail(guardConfig)
  return <div>Not found</div>
}
```

If `trackFail` is called before `trackSuccess` has ever run for that IP, they are permanently banned.

---

## API

| Export | Description |
|---|---|
| `createMiddleware(config)` | Returns `{ middleware, config }` for `middleware.ts` |
| `trackSuccess(config)` | Call from layout/page on successful render — marks IP as seen |
| `trackFail(config)` | Call from `not-found.tsx` — bans IP if never seen before |
| `isBanned(ip, store)` | Check if an IP is permanently banned |
| `permBan(ip, reason, config)` | Manually ban an IP (local store + Cloudflare) |
| `normalizeIp(ip)` | Normalize raw IP — IPv6 collapsed to `/64` subnet |
| `createMemoryStore()` | In-process store for development |
| `createUpstashStore(client)` | Upstash Redis store for production |


## GuardConfig

| Field | Type | Description |
|---|---|---|
| `store` | `ScannerStore` | KV store — use `createUpstashStore` in prod |
| `allowedIps` | `string[]` | IPs that are never banned |
| `cfApiToken` | `string` | Cloudflare API token |
| `cfAccountId` | `string` | Account ID — bans across all domains (preferred) |
| `cfZoneId` | `string` | Zone ID — bans one domain only (fallback) |
