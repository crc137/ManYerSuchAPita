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

export function normalizeIp(ip: string): string {
  if (!ip.includes(':')) return ip;

  const expanded = expandIPv6(ip);
  if (!expanded) return ip;

  const groups = expanded.split(':');
  return groups.slice(0, 4).join(':') + '::/64';
}

function expandIPv6(ip: string): string | null {
  const clean = ip.split('%')[0];

  if (!clean.includes('::')) {
    return clean.split(':').length === 8 ? clean : null;
  }

  const [left, right] = clean.split('::');
  const leftGroups  = left  ? left.split(':')  : [];
  const rightGroups = right ? right.split(':') : [];
  const missing = 8 - leftGroups.length - rightGroups.length;
  const middle  = Array(missing).fill('0000');

  return [...leftGroups, ...middle, ...rightGroups]
    .map((g) => g.padStart(4, '0'))
    .join(':');
}
