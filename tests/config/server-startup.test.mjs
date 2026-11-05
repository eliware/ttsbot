import { expect, jest, test } from "@jest/globals";
import { startConfiguredHealthServer } from "../../src/config/server-startup.mjs";

test("starts the health server on the configured port and local interface", async () => {
  const health = { start: jest.fn(async () => {}) };
  const createServer = jest.fn(() => health);
  await expect(startConfiguredHealthServer(4321, createServer)).resolves.toBe(health);
  expect(createServer).toHaveBeenCalledWith({ port: 4321, host: "127.0.0.1" });
  expect(health.start).toHaveBeenCalledTimes(1);
});

test("uses a configured health host", async () => {
  const createServer = jest.fn(() => ({ start: jest.fn(async () => {}) }));
  await startConfiguredHealthServer(4321, createServer, "0.0.0.0");
  expect(createServer).toHaveBeenCalledWith({ port: 4321, host: "0.0.0.0" });
});
