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
    `${source}\nexports.motion = { freshBurstSeed, groupLayout, diffractionEnv, spatialRipple, buildStringPath, VIBRATE_HZ_BASE, VIBRATE_DECAY_MS, SAMPLE_COUNT, STRING_COUNT };`,
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  ).outputText,
  context,
);
const motion = context.exports.motion;
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
function pathOffsets(seed, phase, index = 0) {
  return [
    ...motion
      .buildStringPath(100, 900, index, 50, 1, phase, seed, true)
      .matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g),
  ].map((m) => Number(m[1]) - 100);
}

test("snake wakes use slow travel and randomized body-scale bends", () => {
  assert.ok(motion.VIBRATE_HZ_BASE >= 1 && motion.VIBRATE_HZ_BASE <= 2.5);
  const directions = new Set();
  const wavelengths = [];
  for (let i = 0; i < 500; i++) {
    const seed = motion.freshBurstSeed();
    assert.ok(seed.wavelength >= 0.28 && seed.wavelength <= 0.55);
    assert.ok(seed.harmonicWeight >= 0.15 && seed.harmonicWeight <= 0.35);
    assert.ok(seed.hzScale >= 0.7 && seed.hzScale <= 1.3);
    assert.ok(seed.ampScale >= 0.85 && seed.ampScale <= 1);
    assert.ok(seed.phase >= 0 && seed.phase <= Math.PI * 2);
    assert.ok(seed.harmonicPhase >= 0 && seed.harmonicPhase <= Math.PI * 2);
    assert.ok(seed.direction === -1 || seed.direction === 1);
    assert.ok(Math.abs(seed.stringPhaseLag) <= 0.035);
    directions.add(seed.direction);
    wavelengths.push(seed.wavelength);
  }
  assert.equal(directions.size, 2);
  assert.ok(Math.max(...wavelengths) - Math.min(...wavelengths) > 0.2);
});

test("phase moves the body along Y, not a scalar flip of a frozen field", () => {
  for (let burst = 0; burst < 30; burst++) {
    const seed = motion.freshBurstSeed();
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
      const later = motion.spatialRipple(y + shift, 1, 0, seed, delta);
      const earlier = motion.spatialRipple(y, 1, 0, seed, 0);
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
        const path = motion.buildStringPath(base, 900, index, layout.amplitude, 1, 1, seed, true);
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
            motion.buildStringPath(base, 900, index, layout.amplitude, gain, 1, seed, animate),
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
