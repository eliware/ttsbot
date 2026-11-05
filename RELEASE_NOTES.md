# Release Notes

## 15.1.1 — 2026-11-05

### Changed

- Update Discord.js to 14.28.1 and the resampler to 15.1.0. Refresh the dependency lockfile.
- Remove direct OpenAI and oxlint dependencies and the obsolete `test:gaps` script.
- Localize `/help` command names, descriptions, and replies for supported Discord languages.
- Apply supported `LOG_LEVEL` values at startup.
- Add playback stream diagnostics and document setup, configuration, health checks, Docker, and systemd use.
- Use loopback as the default health address in Node. Configure the container network address explicitly.
- Limit health and readiness routes to GET requests.
- Update the systemd launch command.

### Fixed

- Keep playback active for ten seconds during temporary TTS stream gaps.
- Prevent long messages from cutting off during audio playback.
- Continue playback after TTS stream errors and release audio resources when setup fails.
- Keep queued messages moving after playback or stream errors. Drop messages added while `/stop` waits.
- Prevent duplicate voice connections for `/join` requests at once.
- Clean audio state for guilds with no Discord cache entry.
- Save a user's voice selection before updating memory.
- Ignore stale voice assignments and bound voice selection at random values of one.
- Retry replacement reads after a file error. Do not cache failed reads.
- Make fewer copies while the audio buffer fills.
- Log the chosen health address and channel IDs for ignored interactions.

## 15.1.0 — 2026-11-01

### Added

- Add a user guide for installation, Discord permissions, configuration, commands, Docker, systemd, health checks, and troubleshooting.
- Add Ubuntu CI validation and a Knit deployment workflow.
- Add versioned GHCR image publishing with package-version checks and image digest verification.
- Add locale metadata for Discord commands.
- Add maintained repository specifications and the MIT license.

### Changed

- Set the default health port to `3040` in the environment example, application, and container.
- Rename the package to `@eliware/ttsbot` and set its version to `15.1.0`.
- Use `eliware-test` for aggregate validation, formatting, linting, and dependency audits.
- Update dependencies and override `minimatch` and `tar` with patched releases.
- Move the executable launcher into `bin/`.
- Split startup, Discord events, commands, audio processing, TTS queue handling, replacement rules, and health handling into focused modules.
- Add locale metadata and help catalogs for supported Discord locales.

### Fixed

- Clean up audio and response resources after failed TTS requests.
- Check full Git history in CI so release validation can read tags.
- Verify readiness after Discord startup and mark the bot unready during shutdown.
