# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## ttsbot [![License](https://img.shields.io/github/license/eliware/ttsbot)](https://github.com/eliware/ttsbot) [![CI](https://github.com/eliware/ttsbot/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/ttsbot/actions/workflows/ci.yaml)

Discord text-to-speech bot using OpenAI TTS and Discord voice playback

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Configuration](#configuration)
- [Operations](#operations)
- [Commands](#commands)
- [Events](#events)
- [Intents and permissions](#intents-and-permissions)
- [Support](#support)
- [Links](#links)
- [License](#license)

## Features

ttsbot reads messages from one linked Discord text channel, converts them to speech with OpenAI, and plays audio in a Discord voice channel.

## Requirements

Use Node.js 26 or later. Create a Discord application and an OpenAI API key. Enable the Message Content privileged intent for the Discord application.

## Setup

Copy `.env.example` to `.env` and set `DISCORD_CLIENT_ID`, `DISCORD_TOKEN`, and `OPENAI_API_KEY`. Run `npm ci`, then run `npm start`.

## Usage

Invite the bot with the `bot` and `applications.commands` scopes. Use `/join` while you are in a voice channel to link that channel to the text channel where you ran the command. Read the [user guide](docs/USER_GUIDE.md) for complete setup, configuration, operation, and recovery steps. Read [release notes](RELEASE_NOTES.md) for version history.

## Development

Read [AGENTS.md](AGENTS.md) before you change repository files. Find user documentation in [docs/README.md](docs/README.md).

## Testing

Run `npm test` for the full Jest suite. Run `npm run lint` for lint checks.

## Troubleshooting

If the bot does not speak, confirm that it joined the expected voice channel and that the message came from the linked text channel. Check the user guide for configuration and connection troubleshooting.

## Security

Keep `DISCORD_TOKEN` and `OPENAI_API_KEY` out of Git. The health server has no authentication and listens on all interfaces. Restrict its network access.

## Configuration

`DISCORD_CLIENT_ID`, `DISCORD_TOKEN`, and `OPENAI_API_KEY` are required. `HEALTH_PORT` is optional and defaults to `3040`. `TTS_JITTER_BUFFER_MS` is optional and defaults to `200`, with values limited to 0 through 1000. Read [configuration details](docs/USER_GUIDE.md#configure-the-bot) for all settings.

## Operations

Build a local container with `docker build -t ttsbot:local .`. The included systemd unit expects `/opt/ttsbot` and `/opt/ttsbot/.env`. Read [deployment instructions](docs/USER_GUIDE.md#run-with-docker) and [systemd instructions](docs/USER_GUIDE.md#run-with-systemd) before deployment. The GHCR workflow publishes only when a version tag matches the package version.

## Commands

The bot provides `/help`, `/join`, `/leave`, `/voice`, `/skip`, and `/stop`. Read [command behavior](docs/USER_GUIDE.md#use-slash-commands) for details.

## Events

The bot handles Discord client readiness, slash command interactions, and server messages. It ignores bot-authored messages and messages outside the linked text channel.

## Intents and permissions

The bot uses the Guilds, Guild Messages, Message Content, and Guild Voice States intents. Grant View Channels and Send Messages in the text channel. Grant Connect and Speak in the voice channel. Enable the Message Content privileged intent in the Discord Developer Portal.

## Support

For help, questions, or to chat with the author and community, visit:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)[![eliware.org](https://eliware.org/logos/eliware_96.png)](https://discord.gg/M6aTR9eTwN)

**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## Links

- [Home Page](https://eliware.org)
- [GitHub Org](https://github.com/eliware)
- [GitHub Repo](https://github.com/eliware/ttsbot)
- [Bug Reports](https://github.com/eliware/ttsbot/issues)
- [Discord](https://discord.gg/M6aTR9eTwN)

## License

The package metadata declares the ISC license. Read the [ISC license](https://spdx.org/licenses/ISC.html).
