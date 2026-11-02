import { describe, expect, test } from "@jest/globals";
import { isIgnoredNodeWarning } from "../../src/warnings/filter.mjs";

describe("Node warning filter", () => {
  test("ignores only the known punycode deprecation", () => {
    expect(isIgnoredNodeWarning({ code: "DEP0040" })).toBe(true);
    expect(isIgnoredNodeWarning({ code: "OTHER" })).toBe(false);
    expect(isIgnoredNodeWarning(null)).toBe(false);
  });

  test("ignores warning objects that throw when reading their code", () => {
    const warning = Object.defineProperty({}, "code", {
      get() {
        throw new Error("unavailable");
      },
    });
    expect(isIgnoredNodeWarning(warning)).toBe(false);
  });
});
