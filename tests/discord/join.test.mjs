import { describe, expect, jest, test } from "@jest/globals";
import { createJoinAction } from "../../src/discord/join.mjs";
import { createLeaveAction } from "../../src/discord/leave.mjs";

const makeInteraction = () => ({
  guildId: "guild",
  channelId: "text",
  user: { id: "user" },
  member: {
    voice: { channel: { id: "voice", name: "Voice", guild: { voiceAdapterCreator: "adapter" } } },
  },
  deferReply: jest.fn(async () => {}),
  editReply: jest.fn(async () => {}),
  reply: jest.fn(async () => {}),
});

function setup({ connected = null, ready = true } = {}) {
  const state = { player: { stop: jest.fn() }, queue: ["queued"], current: null };
  const connection = { subscribe: jest.fn(), destroy: jest.fn() };
  const log = { debug: jest.fn(), error: jest.fn() };
  const join = createJoinAction({
    log,
    getConnection: jest.fn(() => connected),
    joinConnection: jest.fn(() => connection),
    waitForState: ready
      ? jest.fn(async () => {})
      : jest.fn(async () => {
          throw new Error("not ready");
        }),
    connectionStatus: { Ready: "ready" },
    getGuildState: jest.fn(() => state),
  });
  const stopAndClear = jest.fn(async () => {
    state.queue = [];
    state.player.stop(true);
  });
  return { join, connection, log, state, stopAndClear };
}

describe("voice connection actions", () => {
  test("uses default state and connection lookup helpers", async () => {
    const connection = { subscribe: jest.fn() };
    const interaction = makeInteraction();
    await createJoinAction({
      log: { debug: jest.fn() },
      joinConnection: () => connection,
      waitForState: async () => {},
    })(interaction);
    expect(connection.subscribe).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalled();
  });

  test("joins and links the voice and text channels", async () => {
    const { join, connection, state } = setup();
    const interaction = makeInteraction();
    await join(interaction);
    expect(connection.subscribe).toHaveBeenCalledWith(state.player);
    expect(state).toMatchObject({
      connection,
      linkedTextChannelId: "text",
      assignedUserOrder: [],
      assignedVoices: {},
    });
    expect(interaction.editReply).toHaveBeenCalledWith({
      content: "Joined Voice and linked to this text channel for TTS.",
    });
  });

  test("rejects users outside voice and duplicate connections", async () => {
    const none = setup();
    const noVoice = makeInteraction();
    noVoice.member.voice.channel = null;
    await none.join(noVoice);
    expect(noVoice.reply).toHaveBeenCalledWith({
      content: "You must be in a voice channel for me to join.",
      flags: 64,
    });

    const existing = setup({ connected: {} });
    const duplicate = makeInteraction();
    await existing.join(duplicate);
    expect(duplicate.editReply).toHaveBeenCalledWith({
      content: "I am already connected. Use /leave to disconnect first.",
    });
  });

  test("rejects a concurrent join after guild state loads", async () => {
    const state = { player: { stop: jest.fn() } };
    let releaseState;
    const statePromise = new Promise((resolve) => {
      releaseState = () => resolve(state);
    });
    let activeConnection = null;
    const connection = { subscribe: jest.fn() };
    const joinConnection = jest.fn(() => {
      activeConnection = connection;
      return connection;
    });
    const join = createJoinAction({
      log: { debug: jest.fn() },
      getConnection: () => activeConnection,
      joinConnection,
      waitForState: async () => {},
      connectionStatus: { Ready: "ready" },
      getGuildState: () => statePromise,
    });
    const firstInteraction = makeInteraction();
    const secondInteraction = makeInteraction();

    const firstJoin = join(firstInteraction);
    const secondJoin = join(secondInteraction);
    await Promise.resolve();
    releaseState();
    await Promise.all([firstJoin, secondJoin]);

    expect(joinConnection).toHaveBeenCalledTimes(1);
    expect(firstInteraction.editReply).toHaveBeenCalledWith({
      content: "Joined Voice and linked to this text channel for TTS.",
    });
    expect(secondInteraction.editReply).toHaveBeenCalledWith({
      content: "I am already connected. Use /leave to disconnect first.",
    });
  });

  test("clears state when connection setup fails", async () => {
    const { join, connection, state } = setup({ ready: false });
    const interaction = makeInteraction();
    await join(interaction);
    expect(connection.destroy).toHaveBeenCalled();
    expect(state).toMatchObject({ connection: null, linkedTextChannelId: null });
    expect(interaction.editReply).toHaveBeenCalledWith({
      content: "Failed to connect to the voice channel. Please try /join again.",
    });
  });

  test("leaves a connection and clears guild state", async () => {
    const { connection, state, stopAndClear } = setup({ connected: null });
    state.connection = connection;
    state.linkedTextChannelId = "text";
    await createLeaveAction({
      log: { debug: jest.fn(), error: jest.fn() },
      getConnection: () => connection,
      getGuildState: () => state,
      stopAndClear,
    })(makeInteraction());
    expect(stopAndClear).toHaveBeenCalledWith("guild");
    expect(state.player.stop).toHaveBeenCalledWith(true);
    expect(connection.destroy).toHaveBeenCalled();
    expect(state).toMatchObject({ connection: null, linkedTextChannelId: null, queue: [] });
  });
});
