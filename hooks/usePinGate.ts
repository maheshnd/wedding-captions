"use client";

import { useEffect, useState } from "react";
import { PIN_STORAGE_KEY } from "@/lib/weddingConfig";

export function usePinGate(requiredPin: string) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage once
  useEffect(() => {
    try {
      const v = localStorage.getItem(PIN_STORAGE_KEY);
      if (v === "1") setUnlocked(true);
    } catch {
      // ignore
    }
  }, []);

  const unlock = () => {
    if (pin === requiredPin) {
      setUnlocked(true);
      setError(null);
      try {
        localStorage.setItem(PIN_STORAGE_KEY, "1");
      } catch {}
    } else {
      setError("Wrong PIN");
    }
  };

  const lock = () => {
    setUnlocked(false);
    setPin("");
    setError(null);
    try {
      localStorage.removeItem(PIN_STORAGE_KEY);
    } catch {}
  };

  return { pin, setPin, unlocked, unlock, lock, error };
}
