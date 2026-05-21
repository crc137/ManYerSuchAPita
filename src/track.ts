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
import { normalizeIp } from "./ip.js"
import { hasSeen, markSeen, permBan } from "./ban.js"
import { isInChallenge, setChallenge } from "./challenge.js"
import type { GuardConfig } from "./types.js"

export type TrackResult = 'ok' | 'banned' | 'challenged';

async function getIp(): Promise<string> {
  const h = await headers();
  const raw = h.get('cf-connecting-ip') ?? h.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
  return normalizeIp(raw);
}

export async function trackSuccess(config: GuardConfig): Promise<void> {
  const ip = await getIp();
  if (ip === '0.0.0.0') return;
  if (config.allowedIps?.some(a => normalizeIp(a) === ip)) return;

  if (!await hasSeen(ip, config.store)) {
    await markSeen(ip, config.store);
  }
}

export async function trackFail(config: GuardConfig): Promise<TrackResult> {
  const ip = await getIp();
  if (ip === '0.0.0.0') return 'ok';
  if (config.allowedIps?.some(a => normalizeIp(a) === ip)) return 'ok';

  if (!await hasSeen(ip, config.store)) {
    if (config.challengeMode) {
      if (!await isInChallenge(ip, config.store)) {
        await setChallenge(ip, config.store);
      }
      return 'challenged';
    }
    const h = await headers();
    const pathname = h.get('x-pathname') ?? h.get('x-invoke-path') ?? '(unknown)';
    await permBan(ip, `First request was 4xx: ${pathname}`, config, 'probe');
    return 'banned';
  }
  return 'ok';
}
