import { describe, expect, test } from "@jest/globals";
import {
  clearGuildVoiceConnection,
  setGuildVoiceConnection,
} from "../../src/discord/connection-state.mjs";

describe("voice connection state", () => {
  test("sets the connection and linked text channel", () => {
    const state = {};
    const connection = {};
    setGuildVoiceConnection(state, connection, "text");
    expect(state).toEqual({ connection, linkedTextChannelId: "text" });
  });

  test("clears connection state and optionally clears the queue", () => {
    const state = { connection: {}, linkedTextChannelId: "text", queue: ["queued"] };
    clearGuildVoiceConnection(state);
    expect(state).toEqual({ connection: null, linkedTextChannelId: null, queue: ["queued"] });
    clearGuildVoiceConnection(state, { clearQueue: true });
    expect(state).toEqual({ connection: null, linkedTextChannelId: null, queue: [] });
  });
});
