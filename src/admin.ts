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
import { getBanRecord, hasSeen, permBan, unban } from "./ban.js"
import { isInChallenge } from "./challenge.js"
import type { GuardConfig } from "./types.js"

export function createAdminHandler(config: GuardConfig) {
  function authorized(request: NextRequest): boolean {
    if (!config.adminToken) return false;
    const token =
      request.headers.get('x-guard-token') ??
      request.nextUrl.searchParams.get('token');
    return token === config.adminToken;
  }

  return {
    async GET(request: NextRequest): Promise<NextResponse> {
      if (!authorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const rawIp = request.nextUrl.searchParams.get('ip');
      if (!rawIp) {
        return NextResponse.json({ error: 'Missing ?ip= parameter' }, { status: 400 });
      }

      const ip = normalizeIp(rawIp);
      const [ban, seen, challenged] = await Promise.all([
        getBanRecord(ip, config.store),
        hasSeen(ip, config.store),
        isInChallenge(ip, config.store),
      ]);

      const state = ban ? ban.tier === 'soft' ? 'soft_banned' : ban.tier === 'temp' ? 'temp_banned' : 'banned' : challenged ? 'challenged' : seen ? 'seen' : 'unseen';

      return NextResponse.json({ ip, state, ban, seen, challenged });
    },

    async POST(request: NextRequest): Promise<NextResponse> {
      if (!authorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      let body: { action?: string; ip?: string; reason?: string };
      try { body = await request.json(); }
      catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

      if (!body.ip) return NextResponse.json({ error: 'Missing ip' }, { status: 400 });
      const ip = normalizeIp(body.ip);

      switch (body.action) {
        case 'unban':
          await unban(ip, config.store);
          return NextResponse.json({ ok: true, ip, action: 'unban' });

        case 'ban': {
          const reason = body.reason ?? 'Manual ban via admin API';
          await permBan(ip, reason, config, 'admin');
          return NextResponse.json({ ok: true, ip, action: 'ban', reason });
        }

        default:
          return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
      }
    },
  };
}
