import { describe, expect, jest, test } from "@jest/globals";
import { createHealthRequestHandler } from "../../src/health/routes.mjs";

function response() {
  return { writeHead: jest.fn(), end: jest.fn() };
}

describe("health routes", () => {
  test("returns liveness status", () => {
    const res = response();
    createHealthRequestHandler(() => false)({ method: "GET", url: "/health" }, res);
    expect(res.writeHead).toHaveBeenCalledWith(200, { "content-type": "application/json" });
    expect(res.end).toHaveBeenCalledWith('{"status":"ok"}');
  });

  test.each([
    [false, 503, "starting"],
    [true, 200, "ready"],
  ])("reports readiness %s", (ready, status, text) => {
    const res = response();
    createHealthRequestHandler(() => ready)({ method: "GET", url: "/ready" }, res);
    expect(res.writeHead).toHaveBeenCalledWith(status, { "content-type": "application/json" });
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ status: text }));
  });

  test("returns not found for unknown routes", () => {
    const res = response();
    createHealthRequestHandler(() => false)({ method: "GET", url: "/unknown" }, res);
    expect(res.writeHead).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalledWith();
  });

  test("rejects methods other than GET", () => {
    const res = response();
    const getReady = jest.fn(() => true);
    createHealthRequestHandler(getReady)({ method: "POST", url: "/ready" }, res);
    expect(res.writeHead).toHaveBeenCalledWith(405, { allow: "GET" });
    expect(res.end).toHaveBeenCalledWith();
    expect(getReady).not.toHaveBeenCalled();
  });
});
