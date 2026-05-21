/*
✨ CoonDev • https://dev.coonlink.com/

 ▄█▄    ████▄ ████▄    ▄   ██▄   ▄███▄      ▄
 █▀ ▀▄  █   █ █   █     █  █  █  █▀   ▀      █
 █   ▀  █   █ █   █ ██   █ █   █ ██▄▄   █     █
 █▄  ▄▀ ▀████ ▀████ █ █  █ █  █  █▄   ▄▀ █    █
 ▀███▀              █  █ █ ███▀  ▀███▀    █  █
                    █   ██                 █▐
                                           ▐
*/

import type { BanRecord, BanTier, GuardConfig, ScannerStore } from "./types.js"

const TIER_TTL: Record<BanTier, number> = { soft: 5 * 60, temp: 24 * 3600, perm: 365 * 86400 };

const SEEN_TTL = 86400 * 30;

export function banKey(ip: string)  { return `guard:ban:${ip}`; }
export function seenKey(ip: string) { return `guard:seen:${ip}`; }

export async function isBanned(ip: string, store: ScannerStore): Promise<boolean> {
  return (await store.get(banKey(ip))) !== null;
}

export async function getBanRecord(ip: string, store: ScannerStore): Promise<BanRecord | null> {
  const raw = await store.get(banKey(ip));
  if (!raw) return null;
  try { return JSON.parse(raw) as BanRecord; }
  catch { return { reason: 'legacy ban', createdAt: 0, source: 'unknown', tier: 'perm' }; }
}

export async function hasSeen(ip: string, store: ScannerStore): Promise<boolean> {
  return (await store.get(seenKey(ip))) !== null;
}

export async function markSeen(ip: string, store: ScannerStore): Promise<void> {
  await store.set(seenKey(ip), '1', SEEN_TTL);
}

export async function permBan(
  ip: string,
  reason: string,
  config: GuardConfig,
  source = 'middleware',
): Promise<void> {
  const record: BanRecord = { reason, createdAt: Date.now(), source, tier: 'perm' };
  await config.store.set(banKey(ip), JSON.stringify(record), TIER_TTL.perm);
  await cfBan(ip, reason, config);
}

export async function unban(ip: string, store: ScannerStore): Promise<void> {
  await Promise.all([
    store.del(banKey(ip)),
    store.del(`guard:cfban:${ip}`),
  ]);
}

async function cfBan(ip: string, notes: string, config: GuardConfig): Promise<void> {
  if (!config.cfApiToken) return;
  if (!config.cfAccountId && !config.cfZoneId) return;

  const already = await config.store.get(`guard:cfban:${ip}`);
  if (already) return;

  const endpoint = config.cfAccountId ? `https://api.cloudflare.com/client/v4/accounts/${config.cfAccountId}/firewall/access_rules/rules` : `https://api.cloudflare.com/client/v4/zones/${config.cfZoneId}/firewall/access_rules/rules`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.cfApiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode: 'block',
      configuration: { target: 'ip', value: ip },
      notes,
    }),
  });

  const json = (await res.json()) as { success: boolean };
  if (json.success) {
    await config.store.set(`guard:cfban:${ip}`, '1', TIER_TTL.perm);
  }
}
