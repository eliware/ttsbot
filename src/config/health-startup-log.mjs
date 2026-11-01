export function logHealthServerListening({ log, port }) {
  log.info("Health server listening", { host: "0.0.0.0", port });
}
