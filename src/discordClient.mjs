import { createDiscord } from '@eliware/discord';
import { log, path } from '@eliware/common';
import { createDiscordActions } from './discordActions.mjs';
import { getVoiceConnection } from '@discordjs/voice';
import { ensureGuildState, stopAndClear } from './ttsEngine.mjs';

export async function startDiscordClient() {
  if (!process.env.DISCORD_TOKEN) throw new Error('Missing DISCORD_TOKEN');
  if (!process.env.DISCORD_CLIENT_ID) throw new Error('Missing DISCORD_CLIENT_ID');
  const actions = createDiscordActions({ log });
  const cleanupAudio = async () => {
    const client = cleanupAudio.client;
    if (!client) return;
    for (const [guildId] of client.guilds.cache) {
      try { await stopAndClear(guildId); } catch (error) { log.error('Failed to stop guild audio', error); }
      try { getVoiceConnection(guildId)?.destroy(); } catch (error) { log.error('Failed to destroy voice connection', error); }
      ensureGuildState(guildId).connection = null;
    }
  };
  const client = await createDiscord({
    clientId: process.env.DISCORD_CLIENT_ID,
    token: process.env.DISCORD_TOKEN,
    rootDir: path(import.meta, '..'),
    intents: { Guilds: true, GuildMessages: true, MessageContent: true, GuildVoiceStates: true },
    context: { actions },
    signals: true,
    processHandlers: true,
    signalOptions: { shutdownHook: cleanupAudio },
  });
  cleanupAudio.client = client;
  return client;
}
