# ttsbot User Guide

This guide explains how to configure, run, and operate ttsbot. The bot reads messages from one linked Discord text channel and speaks them in a voice channel through OpenAI text-to-speech.

## Requirements

- Node.js 26 or newer and npm.
- A Discord application with a bot user and an application command.
- An OpenAI API key with access to text-to-speech.
- A Discord server where the bot can read messages, answer commands, and connect to and speak in voice channels.
- The Message Content privileged intent enabled for the Discord application.

## Discord access

Invite the bot with the `bot` and `applications.commands` OAuth scopes. Grant these channel permissions:

- View Channels.
- Send Messages, so the bot can answer slash commands.
- Connect and Speak in the target voice channel.

Enable the Message Content privileged intent in the Discord Developer Portal. The bot also uses the Guilds, Guild Messages, and Guild Voice States intents. Discord may require approval for privileged intents in larger applications.

## Configure the bot

Copy `.env.example` to `.env`. Set the required values and adjust optional values as needed.

| Variable               | Required | Default | Purpose                                               |
| ---------------------- | -------- | ------- | ----------------------------------------------------- |
| `DISCORD_CLIENT_ID`    | Yes      | None    | Discord application ID.                               |
| `DISCORD_TOKEN`        | Yes      | None    | Secret bot token.                                     |
| `OPENAI_API_KEY`       | Yes      | None    | Secret OpenAI API key.                                |
| `HEALTH_PORT`          | No       | `3040`  | Port for the health and readiness endpoints.          |
| `TTS_JITTER_BUFFER_MS` | No       | `200`   | Audio prebuffer in milliseconds, from 0 through 1000. |

The bot exits before startup when a required value is missing. The application ID is not a secret. Keep the bot token and API key outside version control. The included `.gitignore` excludes `.env`.

The logger writes at the `info` level by default. The application does not expose a log-level setting. The code includes debug records for channel, user, queue, request, and timing identifiers. The default level does not show these records.

The health server listens on `0.0.0.0`. Restrict access to its port with your host or container network rules.

## Install and run

From a clone of this repository, install the locked dependencies and start the bot. If no prebuilt Opus binary matches your system, npm compiles it and needs Python plus a C/C++ toolchain.

```sh
npm ci
npm start
```

The `ttsbot.mjs` entry point loads `.env`, then starts the health server and Discord client. The health server starts before the Discord connection. The readiness endpoint reports `starting` until Discord startup completes.

## Use slash commands

Run these commands in a server where the bot has been invited:

| Command          | Result                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------- |
| `/help`          | Shows basic usage.                                                                     |
| `/join`          | Joins your current voice channel and links the text channel where you ran the command. |
| `/leave`         | Stops playback, disconnects from voice, and clears the guild queue and linked channel. |
| `/voice <voice>` | Sets your voice for the current server.                                                |
| `/skip`          | Stops the current message and continues with the next queued message.                  |
| `/stop`          | Stops the current message and clears the queue.                                        |

Choose one of these voices with `/voice`: `alloy`, `ash`, `coral`, `echo`, `fable`, `nova`, `onyx`, `sage`, or `shimmer`.

Join a voice channel before you run `/join`. The bot rejects `/join` when the caller is not in a voice channel or when the bot already has a voice connection in that server. Run `/leave` before linking a different channel.

## Message and voice behavior

The bot speaks nonempty messages from the linked text channel. It ignores bot-authored messages and messages longer than 2,000 characters. It queues messages in first-in, first-out order for each server.

Each user has a voice setting per server. Settings exist only in memory and reset when the bot restarts. When a user has no setting, the bot assigns a voice with the lowest current assignment count. It chooses randomly when multiple voices share the lowest count. The default voice fallback is `coral`.

Before each OpenAI request, ttsbot applies the word replacements in `replacements.json`. Each record has `search` and `replace` strings. The bot matches whole words without regard to letter case. Keep valid JSON in that file. The bot loads the replacement list the first time it needs one and then caches it until restart.

The bot requests PCM audio from OpenAI. It processes the returned audio as 24 kHz mono input and resamples it to 48 kHz stereo PCM for Discord playback. It retries HTTP 429 and server errors up to three times, with 250 ms and 500 ms delays. The jitter buffer holds audio until it has buffered the configured number of milliseconds. Set `TTS_JITTER_BUFFER_MS=0` to disable that prebuffer.

## Health and readiness

The HTTP server provides two unauthenticated endpoints:

| Path                            | Success response                      | Meaning                                           |
| ------------------------------- | ------------------------------------- | ------------------------------------------------- |
| `/health`                       | HTTP 200 with `{"status":"ok"}`       | The process answers HTTP requests.                |
| `/ready`                        | HTTP 200 with `{"status":"ready"}`    | Discord startup completed.                        |
| `/ready` before Discord startup | HTTP 503 with `{"status":"starting"}` | The process is not ready to serve Discord events. |

The server returns HTTP 404 for other paths. It listens on `0.0.0.0:<HEALTH_PORT>`, so network controls must restrict access where needed.

## Run with Docker

Build the image from the repository root:

```sh
docker build -t ttsbot:local .
```

Create a local `.env` file with the required settings. Then start the container:

```sh
docker run --rm --name ttsbot --env-file .env -p 3040:3040 ttsbot:local
```

If `HEALTH_PORT` differs from `3040`, map a host port to the container port set by `HEALTH_PORT`. For example, use `-p 3040:9090` when `HEALTH_PORT=9090`. The container exposes port `3040` and runs as the `node` user. The image includes production dependencies and the files needed at runtime.

The GHCR workflow publishes an image for a version tag that matches `package.json`. Publication runs only after validation. Check the package visibility and access settings before relying on a registry image. Use a version tag and verify its digest before deployment.

## Run with systemd

The included `ttsbot.service` expects the repository at `/opt/ttsbot` and settings in `/opt/ttsbot/.env`. Review the unit before enabling it. The unit runs as `root`, sets a restrictive filesystem policy, and restarts the service after a failure.

After installing the repository and creating the environment file, use:

```sh
sudo systemctl enable --now ttsbot.service
sudo systemctl status ttsbot.service
journalctl -u ttsbot.service -f
```

Restart after updating code or dependencies:

```sh
sudo systemctl restart ttsbot.service
```

## Troubleshoot

- If startup reports missing configuration, set all three required variables and restart the process.
- If `/ready` returns HTTP 503, check that the Discord token and application ID are valid and that Discord startup succeeds.
- If `/join` rejects the request, join a voice channel first or run `/leave` to clear an existing connection.
- If messages are not spoken, check that the message is in the linked channel, is not from a bot, and is no longer than 2,000 characters.
- If Discord cannot read user messages, enable the Message Content privileged intent and grant channel read access.
- If speech requests fail, check the OpenAI API key, account access, and service logs.
- If the health server cannot start, check whether another process uses `HEALTH_PORT`.

## Stop and recover

Use `/stop` to stop playback and clear the server queue. Use `/leave` to stop playback, disconnect, and clear the channel link. During process shutdown, ttsbot marks readiness false, closes the health server, stops audio, disconnects voice sessions, and shuts down Discord.

User voice settings are not persisted. Users can run `/voice` again after a restart. To roll back a deployment, restore the prior repository revision or image digest, reinstall the matching dependencies when using a source deployment, and restart the service.
