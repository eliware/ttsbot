import { Server } from "node:http";
import { expect, test } from "@jest/globals";
import { createHealthHttpServer } from "../../../src/health/server/factory.mjs";

test("creates an HTTP server with the supplied handler", () => {
  const handler = () => {};
  const server = createHealthHttpServer(handler);
  expect(server).toBeInstanceOf(Server);
  expect(server.listeners("request")).toContain(handler);
});
