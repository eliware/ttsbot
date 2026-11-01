import { describe, expect, test } from "@jest/globals";
import { createHealthReadiness } from "../src/health-readiness.mjs";

describe("health readiness state", () => {
  test("starts unready and accepts only true as ready", () => {
    const readiness = createHealthReadiness();
    expect(readiness.getReady()).toBe(false);
    readiness.setReady(true);
    expect(readiness.getReady()).toBe(true);
    readiness.setReady(1);
    expect(readiness.getReady()).toBe(false);
  });
});
