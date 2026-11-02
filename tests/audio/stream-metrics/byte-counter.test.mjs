import { EventEmitter } from "node:events";
import { expect, test } from "@jest/globals";
import { attachAudioByteCounter } from "../../../src/audio/stream-metrics/byte-counter.mjs";

test("counts bytes from each source chunk", () => {
  const source = new EventEmitter();
  const getAudioBytes = attachAudioByteCounter(source);
  source.emit("data", Buffer.alloc(2));
  source.emit("data", Buffer.alloc(3));
  expect(getAudioBytes()).toBe(5);
});
