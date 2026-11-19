import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Run the component's real private helpers with reproducible random wakes.
const source = readFileSync(
  new URL("../src/components/ScrollStringCoil.tsx", import.meta.url),
  "utf8",
);
let randomState = 12345;
const math = Object.create(Math);
math.random = () => {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  return randomState / 2 ** 32;
};
const context = vm.createContext({ exports: {}, require: () => ({}), Math: math });
vm.runInContext(
  ts.transpileModule(
    `${source}\nexports.motion = { freshBurstSeed, groupLayout, diffractionEnv, spatialRipple, buildStringPath, boostWavePackets, packetGain, VIBRATE_HZ_BASE, VIBRATE_DECAY_MS, SAMPLE_COUNT, STRING_COUNT };`,
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  ).outputText,
  context,
);
const motion = context.exports.motion;
const buildPath = (base, height, index, amp, gain, phase, seed, animate) =>
  motion.buildStringPath(
    base,
    height,
    index,
    amp,
    gain > 0
      ? [{ seed, phase, direction: seed.direction ?? 1, intensity: gain, gainClock: 0 }]
      : [],
    0,
    animate,
  );
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
function pathOffsets(seed, phase, index = 0) {
  return [
    ...buildPath(100, 900, index, 50, 1, phase, seed, true).matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g),
  ].map((m) => Number(m[1]) - 100);
}

test("scroll intensity has a gentle floor, grows with absolute speed and saturates", () => {
  const intensity = context.exports.scrollIntensity;
  assert.equal(typeof intensity, "function");
  assert.equal(intensity(0), 0.08, "slow scroll should be barely visible");
  assert.ok(intensity(25) < 0.1);
  assert.ok(intensity(300) < 0.3, "mid-range must be softer than the old sqrt map");
  assert.equal(intensity(1000), 1);
  const speeds = [0, 25, 100, 300, 600, 1000];
  const values = speeds.map(intensity);
  for (let i = 1; i < values.length; i++) {
    assert.ok(values[i] > values[i - 1]);
  }
  for (const speed of speeds) {
    assert.equal(intensity(-speed), intensity(speed));
    assert.ok(intensity(speed) >= 0.08 && intensity(speed) <= 1);
  }

  assert.equal(intensity(1200), 1);
  assert.equal(intensity(100000), 1);
});

// Mount the real effect/event/paint pipeline with a deterministic clock and DOM.
function mountCoil() {
  let now = 10000;
  let suppressed = false;
  const effects = [];
  const listeners = new Map();
  let frame;
  const window = {
    scrollY: 0,
    innerWidth: 1440,
    innerHeight: 900,
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
    dispatchEvent: (event) => listeners.get(event.type)?.(),
    requestAnimationFrame: (fn) => {
      frame = fn;
      return 1;
    },
    cancelAnimationFrame: () => {
      frame = undefined;
    },
  };
  const jsx = (type, props) => ({ type, props });
  const sandbox = vm.createContext({
    exports: {},
    window,
    Event,
    performance: { now: () => now },
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    require: (name) => {
      if (name === "react")
        return {
          useRef: (current) => ({ current }),
          useEffect: (effect) => effects.push(effect),
        };
      if (name === "next/navigation") return { usePathname: () => "/" };
      if (name.endsWith("scrollFxGuard"))
        return {
          markAppRouteChange() {},
          isScrollFxSuppressed: () => suppressed,
        };
      if (name.endsWith("scrollStringAudio"))
        return {
          notifyScrollAudio() {},
          resetScrollAudioBaseline() {},
          silenceScrollAudio() {},
        };
      return { jsx, jsxs: jsx };
    },
  });
  vm.runInContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText,
    sandbox,
  );
  const paths = [];
  function attach(element) {
    if (!element) return;
    if (Array.isArray(element)) return element.forEach(attach);
    const node = {
      style: {},
      setAttribute(name, value) {
        this[name] = value;
      },
    };
    if (element.type === "path") paths.push(node);
    if (typeof element.props.ref === "function") element.props.ref(node);
    else if (element.props.ref) element.props.ref.current = node;
    attach(element.props.children);
  }
  attach(sandbox.exports.ScrollStringCoil());
  effects.forEach((effect) => effect());
  return {
    scroll(delta, dt = 20) {
      now += dt;
      window.scrollY += delta;
      listeners.get("scroll")();
      const next = frame;
      frame = undefined;
      next?.();
    },
    suppress(value) {
      suppressed = value;
    },
    offsets() {
      const xs = [...paths[0].d.matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)].map((m) => Number(m[1]));
      return xs.map((x) => x - xs[0]);
    },
    settle() {
      now += 2100;
      const next = frame;
      frame = undefined;
      next?.();
      return paths[0].d;
    },
  };
}

const peak = (coil) => Math.max(...coil.offsets().map(Math.abs));

test("real scroll/paint scales amplitude by speed, updating within one wake", () => {
  const slow = mountCoil();
  const fast = mountCoil();
  // Same seed, time, gain and phase: only scroll velocity differs.
  slow.scroll(1, 50);
  fast.scroll(60, 50);
  assert.ok(peak(fast) > peak(slow) * 2.5, "slow drag must be much gentler than fast flick");
  const firstSlow = peak(slow);
  const firstFast = peak(fast);
  for (let i = 0; i < 12; i++) {
    slow.scroll(60, 20);
    fast.scroll(1, 20);
  }
  assert.ok(peak(slow) > peak(fast) * 2, "continuous input updates intensity without re-seeding");
  assert.ok(firstSlow < firstFast);
  for (const coil of [slow, fast]) {
    assert.equal(coil.offsets()[0], 0);
    assert.equal(coil.offsets().at(-1), 0);
    assert.ok(peak(coil) <= motion.groupLayout(1440).amplitude + 0.01);
    assert.match(coil.settle(), /^M [\d.]+ 0 L [\d.]+ 900$/);
  }
});

test("scroll sign controls travel and a live reversal preserves the opposite packet", () => {
  const down = mountCoil();
  const up = mountCoil();
  down.scroll(60, 50);
  up.scroll(-60, 50);
  down.scroll(0, 50);
  up.scroll(0, 50);
  assert.notDeepEqual(down.offsets(), up.offsets(), "up must not repeat the down field");
  const reversing = mountCoil();
  const continuing = mountCoil();
  reversing.scroll(60, 50);
  continuing.scroll(60, 50);
  reversing.scroll(-60, 50);
  continuing.scroll(60, 50);
  assert.notDeepEqual(reversing.offsets(), continuing.offsets(), "reversal changes the field");
  assert.ok(peak(reversing) <= motion.groupLayout(1440).amplitude + 0.01);
});

test("packet reversal keeps independent clocks, reuses live seeds and respawns dead directions", () => {
  let packets = motion.boostWavePackets([], 50, 20, 100);
  const down = packets[0];
  const seed = down.seed;
  assert.equal(down.direction, 1);
  down.phase = 0.7;
  packets = motion.boostWavePackets(packets, -50, 20, 200);
  assert.equal(packets.length, 2);
  assert.equal(packets[1].direction, -1);
  assert.equal(packets[0], down);
  assert.equal(down.gainClock, 100);
  assert.equal(down.phase, 0.7);
  assert.ok(motion.packetGain(down, 200) < motion.packetGain(packets[1], 200));
  packets = motion.boostWavePackets(packets, 50, 20, 300);
  assert.equal(packets.length, 2);
  assert.equal(packets[0].seed, seed);
  assert.equal(packets[1].gainClock, 200);
  assert.equal(down.gainClock, 300);
  for (let i = 0; i < 100; i++) {
    packets = motion.boostWavePackets(packets, i % 2 ? 10 : -10, 20, 320 + i * 20);
    assert.equal(packets.length, 2, "rapid reversals cannot accumulate packets");
  }
  packets = motion.boostWavePackets(packets, 50, 20, 5000);
  assert.equal(packets.length, 1);
  assert.notEqual(packets[0].seed, seed);
  assert.equal(motion.packetGain(packets[0], 7000), 0);
  assert.equal(motion.boostWavePackets(packets, 0, 20, 7000).length, 0);
});

test("opposing packets interfere before saturation and never exceed the amplitude budget", () => {
  const seed = { ...motion.freshBurstSeed(), phase: 0, harmonicWeight: 0, ampScale: 1 };
  const down = { seed, direction: 1, phase: 0.7, intensity: 0.3, gainClock: 0 };
  const up = { ...down, direction: -1 };
  const offsets = (packets, now = 0) =>
    [
      ...motion
        .buildStringPath(100, 900, 0, 50, packets, now, true)
        .matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g),
    ].map((m) => Number(m[1]) - 100);
  const a = offsets([down]);
  const b = offsets([up]);
  const clash = offsets([down, up]);
  assert.notDeepEqual(clash, a);
  assert.notDeepEqual(clash, b);
  assert.ok(
    clash.every((x, i) => Math.abs(x - a[i] - b[i]) < 0.02),
    "low-amplitude clash is additive, not a field flip",
  );
  assert.ok(
    clash.some((x, i) => Math.abs(x) < Math.max(Math.abs(a[i]), Math.abs(b[i])) - 1),
    "destructive interference",
  );
  assert.ok(
    clash.some((x, i) => Math.abs(x) > Math.max(Math.abs(a[i]), Math.abs(b[i])) + 1),
    "constructive interference",
  );
  for (let phase = 0; phase < 10; phase += 0.1) {
    down.phase = phase;
    up.phase = phase * 1.2;
    down.intensity = up.intensity = 1;
    for (const now of [0, 200, 1000, 1999]) {
      const field = offsets([down, up], now);
      assert.ok(field.every((x) => Math.abs(x) <= 50.01));
      assert.equal(field[0], 0);
      assert.equal(field.at(-1), 0);
    }
  }
});

test("suppressed route jumps reset the velocity baseline", () => {
  const jumped = mountCoil();
  const control = mountCoil();
  jumped.suppress(true);
  control.suppress(true);
  jumped.scroll(1000);
  control.scroll(0);
  jumped.suppress(false);
  control.suppress(false);
  jumped.scroll(1);
  control.scroll(1);
  assert.deepEqual(jumped.offsets(), control.offsets());
});

test("snake wakes use slow travel and randomized body-scale bends", () => {
  assert.ok(motion.VIBRATE_HZ_BASE >= 1 && motion.VIBRATE_HZ_BASE <= 2.5);
  const wavelengths = [];
  for (let i = 0; i < 500; i++) {
    const seed = motion.freshBurstSeed();
    assert.ok(seed.wavelength >= 0.28 && seed.wavelength <= 0.55);
    assert.ok(seed.harmonicWeight >= 0.15 && seed.harmonicWeight <= 0.35);
    assert.ok(seed.hzScale >= 0.7 && seed.hzScale <= 1.3);
    assert.ok(seed.ampScale >= 0.85 && seed.ampScale <= 1);
    assert.ok(seed.phase >= 0 && seed.phase <= Math.PI * 2);
    assert.ok(seed.harmonicPhase >= 0 && seed.harmonicPhase <= Math.PI * 2);
    assert.ok(Math.abs(seed.stringPhaseLag) <= 0.035);
    wavelengths.push(seed.wavelength);
  }

  assert.ok(Math.max(...wavelengths) - Math.min(...wavelengths) > 0.2);
});

test("phase moves the body along Y, not a scalar flip of a frozen field", () => {
  for (let burst = 0; burst < 30; burst++) {
    const seed = { ...motion.freshBurstSeed(), direction: burst % 2 ? 1 : -1 };
    const start = pathOffsets(seed, 0);
    const delta = Math.PI / 2;
    const next = pathOffsets(seed, delta);
    assert.ok(start.length >= 97);
    assert.ok(Math.max(...start.map(Math.abs)) > 15);
    const scale = dot(start, next) / dot(start, start);
    const residual = next.map((x, i) => x - scale * start[i]);
    assert.ok(dot(residual, residual) / dot(next, next) > 0.4);
    // Removing the fixed envelope, the entire body must translate coherently.
    const shift = (seed.direction * delta * seed.wavelength) / (Math.PI * 2);
    for (const y of [0.3, 0.5, 0.7]) {
      const later = motion.spatialRipple(y + shift, 1, 0, seed, delta, seed.direction);
      const earlier = motion.spatialRipple(y, 1, 0, seed, 0, seed.direction);
      assert.ok(Math.abs(later - earlier) < 1e-12);
    }
    const offsets = start.filter((x, i) => i > start.length * 0.1 && i < start.length * 0.9);
    const crossings = offsets.slice(1).filter((x, i) => x * offsets[i] < 0).length;
    assert.ok(crossings >= 2, "multiple visible S-bends, not one broad bulge");
  }
});

test("fresh wakes differ meaningfully in their center paths", () => {
  for (let burst = 0; burst < 30; burst++) {
    const a = pathOffsets(motion.freshBurstSeed(), 0);
    const b = pathOffsets(motion.freshBurstSeed(), 0);
    const center = a.map((x, i) => x - b[i]).slice(a.length / 4, (a.length * 3) / 4);
    assert.ok(Math.sqrt(dot(center, center) / center.length) > 3);
  }
});

test("snake stays smooth, bounded and centered over a full travel cycle", () => {
  for (let burst = 0; burst < 20; burst++) {
    const seed = motion.freshBurstSeed();
    for (let index = 0; index < 6; index++) {
      let sum = 0;
      for (let frame = 0; frame < 512; frame++) {
        const phase = (frame / 512) * Math.PI * 2;
        const field = (y) => motion.spatialRipple(y, 1, index, seed, phase);
        const value = field(0.5);
        sum += value;
        assert.ok(Math.abs(value) <= 1);
        const step = 0.0001;
        const curvature = Math.abs((field(0.5 + step) - 2 * value + field(0.5 - step)) / step ** 2);
        assert.ok(curvature < 1000, "no clipped corners or discontinuities");
      }
      assert.ok(Math.abs(sum / 512) < 1e-12, "no DC drift");
    }
  }
});

test("sin-squared taper has exact flat ends and a strong center", () => {
  assert.equal(motion.diffractionEnv(0), 0);
  assert.equal(motion.diffractionEnv(1), 0);
  assert.equal(motion.diffractionEnv(0.5), 1);
  for (const t of [0.001, 0.01, 0.03, 0.05]) {
    assert.ok(motion.diffractionEnv(t) <= Math.PI ** 2 * t ** 2);
    assert.ok(Math.abs(motion.diffractionEnv(t) - motion.diffractionEnv(1 - t)) < 1e-12);
  }
  assert.ok(motion.diffractionEnv(1 / 3) > 0.7);
  assert.ok(motion.diffractionEnv(2 / 3) > 0.7);
});

test("six strings preserve amplitude/layout budget, spacing and static fallback", () => {
  assert.equal(motion.STRING_COUNT, 6);
  assert.ok(motion.SAMPLE_COUNT >= 96);
  assert.ok(motion.VIBRATE_DECAY_MS >= 1500 && motion.VIBRATE_DECAY_MS <= 2000);
  for (const [width, groupWidth] of [
    [390, 56],
    [1440, 92],
  ]) {
    const layout = motion.groupLayout(width);
    assert.equal(layout.groupWidth, groupWidth);
    assert.equal(layout.amplitude, (groupWidth / 5) * 0.95 * 3);
    assert.equal(layout.sidePad, Math.ceil(layout.amplitude * 1.15 + 8));
    for (let burst = 0; burst < 30; burst++) {
      const seed = motion.freshBurstSeed();
      const paths = [];
      for (let index = 0; index < 6; index++) {
        const base = layout.sidePad + (index / 5) * groupWidth;
        const path = buildPath(base, 900, index, layout.amplitude, 1, 1, seed, true);
        const points = [...path.matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)].map((m) => Number(m[1]));
        paths.push(points);
        assert.ok(Math.abs(points[0] - base) <= 0.01);
        assert.ok(Math.abs(points.at(-1) - base) <= 0.01);
        assert.ok(points.every((x) => Math.abs(x - base) <= layout.amplitude + 0.01));
        for (const [gain, animate] of [
          [1, false],
          [0, true],
        ]) {
          assert.equal(
            buildPath(base, 900, index, layout.amplitude, gain, 1, seed, animate),
            `M ${base} 0 L ${base} 900`,
          );
        }
      }
      for (let index = 1; index < 6; index++) {
        assert.ok(
          paths[index].every((x, i) => x > paths[index - 1][i]),
          "no string crossings",
        );
      }
    }
  }
});
