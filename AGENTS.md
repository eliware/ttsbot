# AGENTS.md

## Project

Maintain the ttsbot Discord text-to-speech application. Eliware owns this repository.

## Scope and boundaries

Keep application behavior in this repository. Keep end-user procedures in `docs/USER_GUIDE.md`.

## Layout

Keep runtime code in `src/`. Keep launchers in `bin/`. Keep Discord command definitions in `commands/`.
Keep event adapters in `events/`. Keep tests in `tests/`. Keep user documentation in `docs/`.

## Development

Use Node.js 26 or later and native ESM. Update user documentation when behavior changes.

## Validation

Run `npm test` for aggregate validation. Run `npm run lint` for lint checks.
Run `npm run audit` for dependency checks. Run `npm run format` to format files.
Run `npm run format:check` to check formatting.

## Security

Keep Discord tokens, OpenAI API keys, and runtime state out of Git. Limit access to the unauthenticated health server.

## Changes

Keep changes focused. Update release notes for user-visible changes.

## Application

Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Run the full `npm test` suite for final validation before a commit, milestone, or release.
Keep startup configuration and user procedures accurate in `README.md` and `docs/USER_GUIDE.md`.

## Discord

Document each slash command and each required intent and permission. Keep command logic in `src/commands/`.
Keep command adapters in `commands/`. Keep event logic in `src/events/` and adapters in `events/`.

## GHCR publication

Image: ghcr.io/eliware/ttsbot

Pull command: docker pull ghcr.io/eliware/ttsbot:v15.1.0

Supported tags: vMAJOR.MINOR.PATCH

Deployment boundary: Publication does not deploy. Use an immutable version tag and record its SHA-256 digest.
