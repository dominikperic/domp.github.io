/**
 * Detuned hypersaw D-minor chord (D–F–A) driven by page scroll.
 * Softer attack; reverb is 2× wet while scrolling and fades out over 3s after stop.
 * Dry fades sooner; wet is separately gated (no runaway stack).
 * Web Audio only — no sample files.
 */

import { isScrollFxSuppressed } from "@/lib/scrollFxGuard";

/** D minor triad + high D in the low/mid register (Hz). */
const CHORD_HZ = {
  D: 73.416, // D2
  F: 87.307, // F2
  A: 110.0, // A2
  D4: 293.665, // D4 high
} as const;

/** Dry body fade after scroll stops (ms). */
export const SCROLL_AUDIO_FADE_OUT_MS = 1200;
/** Reverb tail fade after scroll stops (ms). */
const REVERB_FADE_OUT_MS = 3000;

/** Saws per chord tone (hypersaw stack). */
const HYPERSAW_COUNT = 7;
/** Detune spread per voice (± cents). */
const DETUNE_CENTS = 22;
const MASTER_CEILING = 0.42;
const SCROLL_IDLE_MS = 40;
/** Default user volume (0–1). Slider starts muted. */
export const SCROLL_AUDIO_DEFAULT_VOLUME = 0;

/** Wet level while scrolling (2× prior 0.38). */
const WET_LEVEL = 0.76;
const DRY_LEVEL = 0.65;

type ChordVoice = {
  name: keyof typeof CHORD_HZ;
  baseHz: number;
  oscs: OscillatorNode[];
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let dryEnv: GainNode | null = null;
let wetEnv: GainNode | null = null;
let lowpass: BiquadFilterNode | null = null;
let subOsc: OscillatorNode | null = null;
let started = false;
let lastScrollMs = 0;
let lastScrollY = 0;
let rafId: number | null = null;

let targetDry = 0;
let currentDry = 0;
let targetWet = 0;
let currentWet = 0;
/** Softer attack (gain units/sec) — lower than before. */
let attackPerSec = 0.18;
const DRY_RELEASE_PER_SEC = 1 / (SCROLL_AUDIO_FADE_OUT_MS / 1000);
const WET_RELEASE_PER_SEC = 1 / (REVERB_FADE_OUT_MS / 1000);

let userVolume = SCROLL_AUDIO_DEFAULT_VOLUME;
let unlocked = false;

export function getScrollAudioVolume(): number {
  return userVolume;
}

export function isScrollAudioEnabled(): boolean {
  return unlocked && userVolume > 0.001;
}

function applyMasterVolume() {
  if (master && ctx) {
    master.gain.setValueAtTime(MASTER_CEILING * userVolume, ctx.currentTime);
  }
}

export function unlockScrollAudio(): void {
  unlocked = true;
  const ac = ensureGraph();
  if (ac?.state === "suspended") {
    void ac.resume();
  }
  applyMasterVolume();
}

export function setScrollAudioVolume(level: number): void {
  userVolume = Math.min(1, Math.max(0, level));
  if (userVolume <= 0.001) {
    silenceScrollAudio();
  }
  applyMasterVolume();
}

export function enableScrollAudio(): void {
  if (userVolume < 0.001) userVolume = SCROLL_AUDIO_DEFAULT_VOLUME;
  unlockScrollAudio();
}

export function disableScrollAudio(): void {
  setScrollAudioVolume(0);
}

function createHypersawVoice(
  audioCtx: AudioContext,
  baseHz: number,
  name: keyof typeof CHORD_HZ,
  dest: AudioNode,
): ChordVoice {
  const bus = audioCtx.createGain();
  const voiceLevel = name === "D" ? 0.34 : name === "F" ? 0.28 : name === "A" ? 0.26 : 0.22; // D4 a bit quieter
  bus.gain.value = voiceLevel / HYPERSAW_COUNT;
  bus.connect(dest);

  const oscs: OscillatorNode[] = [];
  for (let i = 0; i < HYPERSAW_COUNT; i++) {
    const osc = audioCtx.createOscillator();
    osc.type = "sawtooth";
    const t = i / (HYPERSAW_COUNT - 1);
    const cents = (t - 0.5) * 2 * DETUNE_CENTS;
    const extra = (i % 3) * 0.7 - 0.7;
    osc.frequency.value = baseHz * Math.pow(2, (cents + extra) / 1200);
    osc.connect(bus);
    osc.start();
    oscs.push(osc);
  }

  return { name, baseHz, oscs };
}

function ensureGraph(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = MASTER_CEILING;
    master.connect(ctx.destination);

    dryEnv = ctx.createGain();
    dryEnv.gain.value = 0;
    dryEnv.connect(master);

    wetEnv = ctx.createGain();
    wetEnv.gain.value = 0;
    wetEnv.connect(master);

    const chordBus = ctx.createGain();
    chordBus.gain.value = 1;

    const chordVoices = [
      createHypersawVoice(ctx, CHORD_HZ.D, "D", chordBus),
      createHypersawVoice(ctx, CHORD_HZ.F, "F", chordBus),
      createHypersawVoice(ctx, CHORD_HZ.A, "A", chordBus),
      createHypersawVoice(ctx, CHORD_HZ.D4, "D4", chordBus),
    ];
    void chordVoices;

    subOsc = ctx.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.value = CHORD_HZ.D / 2;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.18;
    subOsc.connect(subGain);
    subOsc.start();

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 40;

    lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 1400;
    lowpass.Q.value = 0.55;

    const dry = ctx.createGain();
    dry.gain.value = DRY_LEVEL;

    const wet = ctx.createGain();
    wet.gain.value = WET_LEVEL;
    const verbIn = ctx.createGain();
    const verbMerge = ctx.createGain();

    const lightDelays = [0.021, 0.029, 0.037, 0.053, 0.067, 0.089, 0.113];
    lightDelays.forEach((sec, i) => {
      const d = ctx!.createDelay(0.4);
      d.delayTime.value = sec;
      const fb = ctx!.createGain();
      // Still capped feedback — more wet via WET_LEVEL, not runaway FB
      fb.gain.value = 0.34 - i * 0.025;
      const lp = ctx!.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1800 - i * 90;
      verbIn.connect(d);
      d.connect(lp);
      lp.connect(fb);
      fb.connect(d);
      lp.connect(verbMerge);
    });

    chordBus.connect(highpass);
    subGain.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(dry);
    lowpass.connect(verbIn);
    dry.connect(dryEnv);
    verbMerge.connect(wet);
    wet.connect(wetEnv);

    started = true;
    lastScrollY = window.scrollY || 0;
  }

  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  if (master) {
    applyMasterVolume();
  }
  return ctx;
}

function stopRaf() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function hardSilence() {
  targetDry = 0;
  targetWet = 0;
  currentDry = 0;
  currentWet = 0;
  if (ctx) {
    if (dryEnv) {
      dryEnv.gain.cancelScheduledValues(ctx.currentTime);
      dryEnv.gain.setValueAtTime(0, ctx.currentTime);
    }
    if (wetEnv) {
      wetEnv.gain.cancelScheduledValues(ctx.currentTime);
      wetEnv.gain.setValueAtTime(0, ctx.currentTime);
    }
  }
  stopRaf();
}

function tick() {
  rafId = null;
  if (!ctx || !dryEnv || !wetEnv) return;

  const now = performance.now();
  const dt = Math.min(0.05, 1 / 60);

  if (now - lastScrollMs > SCROLL_IDLE_MS) {
    targetDry = 0;
    targetWet = 0;
  }

  // Dry: softer attack, ~1.2s release
  if (targetDry > currentDry) {
    currentDry = Math.min(targetDry, currentDry + attackPerSec * dt);
  } else if (targetDry < currentDry) {
    currentDry = Math.max(0, currentDry - DRY_RELEASE_PER_SEC * dt);
  }

  // Wet: same soft attack while scrolling; 2s release after stop
  if (targetWet > currentWet) {
    currentWet = Math.min(targetWet, currentWet + attackPerSec * dt);
  } else if (targetWet < currentWet) {
    currentWet = Math.max(0, currentWet - WET_RELEASE_PER_SEC * dt);
  }

  dryEnv.gain.setValueAtTime(Math.max(0, currentDry), ctx.currentTime);
  wetEnv.gain.setValueAtTime(Math.max(0, currentWet), ctx.currentTime);

  if (currentDry > 0.002 || currentWet > 0.002 || targetDry > 0 || targetWet > 0) {
    rafId = requestAnimationFrame(tick);
  } else {
    hardSilence();
  }
}

function ensureRaf() {
  if (rafId == null) {
    rafId = requestAnimationFrame(tick);
  }
}

export function notifyScrollAudio(scrollDeltaPx?: number): void {
  if (typeof window === "undefined") return;
  if (!unlocked || userVolume <= 0.001) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const y = window.scrollY || document.documentElement.scrollTop || 0;

  // Page navigations reset scrollY — never treat that as user scroll.
  if (isScrollFxSuppressed()) {
    lastScrollY = y;
    return;
  }

  const ac = ensureGraph();
  if (!ac || !started) return;

  const now = performance.now();
  const delta = scrollDeltaPx !== undefined ? scrollDeltaPx : y - lastScrollY;
  const dtMs = Math.max(8, now - (lastScrollMs || now - 16));
  lastScrollMs = now;
  lastScrollY = y;

  const speed = Math.abs(delta) / (dtMs / 1000);
  const speedNorm = Math.max(0, Math.min(1, (speed - 60) / 2400));
  // Softer attack
  attackPerSec = 0.06 + speedNorm * 1.35;

  targetDry = 1;
  targetWet = 1;
  ensureRaf();
}

/** Reset scroll baseline after route change (no sound). */
export function resetScrollAudioBaseline(): void {
  if (typeof window === "undefined") return;
  lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  lastScrollMs = 0;
  hardSilence();
}

export function silenceScrollAudio(): void {
  lastScrollMs = 0;
  hardSilence();
}
