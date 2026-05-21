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

import { withLock } from "./lock.js"
import type { BanRecord, BanTier, GuardConfig, ScannerStore } from "./types.js"

const TIER_TTL: Record<BanTier, number> = {
  soft: 5 * 60,
  temp: 24 * 3600,
  perm: 365 * 86400,
};

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

export async function tempBan(
  ip: string,
  reason: string,
  config: GuardConfig,
  source = 'middleware',
): Promise<void> {
  const record: BanRecord = { reason, createdAt: Date.now(), source, tier: 'temp' };
  await config.store.set(banKey(ip), JSON.stringify(record), TIER_TTL.temp);
  await cfBan(ip, reason, config);
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

export async function unban(ip: string, config: GuardConfig): Promise<void> {
  const ruleId = await config.store.get(`guard:cfban:${ip}`);
  await Promise.all([
    config.store.del(banKey(ip)),
    config.store.del(`guard:cfban:${ip}`),
    ruleId ? cfUnban(ruleId, config) : Promise.resolve(),
  ]);
}

async function cfBan(ip: string, notes: string, config: GuardConfig): Promise<void> {
  if (!config.cfApiToken) return;
  if (!config.cfAccountId && !config.cfZoneId) return;

  const endpoint = config.cfAccountId
    ? `https://api.cloudflare.com/client/v4/accounts/${config.cfAccountId}/firewall/access_rules/rules`
    : `https://api.cloudflare.com/client/v4/zones/${config.cfZoneId}/firewall/access_rules/rules`;

  const doWork = async () => {
    const already = await config.store.get(`guard:cfban:${ip}`);
    if (already) return;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.cfApiToken!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'block',
        configuration: { target: 'ip', value: ip },
        notes,
      }),
    });

    const json = (await res.json()) as { success: boolean; result?: { id: string } };
    if (json.success && json.result?.id) {
      await config.store.set(`guard:cfban:${ip}`, json.result.id, TIER_TTL.perm);
    }
  };

  if (config.redis) {
    await withLock(`guard:cfban-lock:${ip}`, config.redis, doWork, undefined);
  } else {
    await doWork();
  }
}

async function cfUnban(ruleId: string, config: GuardConfig): Promise<void> {
  if (!config.cfApiToken) return;
  if (!config.cfAccountId && !config.cfZoneId) return;

  const endpoint = config.cfAccountId
    ? `https://api.cloudflare.com/client/v4/accounts/${config.cfAccountId}/firewall/access_rules/rules/${ruleId}`
    : `https://api.cloudflare.com/client/v4/zones/${config.cfZoneId}/firewall/access_rules/rules/${ruleId}`;

  await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${config.cfApiToken}`,
      'Content-Type': 'application/json',
    },
  });
}
