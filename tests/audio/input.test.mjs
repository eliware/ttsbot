import { describe, expect, jest, test } from "@jest/globals";
import { preparePlaybackInput } from "../../src/audio/input.mjs";
import { validatePlaybackInput } from "../../src/audio/input-validation.mjs";

function harness({
  settings = { voice: "nova" },
  replaceText = async (text) => text,
  waitForState = async () => {},
} = {}) {
  return {
    state: { connection: {}, player: {} },
    waitForState,
    connectionStatus: { Ready: "ready" },
    getUserSettings: jest.fn(async () => settings),
    replaceText,
    log: { warn: jest.fn(), error: jest.fn() },
  };
}

describe("playback input preparation", () => {
  test("uses defaults when invalid input exits before dependencies run", async () => {
    await expect(
      preparePlaybackInput({
        text: "",
        state: {},
        guildId: "g",
        userId: "u",
        waitForState: jest.fn(),
        connectionStatus: { Ready: "ready" },
      }),
    ).resolves.toBeNull();
  });

  test("rejects empty, long, and disconnected input", async () => {
    const deps = harness();
    expect(
      validatePlaybackInput({ text: "", state: deps.state, guildId: "g", log: deps.log }),
    ).toBe(false);
    expect(
      validatePlaybackInput({
        text: "x".repeat(2001),
        state: deps.state,
        guildId: "g",
        log: deps.log,
      }),
    ).toBe(false);
    expect(
      validatePlaybackInput({
        text: "hello",
        state: { connection: null },
        guildId: "g",
        log: deps.log,
      }),
    ).toBe(false);
    expect(
      await preparePlaybackInput({
        ...deps,
        state: { connection: null },
        text: "hello",
        guildId: "g",
        userId: "u",
      }),
    ).toBeNull();
    expect(deps.getUserSettings).not.toHaveBeenCalled();
  });

  test("rejects an unready connection", async () => {
    const deps = harness({
      waitForState: async () => {
        throw new Error("not ready");
      },
    });
    expect(
      await preparePlaybackInput({ ...deps, text: "hello", guildId: "g", userId: "u" }),
    ).toBeNull();
    expect(deps.log.warn).toHaveBeenCalledWith("Voice connection was not ready for guild", "g");
  });

  test("prepares text and defaults a missing voice", async () => {
    const deps = harness({ settings: {}, replaceText: async (text) => `${text}!` });
    await expect(
      preparePlaybackInput({ ...deps, text: "hello", guildId: "g", userId: "u" }),
    ).resolves.toEqual({ inputText: "hello!", voice: "coral" });
  });

  test("keeps original text when replacement fails", async () => {
    const error = new Error("replacement unavailable");
    const deps = harness({
      replaceText: async () => {
        throw error;
      },
    });
    await expect(
      preparePlaybackInput({ ...deps, text: "hello", guildId: "g", userId: "u" }),
    ).resolves.toEqual({ inputText: "hello", voice: "nova" });
    expect(deps.log.error).toHaveBeenCalledWith("Replacements error", error);
  });
});
