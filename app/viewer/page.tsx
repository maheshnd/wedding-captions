"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { WEDDING_ROOM, WEDDING_SECRET } from "@/lib/weddingConfig";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";

type CaptionPayload = {
  text?: string;
  secret?: string;
  kind?: "interim" | "final";
  ts?: number;
};

const MAX_LINES = 40; // keep last 40 final captions

export default function ViewerPage() {
  const [connected, setConnected] = useState(false);
  const [latest, setLatest] = useState("Waiting for captions…");
  const [lines, setLines] = useState<string[]>([]);

  // Optional: prevent duplicate final lines if sender sends same text twice
  const lastFinalRef = useRef<string>("");

  useEffect(() => {
    const ch = supabase.channel(`captions:${WEDDING_ROOM}`);

    ch.on("broadcast", { event: "caption" }, ({ payload }) => {
      const p = payload as CaptionPayload;
      if (!p?.text) return;

      // If you use secret filtering
      if (WEDDING_SECRET && p.secret !== WEDDING_SECRET) return;

      // Always show latest (including interim if you ever send it)
      setLatest(p.text);

      // Only store history for FINAL lines
      if (p.kind === "final") {
        // dedupe
        if (p.text === lastFinalRef.current) return;
        lastFinalRef.current = p.text;

        setLines((prev) => {
          const next = [...prev, p.text!];
          // keep last N lines
          if (next.length > MAX_LINES)
            return next.slice(next.length - MAX_LINES);
          return next;
        });
      }
    });

    ch.subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  // UI: latest big, previous list below
  return (
    <Box className="min-h-screen bg-zinc-950 p-5">
      <VStack space="md" className="max-w-4xl mx-auto">
        <HStack className="items-center justify-between">
          <Text className="text-white text-xl font-bold">
            Live English Captions
          </Text>

          <Box
            className={`px-3 py-1 rounded-full border ${
              connected ? "border-green-600" : "border-orange-600"
            }`}
          >
            <Text className="text-white text-xs">
              {connected ? "Connected" : "Connecting…"}
            </Text>
          </Box>
        </HStack>

        {/* Latest */}
        <Box className="rounded-2xl bg-zinc-900 p-6 border border-zinc-800">
          <Text className="text-white text-3xl leading-relaxed">{latest}</Text>
        </Box>

        {/* Previous */}
        <Box className="rounded-2xl bg-zinc-900 p-4 border border-zinc-800">
          <Text className="text-zinc-300 text-sm mb-3">Previous captions</Text>

          <ScrollView className="max-h-[45vh]">
            <VStack space="sm">
              {lines.length === 0 ? (
                <Text className="text-zinc-500 text-sm">No history yet…</Text>
              ) : (
                // show newest at bottom (normal subtitles feel)
                lines.map((line, idx) => (
                  <Text
                    key={idx}
                    className="text-zinc-200 text-base leading-relaxed"
                  >
                    {line}
                  </Text>
                ))
              )}
            </VStack>
          </ScrollView>
        </Box>

        <Text className="text-zinc-400 text-xs">
          Keep this page open. Captions update automatically.
        </Text>
      </VStack>
    </Box>
  );
}
