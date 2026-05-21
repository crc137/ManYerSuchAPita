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

import { NextRequest, NextResponse } from "next/server"
import { normalizeIp } from "./ip.js"
import { markSeen, permBan } from "./ban.js"
import type { GuardConfig, ScannerStore } from "./types.js"

const CHALLENGE_TTL = 600;

export function challengeKey(ip: string) { return `guard:challenge:${ip}`; }

export async function setChallenge(ip: string, store: ScannerStore): Promise<void> {
  await store.set(challengeKey(ip), String(Date.now()), CHALLENGE_TTL);
}

export async function isInChallenge(ip: string, store: ScannerStore): Promise<boolean> {
  return (await store.get(challengeKey(ip))) !== null;
}

export function createChallengeHandler(config: GuardConfig) {
  return {
    async POST(request: NextRequest): Promise<NextResponse> {
      let body: { token?: string; next?: string };
      try { body = await request.json(); }
      catch { return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 }); }

      const rawIp =
        request.headers.get('cf-connecting-ip') ??
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
      const ip = normalizeIp(rawIp);

      if (config.turnstileSecretKey) {
        if (!body.token) {
          return NextResponse.json({ ok: false, error: 'missing token' }, { status: 400 });
        }

        const form = new FormData();
        form.append('secret', config.turnstileSecretKey);
        form.append('response', body.token);
        form.append('remoteip', rawIp);

        const res = await fetch('https://challenges.cloudflare.com/turnstile/v1/siteverify', {
          method: 'POST',
          body: form,
        });
        const data = (await res.json()) as { success: boolean };

        if (!data.success) {
          await permBan(ip, 'Challenge failed: Turnstile rejected', config, 'challenge');
          return NextResponse.json({ ok: false, error: 'challenge failed' }, { status: 403 });
        }
      }

      await markSeen(ip, config.store);
      await config.store.del(challengeKey(ip));

      return NextResponse.json({ ok: true, next: body.next ?? '/' });
    },
  };
}
