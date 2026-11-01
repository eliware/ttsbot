import { createDiscord } from "@eliware/discord";
import { log, path } from "@eliware/common";
import { createDiscordActions } from "./discordActions.mjs";

export async function startDiscordClient() {
  if (!process.env.DISCORD_TOKEN) throw new Error("Missing DISCORD_TOKEN");
  if (!process.env.DISCORD_CLIENT_ID) throw new Error("Missing DISCORD_CLIENT_ID");
  const actions = createDiscordActions({ log });
  return createDiscord({
    clientId: process.env.DISCORD_CLIENT_ID,
    token: process.env.DISCORD_TOKEN,
    rootDir: path(import.meta, ".."),
    intents: { Guilds: true, GuildMessages: true, MessageContent: true, GuildVoiceStates: true },
    context: { actions },
    signals: false,
  });
}
