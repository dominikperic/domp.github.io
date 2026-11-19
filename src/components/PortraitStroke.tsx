"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { CONTAINER_INLINE_GUTTER_PX, CONTAINER_MAX_PX } from "@/lib/stringGutterLayout";

type Placement = { left: number; top: number; width: number; visible: boolean };

/** Natural aspect of the detailed sketch asset (1122×1402). */
const PORTRAIT_ASPECT = 1402 / 1122;

const ASSET = "/portraits/dominik-portrait-stroke-hd.svg";

/**
 * RIGHT empty gutter — same geometry family as CroatiaKingdomMapPlate.
 * Vertically centered on #home-intro (name + personal life paragraphs).
 */
export function portraitPlacement(
  stage: Pick<DOMRect, "left" | "top">,
  intro: { top: number; height: number },
  viewportWidth: number,
  measuredHeight?: number,
): Placement | null {
  if (viewportWidth < 960) return null;

  const contentW = Math.min(viewportWidth - CONTAINER_INLINE_GUTTER_PX, CONTAINER_MAX_PX);
  const sideGutter = Math.max(0, (viewportWidth - contentW) / 2);
  const textColMax = Math.min(42 * 16, contentW);
  const textLeftBias = Math.max(0, (contentW - textColMax) * 0.28);
  const textRight = sideGutter + textLeftBias + textColMax;
  const rightEmpty = viewportWidth - textRight - 12;

  if (rightEmpty < 200) return null;

  // Full gutter fit, then scale to 78.75% (75% + 5%) while preserving center position.
  const fullWidth = Math.min(440, Math.max(320, rightEmpty * 0.94));
  const fullLeftViewport = textRight + Math.max(8, (rightEmpty - fullWidth) * 0.26);
  const width = fullWidth * 0.7875;
  const leftViewport = fullLeftViewport + (fullWidth - width) / 2;
  const left = leftViewport - stage.left;

  const introTop = intro.top - stage.top;
  const portraitH =
    measuredHeight && measuredHeight > 40 ? measuredHeight : width * PORTRAIT_ASPECT;
  const top = introTop + intro.height / 2 - portraitH / 2;

  return { left, top, width, visible: true };
}

/** Full-stage sibling of PageShell — RIGHT of intro, large brass stroke portrait. */
export function PortraitStrokePlate() {
  const rootRef = useRef<HTMLElement>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);

  useLayoutEffect(() => {
    const stage = document.getElementById("home-stage");
    const intro = document.getElementById("home-intro");
    if (!stage || !intro) return;

    let active = true;
    const place = () => {
      if (!active) return;
      const next = portraitPlacement(
        stage.getBoundingClientRect(),
        {
          top: intro.getBoundingClientRect().top,
          height: intro.offsetHeight,
        },
        window.innerWidth,
        rootRef.current?.offsetHeight,
      );
      setPlacement((previous) => {
        if (!next) return previous?.visible ? { ...previous, visible: false } : previous;
        if (
          previous?.visible &&
          Math.abs(previous.left - next.left) < 0.5 &&
          Math.abs(previous.top - next.top) < 0.5 &&
          Math.abs(previous.width - next.width) < 0.5
        ) {
          return previous;
        }
        return next;
      });
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(stage);
    observer.observe(intro);
    if (rootRef.current) observer.observe(rootRef.current);
    window.addEventListener("resize", place);
    const t1 = window.setTimeout(place, 50);
    const t2 = window.setTimeout(place, 300);
    document.fonts?.ready.then(place).catch(() => {});

    return () => {
      active = false;
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [placement?.visible, placement?.width]);

  if (!placement?.visible) {
    return (
      <aside
        ref={rootRef}
        className="pointer-events-none absolute left-0 top-0 -z-10 h-0 w-0 overflow-hidden opacity-0"
        aria-hidden
      />
    );
  }

  return (
    <aside
      ref={rootRef}
      aria-label="Portrait of Dominik Peric"
      className="pointer-events-none absolute z-[6] hidden min-[960px]:block"
      style={{ left: placement.left, top: placement.top, width: placement.width }}
    >
      <PortraitStroke />
    </aside>
  );
}

/** Native-resolution source contours; drawing and reduced motion live in the SVG. */
export function PortraitStroke({ className = "block h-auto w-full" }: { className?: string }) {
  return (
    <object
      data={ASSET}
      type="image/svg+xml"
      role="img"
      aria-label="Brass line portrait of Dominik Peric"
      className={className}
      width={1122}
      height={1402}
      style={{ width: "100%", height: "auto", aspectRatio: "1122 / 1402", colorScheme: "normal" }}
    >
      Brass line portrait of Dominik Peric
    </object>
  );
}
