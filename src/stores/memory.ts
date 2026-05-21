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

import type { ScannerStore } from "../types.js"

interface Entry {
  value: string;
  expiresAt: number;
}

export function createMemoryStore(): ScannerStore {
  const map = new Map<string, Entry>();

  function isExpired(entry: Entry) {
    return Date.now() > entry.expiresAt;
  }

  return {
    async get(key) {
      const entry = map.get(key);
      if (!entry || isExpired(entry)) { map.delete(key); return null; }
      return entry.value;
    },
    async set(key, value, ttlSeconds) {
      map.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    },
    async del(key) {
      map.delete(key);
    },
  };
}
