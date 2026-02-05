import { supabase } from "./supabase";

export function channelName(room: string) {
  return `captions:${room}`;
}

export async function createRoomChannel(room: string) {
  const ch = supabase.channel(channelName(room));
  await new Promise<void>((resolve) => {
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") resolve();
    });
  });
  return ch;
}
