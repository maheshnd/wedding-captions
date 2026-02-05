"use client";
import { useMemo, useState } from "react";
import { PinGate } from "./PinGate";
import { SenderControls } from "./SenderControls";
import { usePinGate } from "@/hooks/usePinGate";
import { useSupabaseBroadcast } from "@/hooks/useSupabaseBroadcast";
import { useAzureSpeechTranslationHindi } from "@/hooks/useAzureSpeechTranslation";

export default function SenderPage() {
  const REQUIRED_PIN = process.env.NEXT_PUBLIC_SENDER_PIN || "1234";

  const { pin, setPin, unlocked, unlock, lock, error } =
    usePinGate(REQUIRED_PIN);
  const { status: rtStatus, sendCaption, connect } = useSupabaseBroadcast();

  const [latest, setLatest] = useState("—");
  const [running, setRunning] = useState(false);

  const azure = useAzureSpeechTranslationHindi({
    onInterim: (text) => {
      // show interim on sender screen (optional)
      setLatest(text);
    },
    onFinal: (text) => {
      setLatest(text);
      sendCaption(text, "final"); // viewer will store as history
    },
    onError: (err) => {
      console.error("Azure speech error:", err);
      setRunning(false);
    },
    onStopped: () => {
      setRunning(false);
    },
  });

  const statusLabel = useMemo(() => {
    if (!unlocked) return "Locked";
    if (running) return "Listening…";
    if (rtStatus === "idle") return "Idle";
    if (rtStatus === "connecting") return "Connecting…";
    if (rtStatus === "connected") return "Connected";
    return "Error";
  }, [rtStatus, running, unlocked]);

  const start = async () => {
    if (running) return;
    await connect(); // Supabase realtime channel
    await azure.start(); // Azure mic + translation
    setRunning(true);
  };

  const stop = () => {
    azure.stop();
    setRunning(false);
  };

  if (!unlocked) {
    return (
      <PinGate pin={pin} setPin={setPin} onUnlock={unlock} error={error} />
    );
  }

  return (
    <SenderControls
      status={statusLabel}
      onStart={start}
      onStop={stop}
      latest={latest}
      onLock={() => {
        stop();
        lock();
      }}
      // if your SenderControls supports disabling buttons, pass:
      // startDisabled={running}
      // stopDisabled={!running}
    />
  );
}
