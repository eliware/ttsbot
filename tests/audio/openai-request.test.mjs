import { expect, jest, test } from "@jest/globals";
import { requestSpeechOnce } from "../../src/audio/openai-request.mjs";

test("passes speech API failures to the caller", async () => {
  const error = new Error("request failed");
  const create = jest.fn().mockRejectedValue(error);
  await expect(
    requestSpeechOnce({
      client: { audio: { speech: { create } } },
      input: "hello",
      voice: "coral",
      signal: new AbortController().signal,
    }),
  ).rejects.toBe(error);
  expect(create).toHaveBeenCalledTimes(1);
});
