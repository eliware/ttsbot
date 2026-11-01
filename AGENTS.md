# AGENTS.md

## Project

Maintain the ttsbot Discord text-to-speech application. Eliware owns this repository.

## Scope and boundaries

Keep application behavior in this repository. Keep end-user procedures in `docs/USER_GUIDE.md`.

## Layout

Keep runtime code in `src/`, Discord command definitions in `commands/`, event handlers in `events/`, and tests in `tests/`. Keep end-user documentation in `docs/` and link each document from `docs/README.md`.

## Development

Use Node.js 26 or later and native ESM. Run focused tests first during development.
Run one test file with `npm test -- tests/path/to/example.test.mjs`.
Run multiple test files with `npm test -- tests/path/to/first.test.mjs tests/path/to/second.test.mjs`.
Prevent repeated full-suite runs during development.
Update end-user documentation when behavior or setup changes.

## Validation

Run `npm test` for the full Jest suite before a commit.
Run `npm run lint` for lint checks.

## Security

Keep Discord tokens, OpenAI API keys, and runtime state out of Git. Restrict access to the unauthenticated health server.

## Changes

Keep changes focused. Update release notes for user-visible changes.

## Application

Keep startup configuration and user procedures accurate in `README.md` and `docs/USER_GUIDE.md`.

## Discord

Document each slash command and each required intent and permission. Keep command definitions in `commands/` and event handlers in `events/`.

## GHCR publication

Image: `ghcr.io/eliware/ttsbot`

Pull command: `docker pull ghcr.io/eliware/ttsbot:vMAJOR.MINOR.PATCH`

Supported tags: `vMAJOR.MINOR.PATCH`

Deployment boundary: Publication does not deploy. Verify an immutable image digest before deployment.
