import { describe, expect, jest, test } from "@jest/globals";
import { createHealthRequestHandler } from "../../src/health/routes.mjs";

function response() {
  return { writeHead: jest.fn(), end: jest.fn() };
}

describe("health routes", () => {
  test("returns liveness status", () => {
    const res = response();
    createHealthRequestHandler(() => false)({ url: "/health" }, res);
    expect(res.writeHead).toHaveBeenCalledWith(200, { "content-type": "application/json" });
    expect(res.end).toHaveBeenCalledWith('{"status":"ok"}');
  });

  test.each([
    [false, 503, "starting"],
    [true, 200, "ready"],
  ])("reports readiness %s", (ready, status, text) => {
    const res = response();
    createHealthRequestHandler(() => ready)({ url: "/ready" }, res);
    expect(res.writeHead).toHaveBeenCalledWith(status, { "content-type": "application/json" });
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ status: text }));
  });

  test("returns not found for unknown routes", () => {
    const res = response();
    createHealthRequestHandler(() => false)({ url: "/unknown" }, res);
    expect(res.writeHead).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalledWith();
  });
});
