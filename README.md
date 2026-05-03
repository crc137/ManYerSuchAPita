# coonlink-ManYerSuchAPita

Next.js middleware + 404 tracker: progressive IP ban for scanners/probers.


## Usage

### 1. Create config (`lib/guard.ts`)

```ts
import { createMemoryStore, createUpstashStore } from 'coonlink-ManYerSuchAPita';
import { kv } from '@vercel/kv';

export const guardConfig = {
  store: process.env.NODE_ENV === 'production'
    ? createUpstashStore(kv)
    : createMemoryStore(),

  cfApiToken: process.env.CF_API_TOKEN,
  cfZoneId: process.env.CF_ZONE_ID,
};
```

### 2. Middleware (`middleware.ts`)

```ts
import { createMiddleware } from 'coonlink-ManYerSuchAPita';
import { guardConfig } from './lib/guard';

export const { middleware, config } = createMiddleware(guardConfig);
```

### 3. 404 page (`app/not-found.tsx`)

```ts
import { track404 } from 'coonlink-ManYerSuchAPita';
import { guardConfig } from '@/lib/guard';

export default async function NotFound() {
  await track404(guardConfig);
  return <div>Page not found</div>;
}
```

### 4. Environment variables

```env
CF_API_TOKEN=your_cloudflare_api_token
CF_ZONE_ID=your_zone_id

# CF IP verification (optional)
CF_IP_CHECK=1
CF_IP_CHECK_URL=https://ip-check-perf.radar.cloudflare.com
NEXT_PUBLIC_CF_IP_CHECK_URL=https://ip-check-perf.radar.cloudflare.com
```

## How it works

- Detects probe paths in middleware
- Tracks any 404 via `track404()`
- 5 hits → YouTube redirect
- 12 hits → 5h temp ban (KV with TTL, auto-expires)
- Return after ban + 5 hits → permanent CF Firewall ban

Patterns are intentionally conservative to avoid false positives.
## CF IP Verification (cfIpCheck)

When Cloudflare proxy is active, a client-side script calls `CF_IP_CHECK_URL`
to verify the real IP is reachable. If the URL is blocked by an extension or
VPN that hides the real IP from Cloudflare → user is redirected to YouTube.

### Setup

**`.env.local`**
```env
CF_IP_CHECK=1
CF_IP_CHECK_URL=https://ip-check-perf.radar.cloudflare.com
NEXT_PUBLIC_CF_IP_CHECK_URL=https://ip-check-perf.radar.cloudflare.com
```

**`lib/guard.ts`** — enable the flag:
```ts
export const guardConfig = {
  store: createUpstashStore(kv),
  cfIpCheck: (Number(process.env.CF_IP_CHECK) || 0) as 0 | 1,
  cfIpCheckUrl: process.env.CF_IP_CHECK_URL,
}
```

**`app/api/_guard/verify/route.ts`** — mount the verify endpoint:
```ts
import { createVerifyHandler } from 'coonlink-ManYerSuchAPita'
import { guardConfig } from '@/lib/guard'

export const POST = createVerifyHandler(guardConfig)
export const runtime = 'edge'
```

**`app/layout.tsx`** — add the client script:
```tsx
import { IpCheckScript } from 'coonlink-ManYerSuchAPita/client'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NEXT_PUBLIC_CF_IP_CHECK_URL && (
          <IpCheckScript cfIpCheckUrl={process.env.NEXT_PUBLIC_CF_IP_CHECK_URL} />
        )}
      </body>
    </html>
  )
}
```

### How it works

1. Page loads → `IpCheckScript` calls `CF_IP_CHECK_URL` in the browser
2. **Success** → gets real IP, posts to `/api/_guard/verify` → stored in KV (1h TTL)
3. **Blocked** (extension / VPN hiding IP from CF) → posts `blocked: true`
4. Next request → middleware reads session cookie → checks KV → if `blocked` → YouTube
5. Session stored in KV with 1h TTL, cookie `_gsid` is httpOnly

`cfIpCheck: 0` — feature completely disabled, no overhead.
