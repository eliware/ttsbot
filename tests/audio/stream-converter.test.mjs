import { describe, expect, test } from "@jest/globals";
import { toNodeReadable } from "../../src/audio/stream-converter.mjs";

describe("Web stream conversion", () => {
  test("converts Web streams and preserves already streamable bodies", () => {
    const webStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
    expect(typeof toNodeReadable(webStream).pipe).toBe("function");
    const body = {};
    expect(toNodeReadable(body)).toBe(body);
  });
});
