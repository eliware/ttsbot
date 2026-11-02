import { expect, jest, test } from "@jest/globals";
import { validatePlaybackInput } from "../../src/audio/input-validation.mjs";

test("accepts valid text when a voice connection exists", () => {
  expect(
    validatePlaybackInput({
      text: "hello",
      state: { connection: {} },
      guildId: "g",
      log: { warn: jest.fn() },
    }),
  ).toBe(true);
});

test("rejects empty or oversized text and missing connections", () => {
  const log = { warn: jest.fn() };
  expect(validatePlaybackInput({ text: "", state: { connection: {} }, log })).toBe(false);
  expect(validatePlaybackInput({ text: "x".repeat(2001), state: { connection: {} }, log })).toBe(
    false,
  );
  expect(validatePlaybackInput({ text: "hello", state: {}, guildId: "g", log })).toBe(false);
  expect(log.warn).toHaveBeenCalledWith("No voice connection for guild", "g");
});
