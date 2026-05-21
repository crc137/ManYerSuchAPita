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
import { exactIp, normalizeIp } from "./ip.js"
import { isBanned, permBan, tempBan } from "./ban.js"
import { isInChallenge, setChallenge } from "./challenge.js"
import { classifyProbe } from "./probe.js"
import type { GuardConfig } from "./types.js"

const ALWAYS_PASS = /^\/_next\/(static|image)|^\/favicon\.ico|^\/api\/_guard\//;

export function createMiddleware(config: GuardConfig) {
  const allowed = new Set((config.allowedIps ?? []).map(ip =>
    ip.includes(':') ? exactIp(ip) : ip
  ));

  async function middleware(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;

    if (ALWAYS_PASS.test(pathname)) return NextResponse.next();

    const rawIp = request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      '0.0.0.0';

    const exact  = exactIp(rawIp);
    const subnet = normalizeIp(rawIp);

    if (allowed.has(exact)) return NextResponse.next();

    if (await isBanned(subnet, config.store)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const probe = classifyProbe(pathname);
    if (probe) {
      if (probe === 'instant') {
        await permBan(subnet, `Instant ban: probe path ${pathname}`, config, 'probe');
        return new NextResponse('Forbidden', { status: 403 });
      }

      if (!config.challengeMode) {
        await tempBan(subnet, `Probe path: ${pathname}`, config, 'probe');
        return new NextResponse('Forbidden', { status: 403 });
      }

      if (await isInChallenge(exact, config.store)) {
        await permBan(subnet, `Probe while challenged: ${pathname}`, config, 'probe');
        return new NextResponse('Forbidden', { status: 403 });
      }
      await setChallenge(exact, config.store);
      const dest = new URL(config.challengeUrl ?? '/guard-challenge', request.url);
      return NextResponse.redirect(dest, 302);
    }

    return NextResponse.next();
  }

  const config_ = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  };

  return { middleware, config: config_ };
}
