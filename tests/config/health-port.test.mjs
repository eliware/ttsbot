import { describe, expect, test } from "@jest/globals";
import { getHealthPort, getListeningHealthPort } from "../../src/config/health-port.mjs";

describe("health port configuration", () => {
  test.each([
    [{ HEALTH_PORT: "3041" }, 3041],
    [{ HEALTH_PORT: "0" }, 0],
    [{}, 3040],
    [{ HEALTH_PORT: "" }, 3040],
    [{ HEALTH_PORT: "invalid" }, 3040],
  ])("resolves %o to port %i", (environment, expected) => {
    expect(getHealthPort(environment)).toBe(expected);
  });
});

describe("health listening port", () => {
  test("uses the bound port when available", () => {
    expect(getListeningHealthPort({ address: () => ({ port: 3042 }) }, 3040)).toBe(3042);
  });

  test("uses the configured port when the server has no address", () => {
    expect(getListeningHealthPort({ address: () => null }, 3040)).toBe(3040);
  });
});
