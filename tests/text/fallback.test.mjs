import { describe, expect, jest, test } from "@jest/globals";
import {
  createReplacementLoadFallback,
  preserveTextOnReplacementFailure,
} from "../../src/text/fallback.mjs";

describe("replacement fallback", () => {
  test("returns successful replacements with the default logger", async () => {
    await expect(preserveTextOnReplacementFailure("text", async () => "replaced")).resolves.toBe(
      "replaced",
    );
  });

  test("preserves input and logs when replacement processing fails", async () => {
    const error = new Error("replacement load failed");
    const logger = { error: jest.fn() };
    await expect(
      preserveTextOnReplacementFailure(
        "text",
        async () => {
          throw error;
        },
        logger,
      ),
    ).resolves.toBe("text");
    expect(logger.error).toHaveBeenCalledWith("Replacements error", error);
  });

  test("accepts omitted load options", () => {
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
    await expect(createReplacementLoadFallback({ readReplacements })()).resolves.toBeUndefined();
  });
});
