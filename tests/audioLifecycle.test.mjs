import { describe, expect, jest, test } from "@jest/globals";
import { cancelResponseBody, cleanupCurrent } from "../src/audioLifecycle.mjs";

describe("audio lifecycle cleanup", () => {
  test("handles missing resources and avoids destroying the shared response source", () => {
    expect(() => cleanupCurrent(null)).not.toThrow();
    const source = { destroy: jest.fn() };
    const current = { source, controller: { abort: jest.fn() } };
    cleanupCurrent(current, { responseBody: source });
    expect(current.controller.abort).toHaveBeenCalled();
    expect(source.destroy).toHaveBeenCalledTimes(1);
  });

  test("cleans the playback pipeline and response body without aborting", () => {
    const current = {
      controller: { abort: jest.fn() },
      source: { destroy: jest.fn() },
      resampler: { destroy: jest.fn() },
      jitterBuffer: { destroy: jest.fn() },
    };
    const responseBody = { destroy: jest.fn() };
    cleanupCurrent(current, { responseBody, abort: false });
    expect(current.controller.abort).not.toHaveBeenCalled();
    expect(current.source.destroy).toHaveBeenCalled();
    expect(current.resampler.destroy).toHaveBeenCalled();
    expect(current.jitterBuffer.destroy).toHaveBeenCalled();
    expect(responseBody.destroy).toHaveBeenCalled();
  });

  test("continues cleanup when a resource destroy call fails", () => {
    const current = {
      controller: { abort: jest.fn() },
      source: {
        destroy: () => {
          throw new Error("source failed");
        },
      },
      resampler: {
        destroy: () => {
          throw new Error("resampler failed");
        },
      },
      jitterBuffer: { destroy: jest.fn() },
    };
    const responseBody = {
      destroy: () => {
        throw new Error("body failed");
      },
    };
    expect(() => cleanupCurrent(current, { responseBody, abort: false })).not.toThrow();
    expect(current.jitterBuffer.destroy).toHaveBeenCalled();
  });

  test("cancels a response body that has no destroy method", () => {
    const responseBody = { cancel: jest.fn() };
    cleanupCurrent({}, { responseBody, abort: false });
    expect(responseBody.cancel).toHaveBeenCalled();
  });

  test("destroys a response body when cancellation can use destroy", () => {
    const responseBody = { destroy: jest.fn() };
    cancelResponseBody(responseBody);
    expect(responseBody.destroy).toHaveBeenCalledTimes(1);
  });

  test("handles a rejected response body cancellation", async () => {
    const responseBody = { cancel: jest.fn(() => Promise.reject(new Error("cancel failed"))) };
    expect(() => cancelResponseBody(responseBody)).not.toThrow();
    await Promise.resolve();
    expect(responseBody.cancel).toHaveBeenCalledTimes(1);
  });
});
