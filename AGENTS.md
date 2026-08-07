# AGENTS.md

## Scope

This repository contains `ttsbot`, a Discord text-to-speech bot.

## High-signal overview

- Entry point: `ttsbot.mjs`
- Main bootstrap: `src/main.mjs`
- Discord logic: `src/discordClient.mjs`
- TTS playback pipeline: `src/ttsEngine.mjs`
- Per-user settings: `src/settings.mjs`
- Replacements: `replacements.json`

## Behavior summary

- The bot joins a Discord voice channel on `/join`.
- It speaks messages only from the linked text channel.
- It uses OpenAI TTS and resamples audio for Discord playback.
- It stores per-user voice preferences in memory and resets them on restart.
- It auto-assigns voices for users without settings.

## Required environment

- `DISCORD_CLIENT_ID`
- `DISCORD_TOKEN`
- `OPENAI_API_KEY`
- `HEALTH_PORT` (optional, default `8080`)
- `TTS_JITTER_BUFFER_MS` (optional, integer 0-1000, default `200`)
- `LOG_LEVEL` (optional, default `info`)

## Run

- `npm install`
- `npm start`

## Edit rules

- Keep changes focused.
- Prefer small edits over broad rewrites.
- Match the existing ESM style.
- Update this file and `README.md` when behavior or setup changes.

## Testing

- `npm test`
- `npm run test:gaps`
- `npm run lint`
