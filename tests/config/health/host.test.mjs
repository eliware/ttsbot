import { describe, expect, test } from "@jest/globals";
import { getHealthHost } from "../../../src/config/health/host.mjs";

describe("health host configuration", () => {
  test.each([
    [{}, "127.0.0.1"],
    [{ HEALTH_HOST: "0.0.0.0" }, "0.0.0.0"],
    [{ HEALTH_HOST: " 127.0.0.1 " }, "127.0.0.1"],
    [{ HEALTH_HOST: "" }, "127.0.0.1"],
  ])("resolves %o to %s", (environment, expected) => {
    expect(getHealthHost(environment)).toBe(expected);
  });
});
