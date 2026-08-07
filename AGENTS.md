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
- Runtime settings: `settings/`

## Behavior summary

- The bot joins a Discord voice channel on `/join`.
- It speaks messages only from the linked text channel.
- It uses OpenAI TTS and resamples audio for Discord playback.
- It stores per-user voice and instruction preferences on disk.
- It auto-assigns voices for users without saved settings.

## Required environment

- `DISCORD_TOKEN`
- `OPENAI_API_KEY`

## Run

- `npm install`
- `npm start`

## Edit rules

- Keep changes focused.
- Prefer small edits over broad rewrites.
- Match the existing ESM style.
- Update this file and `README.md` when behavior or setup changes.

## Testing

- No test suite exists yet.
- If behavior changes, validate by starting the bot and checking Discord interaction flow.
