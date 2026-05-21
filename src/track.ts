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

import { headers } from "next/headers"
import { exactIp, normalizeIp } from "./ip.js"
import { hasSeen, markSeen, permBan, tempBan } from "./ban.js"
import { isInChallenge, setChallenge } from "./challenge.js"
import { classifyProbe } from "./probe.js"
import type { GuardConfig } from "./types.js"

export type TrackResult = 'ok' | 'banned' | 'challenged';

async function getIps(): Promise<{ exact: string; subnet: string } | null> {
  const h = await headers();
  const raw =
    h.get('cf-connecting-ip') ??
    h.get('x-forwarded-for')?.split(',')[0].trim() ??
    null;
  if (!raw) return null;
  return { exact: exactIp(raw), subnet: normalizeIp(raw) };
}

function isAllowed(exact: string, config: GuardConfig): boolean {
  return (config.allowedIps ?? []).some(a =>
    a.includes(':') ? exactIp(a) === exact : a === exact
  );
}

export async function trackSuccess(config: GuardConfig): Promise<void> {
  const ips = await getIps();
  if (!ips) return;
  if (isAllowed(ips.exact, config)) return;

  if (!await hasSeen(ips.exact, config.store)) {
    await markSeen(ips.exact, config.store);
  }
}

export async function trackFail(config: GuardConfig): Promise<TrackResult> {
  const ips = await getIps();
  if (!ips) return 'ok';
  if (isAllowed(ips.exact, config)) return 'ok';

  if (!await hasSeen(ips.exact, config.store)) {
    const h = await headers();
    const pathname = h.get('x-pathname') ?? h.get('x-invoke-path') ?? '';
    const probe = classifyProbe(pathname);

    if (probe === 'instant') {
      await permBan(ips.subnet, `Instant ban: ${pathname}`, config, 'probe');
      return 'banned';
    }
    if (probe === 'high') {
      await tempBan(ips.subnet, `Probe path: ${pathname}`, config, 'probe');
      return 'banned';
    }

    if (config.challengeMode) {
      if (!await isInChallenge(ips.exact, config.store)) {
        await setChallenge(ips.exact, config.store);
      }
      return 'challenged';
    }
    await markSeen(ips.exact, config.store);
  }
  return 'ok';
}
