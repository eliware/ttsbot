import { EventEmitter } from "node:events";
import { expect, jest, test } from "@jest/globals";
import { createHealthServerLifecycle } from "../../../src/health/server/lifecycle.mjs";

function createServer() {
  const server = new EventEmitter();
  server.listening = false;
  server.listen = jest.fn(() => {
    server.listening = true;
    server.emit("listening");
  });
  server.close = jest.fn((callback) => {
    server.listening = false;
    callback();
  });
  return server;
}

test("starts and stops the HTTP server", async () => {
  const server = createServer();
  const lifecycle = createHealthServerLifecycle(server, { port: 3040, host: "127.0.0.1" });
  await expect(lifecycle.start()).resolves.toBe(server);
  expect(server.listen).toHaveBeenCalledWith(3040, "127.0.0.1");
  await expect(lifecycle.stop()).resolves.toBeUndefined();
  expect(server.close).toHaveBeenCalledTimes(1);
  await expect(lifecycle.stop()).resolves.toBeUndefined();
});

test("rejects startup and shutdown errors", async () => {
  const startup = createServer();
  const startError = new Error("listen failed");
  startup.listen = jest.fn(() => startup.emit("error", startError));
  await expect(
    createHealthServerLifecycle(startup, { port: 1, host: "localhost" }).start(),
  ).rejects.toBe(startError);
  const running = createServer();
  running.listening = true;
  const stopError = new Error("close failed");
  running.close = jest.fn((callback) => callback(stopError));
  await expect(createHealthServerLifecycle(running, {}).stop()).rejects.toBe(stopError);
});
