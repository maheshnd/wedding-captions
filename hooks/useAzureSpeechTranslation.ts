"use client";

import { useRef } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

type Callbacks = {
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (err: any) => void;
  onStopped?: () => void;
};

// Small helper to throttle interim updates (prevents UI flicker)
function throttle<T extends (...args: any[]) => void>(fn: T, waitMs: number) {
  let last = 0;
  let timer: any = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = waitMs - (now - last);

    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        fn(...args);
      }, remaining);
    }
  };
}

export function useAzureSpeechTranslationHindi(cb: Callbacks) {
  const recognizerRef = useRef<SpeechSDK.TranslationRecognizer | null>(null);

  const start = async () => {
    if (recognizerRef.current) return;

    const key = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
    const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

    if (!key || !region) {
      throw new Error("Missing Azure Speech env vars (KEY/REGION)");
    }

    const speechConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(
      key,
      region,
    );

    // Hindi input
    speechConfig.speechRecognitionLanguage = "hi-IN";

    // English output
    speechConfig.addTargetLanguage("en");

    // Optional: if you want punctuation/casing improvements (sometimes helps)
    // speechConfig.setProperty(
    //   SpeechSDK.PropertyId.SpeechServiceResponse_PostProcessingOption,
    //   "TrueText"
    // );

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = new SpeechSDK.TranslationRecognizer(
      speechConfig,
      audioConfig,
    );

    const throttledInterim = throttle((t: string) => cb.onInterim?.(t), 250);

    recognizer.recognizing = (_, e) => {
      const t = e.result?.translations?.get("en");
      if (t) throttledInterim(t);
    };

    recognizer.recognized = (_, e) => {
      if (e.result?.reason === SpeechSDK.ResultReason.TranslatedSpeech) {
        const t = e.result.translations.get("en");
        if (t) cb.onFinal?.(t);
      }
    };

    recognizer.canceled = (_, e) => {
      cb.onError?.(e);
      stop();
    };

    recognizer.sessionStopped = () => {
      cb.onStopped?.();
      stop();
    };

    recognizer.startContinuousRecognitionAsync(
      () => {
        recognizerRef.current = recognizer;
      },
      (err) => {
        cb.onError?.(err);
        recognizer.close();
        recognizerRef.current = null;
      },
    );
  };

  const stop = () => {
    const r = recognizerRef.current;
    if (!r) return;

    r.stopContinuousRecognitionAsync(
      () => {
        r.close();
        recognizerRef.current = null;
        cb.onStopped?.();
      },
      () => {
        // even if stop fails, cleanup
        r.close();
        recognizerRef.current = null;
        cb.onStopped?.();
      },
    );
  };

  return { start, stop };
}
