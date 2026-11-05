# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/ttsbot [![License](https://img.shields.io/github/license/eliware/ttsbot)](https://github.com/eliware/ttsbot/blob/main/LICENSE) [![CI](https://github.com/eliware/ttsbot/actions/workflows/ci.yaml/badge.svg)](https://github.com/eliware/ttsbot/actions/workflows/ci.yaml)

Discord text-to-speech bot using OpenAI TTS

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

ttsbot reads messages from one linked Discord text channel and speaks them in a voice channel with OpenAI text-to-speech.

## Requirements

Use Node.js 26 or later. Create a Discord application. Request an OpenAI API key. Enable the Message Content privileged intent.

## Setup

Copy `.env.example` to `.env`. Set the required credentials. Install dependencies with `npm ci`. Run `npm start`.

## Usage

Invite the bot with the `bot` and `applications.commands` scopes. Use `/join` from a voice channel to link it to the current text channel.
Read the [user guide](docs/USER_GUIDE.md) for setup, configuration, commands, and operation. Read [release notes](RELEASE_NOTES.md) for version history.

## Development

Read [AGENTS.md](AGENTS.md) before changing repository files. Find user documents in [docs/README.md](docs/README.md).
Read maintained rules in [specs/README.md](specs/README.md).

## Testing

Run `npm test` for aggregate validation. Run `npm run lint`, `npm run audit`, or `npm run format:check` for focused checks.

## Troubleshooting

Check the [user guide troubleshooting section](docs/USER_GUIDE.md#troubleshoot) for configuration, Discord, audio, and health problems.

## Security

Keep `DISCORD_TOKEN` and `OPENAI_API_KEY` out of Git. The health server has no authentication and listens on all interfaces.
Use network rules to control access to the health server.

## Configuration

Set `DISCORD_CLIENT_ID`, `DISCORD_TOKEN`, and `OPENAI_API_KEY` before startup. The [user guide](docs/USER_GUIDE.md#configure-the-bot) lists all environment variables, defaults, and valid ranges.

## Operations

Build the container with `docker build -t ttsbot:local .`.
Read the [Docker instructions](docs/USER_GUIDE.md#run-with-docker) and [systemd instructions](docs/USER_GUIDE.md#run-with-systemd).
The GHCR workflow builds the image for its runner's default architecture and publishes a version tag after validation. Publication does not deploy. Check package access and the image digest before deployment.

## Commands

Use `/help`, `/join`, `/leave`, `/voice`, `/skip`, and `/stop`.
Read [command descriptions](docs/USER_GUIDE.md#use-slash-commands) for behavior and options.

## Events

The bot handles Discord client readiness, slash command interactions, and server messages. It ignores bot messages and messages outside the linked text channel.

## Intents and permissions

Enable the Guilds, Guild Messages, Message Content, and Guild Voice States intents.
Grant View Channels and Send Messages in the text channel.
Grant Connect and Speak in the voice channel.

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

[MIT © Eliware](LICENSE)
