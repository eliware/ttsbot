import { describe, expect, jest, test } from "@jest/globals";
import { preserveTextOnReplacementFailure } from "../../src/text/fallback.mjs";

describe("replacement fallback", () => {
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
});
