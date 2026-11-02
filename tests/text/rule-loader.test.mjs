import { describe, expect, jest, test } from "@jest/globals";
import { createReplacementRuleLoader } from "../../src/text/rule-loader.mjs";

describe("replacement rule loader", () => {
  test("creates its default reader without reading files until invoked", () => {
    expect(typeof createReplacementRuleLoader()).toBe("function");
  });

  test("reads replacement data and compiles its rules", async () => {
    const readReplacements = jest.fn(async () => '[{"search":"brb","replace":"back"}]');
    const rules = await createReplacementRuleLoader({ readReplacements })();
    expect(rules[0].regex.test("brb")).toBe(true);
    expect(readReplacements).toHaveBeenCalledTimes(1);
  });

  test("returns no rules for empty input", async () => {
    const readReplacements = jest.fn(async () => "");
    await expect(createReplacementRuleLoader({ readReplacements })()).resolves.toEqual([]);
  });
});
