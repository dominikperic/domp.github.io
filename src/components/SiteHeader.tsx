"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navigation } from "@/content/site";
import {
  SCROLL_AUDIO_DEFAULT_VOLUME,
  setScrollAudioVolume,
  unlockScrollAudio,
} from "@/lib/scrollStringAudio";
import { stringGutterPlacement } from "@/lib/stringGutterLayout";
import { cx } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const volumeId = useId();
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(SCROLL_AUDIO_DEFAULT_VOLUME);
  /** Center the volume control over the string column (viewport px). */
  const [audioLeft, setAudioLeft] = useState(12);

  useEffect(() => {
    const place = () => {
      const { mid } = stringGutterPlacement(window.innerWidth);
      setAudioLeft(Math.max(8, mid));
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  // Keep engine volume in sync with default on mount (no unlock until gesture).
  useEffect(() => {
    setScrollAudioVolume(SCROLL_AUDIO_DEFAULT_VOLUME);
  }, []);

  const onVolumeChange = (value: number) => {
    setVolume(value);
    setScrollAudioVolume(value);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-md">
      <div className="relative h-14 w-full">
        <div
          style={{ left: audioLeft }}
          className="absolute top-[0.55rem] z-20 flex w-[9.5rem] -translate-x-1/2 flex-col items-center gap-1 sm:w-[11rem]"
        >
          <label
            htmlFor={volumeId}
            className="w-full text-center font-mono text-[9px] uppercase tracking-[0.16em] text-subtle sm:text-[10px]"
          >
            Scroll Audio
          </label>
          <input
            id={volumeId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            onPointerDown={() => unlockScrollAudio()}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            className={cx(
              "scroll-audio-slider h-1.5 w-full cursor-pointer appearance-none rounded-full",
              "bg-border accent-accent",
            )}
            aria-label="Scroll audio volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
          />
        </div>

        <div className="container-page flex h-full items-center justify-center">
          <nav className="hidden items-center justify-center gap-1 md:flex" aria-label="Primary">
            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
                    active ? "text-accent" : "text-subtle hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="absolute right-4 inline-flex h-9 w-9 items-center justify-center border border-border bg-card text-muted md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="border-t border-border bg-background md:hidden"
            aria-label="Mobile"
          >
            <div className="container-page flex flex-col items-center py-2 text-center">
              {navigation.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cx(
                      "w-full px-1 py-3 font-mono text-[12px] uppercase tracking-[0.16em]",
                      active ? "text-accent" : "text-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
