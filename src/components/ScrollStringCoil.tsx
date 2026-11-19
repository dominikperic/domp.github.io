"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { markAppRouteChange, isScrollFxSuppressed } from "@/lib/scrollFxGuard";
import {
  notifyScrollAudio,
  resetScrollAudioBaseline,
  silenceScrollAudio,
} from "@/lib/scrollStringAudio";

/** Classic six guitar strings, equal spacing across the group. */
const STRING_COUNT = 6;
const SAMPLE_COUNT = 128;
/** container-page: width min(100% - 2rem, 68rem) — keep in sync with globals.css */
const CONTAINER_MAX_PX = 68 * 16; // 68rem
const CONTAINER_INLINE_GUTTER_PX = 32; // 2rem total
/** After scroll stops, amplitude falls to zero over this many ms (quick log-like curve). */
const VIBRATE_DECAY_MS = 2000;
/** Human-readable snake crawl, not high-frequency string buzz. */
const VIBRATE_HZ_BASE = 1.5;
/**
 * Exponential decay steepness. Higher = faster early drop (log-like ring-out).
 * gain = (e^{-k u} - e^{-k}) / (1 - e^{-k}) with u = elapsed/T ∈ [0,1].
 */
const DECAY_K = 4.2;
/** Convex response: barely visible slow drags, full swing at 1000 px/s. */
const SCROLL_SPEED_REF = 1000;
const MIN_SCROLL_INTENSITY = 0.08;

export function scrollIntensity(velocityPxPerSec: number): number {
  const speed = Math.min(1, Math.abs(velocityPxPerSec) / SCROLL_SPEED_REF);
  return MIN_SCROLL_INTENSITY + (1 - MIN_SCROLL_INTENSITY) * speed ** 1.6;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Per-burst random recipe so each scroll wake-up looks different. */
type BurstSeed = {
  /** Primary wavelength as a fraction of the viewport height. */
  wavelength: number;
  phase: number;
  harmonicPhase: number;
  harmonicWeight: number;
  /** Small shared phase step keeps neighboring strings parallel, never a helix. */
  stringPhaseLag: number;
  ampScale: number;
  hzScale: number;
};

function freshBurstSeed(): BurstSeed {
  return {
    wavelength: rand(0.28, 0.55),
    phase: rand(0, Math.PI * 2),
    harmonicPhase: rand(0, Math.PI * 2),
    harmonicWeight: rand(0.15, 0.35),
    stringPhaseLag: rand(-0.035, 0.035),
    ampScale: rand(0.85, 1),
    hzScale: rand(0.7, 1.3),
  };
}

type WavePacket = {
  seed: BurstSeed;
  /** Positive Y is down the screen, matching positive scroll delta. */
  direction: -1 | 1;
  phase: number;
  intensity: number;
  gainClock: number;
};

function packetGain(packet: WavePacket, now: number): number {
  const u = Math.max(0, (now - packet.gainClock) / VIBRATE_DECAY_MS);
  if (u >= 1) return 0;
  const expK = Math.exp(-DECAY_K);
  return (Math.exp(-DECAY_K * u) - expK) / (1 - expK);
}

/** At most one live packet per direction; reversing never resets the other clock. */
function boostWavePackets(
  packets: WavePacket[],
  delta: number,
  dt: number,
  now: number,
): WavePacket[] {
  const alive = packets.filter((packet) => packetGain(packet, now) > 0);
  if (Math.abs(delta) < 0.01) return alive;
  const direction = delta > 0 ? 1 : -1;
  const target = scrollIntensity((delta * 1000) / dt);
  const packet = alive.find((wave) => wave.direction === direction);
  if (packet) {
    packet.intensity += (target - packet.intensity) * (1 - Math.exp(-dt / 80));
    packet.gainClock = now;
  } else {
    alive.push({ seed: freshBurstSeed(), direction, phase: 0, intensity: target, gainClock: now });
  }
  return alive;
}

/** Page content column left edge (matches .container-page). */
function containerLeftEdge(viewportWidth: number): number {
  const contentWidth = Math.min(viewportWidth - CONTAINER_INLINE_GUTTER_PX, CONTAINER_MAX_PX);
  return Math.max(0, (viewportWidth - contentWidth) / 2);
}

/**
 * Place the string group midpoint halfway across the empty left gutter
 * (viewport left → container-page left).
 */
function groupLayout(viewportWidth: number) {
  const narrow = viewportWidth < 640;
  const groupWidth = narrow ? 56 : 92;
  const stringGap = groupWidth / (STRING_COUNT - 1);
  // Starting swing ~3× prior strength (was ~0.95 gap).
  const amplitude = stringGap * 0.95 * 3;
  const sidePad = Math.ceil(amplitude * 1.15 + 8);
  const leftGutter = containerLeftEdge(viewportWidth);
  const svgWidth = sidePad * 2 + groupWidth;

  if (leftGutter < groupWidth + sidePad * 2 + 8) {
    const left = Math.max(6, Math.min(12, leftGutter * 0.25));
    return { left, groupWidth, amplitude, sidePad, svgWidth };
  }

  const gutterMid = leftGutter / 2;
  const groupMidInSvg = sidePad + groupWidth / 2;
  let left = gutterMid - groupMidInSvg;
  const maxRight = leftGutter - 8;
  if (left + svgWidth > maxRight) {
    left = Math.max(4, maxRight - svgWidth);
  }
  left = Math.max(4, left);

  return { left, groupWidth, amplitude, sidePad, svgWidth };
}

/** Smooth viewport window: zero offset and zero slope at both ends. */
function diffractionEnv(t: number): number {
  if (t <= 0 || t >= 1) return 0;
  return Math.sin(Math.PI * t) ** 2;
}

/** Traveling spatial ripple; a shared phase keeps the six strings flowing together. */
function spatialRipple(
  y: number,
  height: number,
  stringIndex: number,
  seed: BurstSeed,
  phase = 0,
  direction: -1 | 1 = 1,
): number {
  const k = (Math.PI * 2) / (height * seed.wavelength);
  const bodyPhase =
    k * y -
    direction * phase +
    seed.phase +
    (stringIndex - (STRING_COUNT - 1) / 2) * seed.stringPhaseLag;
  // Both modes translate at the SAME speed: the body crawls intact along Y.
  // Normalize instead of clipping so smooth S-bends stay within the old budget.
  return (
    (Math.sin(bodyPhase) + seed.harmonicWeight * Math.sin(2 * bodyPhase + seed.harmonicPhase)) /
    (1 + seed.harmonicWeight)
  );
}

/**
 * Sum independent traveling packets before a smooth bounded saturation.
 * The envelope is applied last, preserving exact flat viewport ends.
 */
function buildStringPath(
  baseX: number,
  height: number,
  stringIndex: number,
  amplitude: number,
  packets: WavePacket[],
  now: number,
  animate: boolean,
): string {
  const active = packets.filter((packet) => packetGain(packet, now) > 0);
  if (!animate || height <= 0 || active.length === 0) {
    return `M ${baseX} 0 L ${baseX} ${height}`;
  }

  let d = "";
  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const t = i / SAMPLE_COUNT;
    const y = t * height;
    const env = diffractionEnv(t);
    const sum = active.reduce((value, packet) => {
      const ripple = spatialRipple(
        y,
        height,
        stringIndex,
        packet.seed,
        packet.phase,
        packet.direction,
      );
      return value + packetGain(packet, now) * packet.intensity * packet.seed.ampScale * ripple;
    }, 0);
    // Linear through 80% of the budget; smooth, odd soft-limit near the ceiling.
    // Unlike dividing by packet count, a tiny dying packet cannot halve the new wave.
    const magnitude = Math.abs(sum);
    const bounded =
      magnitude <= 0.8 ? sum : Math.sign(sum) * (0.8 + 0.2 * Math.tanh((magnitude - 0.8) / 0.2));
    const x = baseX + env * amplitude * bounded;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

/**
 * Left-gutter guitar strings: centered traveling bends with flat viewport ends.
 * Each direction has its own random shape, traveling phase and release clock.
 * Reversals add an opposing wave; all packets die to straight over VIBRATE_DECAY_MS.
 */
export function ScrollStringCoil() {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const loopIdRef = useRef<number | null>(null);
  const packetsRef = useRef<WavePacket[]>([]);
  /** Velocity baseline is separate from the vibration release clock. */
  const lastScrollYRef = useRef(0);
  const lastScrollTsRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const reduceRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const stopLoop = () => {
      if (loopIdRef.current != null) {
        window.cancelAnimationFrame(loopIdRef.current);
        loopIdRef.current = null;
      }
    };

    const paint = (): boolean => {
      const svg = svgRef.current;
      const wrap = wrapRef.current;
      if (!svg || !wrap) return true;

      const now = performance.now();
      const height = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const { left, groupWidth, amplitude, sidePad, svgWidth } = groupLayout(viewportWidth);
      const animate = !reduceRef.current;
      const packets = animate
        ? packetsRef.current.filter((packet) => packetGain(packet, now) > 0)
        : [];
      packetsRef.current = packets;
      const dt = Math.min(0.05, (now - (lastFrameTimeRef.current || now)) / 1000);
      lastFrameTimeRef.current = now;
      for (const packet of packets) {
        packet.phase += dt * VIBRATE_HZ_BASE * packet.seed.hzScale * Math.PI * 2;
      }
      const settled = packets.length === 0;

      wrap.style.left = `${left}px`;
      wrap.style.width = `${svgWidth}px`;
      svg.setAttribute("viewBox", `0 0 ${svgWidth} ${height}`);
      svg.setAttribute("width", String(svgWidth));
      svg.setAttribute("height", String(height));

      for (let index = 0; index < STRING_COUNT; index++) {
        const path = pathRefs.current[index];
        if (!path) continue;
        const slot = index / (STRING_COUNT - 1);
        const baseX = sidePad + slot * groupWidth;
        path.setAttribute(
          "d",
          buildStringPath(baseX, height, index, amplitude, packets, now, animate),
        );
      }

      return settled;
    };

    const ensureLoop = () => {
      if (loopIdRef.current != null || reduceRef.current) return;
      const loop = () => {
        loopIdRef.current = null;
        const settled = paint();
        if (!reduceRef.current && !settled) {
          loopIdRef.current = window.requestAnimationFrame(loop);
        }
      };
      loopIdRef.current = window.requestAnimationFrame(loop);
    };

    const onScroll = () => {
      const now = performance.now();
      const delta = window.scrollY - lastScrollYRef.current;
      // Bound event timing and velocity, including the first event after idle.
      const dt = Math.max(8, Math.min(50, now - lastScrollTsRef.current));
      lastScrollYRef.current = window.scrollY;
      lastScrollTsRef.current = now;
      if (reduceRef.current) {
        paint();
        silenceScrollAudio();
        return;
      }

      // Ignore scroll jumps from App Router page swaps.
      if (isScrollFxSuppressed()) {
        packetsRef.current = [];
        paint();
        return;
      }

      if (Math.abs(delta) < 0.01) return;
      if (loopIdRef.current == null) lastFrameTimeRef.current = now;
      packetsRef.current = boostWavePackets(packetsRef.current, delta, dt, now);
      notifyScrollAudio();
      ensureLoop();
    };

    const syncReduce = () => {
      reduceRef.current = media.matches;
      if (media.matches) {
        packetsRef.current = [];
        stopLoop();
        paint();
      }
    };

    const onResize = () => {
      paint();
      if (packetsRef.current.length > 0 && !reduceRef.current) {
        ensureLoop();
      }
    };

    reduceRef.current = media.matches;
    media.addEventListener("change", syncReduce);

    // Rest until first scroll.
    packetsRef.current = [];
    lastFrameTimeRef.current = performance.now();
    lastScrollYRef.current = window.scrollY;
    lastScrollTsRef.current = performance.now();
    paint();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      media.removeEventListener("change", syncReduce);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      stopLoop();
      silenceScrollAudio();
    };
  }, []);

  // On App Router navigations: suppress FX and kill any in-flight vibration/audio.
  useEffect(() => {
    markAppRouteChange();
    packetsRef.current = [];
    lastScrollYRef.current = window.scrollY;
    lastScrollTsRef.current = performance.now();
    resetScrollAudioBaseline();
    // Force a static paint (straight strings) after route change.
    const svg = svgRef.current;
    const wrap = wrapRef.current;
    if (!svg || !wrap) return;
    // Trigger resize-style repaint via dispatch — paint is closed inside other effect.
    window.dispatchEvent(new Event("resize"));
  }, [pathname]);

  const strokes = Array.from({ length: STRING_COUNT }, (_, i) => {
    const brass = i % 2 === 0;
    const edge = i === 0 || i === STRING_COUNT - 1;
    const opacity = edge ? 0.32 : brass ? 0.48 : 0.4;
    const width = brass ? 1.55 : 1.25;
    return { opacity, width, brass };
  });

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed inset-y-0 z-10"
      style={{ left: 0, width: 60 }}
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        className="h-full w-full max-sm:opacity-80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMin meet"
      >
        {strokes.map((stroke, index) => (
          <path
            key={index}
            ref={(el) => {
              pathRefs.current[index] = el;
            }}
            fill="none"
            stroke={stroke.brass ? "var(--brass)" : "var(--foreground)"}
            strokeOpacity={stroke.opacity}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
