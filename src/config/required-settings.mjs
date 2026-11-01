export const REQUIRED_SETTINGS = ["DISCORD_CLIENT_ID", "DISCORD_TOKEN", "OPENAI_API_KEY"];

export function hasRequiredSettings(environment) {
  return REQUIRED_SETTINGS.every((name) => Boolean(environment[name]));
}
