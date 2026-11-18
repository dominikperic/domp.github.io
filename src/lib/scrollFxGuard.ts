/**
 * Suppress scroll-driven FX (string vibration + scroll audio) during App Router
 * navigations — page swaps reset scrollY and would otherwise fire a fake "scroll".
 */

/** How long after a route change we ignore scroll FX (ms). */
const NAV_SUPPRESS_MS = 700;

let suppressUntil = 0;

/** Call when the Next.js pathname changes. */
export function markAppRouteChange(): void {
  suppressUntil = performance.now() + NAV_SUPPRESS_MS;
}

export function isScrollFxSuppressed(): boolean {
  return performance.now() < suppressUntil;
}
