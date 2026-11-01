import { describe, expect, jest, test } from "@jest/globals";
import { createReplacementFileReader } from "../../src/text/file-reader.mjs";

describe("replacement file reader", () => {
  test("reads the configured file as UTF-8 text", async () => {
    const readFile = jest.fn(async () => "[ ]");
    const readReplacements = createReplacementFileReader({
      readFile,
      filePath: "replacements.json",
    });
    await expect(readReplacements()).resolves.toBe("[ ]");
    expect(readFile).toHaveBeenCalledWith("replacements.json", "utf8");
  });
});
