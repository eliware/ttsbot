import { describe, expect, test } from "@jest/globals";
import { normalizeMessageContent } from "../../../src/discord/message/content.mjs";

describe("message content normalization", () => {
  test("trims valid message content", () => {
    expect(normalizeMessageContent("  hello  ")).toBe("hello");
  });

  test("rejects empty and oversized content", () => {
    expect(normalizeMessageContent("")).toBeNull();
    expect(normalizeMessageContent("   ")).toBeNull();
    expect(normalizeMessageContent("x".repeat(2001))).toBeNull();
    expect(normalizeMessageContent(undefined)).toBeNull();
  });
});
