"use client";

import { useEffect, useMemo, useState } from "react";

type Stored = {
  latest: string;
  lines: string[];
};

function safeParse(json: string | null): Stored | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as Stored;
  } catch {
    return null;
  }
}

function trimByTotalChars(lines: string[], maxChars: number) {
  // Keep newest at end, drop oldest until within maxChars
  let total = 0;
  const out: string[] = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    const s = lines[i] ?? "";
    const add = s.length + 1; // +1 for newline
    if (total + add > maxChars) break;
    out.push(s);
    total += add;
  }
  return out.reverse();
}

export function useCaptionHistoryLocal(options?: {
  storageKey?: string;
  maxChars?: number; // total chars stored across lines
  maxLines?: number; // optional extra cap
}) {
  const storageKey = options?.storageKey ?? "wedding_viewer_captions_v1";
  const maxChars = options?.maxChars ?? 1200; // ~1000–1500 chars is nice for mobile
  const maxLines = options?.maxLines ?? 25;

  const [latest, setLatest] = useState("Waiting for captions…");
  const [lines, setLines] = useState<string[]>([]);

  // Load once
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(storageKey));
    if (saved?.latest) setLatest(saved.latest);
    if (saved?.lines?.length) setLines(saved.lines);
  }, [storageKey]);

  // Persist whenever changes
  useEffect(() => {
    const data: Stored = { latest, lines };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [latest, lines, storageKey]);

  const addFinalLine = (text: string) => {
    setLatest(text);

    setLines((prev) => {
      // avoid duplicates back-to-back
      const last = prev[prev.length - 1];
      const next = last === text ? prev : [...prev, text];

      // cap by max lines
      const cappedByLines =
        next.length > maxLines ? next.slice(next.length - maxLines) : next;

      // cap by total chars
      return trimByTotalChars(cappedByLines, maxChars);
    });
  };

  const setInterim = (text: string) => setLatest(text);

  const clear = () => {
    setLatest("Waiting for captions…");
    setLines([]);
    localStorage.removeItem(storageKey);
  };

  const stats = useMemo(() => {
    const totalChars = lines.reduce((a, b) => a + b.length + 1, 0);
    return { totalChars, count: lines.length };
  }, [lines]);

  return { latest, lines, addFinalLine, setInterim, clear, stats };
}
