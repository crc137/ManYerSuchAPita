# coonlink-ManYerSuchAPita

Next.js middleware: instant perma-ban for IPs whose first request is 4xx.

## How it works

- Legitimate users land on a real page first (200) → marked as **seen**
- Bots/scanners immediately probe non-existent paths → their first request is 4xx → **permanent ban**
- Known exploit paths (`.env`, `wp-login.php`, etc.) are banned instantly in the middleware, no 4xx page needed
- Optional Cloudflare Firewall integration for network-level blocking

## Setup

### 1. Config (`lib/guard.ts`)

```ts
import { createMemoryStore, createUpstashStore } from "coonlink-manyersuchapita"
import { kv } from "@vercel/kv"

export const guardConfig = {
  store: process.env.NODE_ENV === 'production'
    ? createUpstashStore(kv)
    : createMemoryStore(),

  // optional: Cloudflare perma-ban (account-level blocks all domains in the account)
  cfApiToken:   process.env.CF_API_TOKEN,
  cfAccountId:  process.env.CF_ACCOUNT_ID,   // preferred — account-wide ban
  cfZoneId:     process.env.CF_ZONE_ID,       // fallback — single domain only
};
```

### 2. Middleware (`middleware.ts`)

```ts
import { createMiddleware } from "coonlink-manyersuchapita"
import { guardConfig } from "./lib/guard"

export const { middleware, config } = createMiddleware(guardConfig);
```

### 3. Success tracking (`app/layout.tsx`)

Call `trackSuccess` from any layout or page that renders successfully:

```tsx
import { trackSuccess } from "coonlink-manyersuchapita"
import { guardConfig } from "@/lib/guard"

export default async function Layout({ children }) {
  await trackSuccess(guardConfig);
  return <html><body>{children}</body></html>;
}
```

### 4. Failure tracking (`app/not-found.tsx`)

```tsx
import { trackFail } from "coonlink-manyersuchapita"
import { guardConfig } from "@/lib/guard"

export default async function NotFound() {
  await trackFail(guardConfig);
  return <div>Not found</div>;
}
```

That's it. If an IP calls `trackFail` before ever calling `trackSuccess`, they are permanently banned.
