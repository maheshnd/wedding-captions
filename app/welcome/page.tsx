"use client";

import { useRouter } from "next/navigation";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";

export default function WeddingWelcomePage() {
  const router = useRouter();

  const bride = "Test";
  const groom = "Test2";

  return (
    <Box className="min-h-[100dvh] bg-black overflow-hidden">
      {/* Elegant background */}
      <Box className="absolute inset-0 -z-10">
        <Box className="absolute -top-48 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />
        <Box className="absolute top-32 right-[-180px] h-[520px] w-[520px] rounded-full bg-purple-500/18 blur-3xl" />
        <Box className="absolute bottom-[-220px] left-[-180px] h-[640px] w-[640px] rounded-full bg-pink-500/16 blur-3xl" />
        <Box className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
      </Box>

      {/* Centered container – no scroll */}
      <Box className="min-h-[100dvh] flex items-center justify-center px-4">
        <Box className="w-full max-w-md sm:max-w-lg">
          <Box className="rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_40px_120px_rgba(0,0,0,0.65)] px-6 py-8 sm:px-8 sm:py-10">
            <VStack space="lg" className="items-center text-center">
              {/* Wedding badge */}
              <Box className="px-4 py-2 rounded-full border border-white/15 bg-white/5">
                <HStack className="items-center gap-2">
                  <Text className="text-white">💍</Text>
                  <Text className="text-zinc-200 text-xs tracking-[0.2em] uppercase">
                    Wedding Celebration
                  </Text>
                </HStack>
              </Box>

              {/* Names */}
              <VStack space="xs" className="items-center">
                <Text className="text-white font-serif leading-none tracking-tight text-[42px] sm:text-[56px]">
                  {bride}
                </Text>
                <Text className="text-zinc-400 text-lg sm:text-xl">&amp;</Text>
                <Text className="text-white font-serif leading-none tracking-tight text-[42px] sm:text-[56px]">
                  {groom}
                </Text>
              </VStack>

              {/* Beautiful divider / sign */}
              <HStack className="items-center gap-3 w-full">
                <Box className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <Text className="text-white/80 text-sm">❦</Text>
                <Box className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </HStack>

              {/* Welcome message */}
              <Text className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-sm">
                With hearts full of love, we welcome you to witness the
                beginning of our forever.
                <br />
                <span className="text-zinc-400">
                  Live English captions are available for everyone’s comfort.
                </span>
              </Text>

              {/* CTA */}
              <Button
                onPress={() => router.push("/viewer")}
                className="w-full rounded-2xl bg-white py-4 mt-2"
              >
                <ButtonText className="text-black text-base font-semibold tracking-wide">
                  View Live Captions
                </ButtonText>
              </Button>

              {/* Footer sign */}
              <Text className="text-zinc-500 text-[11px] tracking-wide">
                Thank you for being part of our special day
              </Text>
            </VStack>
          </Box>

          {/* Floating subtle decorations (no scroll impact) */}
          <Box className="pointer-events-none relative h-0">
            <Text className="absolute -top-14 left-6 text-white/25 animate-float">
              ❀
            </Text>
            <Text className="absolute -top-20 right-10 text-white/20 animate-float-slow">
              ❤
            </Text>
            <Text className="absolute -top-10 right-24 text-white/15 animate-float-slower">
              ❀
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Animations */}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0);
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-26px);
            opacity: 0.1;
          }
        }
        .animate-float {
          animation: floatUp 3.5s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: floatUp 4.5s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: floatUp 5.5s ease-in-out infinite;
        }
      `}</style>
    </Box>
  );
}
