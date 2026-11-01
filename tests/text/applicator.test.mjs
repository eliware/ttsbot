import { describe, expect, test } from "@jest/globals";
import { applyReplacements } from "../../src/text/applicator.mjs";

describe("replacement applicator", () => {
  test("applies compiled rules in order", () => {
    expect(
      applyReplacements("LOL lolly a+b aab", [
        { regex: /\blol\b/gi, replace: "laugh out loud" },
        { regex: /\ba\+b\b/gi, replace: "sum" },
      ]),
    ).toBe("laugh out loud lolly sum aab");
  });

  test("preserves text when no rules exist", () => {
    expect(applyReplacements("hello", [])).toBe("hello");
  });
});
