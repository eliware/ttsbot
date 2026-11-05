import { describe, expect, jest, test } from "@jest/globals";
import { configureLogLevel } from "../../src/config/log-level.mjs";

describe("log level configuration", () => {
  test("keeps the logger level when no value is set", () => {
    const logger = { level: "info", levels: { info: 2, debug: 5 }, warn: jest.fn() };
    configureLogLevel(logger, undefined);
    expect(logger.level).toBe("info");
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test("keeps the logger level when the value is empty", () => {
    const logger = { level: "info", levels: { info: 2, debug: 5 }, warn: jest.fn() };
    configureLogLevel(logger, "");
    expect(logger.level).toBe("info");
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test("sets a supported logger level", () => {
    const logger = { level: "info", levels: { info: 2, debug: 5 }, warn: jest.fn() };
    configureLogLevel(logger, "DEBUG");
    expect(logger.level).toBe("debug");
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test("keeps the current level and warns for an unsupported value", () => {
    const logger = { level: "info", levels: { info: 2, debug: 5 }, warn: jest.fn() };
    configureLogLevel(logger, "invalid");
    expect(logger.level).toBe("info");
    expect(logger.warn).toHaveBeenCalledWith("Ignoring unsupported LOG_LEVEL value.", {
      logLevel: "invalid",
    });
  });

  test("warns when the logger has no level map", () => {
    const logger = { level: "info", warn: jest.fn() };
    configureLogLevel(logger, "debug");
    expect(logger.level).toBe("info");
    expect(logger.warn).toHaveBeenCalledWith("Ignoring unsupported LOG_LEVEL value.", {
      logLevel: "debug",
    });
  });
});
