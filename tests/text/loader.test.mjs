import { describe, expect, jest, test } from "@jest/globals";
import { createReplacementLoader } from "../../src/text/loader.mjs";

describe("replacement loader", () => {
  test("loads replacement rules once and reuses the cache", async () => {
    const readReplacements = jest.fn(async () =>
      JSON.stringify([{ search: "brb", replace: "be right back" }]),
    );
    const loadReplacements = createReplacementLoader({ readReplacements });
    const first = await loadReplacements();
    const second = await loadReplacements();
    expect(second).toBe(first);
    expect(readReplacements).toHaveBeenCalledTimes(1);
  });

  test("retries after a temporary replacement-file failure", async () => {
    const readReplacements = jest
      .fn()
      .mockRejectedValueOnce(new Error("temporary read failure"))
      .mockResolvedValue(JSON.stringify([{ search: "brb", replace: "be right back" }]));
    const loadReplacements = createReplacementLoader({ readReplacements });
    await expect(loadReplacements()).resolves.toEqual([]);
    await expect(loadReplacements()).resolves.toMatchObject([{ replace: "be right back" }]);
    expect(readReplacements).toHaveBeenCalledTimes(2);
  });
});
