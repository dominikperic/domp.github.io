import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = fileURLToPath(new URL("../", import.meta.url));

function loadPortrait(react = React) {
  const filename = path.join(root, "src/components/PortraitStroke.tsx");
  assert.ok(fs.existsSync(filename), "PortraitStroke component must exist");
  const source = fs.readFileSync(filename, "utf8");
  assert.match(source, /^"use client";/, "portrait is a client boundary");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
    },
    fileName: filename,
  });
  const loaded = new Module(filename);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  const prev = Module._extensions[".ts"];
  Module._extensions[".ts"] = (mod, filename) => {
    const src = fs.readFileSync(filename, "utf8");
    const out = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
      fileName: filename,
    }).outputText;
    mod._compile(out, filename);
  };
  loaded.require = (id) => {
    if (id === "react") return react;
    if (id === "@/lib/stringGutterLayout") {
      return originalRequire(path.join(root, "src/lib/stringGutterLayout.ts"));
    }
    return originalRequire(id);
  };
  try {
    loaded._compile(compiled.outputText, filename);
  } finally {
    if (prev) Module._extensions[".ts"] = prev;
    else delete Module._extensions[".ts"];
  }
  return loaded.exports;
}

test("renders a transparent standalone pen-animation asset, not a raster wipe", () => {
  const html = renderToStaticMarkup(
    React.createElement(loadPortrait().PortraitStroke, { className: "portrait-test" }),
  );
  assert.match(html, /<object\b/);
  assert.match(html, /data="\/portraits\/dominik-portrait-stroke-hd.svg"/);
  assert.match(html, /type="image\/svg\+xml"/);
  assert.match(html, /aria-label="Brass line portrait of Dominik Peric"/);
  assert.match(html, /color-scheme:normal/);
  assert.match(html, /class="portrait-test"/);
  assert.doesNotMatch(html, /<canvas\b/);
});

test("HD asset draws ordered fine vector paths in 3–6 seconds with instant reduced motion", () => {
  const filename = path.join(root, "public/portraits/dominik-portrait-stroke-hd.svg");
  assert.ok(fs.existsSync(filename), "HD stroke SVG must exist");
  const svg = fs.readFileSync(filename, "utf8");
  assert.match(svg, /viewBox="0 0 1122 1402"/);
  assert.match(svg, /stroke="#d4a04a"/);
  assert.doesNotMatch(svg, /<(?:mask|clipPath|rect)\b/);
  assert.match(svg, /stroke-dashoffset:\s*1/);
  assert.match(svg, /stroke-dashoffset:\s*0/);
  assert.match(svg, /prefers-reduced-motion:\s*reduce/);
  assert.match(svg, /animation:\s*none\s*!important/);
  const strokes = [
    ...svg.matchAll(
      /<path\s+[^>]*d="([^"]+)"[^>]*style="--start:([\d.]+)ms;--duration:([\d.]+)ms"/g,
    ),
  ];
  assert.ok(strokes.length > 1500, `expected detailed source trace, got ${strokes.length}`);
  assert.ok(
    strokes.length <= 9000,
    "bound concurrent CSS animation objects for responsive playback",
  );
  let end = 0;
  for (const [, d, start, duration] of strokes) {
    assert.equal((d.match(/M/g) || []).length, 1, "each stroke has one continuous pen run");
    assert.ok(Number(start) >= end - 0.02, "pen runs must be sequential, not a global wipe");
    assert.ok(Number(duration) > 0);
    end = Number(start) + Number(duration);
  }
  assert.ok(end >= 3000 && end <= 6000, `total draw time ${end}ms`);
});

test("source-faithful TL→BR fill starts halfway through the pen pass at the same duration", () => {
  const svg = fs.readFileSync(
    path.join(root, "public/portraits/dominik-portrait-stroke-hd.svg"),
    "utf8",
  );
  assert.match(svg, /<image[^>]+class="tonal-finish"[^>]+href="dominik-portrait-detailed.png"/);
  const strokes = [...svg.matchAll(/--start:([\d.]+)ms;--duration:([\d.]+)ms/g)];
  const last = strokes.at(-1);
  assert.ok(last, "stroke timeline exists");
  const strokeMs = Number(last[1]) + Number(last[2]);
  assert.ok(Math.abs(strokeMs - 4800) < 0.02, "keep the full 4800ms pen pass");
  const fill = svg.match(/animation:\s*fill-tl-br\s+([\d.]+)ms[^;]*?\s([\d.]+)ms forwards/);
  assert.ok(fill, "fill animation declares duration and delay");
  const [, duration, start] = fill.map(Number);
  assert.ok(Math.abs(start - strokeMs * 0.5) < 0.02, "fill begins halfway through pen");
  assert.ok(Math.abs(duration - strokeMs) < 0.02, "fill lasts one full pen pass");
  const settle = svg.match(/animation:\s*settle\s+([\d.]+)ms linear ([\d.]+)ms forwards/);
  assert.ok(settle, "pen fades near the end of the fill");
  const settleEnd = Number(settle[1]) + Number(settle[2]);
  assert.ok(Number(settle[2]) >= start + duration * 0.85);
  assert.ok(settleEnd <= start + duration, "pen is gone by the final 7200ms frame");
  assert.match(svg, /@keyframes fill-tl-br/);
  assert.match(svg, /clip-path:\s*polygon/);
  assert.match(
    svg,
    /\.tonal-finish\s*\{\s*animation:\s*none\s*!important;[\s\S]*?opacity:\s*1;[\s\S]*?clip-path:\s*none/,
  );
});

test("tonal fill sweeps at constant diagonal speed without a midpoint topology change", () => {
  const svg = fs.readFileSync(
    path.join(root, "public/portraits/dominik-portrait-stroke-hd.svg"),
    "utf8",
  );
  assert.match(svg, /animation:\s*fill-tl-br\s+4800ms linear 2400ms forwards/);
  const keyframes = svg.match(/@keyframes fill-tl-br\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(keyframes, "fill keyframes exist");
  const frames = [...keyframes.matchAll(/([\d.]+)%\s*\{\s*clip-path:\s*polygon\(([^)]+)\)/g)];
  assert.deepEqual(
    frames.map((frame) => Number(frame[1])),
    [0, 100],
  );
  assert.deepEqual(
    frames.map((frame) => frame[2].split(",").map((point) => point.trim())),
    [
      ["0% 0%", "0% 0%", "0% 0%"],
      ["0% 0%", "200% 0%", "0% 200%"],
    ],
    "matching triangle vertices keep the hypotenuse moving linearly across the full viewBox",
  );
});

test("pen strokes are ordered top-left toward bottom-right", () => {
  const svg = fs.readFileSync(
    path.join(root, "public/portraits/dominik-portrait-stroke-hd.svg"),
    "utf8",
  );
  const strokes = [
    ...svg.matchAll(
      /<path\s+[^>]*d="([^"]+)"[^>]*style="--start:([\d.]+)ms;--duration:([\d.]+)ms"/g,
    ),
  ];
  function centroid(d) {
    const nums = [...d.matchAll(/([\d.]+),([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    const mx = nums.reduce((s, p) => s + p[0], 0) / nums.length;
    const my = nums.reduce((s, p) => s + p[1], 0) / nums.length;
    return mx + my;
  }
  const early = strokes.slice(0, 80).map((m) => centroid(m[1]));
  const late = strokes.slice(-80).map((m) => centroid(m[1]));
  const earlyMed = early.sort((a, b) => a - b)[Math.floor(early.length / 2)];
  const lateMed = late.sort((a, b) => a - b)[Math.floor(late.length / 2)];
  assert.ok(
    earlyMed < lateMed,
    `expected early strokes nearer top-left than late (early=${earlyMed}, late=${lateMed})`,
  );
});

test("detailed brass PNG asset exists (transparent, from user sketch)", () => {
  const asset = path.join(root, "public/portraits/dominik-portrait-detailed.png");
  assert.ok(fs.existsSync(asset), "detailed brass portrait PNG must exist");
  assert.ok(fs.statSync(asset).size > 100_000, "asset should carry pencil detail");
});

test("home places the portrait beside PageShell, with a real name-and-bio intro target", () => {
  const page = fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
  const tree = ts.createSourceFile(
    "page.tsx",
    page,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const elements = [];
  function visit(node) {
    if (ts.isJsxElement(node)) elements.push(node);
    ts.forEachChild(node, visit);
  }
  visit(tree);
  const byId = (id) =>
    elements.find((node) =>
      node.openingElement.attributes.properties.some(
        (attr) =>
          ts.isJsxAttribute(attr) && attr.name.text === "id" && attr.initializer?.text === id,
      ),
    );
  const stage = byId("home-stage");
  const intro = byId("home-intro");
  assert.ok(intro, "home-intro must be a DOM wrapper, not a prop lost by FadeIn");
  assert.match(intro.getText(tree), /siteConfig\.name/);
  assert.match(intro.getText(tree), /siteConfig\.summary(?:Paragraphs)?\b/);
  assert.doesNotMatch(intro.getText(tree), /PortraitStroke/);
  const childTags = stage.children.map((node) =>
    ts.isJsxSelfClosingElement(node)
      ? node.tagName.getText(tree)
      : ts.isJsxElement(node)
        ? node.openingElement.tagName.getText(tree)
        : null,
  );
  assert.ok(childTags.includes("PortraitStrokePlate"), "plate is a sibling of PageShell");
  assert.ok(childTags.includes("PageShell"));
});

test("portrait sits in the RIGHT gutter at 75% size, centered on intro relative to stage", () => {
  const { portraitPlacement } = loadPortrait();
  assert.equal(typeof portraitPlacement, "function", "export the measured placement calculation");
  const stage = { left: 0, top: 80 };
  const intro = { top: 120, height: 420 };
  const wide = portraitPlacement(stage, intro, 1920);
  assert.ok(wide);
  assert.equal(wide.visible, true);
  // Full fit caps at 440; 75% + 5% → 78.75% → 346.5
  assert.equal(wide.width, 346.5, `expected ~79% of full plate, got ${wide.width}`);
  assert.ok(wide.left > 1100, `expected right gutter left=${wide.left}`);
  assert.ok(wide.left + wide.width < 1920);
  const portraitH = (wide.width * 1402) / 1122;
  assert.ok(Math.abs(wide.top + portraitH / 2 - (intro.top - stage.top + intro.height / 2)) < 0.01);
  assert.equal(portraitPlacement(stage, intro, 800), null, "hidden on narrow viewports");
  assert.equal(portraitPlacement(stage, intro, 960), null);

  const shifted = portraitPlacement({ left: 30, top: -400 }, { top: -360, height: 420 }, 1920);
  assert.equal(shifted.width, wide.width);
  assert.equal(shifted.top, wide.top);
  assert.equal(shifted.left, wide.left - 30, "stage translation offsets left only");
});
