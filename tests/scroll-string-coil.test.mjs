import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Execute the actual private motion helpers without mounting React or changing
// the component's public API. A deterministic RNG covers reproducible bursts.
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
    `${source}\nexports.motion = { freshBurstSeed, groupLayout, diffractionEnv, spatialRipple, temporalOsc, buildStringPath, VIBRATE_HZ_BASE, VIBRATE_DECAY_MS, STRING_COUNT };`,
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  ).outputText,
  context,
);
const motion = context.exports.motion;

test("streamline bursts favor one viewport-scale wave and a soft fundamental", () => {
  assert.ok(motion.VIBRATE_HZ_BASE >= 7 && motion.VIBRATE_HZ_BASE <= 9);
  for (let i = 0; i < 500; i++) {
    const seed = motion.freshBurstSeed();
    assert.ok(seed.hzScale >= 0.75 && seed.hzScale <= 1.05);
    assert.ok(seed.tHz2 >= 1.05 && seed.tHz2 <= 1.3);
    assert.ok(seed.tHz3 >= 0.35 && seed.tHz3 <= 0.7);
    assert.ok(seed.len1 >= 0.65 && seed.len1 <= 0.85);
    assert.ok(seed.len2 >= 0.45 && seed.len2 <= 0.6);
    assert.ok(seed.len3 >= 0.95 && seed.len3 <= 1.35);
    assert.ok(seed.w3 >= 0.79, "viewport-scale wave dominates weak secondary bends");
    assert.ok(seed.tW1 >= 0.86, "temporal fundamental dominates");
    assert.ok(Math.abs(seed.w1 + seed.w2 + seed.w3 - 1) < 1e-12);
    assert.ok(Math.abs(seed.tW1 + seed.tW2 + seed.tW3 - 1) < 1e-12);
  }
});

test("spatial bends and temporal turns have continuous, bounded curvature", () => {
  const step = 0.001;
  for (let burst = 0; burst < 50; burst++) {
    const seed = motion.freshBurstSeed();
    for (let i = 1; i < 1000; i++) {
      const t = i / 1000;
      const spatial = (y) => motion.spatialRipple(y, 1, burst % 6, seed);
      const temporal = (phase) => motion.temporalOsc(phase, seed);
      for (const [field, position, limit] of [
        [spatial, t, 80],
        [temporal, t * Math.PI * 4, 1.2],
      ]) {
        const center = field(position);
        const curvature = Math.abs(
          (field(position + step) - 2 * center + field(position - step)) / step ** 2,
        );
        assert.ok(Math.abs(center) <= 1, "normalized fields preserve the amplitude ceiling");
        assert.ok(curvature < limit, `smooth curvature ${curvature} must stay below ${limit}`);
      }
    }
  }
});

function pathOffsets(seed, phase, index = 0) {
  return [
    ...motion
      .buildStringPath(100, 900, index, 50, 1, phase, seed, true)
      .matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g),
  ].map((m) => Number(m[1]) - 100);
}

test("phase advances a traveling body instead of scaling a frozen shape", () => {
  const seed = motion.freshBurstSeed();
  const start = pathOffsets(seed, 0);
  const next = pathOffsets(seed, Math.PI / 2);
  assert.equal(start.length, 97, "phase zero must still contain a wavy body");
  assert.ok(Math.max(...start.map(Math.abs)) > 10);
  const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
  const scale = dot(start, next) / dot(start, start);
  const residual = next.map((x, i) => x - scale * start[i]);
  assert.ok(
    dot(residual, residual) / dot(next, next) > 0.2,
    "later frames cannot be scalar multiples of the same fixed field",
  );
});

test("traveling bends stay centered over time and differ across wakes", () => {
  for (let burst = 0; burst < 8; burst++) {
    const seed = motion.freshBurstSeed();
    for (let index = 0; index < 6; index++) {
      for (const y of [0.25, 0.5, 0.75]) {
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;
        for (let frame = 0; frame < 4096; frame++) {
          const phase = (frame / 4096) * Math.PI * 256;
          const offset = motion.spatialRipple(y, 1, index, seed, phase);
          sum += offset;
          min = Math.min(min, offset);
          max = Math.max(max, offset);
        }
        assert.ok(Math.abs(sum / 4096) < 0.004, "no DC drift from the resting line");
        assert.ok(min < -0.2 && max > 0.2, "body bends to both sides of rest");
      }
    }
    assert.notDeepEqual(pathOffsets(seed, 0.5), pathOffsets(motion.freshBurstSeed(), 0.5));
  }
});

test("viewport taper is smooth, flat-ended and strongest through the middle", () => {
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

test("six strings retain their swing budget, edge taper and static fallback", () => {
  assert.equal(motion.STRING_COUNT, 6);
  assert.equal(motion.VIBRATE_DECAY_MS, 1500);
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
      for (let index = 0; index < 6; index++) {
        const base = layout.sidePad + (index / 5) * groupWidth;
        const path = motion.buildStringPath(base, 900, index, layout.amplitude, 1, 1, seed, true);
        const points = [...path.matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)].map((m) => [
          Number(m[1]),
          Number(m[2]),
        ]);
        assert.ok(Math.abs(points[0][0] - base) <= 0.01);
        assert.ok(Math.abs(points.at(-1)[0] - base) <= 0.01);
        assert.ok(points.every(([x]) => Math.abs(x - base) <= layout.amplitude + 0.01));
        assert.equal(
          motion.buildStringPath(base, 900, index, layout.amplitude, 1, 1, seed, false),
          `M ${base} 0 L ${base} 900`,
        );
        assert.equal(
          motion.buildStringPath(base, 900, index, layout.amplitude, 0, 1, seed, true),
          `M ${base} 0 L ${base} 900`,
        );
      }
    }
  }
  assert.equal(motion.diffractionEnv(0.5), 1);
  assert.ok(motion.diffractionEnv(0.01) < 0.04);
  assert.ok(motion.diffractionEnv(0.99) < 0.04);
  assert.notDeepEqual(motion.freshBurstSeed(), motion.freshBurstSeed());
});
