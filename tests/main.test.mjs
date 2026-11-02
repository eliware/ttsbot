import { afterEach, expect, jest, test } from "@jest/globals";

const log = { error: jest.fn(), info: jest.fn() };
const registerWarning = jest.fn();
const registerErrorHandlers = jest.fn();
const registerShutdownSignals = jest.fn();
const startDiscordApplication = jest.fn(async (options) => options);

jest.unstable_mockModule("@eliware/common", () => ({
  log,
  path: jest.fn(),
  registerHandlers: registerErrorHandlers,
  registerSignals: registerShutdownSignals,
}));
jest.unstable_mockModule("../src/warnings/listener.mjs", () => ({
  registerNodeWarningListener: registerWarning,
}));
jest.unstable_mockModule("../src/application.mjs", () => ({ startDiscordApplication }));

const { startMain } = await import("../src/main.mjs");

const envKeys = ["DISCORD_CLIENT_ID", "DISCORD_TOKEN", "OPENAI_API_KEY"];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
const originalExitCode = process.exitCode;

function setValidEnv() {
  process.env.DISCORD_CLIENT_ID = "client";
  process.env.DISCORD_TOKEN = "token";
  process.env.OPENAI_API_KEY = "key";
}

afterEach(() => {
  jest.clearAllMocks();
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
  process.exitCode = originalExitCode;
});

test("uses default startup dependencies", async () => {
  setValidEnv();
  await startMain();
  expect(registerWarning).toHaveBeenCalledWith({ log });
  expect(registerErrorHandlers).toHaveBeenCalledWith({
    events: ["uncaughtException", "unhandledRejection"],
    log,
  });
  expect(startDiscordApplication).toHaveBeenCalledWith(
    expect.objectContaining({ log, registerSignals: registerShutdownSignals }),
  );
});

test("calls the default exit handler when required settings are absent", async () => {
  const exit = jest.spyOn(process, "exit").mockImplementation(() => undefined);
  try {
    await startMain();
    expect(exit).toHaveBeenCalledWith(1);
  } finally {
    exit.mockRestore();
  }
});

test("sets the default failure exit code when application startup rejects", async () => {
  setValidEnv();
  startDiscordApplication.mockRejectedValueOnce(new Error("startup failed"));
  await startMain();
  expect(process.exitCode).toBe(1);
  expect(log.error).toHaveBeenCalledWith("Failed to start Discord client", expect.any(Error));
});
