# Tagged Release Archive

## 1.0.3 — 2026-08-08

### Changed

- Expose health and readiness endpoints to all interfaces for Kubernetes health checks.
- Document access to Kubernetes health endpoints.
- Update Eliware runtime dependencies.

## 1.0.2 — 2026-08-07

### Added

- Add a production Docker image and a GHCR publishing workflow.
- Add Docker health smoke validation.
- Add Kubernetes deployment support and health and readiness probes.

## 1.0.1 — 2026-08-07

### Added

- Add Discord voice-channel text-to-speech playback with OpenAI TTS.
- Add FIFO per-guild queues, cancellation, skip and stop commands, and PCM jitter buffering.
- Resample mono audio to stereo 48 kHz for Discord playback.
- Add slash commands for help, join, exit, voice selection, skip, and stop.
- Store user voice choices in memory and give initial voices equally.
- Add health and readiness endpoints.
- Add retry handling, safe cancellation, timing logs, and privacy protections.
- Update the systemd unit and document setup and options.
