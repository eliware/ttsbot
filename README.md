# ttsbot

Discord text-to-speech bot using OpenAI TTS.

## What it does

- Joins a Discord voice channel
- Speaks messages from the linked text channel
- Supports per-user saved voice and instructions
- Applies word replacements from `replacements.json`
- Queues messages FIFO and supports skip/stop

## Requirements

- Node.js
- Discord bot token
- OpenAI API key
- A Discord server where the bot has permission to read messages, join/speak in voice, and use slash commands

## Environment

Create a `.env` file with:

```env
DISCORD_TOKEN=your_discord_bot_token
OPENAI_API_KEY=your_openai_api_key
```

See `.env.example` for the expected keys.

## Install

```bash
npm install
```

## Run

```bash
npm start
```

The service entrypoint is `ttsbot.mjs`, which loads `src/main.mjs`.

## Commands

- `/help` — show basic usage
- `/join` — join your current voice channel and link the current text channel
- `/leave` — leave voice and clear state
- `/voice <voice>` — set your TTS voice
- `/instructions` — set custom speaking instructions
- `/skip` — skip the current message
- `/stop` — stop playback and clear the queue

## Behavior

- Only messages in the linked text channel are spoken.
- Users without saved settings are auto-assigned a voice on first use.
- Settings are stored in `settings/<guildId>-<userId>.json`.
- Replacements are loaded from `replacements.json`.

## Files of interest

- `src/main.mjs` — startup and env validation
- `src/discordClient.mjs` — Discord commands and message handling
- `src/ttsEngine.mjs` — OpenAI TTS fetch, queueing, Discord playback
- `src/settings.mjs` — settings file helpers
- `replacements.json` — search/replace rules

## Notes

- There are no automated tests yet.
- The bot uses OpenAI PCM output and resamples for Discord voice playback.
