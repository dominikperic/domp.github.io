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

test("scroll bursts use lower temporal frequencies and longer dominant waves", () => {
  assert.ok(
    motion.VIBRATE_HZ_BASE >= 8 && motion.VIBRATE_HZ_BASE <= 11,
    "base should be 8–11 Hz, not strum blur",
  );
  for (let i = 0; i < 500; i++) {
    const seed = motion.freshBurstSeed();
    assert.ok(seed.hzScale >= 0.75 && seed.hzScale <= 1.05);
    assert.ok(seed.tHz2 >= 1.2 && seed.tHz2 <= 1.8);
    assert.ok(seed.tHz3 >= 0.35 && seed.tHz3 <= 0.7);
    assert.ok(seed.len1 >= 0.36 && seed.len1 <= 0.55);
    assert.ok(seed.len2 >= 0.22 && seed.len2 <= 0.34);
    assert.ok(seed.len3 >= 0.6 && seed.len3 <= 0.9);
    assert.ok(seed.w3 > seed.w1 && seed.w3 > seed.w2, "longest wave dominates");
    assert.ok(Math.abs(seed.w1 + seed.w2 + seed.w3 - 1) < 1e-12);
  }
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
