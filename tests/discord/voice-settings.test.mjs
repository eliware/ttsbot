import { describe, expect, jest, test } from "@jest/globals";
import { createVoiceSettingsAction } from "../../src/discord/voice-settings.mjs";

describe("voice settings action", () => {
  test("saves the selected voice and replies to the user", async () => {
    const settings = { voice: "coral" };
    const loadSettings = jest.fn(async () => settings);
    const saveSettings = jest.fn(async () => {});
    const log = { debug: jest.fn() };
    const interaction = { guildId: "guild", user: { id: "user" }, reply: jest.fn(async () => {}) };

    await createVoiceSettingsAction({ log, loadSettings, saveSettings })(interaction, "nova");

    expect(saveSettings).toHaveBeenCalledWith("guild", "user", { voice: "nova" });
    expect(interaction.reply).toHaveBeenCalledWith({ content: "Saved voice: nova", flags: 64 });
    expect(log.debug).toHaveBeenCalledTimes(2);
  });

  test("rejects unsupported voices without saving them", async () => {
    const loadSettings = jest.fn();
    const saveSettings = jest.fn();
    const interaction = { guildId: "guild", user: { id: "user" }, reply: jest.fn(async () => {}) };
    await createVoiceSettingsAction({ log: { debug: jest.fn() }, loadSettings, saveSettings })(
      interaction,
      "invalid",
    );
    expect(interaction.reply).toHaveBeenCalledWith({
      content: "Choose a supported voice.",
      flags: 64,
    });
    expect(loadSettings).not.toHaveBeenCalled();
    expect(saveSettings).not.toHaveBeenCalled();
  });
});
