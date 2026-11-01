import { describe, expect, test } from "@jest/globals";
import { ensureAssignmentState } from "../../src/tts/assignment-state.mjs";

describe("assignment state", () => {
  test("initializes voice assignment state and preserves existing values", () => {
    const state = { assignedVoices: { user: "coral" } };
    expect(ensureAssignmentState(state)).toBe(state);
    expect(state.assignedUserOrder).toEqual([]);
    expect(state.assignedVoices).toEqual({ user: "coral" });
  });
});
