import { expect, test } from "@jest/globals";
import { playText } from "../../src/audio/default-playback.mjs";

test("exports the default playback function", () => {
  expect(typeof playText).toBe("function");
});
