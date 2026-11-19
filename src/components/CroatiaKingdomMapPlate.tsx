"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { CONTAINER_MAX_PX, CONTAINER_INLINE_GUTTER_PX } from "@/lib/stringGutterLayout";
import { cx } from "@/lib/utils";

/**
 * Marker positions as % of the kingdom SVG viewBox
 * (Natural Earth 50m HR+BA bounds, pad 0.2 — same as croatia-kingdom-antique.svg).
 */
const PARENT_PLACES = [
  {
    id: "capljina",
    label: "Čapljina",
    detail: "Mother’s hometown in Herzegovina, near Mostar.",
    href: "https://en.wikipedia.org/wiki/%C4%8Capljina",
    leftPct: 65.67,
    topPct: 80.26,
  },
  {
    id: "gradacac",
    label: "Gradačac",
    detail: "Father’s hometown in northern Bosnia.",
    href: "https://en.wikipedia.org/wiki/Grada%C4%8Dac",
    leftPct: 79.03,
    topPct: 41.24,
  },
] as const;

/**
 * Antique kingdom map in the RIGHT empty gutter — not inside the Identity text column.
 * Always vertically centered on #identity (measured live).
 */
export function CroatiaKingdomMapPlate() {
  const tipId = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const [style, setStyle] = useState<{
    left: number;
    top: number;
    width: number;
    visible: boolean;
  }>({ left: 0, top: 0, width: 260, visible: false });

  useLayoutEffect(() => {
    const place = () => {
      const stage = document.getElementById("home-stage");
      const identity = document.getElementById("identity");
      const vw = window.innerWidth;

      if (!stage || !identity || vw < 960) {
        setStyle((s) => (s.visible ? { ...s, visible: false } : s));
        return;
      }

      const stageRect = stage.getBoundingClientRect();
      const idRect = identity.getBoundingClientRect();

      const contentW = Math.min(vw - CONTAINER_INLINE_GUTTER_PX, CONTAINER_MAX_PX);
      const sideGutter = Math.max(0, (vw - contentW) / 2);
      const textColMax = Math.min(42 * 16, contentW);
      const textLeftBias = Math.max(0, (contentW - textColMax) * 0.28);
      const textRight = sideGutter + textLeftBias + textColMax;
      const rightEmpty = vw - textRight - 12;

      if (rightEmpty < 150) {
        setStyle((s) => (s.visible ? { ...s, visible: false } : s));
        return;
      }

      const mapW = Math.min(360, Math.max(220, rightEmpty * 0.9));
      const leftViewport = textRight + Math.max(10, (rightEmpty - mapW) * 0.3);
      const left = leftViewport - stageRect.left;

      // Identity top relative to home-stage (stable while scrolling)
      const identityTop = idRect.top - stageRect.top;
      const identityH = identity.offsetHeight;

      // Prefer real plate height once mounted; fall back to estimate
      const measuredH = rootRef.current?.offsetHeight;
      const mapH = measuredH && measuredH > 40 ? measuredH : mapW * 0.92 + 44;

      // Center map on Identity block
      const top = identityTop + identityH / 2 - mapH / 2;

      setStyle((prev) => {
        if (
          prev.visible &&
          Math.abs(prev.left - left) < 0.5 &&
          Math.abs(prev.top - top) < 0.5 &&
          Math.abs(prev.width - mapW) < 0.5
        ) {
          return prev;
        }
        return { left, top, width: mapW, visible: true };
      });
    };

    place();
    const ro = new ResizeObserver(() => place());
    const identity = document.getElementById("identity");
    const stage = document.getElementById("home-stage");
    if (identity) ro.observe(identity);
    if (stage) ro.observe(stage);
    if (rootRef.current) ro.observe(rootRef.current);

    window.addEventListener("resize", place);
    // Fonts / fade-in can change Identity height after first paint
    const t1 = window.setTimeout(place, 50);
    const t2 = window.setTimeout(place, 250);
    const t3 = window.setTimeout(place, 600);
    document.fonts?.ready?.then(() => place()).catch(() => {});

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [style.visible, style.width]);

  // Close tooltip on outside click / Escape
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    const onPointer = (e: MouseEvent | PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [openId]);

  if (!style.visible) {
    // Keep a hidden probe so ResizeObserver can attach after first wide layout
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
      className="absolute z-[5] hidden min-[960px]:block"
      style={{ left: style.left, top: style.top, width: style.width }}
      aria-label="Historical map plate"
    >
      <figure className="m-0">
        {/* Taller plate (stretch down only); same width; markers scale with the map */}
        <div
          className="relative w-full origin-top"
          style={{ transform: "scaleY(1.32)", marginBottom: "22%" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG + CSS sepia */}
          <img
            src="/maps/croatia-kingdom-antique.svg"
            alt="Old-style map of the Croatian Kingdom including Bosnia"
            className="croatia-map-antique pointer-events-none block h-auto w-full"
            width={640}
            height={460}
            decoding="async"
            onLoad={() => {
              // Recenter after image intrinsic size is known
              window.dispatchEvent(new Event("resize"));
            }}
          />

          {PARENT_PLACES.map((place) => {
            const open = openId === place.id;
            return (
              <div
                key={place.id}
                className={cx(
                  "absolute -translate-x-1/2 -translate-y-1/2",
                  open ? "z-40" : "z-10",
                )}
                style={{ left: `${place.leftPct}%`, top: `${place.topPct}%` }}
              >
                <button
                  type="button"
                  className={cx(
                    "relative flex h-3.5 w-3.5 items-center justify-center rounded-full",
                    "border border-brass bg-accent shadow-[0_0_0_3px_rgba(212,160,74,0.25)]",
                    "transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  )}
                  aria-expanded={open}
                  aria-controls={`${tipId}-${place.id}`}
                  aria-label={`${place.label}: parent hometown`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenId((id) => (id === place.id ? null : place.id));
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2a1c0a]" />
                </button>

                {open ? (
                  <div
                    id={`${tipId}-${place.id}`}
                    role="tooltip"
                    className={cx(
                      "absolute left-1/2 z-50 w-max max-w-[12rem] -translate-x-1/2",
                      place.topPct > 55 ? "bottom-[calc(100%+0.55rem)]" : "top-[calc(100%+0.55rem)]",
                      "rounded-sm border border-border-strong bg-card px-2.5 py-2 text-left shadow-lg",
                    )}
                  >
                    <a
                      href={place.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-sm text-accent transition-colors hover:text-brass"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {place.label}
                    </a>
                    <p className="mt-1 text-[12px] leading-snug text-muted">{place.detail}</p>
                    <a
                      href={place.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.12em] text-subtle transition-colors hover:text-accent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Wikipedia ↗
                    </a>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <figcaption className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-subtle sm:text-[10px]">
          Kingdom of Croatia
          <span className="mt-0.5 block normal-case tracking-normal text-subtle/85">
            with Bosnia
          </span>
        </figcaption>
      </figure>
    </aside>
  );
}
