"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { WEDDING_ROOM, WEDDING_SECRET } from "@/lib/weddingConfig";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Button, ButtonText } from "@/components/ui/button";
import { useCaptionHistoryLocal } from "@/hooks/useCaptionHistoryLocal";

type CaptionPayload = {
  text?: string;
  secret?: string;
  kind?: "interim" | "final";
  ts?: number;
};

export default function ViewerPage() {
  const [connected, setConnected] = useState(false);

  // Local storage: keep small history even on refresh
  const { latest, lines, addFinalLine, setInterim, clear, stats } =
    useCaptionHistoryLocal({
      storageKey: "wedding_viewer_captions_v1",
      maxChars: 1400, // adjust (1000–3000 ok)
      maxLines: 30,
    });

  useEffect(() => {
    const ch = supabase.channel(`captions:${WEDDING_ROOM}`);

    ch.on("broadcast", { event: "caption" }, ({ payload }) => {
      const p = payload as CaptionPayload;
      if (!p?.text) return;

      // Secret check (optional)
      if (WEDDING_SECRET && p.secret !== WEDDING_SECRET) return;

      // If you send interim captions, show them as "latest" only
      if (p.kind === "interim") {
        setInterim(p.text);
        return;
      }

      // Default treat as final
      addFinalLine(p.text);
    });

    ch.subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(ch);
    };
  }, [addFinalLine, setInterim]);

  // ---- Previous section behavior ----
  // Show newest at TOP, and when a new line is added, scroll to TOP.
  const previousNewestFirst = useMemo(() => {
    return [...lines].reverse();
  }, [lines]);

  // Ref to the ScrollView so we can programmatically scroll
  const prevScrollRef = useRef<any>(null);
  const prevCountRef = useRef<number>(lines.length);

  useEffect(() => {
    // Only scroll when a new final line is added
    if (lines.length > prevCountRef.current) {
      prevCountRef.current = lines.length;

      // RN-style scrollTo (some ScrollView implementations expose this)
      if (prevScrollRef.current?.scrollTo) {
        prevScrollRef.current.scrollTo({ y: 0, animated: true });
        return;
      }

      // Web fallback (in case ref points to a DOM node)
      const node = prevScrollRef.current as any;
      if (node && typeof node.scrollTop === "number") {
        node.scrollTop = 0;
      }
    } else {
      prevCountRef.current = lines.length;
    }
  }, [lines.length, lines]);

  const liveLabel = useMemo(() => {
    if (connected) return { label: "LIVE", dot: "bg-emerald-400" };
    return { label: "CONNECTING", dot: "bg-amber-400" };
  }, [connected]);

  const nowText = (latest || "").trim();

  return (
    <Box className="min-h-screen bg-black">
      {/* Background glows */}
      <Box className="absolute inset-0 -z-10">
        <Box className="absolute -top-48 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <Box className="absolute top-32 right-[-160px] h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-3xl" />
        <Box className="absolute bottom-[-220px] left-[-180px] h-[640px] w-[640px] rounded-full bg-purple-500/10 blur-3xl" />
      </Box>

      <Box className="px-4 py-5 sm:px-6 sm:py-8">
        <VStack space="lg" className="max-w-3xl mx-auto">
          {/* Header */}
          <HStack className="items-start justify-between gap-3">
            <VStack space="xs" className="flex-1">
              <Text className="text-white text-xl sm:text-2xl font-bold tracking-tight">
                Live English Captions
              </Text>
              <Text className="text-zinc-400 text-xs sm:text-sm">
                Hindi speech → English • updates in real time
              </Text>
            </VStack>

            {/* Live pill */}
            <Box
              className={[
                "px-3 py-2 rounded-full border",
                connected
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-amber-500/30 bg-amber-500/10",
              ].join(" ")}
            >
              <HStack className="items-center gap-2">
                <Box className="relative">
                  {connected ? (
                    <Box className="absolute -inset-1 rounded-full bg-emerald-400/20 animate-ping" />
                  ) : null}
                  <Box className={`h-2 w-2 rounded-full ${liveLabel.dot}`} />
                </Box>
                <Text className="text-white text-xs font-semibold tracking-wide">
                  {liveLabel.label}
                </Text>
              </HStack>
            </Box>
          </HStack>

          {/* NOW (big subtitle) */}
          <Box className="rounded-3xl border border-zinc-800 bg-zinc-950/40 backdrop-blur p-5 sm:p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <HStack className="items-center justify-between">
              <Text className="text-zinc-400 text-xs">NOW</Text>

              <Text className="text-zinc-500 text-xs">
                {lines.length} lines • {stats.totalChars} chars
              </Text>
            </HStack>

            <Box
              className={[
                "mt-4 rounded-2xl border bg-black/30 p-5 sm:p-6",
                connected
                  ? "border-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.10)]"
                  : "border-zinc-800",
              ].join(" ")}
            >
              <Text className="text-white font-semibold leading-relaxed text-3xl sm:text-4xl lg:text-5xl">
                {nowText
                  ? nowText
                  : "Captions will appear here as people speak…"}
              </Text>
            </Box>

            <Text className="text-zinc-500 text-xs mt-4">
              Tip: for best results, keep this page open and don’t lock the
              screen.
            </Text>
          </Box>

          {/* Previous */}
          <Box className="rounded-3xl border border-zinc-800 bg-zinc-950/40 backdrop-blur p-4 sm:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <HStack className="items-center justify-between">
              <Text className="text-zinc-200 text-sm font-semibold">
                Previous
              </Text>

              <HStack className="items-center gap-2">
                <Text className="text-zinc-500 text-xs">
                  {lines.length} lines • {stats.totalChars} chars
                </Text>
                <Button
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
                  onPress={clear}
                >
                  <ButtonText className="text-white text-xs">Clear</ButtonText>
                </Button>
              </HStack>
            </HStack>

            {/* Newest on TOP + auto-scroll to TOP when new line arrives */}
            <ScrollView ref={prevScrollRef} className="mt-4 max-h-[45vh] pr-1">
              <VStack space="sm">
                {previousNewestFirst.length === 0 ? (
                  <Text className="text-zinc-500 text-sm">
                    No previous lines yet.
                  </Text>
                ) : (
                  previousNewestFirst.map((line, idx) => (
                    <Box
                      key={idx}
                      className="rounded-2xl border border-zinc-800 bg-black/25 p-4"
                    >
                      <Text className="text-zinc-200 text-base sm:text-lg leading-relaxed">
                        {line}
                      </Text>
                    </Box>
                  ))
                )}
              </VStack>
            </ScrollView>
          </Box>

          <Text className="text-zinc-500 text-xs text-center">
            Keep phone volume low • captions update live
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
