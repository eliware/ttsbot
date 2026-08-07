# Release notes

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
