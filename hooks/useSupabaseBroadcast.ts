"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { WEDDING_ROOM, WEDDING_SECRET } from "@/lib/weddingConfig";

type Status = "idle" | "connecting" | "connected" | "error";

export function useSupabaseBroadcast() {
  const [status, setStatus] = useState<Status>("idle");
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, []);

  const connect = async () => {
    if (channelRef.current) return;

    setStatus("connecting");

    const ch = supabase.channel(`captions:${WEDDING_ROOM}`);

    await new Promise<void>((resolve, reject) => {
      const timeout = globalThis.setTimeout(() => {
        console.error("Realtime subscribe timed out");
        setStatus("error");
        reject(new Error("SUBSCRIBE_TIMEOUT"));
      }, 8000);

      ch.subscribe((s) => {
        console.log("Realtime status:", s);

        if (s === "SUBSCRIBED") {
          globalThis.clearTimeout(timeout);
          setStatus("connected");
          resolve();
        }

        // These statuses happen when URL/key is wrong or project is paused
        if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") {
          globalThis.clearTimeout(timeout);
          setStatus("error");
          reject(new Error(s));
        }
      });
    });

    channelRef.current = ch;
  };

  const sendCaption = async (
    text: string,
    kind: "interim" | "final" = "final",
  ) => {
    if (!channelRef.current) await connect();
    const ch = channelRef.current;
    await ch.send({
      type: "broadcast",
      event: "caption",
      payload: {
        text,
        kind,
        secret: WEDDING_SECRET,
        ts: Date.now(),
      },
    });
  };

  return { status, connect, sendCaption };
}
