import { expect, test } from "@jest/globals";
import { replaceText } from "../../src/text/default-replacer.mjs";

test("uses the configured replacement file", async () => {
  await expect(replaceText("brb")).resolves.toBe("be right back");
});
