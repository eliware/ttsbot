import { expect, jest, test } from "@jest/globals";
import { startConfiguredHealthServer } from "../../src/config/server-startup.mjs";

test("starts the health server on the configured port and all interfaces", async () => {
  const health = { start: jest.fn(async () => {}) };
  const createServer = jest.fn(() => health);
  await expect(startConfiguredHealthServer(4321, createServer)).resolves.toBe(health);
  expect(createServer).toHaveBeenCalledWith({ port: 4321, host: "0.0.0.0" });
  expect(health.start).toHaveBeenCalledTimes(1);
});
