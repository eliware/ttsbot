import { describe, expect, test } from "@jest/globals";
import { getListeningHealthPort } from "../../../src/config/health/listening-port.mjs";

describe("health listening port", () => {
  test("uses the bound port when available", () => {
    expect(getListeningHealthPort({ address: () => ({ port: 3042 }) }, 3040)).toBe(3042);
  });

  test("uses the configured port when the server has no address", () => {
    expect(getListeningHealthPort({ address: () => null }, 3040)).toBe(3040);
  });
});
