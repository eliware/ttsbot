import { describe, expect, test } from "@jest/globals";
import { createTextReplacer } from "../../src/text/replacer.mjs";
import { replaceText as defaultReplaceText } from "../../src/text/default-replacer.mjs";

describe("text replacer", () => {
  test("uses the configured replacement file in the default replacer", async () => {
    await expect(defaultReplaceText("brb")).resolves.toBe("be right back");
  });

  test("applies replacement rules to input", async () => {
    const replaceText = createTextReplacer({
      loadReplacements: async () => [{ regex: /\bbrb\b/gi, replace: "be right back" }],
    });
    await expect(replaceText("BRB soon")).resolves.toBe("be right back soon");
  });
});
