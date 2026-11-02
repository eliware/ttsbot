import { describe, expect, jest, test } from "@jest/globals";
import { createReplacementLoadFallback } from "../../src/text/load-fallback.mjs";

describe("replacement load fallback", () => {
  test("accepts omitted loader options", () => {
    expect(typeof createReplacementLoadFallback()).toBe("function");
  });

  test("uses an explicitly supplied rule loader", async () => {
    const loadRules = jest.fn(async () => [{ search: "a", replace: "b" }]);
    await expect(createReplacementLoadFallback({ loadRules })()).resolves.toEqual([
      { search: "a", replace: "b" },
    ]);
    expect(loadRules).toHaveBeenCalledTimes(1);
  });

  test.each([
    [
      "read failure",
      async () => {
        throw new Error("read failed");
      },
    ],
    ["invalid JSON", async () => "{"],
    ["invalid entries", async () => "[null]"],
  ])("returns no rules after %s", async (_label, readReplacements) => {
    await expect(createReplacementLoadFallback({ readReplacements })()).resolves.toEqual([]);
  });
});
