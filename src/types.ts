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

export type BanTier = 'soft' | 'temp' | 'perm';

export interface LockableRedis {
  eval(script: string, keys: string[], args: (string | number)[]): Promise<unknown>;
  set(key: string, value: string, opts: { nx: boolean; px: number }): Promise<unknown>;
}

export interface BanRecord {
  reason: string;
  createdAt: number;
  source: string;
  tier: BanTier;
}

export interface ScannerStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

export interface GuardConfig {
  store: ScannerStore;
  redis?: LockableRedis;
  allowedIps?: string[];
  challengeMode?: boolean;
  challengeUrl?: string;
  turnstileSecretKey?: string;
  adminToken?: string;
  cfApiToken?: string;
  cfAccountId?: string;
  cfZoneId?: string;
}
