import { describe, expect, jest, test } from '@jest/globals';
import { createVoiceConnectionActions } from '../../src/discord/voice-connection.mjs';

const makeInteraction = () => ({
  guildId: 'guild', channelId: 'text', user: { id: 'user' },
  member: { voice: { channel: { id: 'voice', name: 'Voice', guild: { voiceAdapterCreator: 'adapter' } } } },
  deferReply: jest.fn(async () => {}), editReply: jest.fn(async () => {}), reply: jest.fn(async () => {}),
});

function setup({ connected = null, ready = true } = {}) {
  const state = { player: {}, queue: ['queued'] };
  const connection = { subscribe: jest.fn(), destroy: jest.fn() };
  const log = { debug: jest.fn(), error: jest.fn() };
  const actions = createVoiceConnectionActions({
    log,
    getConnection: jest.fn(() => connected),
    joinConnection: jest.fn(() => connection),
    waitForState: ready ? jest.fn(async () => {}) : jest.fn(async () => { throw new Error('not ready'); }),
    connectionStatus: { Ready: 'ready' },
    getGuildState: jest.fn(() => state),
  });
  return { actions, connection, log, state };
}

describe('voice connection actions', () => {
  test('joins and links the voice and text channels', async () => {
    const { actions, connection, state } = setup();
    const interaction = makeInteraction();
    await actions.join(interaction);
    expect(connection.subscribe).toHaveBeenCalledWith(state.player);
    expect(state).toMatchObject({ connection, linkedTextChannelId: 'text', assignedUserOrder: [], assignedVoices: {} });
    expect(interaction.editReply).toHaveBeenCalledWith({ content: 'Joined Voice and linked to this text channel for TTS.' });
  });

  test('rejects users outside voice and duplicate connections', async () => {
    const none = setup();
    const noVoice = makeInteraction();
    noVoice.member.voice.channel = null;
    await none.actions.join(noVoice);
    expect(noVoice.reply).toHaveBeenCalledWith({ content: 'You must be in a voice channel for me to join.', flags: 64 });

    const existing = setup({ connected: {} });
    const duplicate = makeInteraction();
    await existing.actions.join(duplicate);
    expect(duplicate.editReply).toHaveBeenCalledWith({ content: 'I am already connected. Use /leave to disconnect first.' });
  });

  test('clears state when connection setup fails', async () => {
    const { actions, connection, state } = setup({ ready: false });
    const interaction = makeInteraction();
    await actions.join(interaction);
    expect(connection.destroy).toHaveBeenCalled();
    expect(state).toMatchObject({ connection: null, linkedTextChannelId: null });
    expect(interaction.editReply).toHaveBeenCalledWith({ content: 'Failed to connect to the voice channel. Please try /join again.' });
  });

  test('leaves a connection and clears guild state', async () => {
    const { actions, connection, state } = setup({ connected: null });
    const getConnection = jest.fn(() => connection);
    const leaveActions = createVoiceConnectionActions({
      log: { debug: jest.fn(), error: jest.fn() }, getConnection, getGuildState: () => state,
    });
    state.connection = connection;
    state.linkedTextChannelId = 'text';
    await leaveActions.leave(makeInteraction());
    expect(connection.destroy).toHaveBeenCalled();
    expect(state).toMatchObject({ connection: null, linkedTextChannelId: null, queue: [] });
  });

  test('reports when there is no connection to leave', async () => {
    const { actions } = setup();
    const interaction = makeInteraction();
    await actions.leave(interaction);
    expect(interaction.reply).toHaveBeenCalledWith({ content: 'I am not in a voice channel.', flags: 64 });
  });
});
