# ttsbot

Discord text-to-speech bot using OpenAI TTS and Discord voice playback.

## Scope

The bot joins a Discord voice channel, links the current text channel, and speaks new messages from that channel. Speech is queued FIFO, converted from OpenAI 24 kHz mono PCM to Discord-compatible 48 kHz stereo PCM, and played in the voice channel.

## Requirements

- Node.js 26 or newer
- Discord application/bot token
- OpenAI API key
- Discord server where the bot can:
  - View channels and read message history
  - Read message content
  - Connect to and speak in voice channels
  - Use slash commands

## Configuration

Copy `.env.example` to `.env` and set:

```env
DISCORD_CLIENT_ID=your_discord_application_client_id_here
DISCORD_TOKEN=your_discord_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

DISCORD_CLIENT_ID identifies the Discord application and is not secret. DISCORD_TOKEN and OPENAI_API_KEY are required secrets. Never commit `.env`, tokens, or API keys. Configuration is loaded at startup and is not logged.

## Install

```bash
npm install
```

The project uses native ESM and requires Node.js 26 or newer.

## Run

```bash
npm start
```

The root entrypoint is `ttsbot.mjs`; it loads `src/main.mjs`, validates required environment variables, initializes the Discord client, and registers lifecycle handlers.

## Commands

- `/help` — show basic usage
- `/join` — join your current voice channel and link the current text channel
- `/leave` — leave voice and clear guild state
- `/voice <voice>` — save your TTS voice
- `/instructions` — set custom speaking instructions using a modal
- `/skip` — skip the current message
- `/stop` — stop playback and clear the queue

Available voices are defined in `src/discordClient.mjs` and exposed as `/voice` choices.

## Behavior and state

- Only messages in the linked text channel are spoken.
- Bot-authored messages are ignored.
- Messages longer than 2,000 characters are ignored.
- Messages are queued FIFO per guild.
- Users without saved settings receive an automatically assigned voice on first use.
- Settings are stored as runtime state in `settings/<guildId>-<userId>.json` and should not be committed.
- Word replacements are loaded from `replacements.json` and applied before TTS requests.
- `/leave`, `/skip`, `/stop`, and process shutdown clean active playback and queues.

## Development and validation

```bash
npm run lint
npm test
npm run test:gaps
```

Tests are under `tests/`. Tests use native ESM Jest and cover settings persistence and resampler stream behavior.

## Deployment with systemd

The included `ttsbot.service` runs the bot from `/opt/ttsbot` using `/opt/ttsbot/.env`:

```bash
sudo systemctl enable --now ttsbot.service
sudo systemctl status ttsbot.service
journalctl -u ttsbot.service -f
```

After code or dependency changes:

```bash
sudo systemctl restart ttsbot.service
```

The service restarts on failure. Verify logs after restart. Roll back by restoring the previous repository revision, reinstalling dependencies, and restarting the service.

## Security and operational notes

- Keep `.env` outside version control and restrict its permissions, for example `chmod 600 .env`.
- The bot requires the Discord Message Content privileged intent; enable it in the Discord Developer Portal.
- Use the minimum Discord permissions required for the bot.
- Do not expose logs containing message content, credentials, or full API responses.
- Runtime settings are local mutable state; back them up only if preserving user preferences is required.
- There is no HTTP health endpoint; readiness is indicated by successful Discord login and the `ClientReady` event.

## Project files

- `ttsbot.mjs` — root entrypoint
- `src/main.mjs` — startup and environment validation
- `src/discordClient.mjs` — Discord commands, events, and shutdown
- `src/ttsEngine.mjs` — TTS requests, queueing, resampling, and playback
- `src/settings.mjs` — settings persistence
- `tests/` — focused automated tests
- `replacements.json` — search/replace rules
- `ttsbot.service` — systemd unit

## License and support

This project is maintained for Eliware infrastructure. See package metadata and repository history for project ownership and changes.
