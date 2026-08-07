import pkg from 'discord.js';
import { log, registerSignals } from '@eliware/common';
const { Client, GatewayIntentBits, Events, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = pkg;
import { joinVoiceChannel, getVoiceConnection, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { ensureSettingsDir, loadUserSettings, saveUserSettings, userHasSettings } from './settings.mjs';
import { ensureGuildState, enqueueSpeech, skipCurrent, stopAndClear } from './ttsEngine.mjs';

// Full voice list
const AVAILABLE_VOICES = ['alloy','ash','ballad','coral','echo','fable','nova','onyx','sage','shimmer','verse','marin','cedar'];

async function loadSettingsWithTimeout(guildId, userId, ms = 600) {
  // Race loading user settings against a short timeout to avoid interaction timeouts
  try {
    const p = loadUserSettings(guildId, userId);
    return await Promise.race([p, new Promise((res) => setTimeout(() => res(null), ms))]);
  } catch (e) {
    log.error('loadUserSettings error', e);
    return null;
  }
}

export async function startDiscordClient() {
  const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
  if (!DISCORD_TOKEN) throw new Error('Missing DISCORD_TOKEN');

  await ensureSettingsDir();

  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });

  // simple clean shutdown handler (registered early)
  let shuttingDown = false;
  async function cleanShutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    try {
      for (const [guildId] of client.guilds.cache) {
        try { await stopAndClear(guildId); } catch {}
        try { const conn = getVoiceConnection(guildId); if (conn) conn.destroy(); } catch {}
      }
      try { if (client.user) client.user.setPresence({ activities: [], status: 'invisible' }); } catch {}
      try { await client.destroy(); } catch {}
    }
  }
  registerSignals({ log, shutdownHook: cleanShutdown });

  client.once(Events.ClientReady, async () => {
    const commands = [
      { name: 'help', description: 'Show basic help' },
      { name: 'join', description: 'Bot joins your current voice channel' },
      { name: 'leave', description: 'Bot leaves the voice channel' },
      { name: 'voice', description: 'Set the voice to use', options: [{ name: 'voice', type: 3, description: 'Select a voice', required: true, choices: AVAILABLE_VOICES.map(v => ({ name: v, value: v })) }] },
      { name: 'instructions', description: 'Set custom speaking instructions (opens a modal)' },
      { name: 'skip', description: 'Skip the currently playing message' },
      { name: 'stop', description: 'Stop playback and clear queue' },
    ];
    try { await client.application.commands.set(commands); } catch (e) { log.error('Failed to set application commands', e); }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        if (commandName === 'help') {
          await interaction.reply({ content: 'TTS POC commands: /join, /leave, /voice, /instructions, /skip, /stop. Type in the linked text channel to have messages spoken.', flags: 64 });
        } else if (commandName === 'join') {
          const member = interaction.member;
          const voiceChannel = member?.voice?.channel;
          if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel for me to join.', flags: 64 });
          await interaction.deferReply();

          const existingConn = getVoiceConnection(guildId);
          if (existingConn) {
            const prevChannelId = existingConn.joinConfig?.channelId;
            let prevName = 'another voice channel';
            if (prevChannelId) {
              try { const ch = await client.channels.fetch(prevChannelId); prevName = ch?.name || prevChannelId; } catch { prevName = prevChannelId; }
            }
            return interaction.editReply({ content: `I am already connected to ${prevName}. Use /leave to disconnect first.` });
          }

          const connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: voiceChannel.guild.id, adapterCreator: voiceChannel.guild.voiceAdapterCreator });
          const state = ensureGuildState(guildId);
          state.connection = connection;
          state.linkedTextChannelId = interaction.channelId;
          // initialize assignment tracking for this guild state
          if (!state.assignedUserOrder) state.assignedUserOrder = [];
          if (!state.assignedVoices) state.assignedVoices = {};
          connection.subscribe(state.player);
          try {
            await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
            await interaction.editReply({ content: `Joined ${voiceChannel.name} and linked to this text channel for TTS.` });
          } catch {
            try { connection.destroy(); } catch {}
            state.connection = null;
            state.linkedTextChannelId = null;
            await interaction.editReply({ content: 'Failed to connect to the voice channel. Please try /join again.' });
          }
        } else if (commandName === 'leave') {
          const state = ensureGuildState(guildId);
          const conn = getVoiceConnection(guildId);
          if (conn) { conn.destroy(); state.connection = null; state.linkedTextChannelId = null; state.queue = []; await interaction.reply('Left the voice channel and cleared state.'); }
          else { await interaction.reply({ content: 'I am not in a voice channel.', flags: 64 }); }
        } else if (commandName === 'voice') {
          const voice = interaction.options.getString('voice');
          const settings = await loadUserSettings(guildId, userId);
          settings.voice = voice;
          await saveUserSettings(guildId, userId, settings);
          await interaction.reply({ content: `Saved voice: ${voice}`, flags: 64 });
        } else if (commandName === 'instructions') {
          // attempt to load existing settings but bail to show modal quickly if it takes too long
          const settings = await loadSettingsWithTimeout(guildId, userId, 600) || {};
          try {
            const modal = new ModalBuilder().setCustomId('instructions_modal').setTitle('Set custom TTS instructions');
            // label must be <= 45 chars per Discord constraints
            const label = 'TTS instructions (tone/style)';
            const placeholder = 'e.g. Calm, storytelling tone';
            // ensure we don't exceed TextInput value limits (use 4000 as safe max)
            const initVal = (settings.instructions || '').toString().slice(0, 4000);
            const input = new TextInputBuilder().setCustomId('instructions_input').setLabel(label).setStyle(TextInputStyle.Paragraph).setPlaceholder(placeholder).setRequired(false).setValue(initVal);
            const row = new ActionRowBuilder().addComponents(input);
            modal.addComponents(row);
            await interaction.showModal(modal);
          } catch (e) {
            log.error('Failed to show modal', e);
            // reply with an ephemeral error so user isn't left waiting
            try { await interaction.reply({ content: 'Failed to open instructions modal — please try again.', flags: 64 }); } catch (e2) { log.error('Failed to reply after modal failure', e2); }
          }
        } else if (commandName === 'skip') {
          await skipCurrent(guildId);
          await interaction.reply({ content: 'Skipped current message (if any).', flags: 64 });
        } else if (commandName === 'stop') {
          await stopAndClear(guildId);
          await interaction.reply({ content: 'Stopped playback and cleared queue.', flags: 64 });
        }
      }

      if (interaction.isModalSubmit()) {
        if (interaction.customId === 'instructions_modal') {
          const val = interaction.fields.getTextInputValue('instructions_input');
          const guildId = interaction.guildId;
          const userId = interaction.user.id;
          const settings = await loadUserSettings(guildId, userId);
          settings.instructions = val;
          await saveUserSettings(guildId, userId, settings);
          await interaction.reply({ content: 'Saved instructions.', flags: 64 });
        }
      }
    } catch (e) { log.error('Interaction handler error', e); }
  });

  client.on('messageCreate', async (message) => {
    try {
      if (message.author.bot) return;
      const guildId = message.guildId;
      if (!guildId) return;
      const state = ensureGuildState(guildId);
      if (!state.linkedTextChannelId) return;
      if (message.channelId !== state.linkedTextChannelId) return;
      const content = message.content?.trim();
      if (!content) return;
      if (content.length > 2000) return;

      // auto-assign voice if user has no saved settings
      const userId = message.author.id;
      try {
        const hasSettings = await userHasSettings(guildId, userId);
        if (!hasSettings) {
          if (!state.assignedUserOrder) state.assignedUserOrder = [];
          if (!state.assignedVoices) state.assignedVoices = {};
          if (!state.assignedUserOrder.includes(userId)) state.assignedUserOrder.push(userId);
          const idx = state.assignedUserOrder.indexOf(userId);
          let chosen;
          if (idx === 0) chosen = 'marin';
          else if (idx === 1) chosen = 'cedar';
          else {
            const taken = new Set(Object.values(state.assignedVoices));
            if (state.assignedUserOrder[0]) taken.add(state.assignedVoices[state.assignedUserOrder[0]] || 'marin');
            if (state.assignedUserOrder[1]) taken.add(state.assignedVoices[state.assignedUserOrder[1]] || 'cedar');
            const options = AVAILABLE_VOICES.filter(v => !taken.has(v));
            if (options.length === 0) chosen = AVAILABLE_VOICES[Math.floor(Math.random() * AVAILABLE_VOICES.length)];
            else chosen = options[Math.floor(Math.random() * options.length)];
          }
          state.assignedVoices[userId] = chosen;
          const settings = await loadUserSettings(guildId, userId);
          settings.voice = chosen;
          await saveUserSettings(guildId, userId, settings);
        }
      } catch {
        // ignore settings errors
      }

      await enqueueSpeech(guildId, { text: content, userId: message.author.id, userTag: message.author.tag });
    } catch {}
  });

  await client.login(DISCORD_TOKEN);
  return client;
}
