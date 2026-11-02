# Release Notes

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
