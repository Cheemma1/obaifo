"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const VISITOR_KEY = "obaifo.visitor";
const BEAT_MS = 30_000;
const READER_PATH = /^\/[a-z]{2}\/read\/([^/]+)\/(\d+)/;

/** One random id per browser, so the admin app can count open tabs without knowing who a guest is. */
function visitorId(): string | null {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null; // Storage blocked: this visitor just isn't counted.
  }
}

/**
 * Tells the API this tab is open (and which tale and chapter it is reading)
 * every 30 seconds while the tab is visible. Powers the admin "live" view.
 */
export function Presence() {
  const pathname = usePathname();

  useEffect(() => {
    const id = visitorId();
    if (!id) return;
    const match = READER_PATH.exec(pathname);
    const body = JSON.stringify({
      visitorId: id,
      path: pathname.slice(0, 300),
      slug: match ? decodeURIComponent(match[1]) : undefined,
      chapter: match ? Math.max(0, Number(match[2]) - 1) : undefined,
    });
    const beat = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/presence", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    };

    beat();
    const timer = setInterval(beat, BEAT_MS);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [pathname]);

  return null;
}
