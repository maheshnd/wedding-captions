"use client";

import { useMemo } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";

type Props = Readonly<{
  status: string;
  onStart: () => void;
  onStop: () => void;
  latest: string;
  onLock: () => void;
}>;

function deriveState(statusRaw: string) {
  const s = (statusRaw || "").toLowerCase();
  const locked = s.includes("lock");
  const listening =
    s.includes("listening") || s.includes("record") || s.includes("live");
  const connected = s.includes("connected") || s.includes("online");

  return { locked, listening, connected };
}

function StatusPill({
  locked,
  listening,
  connected,
}: Readonly<{
  locked: boolean;
  listening: boolean;
  connected: boolean;
}>) {
  const pill = locked
    ? "border-amber-500/30 bg-amber-500/10"
    : listening
      ? "border-emerald-500/30 bg-emerald-500/10"
      : connected
        ? "border-sky-500/30 bg-sky-500/10"
        : "border-zinc-700 bg-zinc-900/40";

  const dot = locked
    ? "bg-amber-400"
    : listening
      ? "bg-emerald-400"
      : connected
        ? "bg-sky-400"
        : "bg-zinc-400";

  const label = locked
    ? "Locked"
    : listening
      ? "Listening"
      : connected
        ? "Connected"
        : "Idle";

  return (
    <Box className={`px-4 py-2 rounded-full border ${pill}`}>
      <HStack className="items-center gap-2">
        <Box className={`w-2 h-2 rounded-full ${dot}`} />
        <Text className="text-xs text-white">{label}</Text>
      </HStack>
    </Box>
  );
}

function ListeningBars() {
  // 3 tiny animated bars (no extra libs)
  return (
    <HStack className="items-end gap-1">
      <Box className="w-1.5 h-3 rounded-full bg-emerald-400/90 animate-[pulse_1s_ease-in-out_infinite]" />
      <Box className="w-1.5 h-5 rounded-full bg-emerald-400/90 animate-[pulse_1.2s_ease-in-out_infinite]" />
      <Box className="w-1.5 h-4 rounded-full bg-emerald-400/90 animate-[pulse_0.9s_ease-in-out_infinite]" />
    </HStack>
  );
}

export function SenderControls(props: Props) {
  const { locked, listening, connected } = useMemo(
    () => deriveState(props.status),
    [props.status],
  );

  const startDisabled = locked || listening;
  const stopDisabled = locked || !listening;

  const captionGlow = listening
    ? "shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_0_70px_rgba(16,185,129,0.10)]"
    : "shadow-[0_0_0_1px_rgba(255,255,255,0.05)]";

  const onCopy = async () => {
    const txt = (props.latest || "").trim();
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      // ignore
    }
  };

  return (
    <Box className="min-h-screen bg-black">
      {/* soft background glow */}
      <Box className="absolute inset-0 -z-10">
        <Box className="absolute -top-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <Box className="absolute top-20 right-[-140px] h-[460px] w-[460px] rounded-full bg-sky-500/10 blur-3xl" />
        <Box className="absolute bottom-[-200px] left-[-140px] h-[560px] w-[560px] rounded-full bg-purple-500/10 blur-3xl" />
      </Box>

      <Box className="p-5">
        <VStack space="lg" className="max-w-5xl mx-auto">
          {/* Header */}
          <HStack className="items-start justify-between">
            <VStack space="xs">
              <Text className="text-white text-2xl font-bold tracking-tight">
                🎙️ Stage Sender
              </Text>
              <Text className="text-zinc-400 text-sm">
                Hindi → English • Live captions
              </Text>
            </VStack>

            <StatusPill
              locked={locked}
              listening={listening}
              connected={connected}
            />
          </HStack>

          {/* Controls Card */}
          <Box className="rounded-3xl border border-zinc-800 bg-zinc-950/40 backdrop-blur p-6">
            <HStack className="items-center justify-between flex-wrap gap-4">
              {/* Left: Beautiful mic tile (no ugly mic background) */}
              <Box className="flex-1 min-w-[260px]">
                <Box
                  className={[
                    "rounded-2xl border border-zinc-800 bg-black/30 p-4",
                    listening
                      ? "shadow-[0_0_0_1px_rgba(16,185,129,0.20),0_0_40px_rgba(16,185,129,0.08)]"
                      : "",
                  ].join(" ")}
                >
                  <HStack className="items-center justify-between">
                    <HStack className="items-center gap-3">
                      {/* Mic icon without circle background */}
                      <Box className="relative">
                        {listening ? (
                          <Box className="absolute -inset-2 rounded-2xl bg-emerald-400/10 blur-md" />
                        ) : null}
                        <Text className="text-white text-2xl">🎤</Text>
                      </Box>

                      <VStack space="xs">
                        <Text className="text-white text-base font-semibold">
                          {locked
                            ? "Locked"
                            : listening
                              ? "Listening…"
                              : "Ready"}
                        </Text>
                        <Text className="text-zinc-400 text-xs">
                          {locked
                            ? "Unlock to start/stop"
                            : listening
                              ? "Speaking Hindi → sending English"
                              : "Tap Start to begin translation"}
                        </Text>
                      </VStack>
                    </HStack>

                    {listening ? <ListeningBars /> : null}
                  </HStack>
                </Box>
              </Box>

              {/* Right: Buttons */}
              <HStack className="gap-3 flex-wrap">
                <Button
                  className="rounded-xl bg-white"
                  onPress={props.onStart}
                  isDisabled={startDisabled}
                >
                  <ButtonText className="text-black">Start</ButtonText>
                </Button>

                <Button
                  className="rounded-xl bg-zinc-900 border border-zinc-800"
                  onPress={props.onStop}
                  isDisabled={stopDisabled}
                >
                  <ButtonText>Stop</ButtonText>
                </Button>

                <Button
                  className={[
                    "rounded-xl border",
                    locked
                      ? "bg-amber-600 border-amber-500/30"
                      : "bg-zinc-900 border-zinc-800",
                  ].join(" ")}
                  onPress={props.onLock}
                >
                  <ButtonText>{locked ? "Locked" : "Lock"}</ButtonText>
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Latest caption (previous style, but same premium UI) */}
          <Box
            className={[
              "rounded-3xl border border-zinc-800 bg-zinc-950/40 backdrop-blur p-6",
              captionGlow,
            ].join(" ")}
          >
            <HStack className="items-center justify-between">
              <VStack space="xs">
                <Text className="text-zinc-300 text-sm font-semibold">
                  Latest caption
                </Text>
                <Text className="text-zinc-500 text-xs">
                  {listening ? "Live updating…" : "Waiting for speech…"}
                </Text>
              </VStack>

              <Button
                className="rounded-xl bg-zinc-900 border border-zinc-800"
                onPress={onCopy}
                isDisabled={!props.latest?.trim()}
              >
                <ButtonText>Copy</ButtonText>
              </Button>
            </HStack>

            <Box className="mt-4 rounded-2xl border border-zinc-800 bg-black/30 p-5">
              <Text className="text-white text-2xl leading-relaxed">
                {props.latest?.trim()
                  ? props.latest
                  : "Say something in Hindi… your English caption will appear here."}
              </Text>
            </Box>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
