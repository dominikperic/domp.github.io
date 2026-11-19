# HD portrait pen trace

`public/portraits/dominik-portrait-stroke-hd.svg` animates **actual source-derived vector strokes**, not a clipped/raster wipe. Its natural viewBox is the detailed source's 1122 × 1402 pixels. `PortraitStroke` embeds it with an object whose `colorScheme: "normal"` prevents Chromium's dark-scheme embedding canvas from painting white. Placement and measured intro-centering geometry are unchanged.

## Reproduce

From the repository root:

```sh
UV_CACHE_DIR=.portrait-work/uv-cache uv run --no-project \
  --with pillow==13.0.0 \
  --with opencv-python-headless==5.1.0.95 \
  --with numpy==2.5.5 \
  scripts/generate-portrait-strokes.py

node --test tests/portrait-stroke.test.mjs
npm run lint
npm run typecheck
```

The generator does not modify either input portrait. It writes the SVG and `.portrait-work/` inspection artifacts; do not commit the latter or its isolated dependency cache. The generated SVG records the detailed PNG's SHA-256. Dependency versions and extraction counts are recorded in `.portrait-work/trace-stats.json`.

## Extraction and ordering

1. Use **`dominik-portrait-detailed.png`**, the already logo-cleaned, source-aligned derivative of the canonical **`dominik-sketch-source.png`**. Do not extract from the logo-bearing original, synthesize facial landmarks, replace the nose, or redraw a generic head.
2. Composite RGB luminance against transparency. Interior tonal pencil detail is in RGB, not alpha; alpha-only tracing produces almost nothing except the outline.
3. Apply a native-resolution bilateral filter (7 px neighborhood, color sigma 24, spatial sigma 2), then Canny edges (28/65, L2 gradient). This suppresses the smallest grain without moving the actual nose, curls, eyelids, ears, jaw, neck, or shoulders.
4. Traverse the one-pixel edge graph into connected pen runs. Reject diagonal corner triangles, split at branches, and discard runs shorter than 8 source pixels. Simplify with a maximum 0.38 px error. This is a fine contour trace, not filled silhouette blobs or a coarse manually approximated face.
5. **Order top-left → bottom-right** by stroke centroid diagonal (`y + x`), then y, then x. Drawing starts at the crown/left and ends at the lower-right shoulders.
6. Give each run one `M` and connected `L` coordinates, normalized `pathLength="1"`, and a **non-overlapping, length-proportional** dash-offset animation. Total vector drawing time is **4800 ms**. The vector stroke is **#d4a04a**, width 1.4 native pixels, opacity 0.9, with round caps and joins.

## Honest visual tradeoff: hybrid tonal finish

Pure edge tracing preserves geometric position but cannot preserve the supplied sketch's continuous cheek/nose shading and dark curls. Visual inspection showed that an all-vector edge-only final image reads more like an engraving and exaggerates skin texture. The implementation therefore uses the permitted hybrid finish:

- **0–4.8 s:** genuine sequential brass vector pen strokes (unchanged TL→BR order); only strokes are visible for the first 2.4 s.
- **2.4–7.2 s:** the **unchanged source-faithful detailed PNG** fills with the existing **top-left → bottom-right diagonal wipe** (`fill-tl-br` clip-path animation). The fill starts halfway through the pen timeline and lasts **4800 ms**, the same full-pass duration as the strokes. Existing wipe keyframes and easing are unchanged.
- **6.48–6.83 s:** pen strokes fade out over 350 ms near the end of the fill.
- **After 7.2 s:** full detailed portrait, fully settled.
- **Reduced motion:** full final portrait immediately; all animations disabled.

The SVG's relative PNG reference requires the existing detailed PNG next to it. This deliberately avoids duplicating the raster as base64 and makes the source dependency explicit. Neither asset paints a background outside the portrait. The final image retains the source's brass tonal palette; only the actual vector pen strokes have the uniform #d4a04a color.

The generated asset contains 6412 pen runs and roughly 62k points. Thousands of tiny runs necessarily advance several times per display frame during the five-second sequence. It is a connected contour sketch, not a slow single-outline flourish. Small grain runs are omitted to bound browser animation overhead.

## Inspection artifacts

Under `.portrait-work/`:

- `portrait-vector-full.png`, `portrait-vector-face.png`, `portrait-vector-nose.png`: dark-background independent renders of the traced geometry before the tonal finish (supersampled approximation; browser captures are authoritative).
- `portrait-final-full.png`, `portrait-final-face.png`, `portrait-final-nose.png`: source-faithful final composite on dark.
- `portrait-before-after.png`: detailed source/final at left, edge-only trace at right; explicitly shows why the tonal finish is necessary.
- `portrait-page-midstroke.png`: actual desktop page, vector animation paused at 2.4 seconds using a debug-only stylesheet.
- `portrait-page-final.png`: actual desktop page at the final settled state.

The component keeps the existing 78.75% gutter fit and intro-centered measurement unchanged. Existing placement/integration tests remain alongside new asset, color-scheme, sequencing, reduced-motion and hybrid-finish contracts. The initial tests were observed failing against the canvas wipe; hybrid and animation-budget tests were separately observed failing before those changes.
