"use client";

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";

export function PinGate(
  props: Readonly<{
    pin: string;
    setPin: (v: string) => void;
    onUnlock: () => void;
    error?: string | null;
  }>,
) {
  return (
    <Box className="min-h-screen bg-zinc-950 p-5 flex items-center justify-center">
      <Box className="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 border border-zinc-800">
        <VStack space="md">
          <Text className="text-white text-xl font-bold">Stage Sender</Text>
          <Text className="text-zinc-300 text-sm">
            Enter PIN to start captions.
          </Text>

          <Input className="border border-zinc-700 rounded-xl">
            <InputField
              placeholder="PIN"
              value={props.pin}
              onChangeText={props.setPin}
              secureTextEntry
              className="text-white"
              placeholderTextColor="#a1a1aa"
            />
          </Input>

          <Button className="rounded-xl" onPress={props.onUnlock}>
            <ButtonText>Continue</ButtonText>
          </Button>

          {props.error ? (
            <Text className="text-red-400 text-xs">{props.error}</Text>
          ) : null}
        </VStack>
      </Box>
    </Box>
  );
}
