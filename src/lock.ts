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

import { Lock } from "@upstash/lock"
import type { LockableRedis } from "./types.js"

export async function withLock<T>(
  id: string,
  redis: LockableRedis,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  const lock = new Lock({
    id,
    redis: redis as ConstructorParameters<typeof Lock>[0]["redis"],
    lease: 10_000,
    retry: { attempts: 3, delay: 100 },
  });
  if (await lock.acquire()) {
    try { return await fn(); }
    finally { await lock.release(); }
  }
  return fallback;
}
