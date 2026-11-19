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
const SAMPLE_COUNT = 96;
/** container-page: width min(100% - 2rem, 68rem) — keep in sync with globals.css */
const CONTAINER_MAX_PX = 68 * 16; // 68rem
const CONTAINER_INLINE_GUTTER_PX = 32; // 2rem total
/** After scroll stops, amplitude falls to zero over this many ms (quick log-like curve). */
const VIBRATE_DECAY_MS = 1500;
/** Lower visual oscillation rate (Hz) for flowing waves rather than strum blur. */
const VIBRATE_HZ_BASE = 9;
/**
 * Exponential decay steepness. Higher = faster early drop (log-like ring-out).
 * gain = (e^{-k u} - e^{-k}) / (1 - e^{-k}) with u = elapsed/T ∈ [0,1].
 */
const DECAY_K = 4.2;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Per-burst random recipe so each scroll wake-up looks different. */
type BurstSeed = {
  /** Spatial harmonic wavelength fractions of viewport height. */
  len1: number;
  len2: number;
  len3: number;
  /** Spatial phases / mix weights. */
  p1: number;
  p2: number;
  p3: number;
  w1: number;
  w2: number;
  w3: number;
  /** Per-string spatial offset jitter. */
  stringJitter: number[];
  /** Temporal multi-osc: relative Hz and phases (noisy L/R, not a pure sine). */
  hzScale: number;
  tHz2: number;
  tHz3: number;
  tPhase2: number;
  tPhase3: number;
  tW1: number;
  tW2: number;
  tW3: number;
};

function freshBurstSeed(): BurstSeed {
  // Favor the longest wave (w3); keep the normalized mix and swing budget unchanged.
  const w1 = rand(0.2, 0.3);
  const w2 = rand(0.1, 0.18);
  const w3 = 1 - w1 - w2;
  const tW1 = rand(0.45, 0.65);
  const tW2 = rand(0.2, 0.35);
  const tW3 = 1 - tW1 - tW2;
  return {
    len1: rand(0.36, 0.55),
    len2: rand(0.22, 0.34),
    len3: rand(0.6, 0.9),
    p1: rand(0, Math.PI * 2),
    p2: rand(0, Math.PI * 2),
    p3: rand(0, Math.PI * 2),
    w1,
    w2,
    w3,
    stringJitter: Array.from({ length: STRING_COUNT }, () => rand(-0.55, 0.55)),
    hzScale: rand(0.75, 1.05),
    tHz2: rand(1.2, 1.8),
    tHz3: rand(0.35, 0.7),
    tPhase2: rand(0, Math.PI * 2),
    tPhase3: rand(0, Math.PI * 2),
    tW1,
    tW2,
    tW3,
  };
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

/** Single-slit style envelope on viewport t∈[0,1] — wide center, flat near ends. */
const DIFFRACTION_BETA = 3.6;

function sinc(u: number): number {
  if (Math.abs(u) < 1e-10) return 1;
  return Math.sin(Math.PI * u) / (Math.PI * u);
}

function diffractionEnv(t: number): number {
  const u = (t - 0.5) * DIFFRACTION_BETA;
  const edge = Math.pow(Math.sin(Math.PI * t), 0.35);
  return Math.abs(sinc(u)) * edge;
}

/** Spatial ripple shaped by the current burst seed (different every scroll wake). */
function spatialRipple(y: number, height: number, stringIndex: number, seed: BurstSeed): number {
  const k1 = (Math.PI * 2) / (height * seed.len1);
  const k2 = (Math.PI * 2) / (height * seed.len2);
  const k3 = (Math.PI * 2) / (height * seed.len3);
  const j = seed.stringJitter[stringIndex] ?? 0;
  const raw =
    seed.w1 * Math.sin(k1 * y + seed.p1 + j) +
    seed.w2 * Math.sin(k2 * y + seed.p2 + j * 1.3) +
    seed.w3 * Math.sin(k3 * y + seed.p3 + j * 0.7);
  return Math.max(-1, Math.min(1, raw * 1.2));
}

/** Noisy temporal L/R driver from multiple incommensurate oscillators. */
function temporalOsc(phase: number, seed: BurstSeed): number {
  const raw =
    seed.tW1 * Math.sin(phase) +
    seed.tW2 * Math.sin(phase * seed.tHz2 + seed.tPhase2) +
    seed.tW3 * Math.sin(phase * seed.tHz3 + seed.tPhase3);
  return Math.max(-1, Math.min(1, raw * 1.25));
}

/**
 * x = baseX + env * amp * gain * temporalOsc * spatialRipple
 * gain shrinks the swing to straight over 1.5s after scroll stops.
 */
function buildStringPath(
  baseX: number,
  height: number,
  stringIndex: number,
  amplitude: number,
  gain: number,
  osc: number,
  seed: BurstSeed,
  animate: boolean,
): string {
  if (!animate || height <= 0 || gain <= 0 || Math.abs(osc * gain) < 1e-4) {
    return `M ${baseX} 0 L ${baseX} ${height}`;
  }

  const amp = amplitude * gain * (0.96 + (stringIndex % 3) * 0.02) * osc;

  let d = "";
  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const t = i / SAMPLE_COUNT;
    const y = t * height;
    const env = diffractionEnv(t);
    const spatial = spatialRipple(y, height, stringIndex, seed);
    const x = baseX + env * amp * spatial;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

/**
 * Left-gutter guitar strings: wide center ripples that swing left/right.
 * Each scroll wake picks a new random burst seed (shape + timing noise).
 * After scroll stops, swing amplitude dies to straight over VIBRATE_DECAY_MS.
 */
export function ScrollStringCoil() {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const loopIdRef = useRef<number | null>(null);
  /** performance.now() of last scroll — starts the 1.5s decay clock. */
  const lastScrollTimeRef = useRef(0);
  /** Radians; advances every frame while gain > 0. */
  const oscPhaseRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const reduceRef = useRef(false);
  /** Random recipe for the active vibration burst. */
  const seedRef = useRef<BurstSeed>(freshBurstSeed());

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const stopLoop = () => {
      if (loopIdRef.current != null) {
        window.cancelAnimationFrame(loopIdRef.current);
        loopIdRef.current = null;
      }
    };

    /**
     * Swing amplitude: full while scrolling; after stop, exponential (quick) fall to 0 by 1.5s.
     * Not linear — steep early drop like a plucked string ringing out.
     */
    const vibrateGain = (now: number): number => {
      const elapsed = now - lastScrollTimeRef.current;
      if (elapsed <= 0) return 1;
      if (elapsed >= VIBRATE_DECAY_MS) return 0;
      const u = elapsed / VIBRATE_DECAY_MS;
      const expK = Math.exp(-DECAY_K);
      const gain = (Math.exp(-DECAY_K * u) - expK) / (1 - expK);
      return Math.max(0, Math.min(1, gain));
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
      const gain = animate ? vibrateGain(now) : 0;
      const seed = seedRef.current;

      // Advance oscillator only while still swinging (gain > 0).
      if (animate && gain > 0) {
        const last = lastFrameTimeRef.current || now;
        const dt = Math.min(0.05, (now - last) / 1000);
        lastFrameTimeRef.current = now;
        const hz = VIBRATE_HZ_BASE * seed.hzScale;
        oscPhaseRef.current += dt * hz * Math.PI * 2;
      } else {
        lastFrameTimeRef.current = now;
      }

      const osc = animate && gain > 0 ? temporalOsc(oscPhaseRef.current, seed) : 0;
      const settled = !animate || gain <= 0;

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
          buildStringPath(baseX, height, index, amplitude, gain, osc, seed, animate),
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
      if (reduceRef.current) {
        paint();
        silenceScrollAudio();
        return;
      }

      // Ignore scroll jumps from App Router page swaps.
      if (isScrollFxSuppressed()) {
        lastScrollTimeRef.current = performance.now() - VIBRATE_DECAY_MS - 1;
        paint();
        return;
      }

      const now = performance.now();
      const wasResting = vibrateGain(now) <= 0.05;
      // Reset decay clock → full back-and-forth amplitude again.
      lastScrollTimeRef.current = now;
      // New random shape + timing each time vibration wakes from rest.
      if (wasResting) {
        seedRef.current = freshBurstSeed();
        oscPhaseRef.current = rand(0, Math.PI * 2);
      }
      notifyScrollAudio();
      ensureLoop();
    };

    const syncReduce = () => {
      reduceRef.current = media.matches;
      if (media.matches) {
        lastScrollTimeRef.current = 0;
        stopLoop();
        paint();
      }
    };

    const onResize = () => {
      paint();
      if (vibrateGain(performance.now()) > 0 && !reduceRef.current) {
        ensureLoop();
      }
    };

    reduceRef.current = media.matches;
    media.addEventListener("change", syncReduce);

    // Rest until first scroll.
    lastScrollTimeRef.current = performance.now() - VIBRATE_DECAY_MS - 1;
    lastFrameTimeRef.current = performance.now();
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
    lastScrollTimeRef.current = performance.now() - VIBRATE_DECAY_MS - 1;
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
