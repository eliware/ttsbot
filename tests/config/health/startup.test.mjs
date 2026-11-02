import { expect, test } from "@jest/globals";
import { startHealthServer } from "../../../src/config/health/startup.mjs";

test("exports the configured health server startup function", () => {
  expect(typeof startHealthServer).toBe("function");
});
