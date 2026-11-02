import { afterEach, expect, jest, test } from "@jest/globals";

const createDiscord = jest.fn(async (options) => options);
jest.unstable_mockModule("@eliware/discord", () => ({ createDiscord }));
jest.unstable_mockModule("@eliware/common", () => ({
  log: {},
  path: () => "/repo",
}));
const { startDiscordClient } = await import("../src/discordClient.mjs");

const previousToken = process.env.DISCORD_TOKEN;
const previousClientId = process.env.DISCORD_CLIENT_ID;
afterEach(() => {
  if (previousToken === undefined) delete process.env.DISCORD_TOKEN;
  else process.env.DISCORD_TOKEN = previousToken;
  if (previousClientId === undefined) delete process.env.DISCORD_CLIENT_ID;
  else process.env.DISCORD_CLIENT_ID = previousClientId;
  createDiscord.mockClear();
});

test("requires Discord credentials", async () => {
  delete process.env.DISCORD_TOKEN;
  await expect(startDiscordClient()).rejects.toThrow("Missing DISCORD_TOKEN");
  process.env.DISCORD_TOKEN = "token";
  delete process.env.DISCORD_CLIENT_ID;
  await expect(startDiscordClient()).rejects.toThrow("Missing DISCORD_CLIENT_ID");
  expect(createDiscord).not.toHaveBeenCalled();
});

test("starts Discord with the bot intents and action context", async () => {
  process.env.DISCORD_TOKEN = "token";
  process.env.DISCORD_CLIENT_ID = "client";
  const result = await startDiscordClient();
  expect(result).toMatchObject({
    clientId: "client",
    token: "token",
    rootDir: "/repo",
    signals: false,
    intents: { Guilds: true, GuildMessages: true, MessageContent: true, GuildVoiceStates: true },
  });
  expect(result.context.actions).toHaveProperty("join");
});
