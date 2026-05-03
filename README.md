# coonlink-ManYerSuchAPita

Next.js middleware + 404 tracker: progressive IP ban for scanners/probers.

## How it works

- Probe paths and suspicious User-Agents are scored 0–100
- Rules load automatically from GitHub (updated without republishing)
- 5 hits → YouTube redirect
- 12 hits → 5h temp ban (KV TTL, auto-expires)
- Return after ban + 5 hits → permanent Cloudflare Firewall ban

## Setup

### 1. Environment variables

```env
CF_API_TOKEN=your_cloudflare_api_token
CF_ZONE_ID=your_zone_id
```

### 2. Config (`lib/guard.ts`)

```ts
import { createMemoryStore, createUpstashStore } from 'coonlink-manyersuchapita';
import { kv } from '@vercel/kv';

export const guardConfig = {
  store: process.env.NODE_ENV === 'production'
    ? createUpstashStore(kv)
    : createMemoryStore(),

  cfApiToken: process.env.CF_API_TOKEN,
  cfZoneId: process.env.CF_ZONE_ID,
};
```

### 3. Middleware (`middleware.ts`)

```ts
import { createMiddleware } from 'coonlink-manyersuchapita';
import { guardConfig } from './lib/guard';

export const { middleware, config } = createMiddleware(guardConfig);
```

### 4. 404 page (`app/not-found.tsx`)

```tsx
import { track404 } from 'coonlink-manyersuchapita';
import { guardConfig } from '@/lib/guard';

export default async function NotFound() {
  await track404(guardConfig);
  return <div>Not found</div>;
}
```

---

## CF IP Verification (optional)

Client-side script checks if the browser can reach Cloudflare's IP endpoint.
If blocked (VPN / extension hiding real IP) → redirect to YouTube.

### 1. Environment variables

```env
CF_IP_CHECK=1
CF_IP_CHECK_URL=https://ip-check-perf.radar.cloudflare.com
NEXT_PUBLIC_CF_IP_CHECK_URL=https://ip-check-perf.radar.cloudflare.com
```

### 2. Enable in config (`lib/guard.ts`)

```ts
export const guardConfig = {
  cfIpCheck: (Number(process.env.CF_IP_CHECK) || 0) as 0 | 1,
  cfIpCheckUrl: process.env.CF_IP_CHECK_URL,
};
```

### 3. Verify endpoint (`app/api/_guard/verify/route.ts`)

```ts
import { createVerifyHandler } from 'coonlink-manyersuchapita';
import { guardConfig } from '@/lib/guard';

export const POST = createVerifyHandler(guardConfig);
export const runtime = 'edge';
```

### 4. Client script (`app/layout.tsx`)

```tsx
import { IpCheckScript } from 'coonlink-manyersuchapita/client';

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
  );
}
```

### How it works

1. Page loads → `IpCheckScript` calls `CF_IP_CHECK_URL` in the browser
2. **Success** → real IP posted to `/api/_guard/verify` → stored in KV (1h TTL)
3. **Blocked** → posts `blocked: true` → next request redirects to YouTube
4. Session cookie `_gsid` (httpOnly) ties browser to KV record
