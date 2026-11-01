# Release notes

## 15.1.0 - 2026-11-01

- Update runtime and development dependencies and align the lockfile with the package manifest.
- Set the default health and readiness port to `3040` and update the container configuration.
- Use the patched Node.js 26 Bookworm Slim base image for Docker builds.
- Align GitHub Actions, Knit, CI, and GHCR image publishing workflows.
- Add a complete user guide for setup, commands, configuration, deployment, health checks, and recovery.
- Set the package version to `15.1.0` and add the Eliware identifier `E-3040`.
- Refactor the TTS pipeline, queue, voice assignment, text replacement, health server, and shutdown code into focused modules.
- Stop active playback and clear queued speech when users run `/leave`.
- Reject unsupported voice selections and prevent assignment when no voices are available.
- Handle retry-delay failures, failed requests, malformed response bodies, empty streams, and shutdown cleanup errors.
- Add coverage for playback cleanup, retry handling, health startup, voice actions, and message queueing.
- Update repository metadata, README content, and development guidance.

## 1.0.3

- Bind health and readiness endpoints to all interfaces for Kubernetes HTTP probes.
- Document Kubernetes health probe access.
- Update Eliware runtime dependencies.

## 1.0.2

- Added production Docker image and GHCR publishing workflow.
- Added Docker health smoke validation.
- Added Kubernetes deployment support and health/readiness probes.

## 1.0.1

Initial tracked release of ttsbot, including:

- Discord voice-channel text-to-speech playback with OpenAI TTS.
- FIFO per-guild queues, cancellation, skip/stop/leave cleanup, and PCM jitter buffering.
- Mono-to-stereo 48 kHz audio resampling for Discord playback.
- Slash commands for help, join, leave, voice selection, skip, and stop.
- In-memory user voice settings and balanced initial voice assignment.
- Health and readiness endpoints.
- Retry handling, cancellation safety, operational timing/debug logging, and privacy protections.
- Hardened systemd service configuration and documented setup/configuration.
- Focused tests with complete statement, branch, function, and line coverage.
