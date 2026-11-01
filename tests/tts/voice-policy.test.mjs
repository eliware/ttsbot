import { describe, expect, test } from "@jest/globals";
import { selectLeastUsedVoice } from "../../src/tts/voice-policy.mjs";

describe("voice allocation policy", () => {
  test("selects a least-used voice", () => {
    expect(
      selectLeastUsedVoice({
        voices: ["a", "b", "c"],
        assignments: { first: "a" },
        random: () => 0,
      }),
    ).toBe("b");
  });

  test("chooses among tied least-used voices using the supplied random value", () => {
    expect(
      selectLeastUsedVoice({
        voices: ["a", "b", "c"],
        assignments: { first: "a" },
        random: () => 0.99,
      }),
    ).toBe("c");
  });

  test("rejects an empty voice list", () => {
    expect(() => selectLeastUsedVoice({ voices: [], assignments: {} })).toThrow(
      "At least one voice is required",
    );
  });
});
