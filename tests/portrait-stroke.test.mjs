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

test("source-faithful tonal finish fades only after the pen phase, without clipping or wiping", () => {
  const svg = fs.readFileSync(
    path.join(root, "public/portraits/dominik-portrait-stroke-hd.svg"),
    "utf8",
  );
  assert.match(svg, /<image[^>]+class="tonal-finish"[^>]+href="dominik-portrait-detailed.png"/);
  assert.match(
    svg,
    /\.tonal-finish\s*\{[^}]*opacity:\s*0;[^}]*animation:\s*finish 400ms linear 4800ms forwards/,
  );
  assert.match(svg, /@keyframes finish\s*\{\s*to\s*\{\s*opacity:\s*1/);
  assert.match(svg, /\.tonal-finish\s*\{\s*animation:\s*none\s*!important;\s*opacity:\s*1/);
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
